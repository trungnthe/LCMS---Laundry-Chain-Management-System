using BusinessObjects.DTO.NotificationDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface INotification
    {
        Task<List<NotificationDTO>> CreateNotificationAsync(NotificationCreateDTO dto);
        Task<List<NotificationDTO>> GetNotificationsByAccountIdAsync(int accountId);
        Task<bool> MarkNotificationAsReadAsync(int notificationId);
        Task<List<NotificationDTO>> GetNotificationsAsync(int accountId);
        Task<List<NotificationDTO>> CreateNotificationForBranchByAdminAsync(NotificationBranchDTO dto, int adminId);
        Task<List<NotificationDTO>> GetSentNotificationsAsync(int userId);
        Task<bool> MarkAllNotificationsAsReadAsync(int accountId);
        Task<List<string>> GetAllStatus();
    }
}
