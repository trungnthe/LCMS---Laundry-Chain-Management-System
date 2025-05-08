using BusinessObjects.DTO.AdminBookingDTO;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class AdminBookingRepository : IAdminBookingRepository
    {
        private readonly AdminBookingDao _adminBookingDao;
        public  AdminBookingRepository(AdminBookingDao adminBookingDao)
        {
            _adminBookingDao = adminBookingDao;
        }
        public Task<List<BookingDTO>> GetAllBookingsAsync()
        {
            return _adminBookingDao.GetAllBookingsAsync();
        }
           
        public async Task<BookingDTO> GetBookingByBookingIdAsync(int id )
        {
            return await _adminBookingDao.GetBookingByBookingIdAsync(id);
        }
        public async Task<Dictionary<string, int>> GetBookingCountByStatusAsync()
        {
           return  await  _adminBookingDao.GetBookingCountByStatusAsync();
        }

        public Task<List<BookingDTO>> GetBookingsByBranchIdAsync(int branchId)
        {
           return _adminBookingDao.GetBookingsByBranchIdAsync(branchId);
        }

        public Task<List<BookingDTO>> GetBookingsByEmployeeIdAsync(int employeeId)
        {
           return _adminBookingDao.GetBookingsByCustomerIdAsync(employeeId);
        }

        public Task<List<BookingDTO>> GetBookingsByStaffIdAsync(int staffId)
        {
            return _adminBookingDao.GetBookingsByStaffIdAsync(staffId);
        }

        public Task<List<BookingDTO>> GetBookingsByStatusAsync(string? status = null)
        {
            return _adminBookingDao.GetBookingsByStatusAsync(status);
        }

        public Task<List<BookingDTO>> GetLatestBookingsByDaysAsync(int days)
        {
            return _adminBookingDao.GetLatestBookingsByDaysAsync((int)days);
        }

        public Task<int> GetTotalBookingsCountAsync()
        {
            return _adminBookingDao.GetTotalBookingsCountAsync();
        }
    }
}
