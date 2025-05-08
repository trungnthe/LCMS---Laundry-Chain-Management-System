using AutoMapper;
using BusinessObjects.DTO.FeedbackDTO;
using BusinessObjects.DTO.ServiceDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using Repositories.Repository;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private IFeedbackRepository _feedbackDao;
        private IAttendanceRepository _attendanceRepository;
        public FeedbackController(IFeedbackRepository feedbackDao, IAttendanceRepository attendanceRepository)
        {
            _feedbackDao = feedbackDao;
            _attendanceRepository = attendanceRepository;
        }
        [HttpPost]
        [Authorize] 
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDTO feedbackDto)
        {
            try
            {
                var feedback = await _feedbackDao.CreateFeedbackAsync(feedbackDto);
                return Ok(feedback);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }
        [HttpPost("{parentFeedbackId}/reply")]
        public async Task<IActionResult> ReplyToFeedback(int parentFeedbackId, [FromBody] ReplyFeedbackDTO replyDto)
        {
            try
            {
                var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
                if (userIdClaim == null)
                    return BadRequest(new { Message = "Không tìm thấy ID nhân viên trong token" });

                int employeeId = int.Parse(userIdClaim.Value);
                replyDto.AccountId = employeeId;

                var response = await _feedbackDao.ReplyToFeedbackAsync(parentFeedbackId, replyDto);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }
        [HttpPut("{feedbackId}")]
        public async Task<IActionResult> UpdateFeedback(int feedbackId, [FromBody] UpdateFeedbackDTO updateDto)
        {
            try
            {
                var feedbackDto = await _feedbackDao.UpdateFeedbackAsync(feedbackId, updateDto);
                return Ok(feedbackDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpGet("booking/{bookingDetailId}")]
        public async Task<IActionResult> GetFeedbacksByBookingDetail(int bookingDetailId)
        {
            try
            {
                var feedbacks = await _feedbackDao.GetFeedbacksByBookingDetailIdAsync(bookingDetailId);
                if (feedbacks == null || feedbacks.Count == 0)
                {
                    return NotFound(new { message = "Không có feedback nào cho BookingDetailId này." });
                }

                return Ok(feedbacks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }
        [HttpGet("GetAllFeedbacksByBranch")]
        public async Task<IActionResult> GetAllFeedbacksByBranch()
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
            Console.WriteLine($"AccountId in claims: {userIdClaim.Value}");

            if (userIdClaim == null)
                return BadRequest(new { Message = "Không tìm thấy ID nhân viên trong token" });

            int employeeId = int.Parse(userIdClaim.Value); 
            int branchId = (int)await _attendanceRepository.GetBranchIdByEmployeeId(employeeId);

            try
            {

                var feedbacks = await _feedbackDao.GetAllFeedbacksByBranchAsync(branchId);
                if (feedbacks == null) { 
                    return NotFound(new { message = "Không có feedback nào cho BookingDetailId này." });
                }

                return Ok(feedbacks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }





    }




}
