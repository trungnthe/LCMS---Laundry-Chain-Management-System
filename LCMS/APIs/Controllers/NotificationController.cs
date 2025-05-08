using BusinessObjects;
using BusinessObjects.DTO.NotificationDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Repositories.Interface;
using Repositories.Repository;
using System.Security.Claims;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotification _notificationService; 
        private readonly IHubContext<SignalHub> _hubContext;

        public NotificationController(INotification notificationDAO, IHubContext<SignalHub> hubContext)
        {
            _notificationService = notificationDAO;
            _hubContext = hubContext;
        }
        [HttpGet("list-all-Type")]
        public async Task<IActionResult> GetAllStaus()
        {
            var bookings = await _notificationService.GetAllStatus();
            return Ok(bookings);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationCreateDTO dto)
        {
            try
            {
  
                var userId = User.FindFirst("AccountId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("Không thể xác định người dùng.");

                dto.CreatedById = int.Parse(userId); 

                var notifications = await _notificationService.CreateNotificationAsync(dto);
                await _hubContext.Clients.All.SendAsync("updateNotification", "notification", notifications);

                return Ok(new { message = "Thông báo đã được gửi thành công.", data = notifications });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra.", error = ex.Message });
            }
        }
        [HttpGet("sent")]
        public async Task<IActionResult> GetSentNotifications()
        {
            try
            {
                // Lấy AccountId từ token
                var userId = User.FindFirst("AccountId")?.Value;

                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("Bạn chưa đăng nhập.");

                int senderId = int.Parse(userId);

                var result = await _notificationService.GetSentNotificationsAsync(senderId);

                return Ok(new { message = "Danh sách thông báo đã gửi.", data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra.", error = ex.Message });
            }
        }



        [HttpGet("list/{accountId}")]
        public async Task<IActionResult> GetNotifications(int accountId)
        {
            var notifications = await _notificationService.GetNotificationsByAccountIdAsync(accountId);
            return Ok(notifications);
        }
        [Authorize]
        [HttpGet("my-notifications")]
        public async Task<IActionResult> GetMyNotifications()
        {
            try
            {
                
                var userId = User.FindFirst("AccountId")?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("Không thể xác định người dùng.");

                int accountId = int.Parse(userId);
                var notifications = await _notificationService.GetNotificationsAsync(accountId);

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra.", error = ex.Message });
            }
        }
        [HttpPost("send-to-branch")]
        public async Task<IActionResult> SendNotificationToBranch([FromBody] NotificationBranchDTO dto)
        {
            try
            {
               
                var userId = User.FindFirst("AccountId")?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(userId) || role != "Admin")
                    return Unauthorized("Chỉ Admin mới có quyền gửi thông báo.");

                int adminId = int.Parse(userId);

                var result = await _notificationService.CreateNotificationForBranchByAdminAsync(dto, adminId);

                return Ok(new { message = "Thông báo đã được gửi đến chi nhánh.", data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra.", error = ex.Message });
            }
        }
        [HttpPut("mark-all-read")]
        [Authorize] 
        public async Task<IActionResult> MarkAllNotificationsAsRead()
        {
            int accountId = GetCurrentAccountId();
            if (accountId == 0) return Unauthorized();

            var result = await _notificationService.MarkAllNotificationsAsReadAsync(accountId);
            if (!result) return NotFound(new { message = "No unread notifications found." });

            return Ok(new { message = "All notifications marked as read." });
        }
        [HttpPut("mark-as-read/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            var success = await _notificationService.MarkNotificationAsReadAsync(notificationId);
            if (!success)
            {
                return NotFound(new { message = "Thông báo không tồn tại hoặc đã được đọc." });
            }
            return Ok(new { message = "Thông báo đã được đánh dấu là đã đọc." });
        }
        private int GetCurrentAccountId()
        {
            var accountIdClaim = User.FindFirst("AccountId");
            return accountIdClaim != null ? int.Parse(accountIdClaim.Value) : 0;
        }

    }
}
