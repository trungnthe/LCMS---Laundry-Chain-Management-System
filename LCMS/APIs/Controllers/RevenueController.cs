using BusinessObjects.DTO.RevenueDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using Repositories.Repository;
using System.Security.Claims;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RevenueController : ControllerBase
    {
        private readonly IRevenueRepository _revenueRepository;

        public IBranchRepository _branchRepository { get; }

        public RevenueController(IRevenueRepository revenueRepository, IBranchRepository branchRepository )
        {
            _revenueRepository = revenueRepository;
            _branchRepository = branchRepository;
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("total-revenue")]
        public async Task<IActionResult> GetTotalRevenue()
        {
            try
            {
                var revenue = await _revenueRepository.GetTotalRevenueAsync();
                return Ok(new { TotalRevenue = revenue });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("total-revenuePackageMonth")]
        public async Task<IActionResult> GetTotalRevenuePackage()
        {
            try
            {
                var revenue = await _revenueRepository.GetTotalRevenuePackageMonth();
                return Ok(new { TotalRevenue = revenue });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "Manager")]
        [HttpGet("branch/Totalrevenue")]
        public async Task<IActionResult> GetTotalRevenueForManager()
        {
            var branchId = await GetManagerBranchId();
            if (branchId == null)
            {
                return Unauthorized("Manager does not belong to any branch");
            }

            var totalRevenue = await _revenueRepository.GetTotalRevenueByBranchAsync(branchId.Value);

            return Ok(new { BranchId = branchId, TotalRevenue = totalRevenue });
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("monthly-revenue")]
        public async Task<IActionResult> GetTotalRevenueByMonthAndYear()
        {
            try
            {
                var revenue = await _revenueRepository.GetTotalRevenueByMonthAndYearAsync();
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("branch-revenue-byDatetime")]
        public async Task<IActionResult> GetBranchRevenueByMonthAndYearAsync([FromQuery] int? branchId, [FromQuery] DateTime date)
        {
            try
            {
                // Nếu là Manager, tự động lấy branchId từ tài khoản đăng nhập
                if (User.IsInRole("Manager"))
                {
                    var managerBranchId = await GetManagerBranchId();
                    if (managerBranchId == null)
                    {
                        return Unauthorized("Không thể xác định chi nhánh của bạn.");
                    }
                    branchId = managerBranchId; // Gán branchId từ tài khoản Manager
                }
                else if (branchId == null)
                {
                    return BadRequest("Vui lòng cung cấp branchId.");
                }

                // Lấy doanh thu của chi nhánh trong tháng/năm
                var revenue = await _revenueRepository.GetBranchRevenueByMonthAndYearAsync(branchId.Value, date);

                if (revenue == null)
                {
                    return NotFound(new { Message = "Không tìm thấy dữ liệu cho chi nhánh này." });
                }

                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        //Admin and manager
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("branch-customer-revenue/{branchId}")]
        public async Task<IActionResult> GetCustomerRevenueByBranchAndMonth(int branchId, [FromQuery] DateTime date)
        {
            try
            {
                // Kiểm tra quyền truy cập cho Manager và Admin
                if (User.IsInRole("Manager"))
                {
                    var managerBranchId = await GetManagerBranchId();

                    // Kiểm tra xem branchId trong yêu cầu có khớp với BranchId của Manager không
                    if (branchId != managerBranchId)
                    {
                        return Forbid("Bạn không có quyền truy cập vào chi nhánh này.");
                    }
                }

                // Lấy doanh thu của khách hàng trong chi nhánh và tháng/năm
                var customerRevenue = await _revenueRepository.GetCustomerRevenueByBranchAndMonthAsync(branchId, date);

                // Nếu không có dữ liệu
                if (customerRevenue == null || !customerRevenue.Any())
                {
                    return NotFound(new { Message = "Không tìm thấy dữ liệu" });
                }

                return Ok(customerRevenue);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }




        //Admin
        [Authorize(Roles = "Admin")]
        [HttpGet("all-branch-revenue-by-month-and-year")]

        public async Task<IActionResult> GetAllBranchRevenueByMonthAndYearAsync([FromQuery] DateTime date)
        {
            try
            {
                var revenues = await _revenueRepository.GetAllBranchRevenueByMonthAndYearAsync(date);
                return Ok(revenues);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        //Admin
        [Authorize(Roles = "Admin")]
        [HttpGet("customer-revenue/{customerId}")]
        public async Task<IActionResult> GetCustomerRevenueByMonthAndYear(int customerId, [FromQuery] DateTime date)
        {
            try
            {
                var revenue = await _revenueRepository.GetCustomerRevenueByMonthAndYearAsync(customerId, date);
                if (revenue == null)
                    return NotFound(new { Message = $"Không tìm thấy dữ liệu" });

                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all-customer-revenue")]
        public async Task<IActionResult> GetAllCustomerRevenueByMonthAndYearAsync([FromQuery] DateTime date)
        {
            try
            {
                var revenues = await _revenueRepository.GetAllCustomerRevenueByMonthAndYearAsync(date);
                return Ok(revenues);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("service-revenue")]
        public async Task<IActionResult> GetAllServiceRevenueByMonthAndYearAsync([FromQuery] DateTime date)
        {
            try
            {
                var revenues = await _revenueRepository.GetAllServiceRevenueByMonthAndYearAsync(date);
                return Ok(revenues);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("branch-service-revenue")]
        public async Task<IActionResult> GetServiceRevenueByBranchAndMonthAsync(
    [FromQuery] int? branchId, [FromQuery] DateTime date)
        {
            try
            {
                // Nếu là Manager, tự động lấy branchId
                if (User.IsInRole("Manager"))
                {
                    var managerBranchId = await GetManagerBranchId();
                    if (managerBranchId == null)
                    {
                        return Forbid("Không tìm thấy chi nhánh của bạn.");
                    }
                    branchId = managerBranchId; // Gán branchId cho Manager
                }

                // Kiểm tra nếu branchId bị thiếu
                if (branchId == null)
                {
                    return BadRequest("Cần cung cấp branchId.");
                }

                // Gọi hàm lấy doanh thu theo chi nhánh
                var serviceRevenues = await _revenueRepository.GetServiceRevenueByBranchAndMonthAsync(branchId.Value, date);

                if (serviceRevenues == null || !serviceRevenues.Any())
                {
                    return NotFound(new { Message = "Không tìm thấy dữ liệu doanh thu." });
                }

                return Ok(serviceRevenues);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Lỗi khi lấy doanh thu.", Error = ex.Message });
            }
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("export-full-revenue")]
        public async Task<IActionResult> ExportFullRevenue([FromQuery] DateTime ? date)
        {
            try
            {
                if (!User.IsInRole("Admin"))
                {
                    return Forbid(); // Trả về ForbidResult nếu không phải Admin
                }
                var fileBytes = await _revenueRepository.ExportFullRevenueReportAsync(date.Value);
                return File(fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"FullRevenueReport_{date:yyyy_MM}.xlsx");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }





        [Authorize(Roles = "Admin, Manager")]
        [HttpGet("payment-revenue")]
        public async Task<IActionResult> GetRevenueByPaymentMethod()
        {
            try
            {
                // Nếu là Manager, lấy BranchId của họ
                if (User.IsInRole("Manager"))
                {
                    var managerBranchId = await GetManagerBranchId();
                    if (managerBranchId == null)
                    {
                        return Forbid("Không tìm thấy chi nhánh của bạn.");
                    }

                    var revenues = await _revenueRepository.GetRevenueByPaymentMethodAsync(managerBranchId.Value);
                    if (revenues == null || !revenues.Any())
                    {
                        return NotFound(new { Message = "Không tìm thấy dữ liệu doanh thu." });
                    }

                    return Ok(revenues);
                }

                // Nếu là Admin, lấy toàn bộ doanh thu
                var allRevenues = await _revenueRepository.GetRevenueByPaymentMethodAsync();
                if (allRevenues == null || !allRevenues.Any())
                {
                    return NotFound(new { Message = "Không tìm thấy dữ liệu doanh thu." });
                }

                return Ok(allRevenues);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Lỗi khi lấy doanh thu theo phương thức thanh toán.", Error = ex.Message });
            }
        }



        private async Task<int?> GetManagerBranchId()
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
            if (userIdClaim == null)
                return null; // Trả về null nếu không tìm thấy AccountId trong token

            int accountId = int.Parse(userIdClaim.Value);

            // Lấy BranchId từ repository
            var branchId = await _branchRepository.GetBranchIdByAccountId(accountId);

            return branchId; // Trả về branchId, hoặc null nếu không tìm thấy
        }


    }
}
