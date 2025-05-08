using BusinessObjects;
using BusinessObjects.DTO.AdminBookingDTO;
using BusinessObjects.DTO.BookingHistoryDTO;
using BusinessObjects.DTO.BookingStaffDTO;
using BusinessObjects.DTO.CartDTO;
using BusinessObjects.DTO.SessionHelper;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Repositories.Interface;
using Repositories.Repository;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   
    public class BookingController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IBookingHistory _bookingHistory;
        private readonly IHubContext<SignalHub> _hubContext;

        public BookingController(IBookingRepository bookingDAO, IHubContext<SignalHub> hubContext,IBookingHistory bookingHistory)
        {
            _bookingRepository = bookingDAO;
            _hubContext = hubContext;
            _bookingHistory = bookingHistory;

        }
        [HttpGet("List-all-statusBookingdetail")]
        public IActionResult GetBranchStatuses()
        {
            var result = _bookingRepository.GetAllBookingDetail();
            return Ok(result);
        }
        [HttpGet("list-all-Status")]
        public async Task<IActionResult> GetAllStaus()
        {
            var bookings = await _bookingRepository.GetAllStatus();
            return Ok(bookings);
        }
        [HttpGet("list-all-PaymentType")]
        public async Task<IActionResult> GetAllPaymentType()
        {
            var bookings = await _bookingRepository.GetAllPaymentType();
            return Ok(bookings);
        }

        [HttpGet("list-all-Delivery")]
        public async Task<IActionResult> GetAllDelivery()
        {
            var bookings = await _bookingRepository.GetAllDeliveryStatuses();
            return Ok(bookings);
        }


        [HttpPost("from-cart")]
        public async Task<IActionResult> BookingFromCart([FromBody] BookingFromCartDto bookingData)
        {
            var cart = HttpContext.Session.GetObjectFromJson<CartDto>("Cart");
            if (cart == null || cart.Items.Count == 0)
            {
                return BadRequest(new { Message = "Cart is empty!" });
            }

            try
            {
                if (bookingData.GuestId == 0) bookingData.GuestId = null;
                var newBooking = await _bookingRepository.CreateBookingFromCartAsync(bookingData, cart);
                await _hubContext.Clients.All.SendAsync("receiveupdate", "NewBooking", newBooking.BranchId);
                HttpContext.Session.Remove("Cart"); 
                return Ok(new { Message = "Booking placed successfully!", BookingId = newBooking.BookingId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to place booking", Error = ex.Message });
            }
        }
        [HttpPost("direct-booking")]
        public async Task<IActionResult> CreateDirectBooking([FromBody] BookingStaffDTO bookingData)
        {
            try
            {
                if (bookingData == null)
                    return BadRequest(new { message = "Invalid booking data!", code = "INVALID_DATA" });

                var bookingId = await _bookingRepository.CreateDirectBookingAsync(bookingData);

                // 🔥 Gửi thông báo SignalR đến client
                await _hubContext.Clients.All.SendAsync("receiveupdate", "NewBooking", new
                {
                    bookingId,
                });

                return Ok(new { message = "Booking created successfully", bookingId, code = "SUCCESS" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error processing booking", code = "INTERNAL_ERROR" });
            }
        }

        [HttpPost("{bookingId}/details")]
        public async Task<IActionResult> AddBookingDetail(int bookingId, [FromBody] List<BookingDetailDto> newDetails)
        {
            try
            {
                var result = await _bookingRepository.AddBookingDetailAsync(bookingId, newDetails);
                return Ok(new { Message = "Booking details added successfully!", BookingId = result });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "An error occurred while adding booking details.", Details = ex.Message });
            }
        }

        [HttpGet("list-all")]
        public async Task<IActionResult> GetBookings()
        {
            var bookings = await _bookingRepository.GetAllBookingsAsync();
            return Ok(bookings);
        }
        [HttpGet("list-all-booking-pending")]
        public async Task<IActionResult> GetAllBookingsPendingAsync()
        {
            var bookings = await _bookingRepository.GetAllBookingsPendingAsync();

            return Ok(bookings);
        }
        [HttpGet("list-all-booking-delivering")]
        public async Task<IActionResult> GetAllBookingsDeliveringAsync()
        {
            var bookings = await _bookingRepository.GetAllBookingsDeliveringAsync();

            return Ok(bookings);
        }

        [HttpGet("list-by-CusId")]
        public async Task<IActionResult> GetBookings([FromQuery] int? customerId)
        {
            var bookings = await _bookingRepository.GetBookingsAsync(customerId);
            return Ok(bookings);
        }

       
        [HttpGet("{bookingId}")]
        public async Task<IActionResult> GetBookingDetails(int bookingId)
        {
            var booking = await _bookingRepository.GetBookingDetailByIdAsync(bookingId);
            if (booking == null)
                return NotFound(new { Message = "Booking not found!" });

            return Ok(booking);
        }
        [HttpPut("{bookingId}/details/{detailId}")]
        public async Task<IActionResult> EditBookingDetail(int bookingId, int detailId, [FromBody] BookingDetailDto updatedDetail)
        {
            try
            {
                if (updatedDetail.ProductId == 0) updatedDetail.ProductId = null;
                bool updated = await _bookingRepository.EditBookingDetailAsync(bookingId, detailId, updatedDetail);
                if (!updated)
                    return NotFound(new { message = "Booking detail not found!" });

                return Ok(new { message = "Booking detail updated successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{bookingId}/details/{detailId}")]
        public async Task<IActionResult> DeleteBookingDetail(int bookingId, int detailId)
        {
            try
            {
                bool deleted = await _bookingRepository.DeleteBookingDetailAsync(bookingId, detailId);
                if (!deleted)
                    return NotFound(new { message = "Booking detail not found!" });

                return Ok(new { message = "Booking detail deleted successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{bookingId}")]
        public async Task<IActionResult> EditBooking(int bookingId, [FromBody] BookingFromCartDto bookingData)
        {
            try
            {
                if (bookingData.GuestId == 0) bookingData.GuestId = null;
                bool updated = await _bookingRepository.EditBookingAsync(bookingId, bookingData);
                if (!updated)
                    return NotFound(new { message = "Booking not found!" });

                return Ok(new { message = "Booking updated successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    
        [HttpDelete("{bookingId}")]
        public async Task<IActionResult> DeleteBooking(int bookingId)
        {
            try
            {
                bool deleted = await _bookingRepository.DeleteBookingAsync(bookingId);
                if (!deleted)
                    return NotFound(new { message = "Booking not found!" });

                return Ok(new { message = "Booking deleted successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
}
