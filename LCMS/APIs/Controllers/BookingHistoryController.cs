using BusinessObjects;
using BusinessObjects.DTO.BookingHistoryDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingHistoryController : ControllerBase
    {
        private readonly IHubContext<SignalHub> _hubContext;

        private readonly IBookingHistory bookingHistory;
        private readonly IBookingRepository _bookingRepository;
        public BookingHistoryController(IBookingHistory bookingHistory, IHubContext<SignalHub> hubContext , IBookingRepository bookingRepository)
        {
            this.bookingHistory = bookingHistory;
            _hubContext = hubContext;
            _bookingRepository = bookingRepository;
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllBookingHistories()
        {
            var histories = await bookingHistory.GetAllBookingHistoryAsync();
            return Ok(histories);
        }

        [HttpGet("{bookingId}")]
        public async Task<IActionResult> GetBookingHistoryById(int bookingId)
        {
            var history = await bookingHistory.GetBookingHistoryByIdAsync(bookingId);
            if (history == null || history.Count == 0)
                return NotFound($"No history found for booking ID {bookingId}");

            return Ok(history);
        }

        [HttpPut("update-status")]
        public async Task<IActionResult> UpdateBookingStatus([FromBody] UpdateBookingStatusRequest request)
        {
            try
            {
                if (request == null || request.BookingId <= 0 || string.IsNullOrEmpty(request.NewStatus))
                {
                    return BadRequest("Invalid request data!");
                }

                bool result = await bookingHistory.UpdateBookingStatusAsync(request.BookingId, request.NewStatus);

                if (result)
                {
                    await _hubContext.Clients.All.SendAsync("receiveupdate", "UpdateBookingDetail", new
                    {
                        BookingId = request.BookingId,

                    });
                    await _hubContext.Clients.All.SendAsync("receiveupdate", "Notification", new
                    {
                        BookingId = request.BookingId,
                    });
                    await _hubContext.Clients.All.SendAsync("updatestatus", "newStatus");

                    return Ok(new { message = "Booking status updated successfully!" });
                }

                return NotFound(new { error = "Booking not found or update failed!" });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating booking status: {ex}");
                return StatusCode(500, new { error = "An internal server error occurred." });
            }
        }



        [HttpPut("update-statusBookingDetail")]
        public async Task<IActionResult> UpdateBookingDetailStatus([FromBody] UpdateBookingDetailHistory request)
        {
            try
            {
                if (request == null || request.Id <= 0 || string.IsNullOrEmpty(request.NewStatus))
                {
                    return BadRequest(new { error = "Invalid request data!" });
                }
             

                // Tiếp tục xử lý khi bookingId hợp lệ
                // Lấy `bookingId` từ booking detail

                bool result = await bookingHistory.UpdateBookingDetailStatusAsync(request.Id, request.NewStatus);
                int? bookingId = await _bookingRepository.GetBookingIdByBookingDetailIdAsync(request.Id);

                if (!bookingId.HasValue)
                {
                    return NotFound(new { error = "Booking detail not found!" });
                }
                if (result)
                {
                    await _hubContext.Clients.All.SendAsync("receiveupdate", "UpdateBookingDetail", new
                    {
                        bookingDetailId = request.Id,
                        bookingId = bookingId,


                    });
                    return Ok(new { message = "BookingDetail status updated successfully!" });
                }

                return NotFound(new { error = "BookingDetail not found or update failed!" });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating BookingDetail status: {ex}");
                return StatusCode(500, new { error = "An internal server error occurred." });
            }
        }

        [HttpPut("update-weightBookingDetail")]
        public async Task<IActionResult> UpdateWeightBookingDetail([FromBody] UpdateBookingDetailWeight request)
        {
            try
            {
                // Kiểm tra xem yêu cầu có hợp lệ không
                if (request == null || request.Id <= 0)
                {
                    return BadRequest(new { error = "Invalid request data!" });
                }

                // Gọi hàm cập nhật cân nặng trong booking detail
                bool result = await bookingHistory.UpdateWeightBookingDetailAsync(request.Id, request.Weight);

                // Lấy BookingId từ BookingDetail đã cập nhật
                int? bookingId = await _bookingRepository.GetBookingIdByBookingDetailIdAsync(request.Id);

                if (result)
                {
                    // Tính lại tổng tiền của Booking sau khi cập nhật BookingDetail
                    var totalAmount = await bookingHistory.CalculateTotalAmountAsync(bookingId.Value);

                    // Lấy thông tin Booking đã cập nhật
                    var updatedBooking = await _bookingRepository.GetBookingByIdAsync(bookingId.Value);

                    if (updatedBooking != null)
                    {
                        // Cập nhật tổng tiền mới cho Booking, bao gồm shippingFee
                        updatedBooking.TotalAmount = totalAmount + updatedBooking.ShippingFee;

                        // Lưu thay đổi vào cơ sở dữ liệu
                        await bookingHistory.UpdateBookingAsync(updatedBooking);

                        // Gửi thông báo tới tất cả client với thông tin cập nhật
                        await _hubContext.Clients.All.SendAsync("receiveupdate", "UpdateBookingDetail", new
                        {
                            bookingDetailId = request.Id,
                            weight = request.Weight,
                            bookingId = bookingId,
                            totalAmount = updatedBooking.TotalAmount // Gửi tổng tiền mới, đã bao gồm shippingFee
                        });

                        // Trả về phản hồi thành công với tổng tiền mới
                        return Ok(new { message = "BookingDetail updated successfully!", totalAmount = updatedBooking.TotalAmount });
                    }
                    else
                    {
                        return NotFound(new { error = "Booking not found!" });
                    }
                }

                // Nếu không tìm thấy BookingDetail hoặc cập nhật thất bại
                return NotFound(new { error = "BookingDetail not found or update failed!" });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating BookingDetail weight: {ex}");

                // Trả về lỗi máy chủ
                return StatusCode(500, new { error = "An internal server error occurred.", details = ex.Message });
            }
        }


        [HttpPut("update-shippingFee")]
        public async Task<IActionResult> UpdateShippingFeeBooking([FromBody] UpdateShippingFee request)
        {
            try
            {   
                // Kiểm tra xem yêu cầu có hợp lệ không
                if (request == null || request.Id <= 0)
                {
                    return BadRequest(new { error = "Invalid request data!" });
                }

                // Gọi hàm cập nhật phí vận chuyển trong booking detail
                bool result = await bookingHistory.UpdateShippingFeeBookingAsync(request.Id, request.ShippingFee);

                // Lấy BookingId từ BookingDetail đã cập nhật
                int? bookingId = await _bookingRepository.GetBookingIdByBookingDetailIdAsync(request.Id);

                if (result)
                {
                    // Tính lại tổng tiền của Booking sau khi cập nhật phí vận chuyển
                    var totalAmount = await bookingHistory.CalculateTotalAmountAsync(bookingId.Value);

                    // Lấy thông tin Booking đã cập nhật
                    var updatedBooking = await _bookingRepository.GetBookingByIdAsync(bookingId.Value);

                    if (updatedBooking != null)
                    {
                        // Cập nhật tổng tiền mới cho Booking
                        updatedBooking.TotalAmount = totalAmount + request.ShippingFee;

                        // Lưu thay đổi vào cơ sở dữ liệu
                        await bookingHistory.UpdateBookingAsync(updatedBooking);
                  

                        // Trả về phản hồi thành công với tổng tiền mới
                        return Ok(new { message = "BookingDetail updated successfully!", totalAmount });
                    }
                    else
                    {
                        return NotFound(new { error = "Booking not found!" });
                    }
                }

                // Nếu không tìm thấy BookingDetail hoặc cập nhật thất bại
                return NotFound(new { error = "BookingDetail not found or update failed!" });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating BookingDetail shipping fee: {ex}");

                // Trả về lỗi máy chủ
                return StatusCode(500, new { error = "An internal server error occurred.", details = ex.Message });
            }
        }




    }
}
