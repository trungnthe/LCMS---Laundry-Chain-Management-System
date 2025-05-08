using BusinessObjects;
using BusinessObjects.DTO.AdminBookingDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class AdminBookingController : ControllerBase
    {
        private readonly IAdminBookingRepository _repository; private readonly IHubContext<SignalHub> _hubContext;

        public AdminBookingController(IAdminBookingRepository repository, IHubContext<SignalHub> hubContext)
        {
            _repository = repository;
            _hubContext = hubContext;

        }
        [HttpGet("get-all-booking")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _repository.GetAllBookingsAsync();

            return Ok(bookings);
        }
        [HttpGet("get-booking-id")]
        public async Task<IActionResult> GetBookingByBookingId(int bookingId)
        {
            var booking = await _repository.GetBookingByBookingIdAsync(bookingId);

            if (booking == null)
            {
                return NotFound("Không tìm thấy booking với ID này.");
            }

            return Ok(booking);
        }


        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetBookingsByEmployeeId(int employeeId)
        {
            var bookings = await _repository.GetBookingsByEmployeeIdAsync(employeeId);
            return Ok(bookings);
        }

        [HttpGet("staff/{staffId}")]
        public async Task<IActionResult> GetBookingsByStaffId(int staffId)
        {
            var bookings = await _repository.GetBookingsByStaffIdAsync(staffId);
            return Ok(bookings);
        }

  
        [HttpGet("branch/{branchId}")]
        public async Task<IActionResult> GetBookingsByBranchId(int branchId)
        {
            var bookings = await _repository.GetBookingsByBranchIdAsync(branchId);
            return Ok(bookings);
        }
        [HttpGet("list-By-Status")]
        public async Task<IActionResult> GetBookingsByStatus([FromQuery] string? status = null)
        {
            var bookings = await _repository.GetBookingsByStatusAsync(status);
            return Ok(bookings);
        }
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestBookingsByDays([FromQuery] int days)
        {
            var result = await _repository.GetLatestBookingsByDaysAsync(days);
            return Ok(result);
        }
        [HttpGet("totalbookings")]
        public async Task<IActionResult> GetAllBookingsWithPermission()
        {
            try
            {
                var bookings = await _repository.GetTotalBookingsCountAsync();
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống", error = ex.Message });
            }
        }
        [HttpGet("booking-countByStaus")]
        public async Task<IActionResult> GetBookingCountByStatus()
        {
            try
            {
                var countResult = await _repository.GetBookingCountByStatusAsync();
                return Ok(countResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống", error = ex.Message });
            }
        }
    }
}
