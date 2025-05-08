using BusinessObjects.DTO.AdminBookingDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IAdminBookingRepository
    {
        Task<List<BookingDTO>> GetAllBookingsAsync();
  
        Task<List<BookingDTO>> GetBookingsByEmployeeIdAsync(int employeeId);
        Task<BookingDTO> GetBookingByBookingIdAsync(int id);
        Task<List<BookingDTO>> GetBookingsByStaffIdAsync(int staffId);
        Task<List<BookingDTO>> GetBookingsByBranchIdAsync(int branchId);
        Task<List<BookingDTO>> GetBookingsByStatusAsync(string? status = null);
        Task<List<BookingDTO>> GetLatestBookingsByDaysAsync(int days);
        Task<int> GetTotalBookingsCountAsync();
        Task<Dictionary<string, int>> GetBookingCountByStatusAsync();
    }
}
