using BusinessObjects.DTO.LaundrySubscriptionDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class LaundryRepository : ILaundry
    {
        private readonly LaundrySubscriptionDao _laundrySubscriptionDao;
        public LaundryRepository(LaundrySubscriptionDao laundrySubscriptionDao)
        {
            _laundrySubscriptionDao = laundrySubscriptionDao;
        }

        public Task<int> AddAsync(string packageName, int customerId)
        {
      return _laundrySubscriptionDao.AddAsync(packageName, customerId);
        }

        public Task<List<LaundrySubscriotionDTO>> GetAllSubscriptionsAsync()
        {
            return _laundrySubscriptionDao.GetAllSubscriptionsAsync();
        }

        public List<string> GetPackageNames()
        {
            return _laundrySubscriptionDao.GetPackageNames();
        }

        public  Task<LaundrySubscriotionDTO> GetSubscriptionByAccountIdAsync(int accountId)
        {
            return _laundrySubscriptionDao.GetSubscriptionsByAccountIdAsync(accountId);
        }

        public Task<List<LaundrySubscriotionDTO>> GetAllSubscriptionsByAccountIdAsync(int accountId)
        {
            return _laundrySubscriptionDao.GetAllSubscriptionsByAccountIdAsync(accountId);
        }

        public Task<List<LaundryDTO>> GetSubscriptionsByBookingIDc(int bookingID)
        {
           return _laundrySubscriptionDao.GetSubscriptionsByBookingIDc(bookingID); 
        }

        public Task<int> AddSubByStaff(string packageName, int customerId)
        {
            return _laundrySubscriptionDao.AddSubByStaffAsync(packageName,customerId);
        }
    }
}
