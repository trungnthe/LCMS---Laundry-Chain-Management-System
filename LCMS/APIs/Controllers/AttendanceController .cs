using AutoMapper;
using BusinessObjects.DTO.AttendanceDTO;
using BusinessObjects.DTO.ServiceDTO;
using BusinessObjects.DTO.WorkScheduleDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using Repositories.Repository;
using System.Security.Claims;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceRepository _attendanceRepository;
        private readonly IWorkScheduleRepository _workScheduleRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ISalaryStructureRepository _salaryStructureRepository;
        private readonly IMapper _mapper;


        // Tiêm IAttendanceRepository vào constructor
        public AttendanceController(IAttendanceRepository attendanceRepository, IWorkScheduleRepository workScheduleRepository, IMapper mapper,
            IEmployeeRepository employeeRepository,ISalaryStructureRepository salaryStructureRepository)
        {
            _mapper = mapper;
            _employeeRepository = employeeRepository;
            _attendanceRepository = attendanceRepository;
            _workScheduleRepository = workScheduleRepository;
            _salaryStructureRepository = salaryStructureRepository;
        }
        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("AddScheduleForPeriod")]
        public async Task<ActionResult> AddScheduleForPeriod([FromBody] CreateAttendanceDto attendanceDto)
        {
            var attendance = _mapper.Map<Attendance>(attendanceDto);

            // Kiểm tra dữ liệu đầu vào
            if (attendanceDto.EmployeeIDs == null || attendanceDto.EmployeeIDs.Count == 0)
            {
                return BadRequest("Danh sách nhân viên không hợp lệ.");
            }

            if (attendanceDto.StartDate >= attendanceDto.EndDate)
            {
                return BadRequest("Ngày bắt đầu phải trước ngày kết thúc.");
            }

            try
            {
                // Lấy danh sách nhân viên từ các EmployeeID
                var employees = await GetEmployeesByIdsAsync(attendanceDto.EmployeeIDs);

                if (employees == null || employees.Count == 0)
                {
                    return NotFound("Không tìm thấy nhân viên.");
                }

                // Kiểm tra ca làm việc
                var workSchedule = await _workScheduleRepository.GetScheduleByIdAsync(attendanceDto.WorkScheduleId);
                if (workSchedule == null)
                {
                    return BadRequest("Ca làm việc không hợp lệ.");
                }

                // Kiểm tra sự trùng lặp của lịch làm việc trong khoảng thời gian
                foreach (var employee in employees)
                {
                    var existingAttendances = await _attendanceRepository.GetAttendancesByEmployeeIdAsync(
                        employee.AccountId, attendanceDto.StartDate, attendanceDto.EndDate);

                    if (existingAttendances.Any(a => a.ShiftDate == attendanceDto.StartDate && a.WorkScheduleId == attendanceDto.WorkScheduleId))
                    {
                        // Debugging: log this message or check with breakpoints if necessary
                        return BadRequest($"Lịch làm việc với ca {attendanceDto.WorkScheduleId} đã tồn tại cho nhân viên {employee.AccountId} trong ngày {attendanceDto.StartDate:yyyy-MM-dd}.");
                    }
                }

                // Tạo và lưu lịch làm việc cho các nhân viên
                var attendances = await _attendanceRepository.CreateAttendanceRecordsAsync(
                    employees,
                    attendanceDto.WorkScheduleId,
                    attendanceDto.StartDate,
                    attendanceDto.EndDate);

                // Trả về thông báo thành công và danh sách các bản ghi đã tạo
                return Ok(new { message = "Lịch làm việc đã được thêm cho các nhân viên.", data = attendanceDto });
            }
            catch (Exception ex)
            {
                // Xử lý lỗi và log chi tiết lỗi
                return StatusCode(500, new { message = "Đã xảy ra lỗi trong quá trình tạo lịch làm việc.", error = ex.Message });
            }
        }


        [Authorize]
        [HttpGet("manager/get-total-hours-worked/{year}/{month}")]
        public async Task<IActionResult> GetTotalHoursWorkedForAllEmployees(int year, int month)
        {
            try
            {
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return Unauthorized("Không tìm thấy ID nhân viên trong token");

                int employeeId = int.Parse(userIdClaim.Value);
                var branchId = await _attendanceRepository.GetBranchIdByEmployeeId(employeeId);
                if (branchId == null)

                    return NotFound("Không tìm thấy chi nhánh của nhân viên");

                // Lấy tất cả dữ liệu chấm công trong tháng đó
                var attendances = await _attendanceRepository.GetAttendancesInMonthAsync(year, month);
                if (attendances == null || !attendances.Any())
                    return NotFound("Không tìm thấy dữ liệu chấm công cho tháng đã chọn");

                // Lấy danh sách nhân viên trong cùng chi nhánh
                var employees = await _employeeRepository.GetAllEmployee();
                if (employees == null || !employees.Any())
                    return NotFound("Không tìm thấy nhân viên nào");

                // Lọc nhân viên theo chi nhánh quản lý
                var branchEmployees = employees.Where(e => e.BranchId == branchId).ToList();
                if (!branchEmployees.Any())
                    return NotFound("Không có nhân viên nào trong chi nhánh của bạn.");

                var result = new List<object>();

                foreach (var employee in branchEmployees)
                {
                    var employeeAttendances = attendances
                                                .Where(a => a.EmployeeId == employee.AccountId)
                                                .ToList();

                    decimal totalHoursWorked = employeeAttendances.Sum(a => a.HoursWorked ?? 0);
                    decimal totalOvertimeHours = employeeAttendances.Sum(a => a.OvertimeHours ?? 0);

                    var salaryStructure = await _salaryStructureRepository.GetSalaryByIdAsync(employee.EmployeeRoleId);
                    if (salaryStructure == null)
                        continue;

                    decimal baseSalary = salaryStructure.BaseSalary;
                    decimal allowance = salaryStructure.Allowance;
                    int standardHours = salaryStructure.StandardHoursPerMonth ?? 0;

                    decimal estimatedSalary = 0;
                    if (standardHours > 0)
                    {
                        decimal hourlyRate = baseSalary / standardHours;
                        estimatedSalary = (totalHoursWorked * hourlyRate) + (totalOvertimeHours) + allowance;
                    }

                    result.Add(new
                    {
                        EmployeeId = employee.AccountId,
                        FullName = employee.EmployeeName,
                        TotalHoursWorked = totalHoursWorked,
                        TotalOvertimeHours = totalOvertimeHours,
                        BaseSalary = baseSalary,
                        Allowance = allowance,
                        EstimatedSalary = estimatedSalary
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Lỗi xảy ra", Details = ex.Message });
            }
        }



        [Authorize]  // Bắt buộc có token
        [HttpGet("staff/get-total-hours-worked/{year}/{month}")]
        public async Task<IActionResult> GetTotalHoursWorked(int year, int month)
        {
            try
            {
                // Lấy ID nhân viên từ JWT token
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return Unauthorized("Không tìm thấy ID nhân viên trong token");

                int employeeId = int.Parse(userIdClaim.Value);

                var attendances = await _attendanceRepository.GetAttendancesByEmployeeIdInMonthAsync(employeeId, year, month);

                if (attendances == null )
                    return NotFound("Không tìm thấy dữ liệu điểm danh");

                decimal totalHoursWorked = attendances.Sum(a => a.HoursWorked ?? 0);
                decimal totalOvertimeHours = attendances.Sum(a => a.OvertimeHours ?? 0);

                // Lấy thông tin lương của nhân viên
                var employee = await _employeeRepository.GetEmployeeById(employeeId);
                if (employee == null)
                    return NotFound("Không tìm thấy thông tin nhân viên");

                var salaryStructure = await _salaryStructureRepository.GetSalaryByIdAsync(employee.EmployeeRoleId);

                decimal baseSalary = salaryStructure.BaseSalary;
                decimal allowance = salaryStructure.Allowance;
                int? standardHours = salaryStructure.StandardHoursPerMonth;

                decimal? hourlyRate = baseSalary / standardHours;
                decimal? estimatedSalary = (totalHoursWorked * hourlyRate) + (totalOvertimeHours) + allowance;

                return Ok(new
                {
                    EmployeeId = employeeId,
                    Year = year,
                    Month = month,
                    TotalHoursWorked = totalHoursWorked,
                    TotalOvertimeHours = totalOvertimeHours,
                    BaseSalary = baseSalary,
                    Allowance = allowance,
                    EstimatedSalary = estimatedSalary
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Lỗi xảy ra", Details = ex.Message });
            }
        }

        private async Task<List<Employee>> GetEmployeesByIdsAsync(List<int> employeeIDs)
        {
            return await _attendanceRepository.GetEmployeesByIdsAsync(employeeIDs);
        }
        [HttpPut("staff/checkIn-employeeID")]
        public async Task<IActionResult> checkInByEmployeeId()
        {
            try
            {
                // Lấy ID nhân viên từ JWT token
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return BadRequest(new { Message = "Không tìm thấy ID nhân viên trong token" });

                int employeeId = int.Parse(userIdClaim.Value);

                // Call the CheckInAsync method
                var attendances = await _attendanceRepository.CheckInAsync(employeeId);

                if (attendances == null)
                    return NotFound(new { Message = "Không tìm thấy dữ liệu chấm công" });

                return Ok(attendances);
            }
            catch (UnauthorizedAccessException ex)
            {
                // Return a specific unauthorized exception response with a message
                return Unauthorized(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Catch all other exceptions and return a generic error response
                return BadRequest(new { Message = "Lỗi xảy ra", Details = ex.Message });
            }
        }



        [HttpPut("staff/checkOut-employeeID")]
        public async Task<IActionResult> checkOutByEmployeeId()
        {
            try
            {
                // Lấy ID nhân viên từ JWT token
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return BadRequest("Không tìm thấy ID nhân viên trong token");

                int employeeId = int.Parse(userIdClaim.Value);
                var attendances = await _attendanceRepository.CheckOutAsync(employeeId);

                if (attendances == null)
                    return NotFound("Không tìm thấy dữ liệu chấm công");

                return Ok(attendances);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Lỗi xảy ra", Details = ex.Message });
            }
        }

        [HttpGet("get-attendance-today")]
        public async Task<IActionResult> GetAttendanceByEmployeeToday()
        {
            try
            {
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return BadRequest("Không tìm thấy ID nhân viên trong token");

                int employeeId = int.Parse(userIdClaim.Value);
                var attend = await _attendanceRepository.GetAttendanceByEmployeeToday(employeeId);
                if (attend == null) return NotFound("Attendance không tồn tại");

                var attendanceDto = _mapper.Map<List<AttendanceTodayDto>>(attend);
                return Ok(attendanceDto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("get-attendance-today-by-time")]
        public async Task<IActionResult> GetAttendanceByEmployeeTodayByTime()
        {
            try
            {
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return BadRequest("Không tìm thấy ID nhân viên trong token");

                int employeeId = int.Parse(userIdClaim.Value);
                var attend = await _attendanceRepository.GetAttendanceByEmployeeTodayByTime(employeeId);
                var attendanceDto = _mapper.Map<AttendanceTodayDto>(attend);
                return Ok(attendanceDto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        // API: Cậ

        [HttpGet("get-attendance/{id}")]
        public async Task<IActionResult> GetAttendanceById(int id)
        {
            try
            {
                var attend = await _attendanceRepository.GetAttendanceById(id);
                if (attend == null) return NotFound("Attendance không tồn tại");

                var result = _mapper.Map<AttendanceDto>(attend);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "Manager")]
        [HttpGet("get-attendance-by-branch")]
        public async Task<IActionResult> GetAttendanceByBranchId()
        {
            try
            {
                // Lấy AccountId từ token
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return BadRequest("Không tìm thấy ID nhân viên trong token");

                int employeeId = int.Parse(userIdClaim.Value);

                // Lấy chi nhánh của nhân viên
                var branchId = await _attendanceRepository.GetBranchIdByEmployeeId(employeeId);
                if (branchId == null)
                    return NotFound("Không tìm thấy chi nhánh của nhân viên");

                // Lấy danh sách attendance theo branchId
                var attendances = await _attendanceRepository.GetAttendanceByBranchId(branchId.Value);
                if (attendances == null || !attendances.Any())
                    return NotFound("Không có attendance nào tồn tại");

                // Map danh sách dữ liệu sang DTO
                var result = _mapper.Map<List<AttendanceDto>>(attendances);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Đã xảy ra lỗi", error = ex.Message });
            }
        }

        [Authorize(Roles = "Staff")]
        [HttpGet("get-attendance-by-employee")]
        public async Task<IActionResult> GetAttendanceByAccountId()
        {
            try
            {
                // Lấy AccountId từ token
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return BadRequest("Không tìm thấy ID nhân viên trong token");

                int employeeId = int.Parse(userIdClaim.Value);

                // Lấy chi nhánh của nhân viên
                var att = await _attendanceRepository.GetAllAttendanceByAccountID(employeeId);
              
                // Map danh sách dữ liệu sang DTO
                var result = _mapper.Map<List<AttendanceDto>>(att);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Đã xảy ra lỗi", error = ex.Message });
            }
        }

        // API: Cập nhật dịch vụ
        [HttpPut("update-attendance/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateAttendanceDto updatedAttendanceDto)
        {
            try
            {
                // Kiểm tra dữ liệu đầu vào
                if (updatedAttendanceDto == null)
                {
                    return BadRequest("Dữ liệu không hợp lệ.");
                }

                // Lấy thông tin chấm công hiện tại
                var existingAttendance = await _attendanceRepository.GetAttendanceById(id);
                if (existingAttendance == null)
                {
                    return NotFound("Chấm công không tồn tại");
                }

                // Cập nhật thông tin từ DTO vào entity
                existingAttendance.CheckIn = TimeOnly.Parse(updatedAttendanceDto.CheckIn);
                existingAttendance.CheckOut = TimeOnly.Parse(updatedAttendanceDto.CheckOut);
                existingAttendance.Status = updatedAttendanceDto.Status;
                existingAttendance.ShiftDate = updatedAttendanceDto.ShiftDate;
                existingAttendance.UpdatedAt = DateTime.UtcNow;
                existingAttendance.EmployeeId = updatedAttendanceDto.EmployeeId;
                existingAttendance.Note = updatedAttendanceDto.Note;
                existingAttendance.WorkScheduleId = updatedAttendanceDto.WorkScheduleId;


                await _attendanceRepository.UpdateAttendance(existingAttendance);
                await _attendanceRepository.UpdateAttendanceWorkTime(existingAttendance.Id);

                // Trả về thông tin đã cập nhật nếu thành công
                return Ok(updatedAttendanceDto);
            }
            catch (Exception ex)
            {
                // Xử lý ngoại lệ
                return BadRequest($"Đã xảy ra lỗi: {ex.Message}");
            }
        }




    }
}
