using BusinessObjects.DTO.AttendanceDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class AttendanceDao
    {
        private readonly LcmsContext _context;
        private readonly IpAddressHelper _ipAddressHelper;

        public AttendanceDao(LcmsContext context, IpAddressHelper ipAddressHelper)
        {
            _context = context;
            _ipAddressHelper = ipAddressHelper;
        }

        // Tạo các bản ghi Attendance cho danh sách nhân viên
        public async Task<List<Attendance>> CreateAttendanceRecordsAsync(List<Employee> employees, int workScheduleId, DateOnly startDate, DateOnly endDate)
        {
            var attendances = new List<Attendance>();

            foreach (var employee in employees)
            {
                DateOnly currentDate = startDate;
                while (currentDate <= endDate)
                {
                    var attendance = new Attendance
                    {
                        EmployeeId = employee.AccountId,
                        WorkScheduleId = workScheduleId,
                        ShiftDate = currentDate,
                        Status = "Future"
                    };

                    attendances.Add(attendance);
                    currentDate = currentDate.AddDays(1);
                }
            }

            // Thêm tất cả các bản ghi vào cơ sở dữ liệu trong một lệnh duy nhất
            await _context.Attendances.AddRangeAsync(attendances);
            await _context.SaveChangesAsync();

            return attendances;  // Trả về danh sách Attendance vừa tạo
        }

        // Lấy danh sách nhân viên theo IDs
        public async Task<List<Employee>> GetEmployeesByIdsAsync(List<int> employeeIDs)
        {
            return await _context.Employees
                                 .Where(e => employeeIDs.Contains(e.AccountId))
                                 .ToListAsync();
        }

        // Lấy Attendance của nhân viên trong một khoảng thời gian
        public async Task<List<Attendance>> GetAttendancesByEmployeeIdAsync(int employeeId, DateOnly startDate, DateOnly endDate)
        {
            return await _context.Attendances
                                 .Where(a => a.EmployeeId == employeeId &&
                                             a.ShiftDate >= startDate && a.ShiftDate <= endDate)
                                 .ToListAsync();
        }
        // Lấy danh sách Attendance của nhân viên trong một tháng cụ thể
        public async Task<List<Attendance>> GetAttendancesInMonthAsync(int year, int month)
        {
            return await _context.Attendances
                                 .Where(a => a.ShiftDate.HasValue &&
                                             a.ShiftDate.Value.Year == year &&
                                             a.ShiftDate.Value.Month == month)
                                 .ToListAsync();
        }





        // Cập nhật Attendance và tính toán các giá trị liên quan
        public async Task<IActionResult> UpdateAttendanceWorkTime(int id)
        {
            // Lấy bản ghi Attendance và WorkSchedule
            var attendance = await _context.Attendances
                .Include(a => a.WorkSchedule)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attendance == null)
            {
                return new NotFoundObjectResult("Attendance not found.");
            }

            var workSchedule = attendance.WorkSchedule;

            // Tính giờ làm việc
            if (attendance.CheckIn.HasValue && attendance.CheckOut.HasValue)
            {
                attendance.HoursWorked = (decimal)(attendance.CheckOut.Value - attendance.CheckIn.Value).TotalMinutes / 60;
            }

            // Tính số phút đến muộn
            if (attendance.CheckIn.HasValue && attendance.CheckIn > workSchedule.ShiftStart)
            {
                attendance.LateMinutes = (int)(attendance.CheckIn.Value - workSchedule.ShiftStart).TotalMinutes;
            }
            else
            {
                attendance.LateMinutes = 0;
            }

            // Tính số phút về sớm
            if (attendance.CheckOut.HasValue && attendance.CheckOut < workSchedule.ShiftEnd)
            {
                attendance.EarlyLeaveMinutes = (int)(workSchedule.ShiftEnd - attendance.CheckOut.Value).TotalMinutes;
            }
            else
            {
                attendance.EarlyLeaveMinutes = 0;
            }

            // Tính giờ tăng ca dưới dạng decimal
            if (attendance.CheckOut.HasValue && attendance.CheckOut > workSchedule.ShiftEnd)
            {
                attendance.OvertimeHours = (decimal)(attendance.CheckOut.Value - workSchedule.ShiftEnd).TotalMinutes / 60;
            }
            else
            {
                attendance.OvertimeHours = 0;
            }

            // Cập nhật cơ sở dữ liệu
            _context.Update(attendance);
            await _context.SaveChangesAsync();

            // Trả về kết quả thành công
            return new OkObjectResult(new { message = "Attendance updated successfully", data = attendance });
        }

        public async Task UpdateAttendance(Attendance updatedAttendance)
        {
            var existingAttendance = await _context.Attendances.FindAsync(updatedAttendance.Id);
            if (existingAttendance != null)
            {
                _context.Entry(existingAttendance).CurrentValues.SetValues(updatedAttendance);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<Attendance> GetAttendanceByIdAsync(int id)
        {
            return await _context.Attendances
                                 .AsNoTracking()
                                 .Include(x => x.Employee).ThenInclude(x => x.Account)
                                 .Include(x => x.WorkSchedule)
                                 .FirstOrDefaultAsync(s => s.Id == id);
        }
        public string GetClientIpAddress()
        {
            return _ipAddressHelper.GetLocalIpAddress();

        }


        public async Task<Attendance> CheckInAsync(int attendanceId)
        {
            //var clientIpAddress = GetClientIpAddress();  // Lấy địa chỉ IP thực của người dùng

            //// Kiểm tra xem IP có khớp với IP của cửa hàng không
            //var branch = await _context.Branches
            //    .FirstOrDefaultAsync(b => b.IpAddress == clientIpAddress);

            //if (branch == null)
            //{
            //    throw new UnauthorizedAccessException("IP không hợp lệ.");
            //}

            // Lấy ngày hiện tại
            var today = DateOnly.FromDateTime(DateTime.Now);

            // Lấy thời gian hiện tại
            var checkInTime = TimeOnly.FromDateTime(DateTime.Now); // Lấy giờ, phút và giây hiện tại
            //var checkInTime = new TimeOnly(12, 55, 0);

            // Lấy ca làm việc dựa trên thời gian Check-In, cho phép check-in sớm 10 phút
            var workSchedule = await _context.WorkSchedules
                .Where(ws => checkInTime >= ws.ShiftStart.AddMinutes(-10) && checkInTime <= ws.ShiftEnd)  // Kiểm tra thời gian Check-In nằm trong phạm vi trước 10 phút ca làm việc
                .FirstOrDefaultAsync();

            if (workSchedule == null)
            {
                throw new UnauthorizedAccessException("Không tìm thấy ca làm việc hợp lệ cho ngày hôm nay.");
            }

            // Kiểm tra xem nhân viên đã có Check-In cho    ngày hôm nay và ca làm việc chưa
            var attendance = await _context.Attendances
                .Where(a => a.EmployeeId == attendanceId
                            && a.ShiftDate == today
                            && a.WorkScheduleId == workSchedule.Id
                            && a.CheckOut == null) // Kiểm tra chưa có CheckOut
                .FirstOrDefaultAsync();

            if (attendance == null)
            {
                throw new UnauthorizedAccessException("Không tìm thấy dữ liệu chấm công cho ngày hôm nay.");
            }

            if (attendance.CheckIn == null)
            {
                attendance.CheckIn = checkInTime;
                attendance.Status = "Ongoing";
                var lateMinutes = (int)(checkInTime.ToTimeSpan() - workSchedule.ShiftStart.ToTimeSpan()).TotalMinutes;
                attendance.LateMinutes = lateMinutes > 0 ? lateMinutes : 0;
                await _context.SaveChangesAsync();
            }

            return attendance;
        }


        public async Task CheckOutAsync(int id)
        {
            //var clientIpAddress = GetClientIpAddress();  // Lấy địa chỉ IP thực của người dùng

            //// Kiểm tra xem IP có khớp với IP của cửa hàng không (nếu cần)
            //var branch = await _context.Branches
            //    .FirstOrDefaultAsync(b => b.IpAddress == clientIpAddress);

            //if (branch == null)
            //{
            //    throw new UnauthorizedAccessException("IP không hợp lệ.");
            //}

            // Lấy ngày hiện tại
            var today = DateOnly.FromDateTime(DateTime.Now);

            // Lấy thời gian hiện tại
            var checkOutTime = TimeOnly.FromDateTime(DateTime.Now);

            // Tìm bản ghi Attendance của nhân viên cho ngày hôm nay
            var attendance = await _context.Attendances
                .Where(a => a.EmployeeId == id
                            && a.ShiftDate == today
                            && a.CheckIn != null // Đã Check-In
                            && a.CheckOut == null) // Chưa Check-Out
                .FirstOrDefaultAsync();

            // Nếu chưa Check-In
            if (attendance == null)
            {
                throw new InvalidOperationException("Bạn chưa thực hiện Check-In hoặc đã Check-Out.");
            }

            // Cập nhật thời gian Check-Out
            attendance.CheckOut = checkOutTime;

            // Cập nhật trạng thái
            attendance.Status = "Completed";

            await UpdateAttendanceWorkTime(attendance.Id);

            await _context.SaveChangesAsync();
        }


        public async Task<List<Attendance>> GetAttendanceByEmployeeToday(int id)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);

            return await _context.Attendances
                                 .AsNoTracking()
                                 .Include(x => x.Employee).ThenInclude(x => x.Account)
                                 .Include(x => x.WorkSchedule)
                                 .Where(s => s.EmployeeId == id && s.ShiftDate == today)
                                 .ToListAsync();
        }

        public async Task<Attendance?> GetAttendanceByEmployeeTodayByTime(int id)
        {
            //var fixedDateTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 12, 51, 0);
            var now = DateTime.Now; // Lấy thời gian hiện tại

            var today = DateOnly.FromDateTime(now);
            var currentTime = TimeOnly.FromDateTime(now);

            return await _context.Attendances
                                 .AsNoTracking()
                                 .Include(x => x.Employee).ThenInclude(x => x.Account)
                                 .Include(x => x.WorkSchedule)
                                 .Where(s => s.EmployeeId == id
                                          && s.ShiftDate == today
                                          && currentTime >= s.WorkSchedule.ShiftStart.AddMinutes(-10)
                                          && currentTime <= s.WorkSchedule.ShiftEnd.AddMinutes(10))
                                 .FirstOrDefaultAsync(); // Chỉ lấy 1 bản ghi đầu tiên
        }


        public async Task<List<Attendance>> GetAttendanceByBranch(int id)
        {

            return await _context.Attendances
                                 .AsNoTracking()
                                 .Include(x => x.Employee).ThenInclude(x => x.Account)
                                 .Include(x => x.WorkSchedule)
                                 .Where(s => s.Employee.BranchId == id)
                                 .ToListAsync();
        }
        public async Task<List<Attendance>> GetAllAttendanceByAccountID(int id)
        {

            return await _context.Attendances
                                 .AsNoTracking()
                                 .Include(x => x.Employee).ThenInclude(x => x.Account)
                                 .Include(x => x.WorkSchedule)
                                 .Where(s => s.Employee.AccountId == id)
                                 .ToListAsync();
        }




        public async Task<int?> GetBranchIdByEmployeeId(int employeeId)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.AccountId == employeeId);

            return employee?.BranchId;
        }

        public async Task<List<Attendance>> GetAttendancesByEmployeeIdInMonthAsync(int employeeId, int year, int month)
        {
            return await _context.Attendances
                                 .Where(a => a.EmployeeId == employeeId &&
                                             a.ShiftDate.HasValue &&   // Kiểm tra null trước
                                             a.ShiftDate.Value.Year == year &&
                                             a.ShiftDate.Value.Month == month)
                                 .ToListAsync();
        }

    }
}
