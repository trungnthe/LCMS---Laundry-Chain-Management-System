using AutoMapper;
using BusinessObjects.DTO.AdminBookingDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class AdminBookingDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public AdminBookingDao(LcmsContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _mapper = mapper;
         _httpContextAccessor= httpContextAccessor;
        
    }
        public async Task<List<BookingDTO>> GetAllBookingsAsync()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<BookingDTO>();

            IQueryable<Booking> query = _context.Bookings
                .Include(b => b.Customer).ThenInclude(c => c.Account)
                .Include(b => b.Staff).ThenInclude(s => s.Account)
                .Include(b => b.BookingDetails)
                    .ThenInclude(detail => detail.Service)
                .Include(b => b.BookingDetails)
                    .ThenInclude(detail => detail.Product)
                .Include(b => b.Guest)
                .Include(b => b.Branch);


            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }
            else if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var staffId = await GetStaffBranchIdAsync(accountId);
                if (!staffId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == staffId.Value);
            }
            else if (role == "4" || role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
            {
                var customerId = await GetCustomerIdByAccountIdAsync(accountId);
                if (!customerId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.CustomerId == customerId.Value);
            }

            // Sắp xếp theo ngày booking giảm dần (mới nhất trước)
            var bookings = await query.OrderByDescending(b => b.BookingDate).ToListAsync();

            return _mapper.Map<List<BookingDTO>>(bookings);
        }
        public async Task<BookingDTO> GetBookingByBookingIdAsync(int bookingId)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return null;

            IQueryable<Booking> query = _context.Bookings
                .Include(b => b.Customer).ThenInclude(c => c.Account)
                .Include(b => b.Staff).ThenInclude(s => s.Account)
                .Include(b => b.BookingDetails)
                .Include(b => b.Guest)
                .Include(b => b.Branch);

            // Kiểm tra quyền truy cập theo vai trò người dùng
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return null;

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }
            else if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var staffId = await GetStaffBranchIdAsync(accountId);
                if (!staffId.HasValue)
                    return null;

                query = query.Where(b => b.BranchId == staffId.Value);
            }
            else if (role == "4" || role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
            {
                var customerId = await GetCustomerIdByAccountIdAsync(accountId);
                if (!customerId.HasValue)
                    return null;

                query = query.Where(b => b.CustomerId == customerId.Value);
            }

            // Lọc booking theo bookingId
            var booking = await query.FirstOrDefaultAsync(b => b.BookingId == bookingId);
            if (booking == null)
                return null;

            return _mapper.Map<BookingDTO>(booking);
        }


        private async Task<int?> GetManagerBranchIdAsync(string accountId)
        {
            if (!int.TryParse(accountId, out int parsedAccountId))
                return null; 

            return await _context.Employees
                .Where(m => m.AccountId == parsedAccountId && m.Account.Role.RoleName == "Manager")
                .Select(m => m.BranchId)
                .FirstOrDefaultAsync();
        }

        private async Task<int?> GetStaffBranchIdAsync(string accountId)
        {
            if (!int.TryParse(accountId, out int parsedAccountId))
                return null;

            return await _context.Employees
                .Where(s => s.AccountId == parsedAccountId && s.Account.Role.RoleName == "Staff")
                .Select(s => s.BranchId)
                .FirstOrDefaultAsync();
        }

        private async Task<int?> GetCustomerIdByAccountIdAsync(string accountId)
        {
            if (!int.TryParse(accountId, out int parsedAccountId))
                return null;

            return await _context.Customers
                .Where(c => c.AccountId == parsedAccountId)
                .Select(c => c.AccountId)
                .FirstOrDefaultAsync();
        }

        public async Task<List<BookingDTO>> GetBookingsByCustomerIdAsync(int customerId)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<BookingDTO>();

            IQueryable<Booking> query = _context.Bookings
                .Where(b => b.CustomerId == customerId)
             .Include(b => b.Customer).ThenInclude(x => x.Account)
                .Include(b => b.Staff).ThenInclude(x => x.Account)
                .Include(b => b.Branch);

            // Nếu là Manager, lọc theo chi nhánh
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }

            var bookings = await query.ToListAsync();
            return _mapper.Map<List<BookingDTO>>(bookings);
        }

        public async Task<List<BookingDTO>> GetBookingsByStaffIdAsync(int staffId)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<BookingDTO>();

            IQueryable<Booking> query = _context.Bookings
                .Where(b => b.StaffId == staffId)
               .Include(b => b.Customer).ThenInclude(x => x.Account)
                .Include(b => b.Staff).ThenInclude(x => x.Account)
                .Include(b => b.Branch);

            // Nếu là Manager, lọc theo chi nhánh
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }
            if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetStaffBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }

            var bookings = await query.ToListAsync();
            return _mapper.Map<List<BookingDTO>>(bookings);
        }



        public async Task<List<BookingDTO>> GetBookingsByBranchIdAsync(int branchId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.BranchId == branchId)
                .Include(b => b.Customer).ThenInclude(x=>x.Account)
                .Include(b => b.Staff).ThenInclude(x => x.Account)
                .Include(b => b.Branch)
                .ToListAsync();

            return _mapper.Map<List<BookingDTO>>(bookings);
        }

        private (string accountId, string role) GetCurrentUserClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return (null, null);
            }
            var identity = httpContext.User.Identity as ClaimsIdentity;
            if (identity == null)
            {
                return (null, null);
            }
            var accountId = identity.FindFirst("AccountId")?.Value;
            var role = identity.FindFirst(ClaimTypes.Role)?.Value;
            return (accountId, role);
        }
        public async Task<List<BookingDTO>> GetBookingsByStatusAsync(string? status = null)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<BookingDTO>();

            IQueryable<Booking> query = _context.Bookings
                .Include(b => b.Customer).ThenInclude(x => x.Account)
                .Include(b => b.Staff).ThenInclude(x => x.Account)
                .Include(b => b.Branch);

            // Nếu là Manager, lọc theo chi nhánh
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }
            if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetStaffBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }

            // Nếu có trạng thái, lọc theo trạng thái
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(b => b.Status == status);
            }

            var bookings = await query.ToListAsync();
            return _mapper.Map<List<BookingDTO>>(bookings);
        }

        public async Task<List<BookingDTO>> GetLatestBookingsByDaysAsync(int days)
        {
            if (days <= 0) days = 7; // Mặc định lấy đơn trong 7 ngày nếu nhập không hợp lệ

            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<BookingDTO>();

            DateTime cutoffDate = DateTime.UtcNow.AddDays(-days);

            IQueryable<Booking> query = _context.Bookings
                .Where(b => b.BookingDate >= cutoffDate)
                 .Include(b => b.Customer).ThenInclude(x => x.Account)
                .Include(b => b.Staff).ThenInclude(x => x.Account)
                .Include(b => b.Branch)
                .OrderByDescending(b => b.BookingDate); // Sắp xếp theo ngày gần nhất

            // Nếu là Manager, lọc theo chi nhánh của họ
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }
            if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetStaffBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }

            var bookings = await query.ToListAsync();
            return _mapper.Map<List<BookingDTO>>(bookings);
        }
        public async Task<int> GetTotalBookingsCountAsync()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return 0;

            IQueryable<Booking> query = _context.Bookings;

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return 0;

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }
            else if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var staffBranchId = await GetStaffBranchIdAsync(accountId);
                if (!staffBranchId.HasValue)
                    return 0;

                query = query.Where(b => b.BranchId == staffBranchId.Value);
            }
            else if (role == "4" || role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
            {
                var customerId = await GetCustomerIdByAccountIdAsync(accountId);
                if (!customerId.HasValue)
                    return 0;

                query = query.Where(b => b.CustomerId == customerId.Value);
            }

            return await query.CountAsync();
        }
        public async Task<Dictionary<string, int>> GetBookingCountByStatusAsync()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new Dictionary<string, int>
        {
            { "Completed", 0 },
            { "Pending", 0 },
            { "Canceled", 0 }
        };

            IQueryable<Booking> query = _context.Bookings;

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new Dictionary<string, int> { { "Completed", 0 }, { "Pending", 0 }, { "Canceled", 0 } };

                query = query.Where(b => b.BranchId == managerBranchId.Value);
            }
          
            else if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                var staffBranchId = await GetStaffBranchIdAsync(accountId);
                if (!staffBranchId.HasValue)
                    return new Dictionary<string, int> { { "Completed", 0 }, { "Pending", 0 }, { "Canceled", 0 } };

                query = query.Where(b => b.BranchId == staffBranchId.Value);
            }
        
            else if (role == "4" || role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
            {
                var customerId = await GetCustomerIdByAccountIdAsync(accountId);
                if (!customerId.HasValue)
                    return new Dictionary<string, int> { { "Completed", 0 }, { "Pending", 0 }, { "Canceled", 0 } };

                query = query.Where(b => b.CustomerId == customerId.Value);
            }

        
            var counts = await query
                .GroupBy(b => b.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Status, g => g.Count);

            
            return new Dictionary<string, int>
    {
        { "Completed", counts.ContainsKey("Completed") ? counts["Completed"] : 0 },
        { "Pending", counts.ContainsKey("Pending") ? counts["Pending"] : 0 },
        { "Canceled", counts.ContainsKey("Canceled") ? counts["Canceled"] : 0 }
    };
        }







    }
}
