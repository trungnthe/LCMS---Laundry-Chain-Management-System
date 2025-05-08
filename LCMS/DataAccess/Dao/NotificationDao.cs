using AutoMapper;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    using AutoMapper;
    using BusinessObjects.DTO.NotificationDTO;
    using Microsoft.AspNetCore.Http;
    using Microsoft.EntityFrameworkCore;
    using System.Security.Claims;
    using static BusinessObjects.NotificationType;

    public class NotificationDAO
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationDAO(LcmsContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<NotificationDTO>> CreateNotificationAsync(NotificationCreateDTO dto)
        {
            // Lấy thông tin người gửi từ database
            var sender = await _context.Accounts.FindAsync(dto.CreatedById);
            if (sender == null)
                throw new ArgumentException("Người gửi không tồn tại.");

            // Kiểm tra quyền của người gửi (chỉ cho phép Role 1, 2, 3 gửi thông báo)
            if (sender.RoleId != 1 && sender.RoleId != 2 && sender.RoleId != 3)
                throw new UnauthorizedAccessException("Bạn không có quyền tạo thông báo."); 

            List<Notification> notifications = new List<Notification>();

            if (dto.SendToAllRole4 || dto.SendToAllRole23)
            {
                IQueryable<Account> query = _context.Accounts.Where(a => a.RoleId == 4 || (dto.SendToAllRole23 && (a.RoleId == 2 || a.RoleId == 3)));

                var accountIds = await query.Select(a => a.AccountId).ToListAsync();

                notifications = accountIds.Select(receiverId => new Notification
                {
                    Title = dto.Title,
                    Content = dto.Content,
                    AccountId = receiverId,   // Người nhận thông báo
                    CreatedById = dto.CreatedById, // Người gửi thông báo (tự động lấy từ token)
                    CreatedAt = DateTime.Now,
                    IsRead = false
                }).ToList();
            }
            else
            {
                // Tạo thông báo cho một Account cụ thể
                notifications.Add(new Notification
                {
                    Title = dto.Title,
                    Content = dto.Content,
                    AccountId = dto.AccountId,  // Người nhận
                    CreatedById = dto.CreatedById, // Người gửi
                    CreatedAt = DateTime.Now,
                    IsRead = false
                });
            }

            // Lưu vào database
            await _context.Notifications.AddRangeAsync(notifications);
            await _context.SaveChangesAsync();

            return _mapper.Map<List<NotificationDTO>>(notifications);
        }

        public async Task<List<NotificationDTO>> GetNotificationsByAccountIdAsync(int accountId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.AccountId == accountId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<NotificationDTO>>(notifications);
        }
        public async Task<List<string>> GetAllStatus()
        {
            return await Task.FromResult(Enum.GetNames(typeof(NotificationType1)).ToList());
        }
        public async Task<List<NotificationDTO>> GetNotificationsAsync(int accountId)
        {
            var thirtyDaysAgo = DateTime.Now.AddDays(-30);

            var notifications = await _context.Notifications
                .Where(n => n.AccountId == accountId && n.CreatedAt >= thirtyDaysAgo)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<NotificationDTO>>(notifications);
        }

        public async Task<bool> MarkAllNotificationsAsReadAsync(int accountId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.AccountId == accountId && n.IsRead == false)
                .ToListAsync();

            if (!notifications.Any()) return false;

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> MarkNotificationAsReadAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }


      
        public async Task<List<NotificationDTO>> CreateNotificationForBranchByAdminAsync(NotificationBranchDTO dto, int adminId)
        {
            // Lấy thông tin admin
            var admin = await _context.Accounts.FindAsync(adminId);
            if (admin == null)
                throw new ArgumentException("Người gửi không tồn tại.");

            // Kiểm tra quyền của người gửi (chỉ Admin mới có quyền)
            if (admin.RoleId != 1)
                throw new UnauthorizedAccessException("Bạn không có quyền tạo thông báo.");

            // Lấy danh sách người dùng trong Branch
            var accountsInBranch = await _context.Accounts
                .Where(a => a.Employee.BranchId == dto.BranchId)
                .Select(a => a.AccountId)
                .ToListAsync();

            if (!accountsInBranch.Any())
                throw new ArgumentException("Không có người dùng nào trong chi nhánh này.");

            // Tạo danh sách thông báo
            var notifications = accountsInBranch.Select(receiverId => new Notification
            {
                Title = dto.Title,
                Content = dto.Content,
                AccountId = receiverId,    // Người nhận thông báo
                CreatedById = adminId,     // Admin gửi thông báo
                CreatedAt = DateTime.Now,
                IsRead = false
            }).ToList();

            // Lưu vào database
            await _context.Notifications.AddRangeAsync(notifications);
            await _context.SaveChangesAsync();

            return _mapper.Map<List<NotificationDTO>>(notifications);
        }
        public async Task<List<NotificationDTO>> GetSentNotificationsAsync(int userId)
        {
            // Kiểm tra người dùng có tồn tại không
            var user = await _context.Accounts.FindAsync(userId);
            if (user == null)
                throw new ArgumentException("Người dùng không tồn tại.");

            // Lấy tất cả thông báo do userId gửi
            var notifications = await _context.Notifications
                .Where(n => n.CreatedById == userId)
                .OrderByDescending(n => n.CreatedAt) // Sắp xếp theo thời gian gần nhất
                .ToListAsync();

            return _mapper.Map<List<NotificationDTO>>(notifications);
        }









        // 🔹 Lấy AccountId của người dùng đăng nhập
        private async Task<(int? AccountId, int? RoleId, int? BranchId)> GetCurrentUserClaimsAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return (null, null, null);

            var identity = httpContext.User.Identity as ClaimsIdentity;
            if (identity == null)
                return (null, null, null);

            var accountId = identity.FindFirst("AccountId")?.Value;
            var roleId = identity.FindFirst("RoleId")?.Value;
            var branchId = identity.FindFirst("BranchId")?.Value;

            int? parsedAccountId = accountId != null ? int.Parse(accountId) : null;
            int? parsedRoleId = roleId != null ? int.Parse(roleId) : null;
            int? parsedBranchId = branchId != null ? int.Parse(branchId) : null;

            // Nếu BranchId chưa có trong Claims, lấy từ database
            if (parsedBranchId == null && parsedAccountId.HasValue)
            {
                parsedBranchId = await _context.Accounts
                    .Where(a => a.AccountId == parsedAccountId.Value)
                    .Select(a => a.Employee.BranchId)
                    .FirstOrDefaultAsync();
            }

            return (parsedAccountId, parsedRoleId, parsedBranchId);
        }
        private int? GetCurrentUserId()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return null;

            var identity = httpContext.User.Identity as ClaimsIdentity;
            if (identity == null)
                return null;

            var accountIdClaim = identity.FindFirst("AccountId")?.Value;
            return accountIdClaim != null ? int.Parse(accountIdClaim) : null;
        }

    }

}
