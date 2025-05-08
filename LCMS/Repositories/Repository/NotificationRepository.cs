using BusinessObjects.DTO.NotificationDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class NotificationRepository : INotification
    {
        private readonly NotificationDAO _notificationDao;
        public NotificationRepository (NotificationDAO notificationDao)
        {
            _notificationDao = notificationDao;
        }

        public Task<List<NotificationDTO>> CreateNotificationAsync(NotificationCreateDTO dto)
        {
            return _notificationDao.CreateNotificationAsync(dto);
        }

        public Task<List<NotificationDTO>> CreateNotificationForBranchByAdminAsync(NotificationBranchDTO dto, int adminId)
        {
            return _notificationDao.CreateNotificationForBranchByAdminAsync (dto, adminId);
        }

        public Task<List<string>> GetAllStatus()
        {
          return _notificationDao.GetAllStatus();
        }

        public Task<List<NotificationDTO>> GetNotificationsAsync(int accountId)
        {
           return _notificationDao.GetNotificationsAsync(accountId);
        }

        public Task<List<NotificationDTO>> GetNotificationsByAccountIdAsync(int accountId)
        {
            return _notificationDao.GetNotificationsByAccountIdAsync(accountId);
        }

        public Task<List<NotificationDTO>> GetSentNotificationsAsync(int userId)
        {
           return _notificationDao.GetSentNotificationsAsync(userId);
        }

        public Task<bool> MarkAllNotificationsAsReadAsync(int accountId)
        {
            return _notificationDao.MarkAllNotificationsAsReadAsync (accountId);
        }

        public Task<bool> MarkNotificationAsReadAsync(int notificationId)
        {
            return _notificationDao.MarkNotificationAsReadAsync(notificationId);
        }
    }
}
