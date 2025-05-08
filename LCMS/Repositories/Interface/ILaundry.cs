using BusinessObjects.DTO.LaundrySubscriptionDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface ILaundry
    {
        Task<int> AddAsync(string packageName, int customerId);
        Task<int> AddSubByStaff(string packageName, int customerId);
        Task<List<LaundrySubscriotionDTO>> GetAllSubscriptionsAsync();
        Task<List<LaundrySubscriotionDTO>> GetAllSubscriptionsByAccountIdAsync(int accountId);
        Task<List<LaundryDTO>> GetSubscriptionsByBookingIDc(int bookingID);
        List<string> GetPackageNames();
        Task<LaundrySubscriotionDTO> GetSubscriptionByAccountIdAsync(int accountId);

    }
}
    