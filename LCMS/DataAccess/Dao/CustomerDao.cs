using AutoMapper;
using BusinessObjects;
using BusinessObjects.DTO.EmployeeDTO;
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
    public class CustomerDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CustomerDao(LcmsContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<List<string>> GetAllStatus()
        {
            return await Task.FromResult(Enum.GetNames(typeof(AccountStatus)).ToList());
        }
        public async Task<List<CustomerDTO>> GetAllCustomer()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<CustomerDTO>();

            IQueryable<Customer> query = _context.Customers
                .Include(x => x.Account)
                .Include(x => x.LaundrySubscriptions)
                .Include(c => c.Bookings);

            // Nếu là Manager thì chỉ lấy những khách hàng có booking ở chi nhánh của manager
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<CustomerDTO>();

                query = query.Where(c => c.Bookings.Any(b => b.BranchId == managerBranchId.Value));
            }

            var customers = await query.ToListAsync();

            // Lấy danh sách CustomerId
            var customerIds = customers.Select(c => c.AccountId).ToList();

            // Tính tổng tiền chi trả thành công theo CustomerId
            var customerSpending = await _context.Payments
                .Where(p => p.PaymentStatus == "Success" && p.Booking.CustomerId != null && customerIds.Contains(p.Booking.CustomerId.Value))
                .GroupBy(p => p.Booking.CustomerId.Value)
                .Select(g => new
                {
                    CustomerId = g.Key,
                    TotalSpent = g.Sum(p => p.AmountPaid)
                })
                .ToListAsync();

            var result = customers.Select(c =>
            {
                var spending = customerSpending.FirstOrDefault(x => x.CustomerId == c.AccountId);
                return new CustomerDTO
                {
                    AccountId = c.AccountId,
                    CustomerName = c.Account?.Name,
                    Email = c.Account?.Email,
                    PhoneNumber = c.Account?.Phone,
                    MembershipLevel = c.MembershipLevel,
                    LoyaltyPoints = c.LoyaltyPoints ?? 0,
                    TotalSpent = spending?.TotalSpent ?? 0,
                    Status = c.Account?.Status,
                    CreatedAt = c.Account?.CreatedAt ?? DateTime.MinValue,
                    PackMonth = c.LaundrySubscriptions
    .Where(s => s.Status == "Active" && s.EndDate >= DateOnly.FromDateTime(DateTime.Today))
    .OrderByDescending(s => s.CreatedDate)
    .FirstOrDefault()?.PackageName

                };
            }).ToList();

            return result;
        }


        public async Task<CustomerDTO> GetUserByID(int id)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return null;

            IQueryable<Customer> query = _context.Customers
                .Include(c => c.Account)
                .Include(c => c.Bookings)
                .Where(c => c.AccountId == id);

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return null;

                query = query.Where(c => c.Bookings.Any(b => b.BranchId == managerBranchId.Value));
            }

            var result = await query.FirstOrDefaultAsync();
            return _mapper.Map<CustomerDTO>(result);
        }

        public async Task<List<CustomerDTO>> SearchUserByName(string name)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<CustomerDTO>();

            IQueryable<Customer> query = _context.Customers
                .Include(x => x.Account)
                .Include(x => x.Bookings)
                .Where(x => x.Account.Name.Contains(name));

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<CustomerDTO>();

                query = query.Where(c => c.Bookings.Any(b => b.BranchId == managerBranchId.Value));
            }

            var result = await query.ToListAsync();
            return _mapper.Map<List<CustomerDTO>>(result);
        }

        public async Task<List<CustomerDTO>> SortCustomersByLoyaltyPoints(bool ascending)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<CustomerDTO>();

            IQueryable<Customer> query = _context.Customers
                .Include(x => x.Account)
                .Include(x => x.Bookings)
                .AsQueryable();

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<CustomerDTO>();

                query = query.Where(c => c.Bookings.Any(b => b.BranchId == managerBranchId.Value));
            }

            query = ascending
                ? query.OrderBy(x => x.LoyaltyPoints)
                : query.OrderByDescending(x => x.LoyaltyPoints);

            var result = await query.ToListAsync();
            return _mapper.Map<List<CustomerDTO>>(result);
        }

        public async Task UpdateMembershipLevel(int customerId)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                return;

            if (customer.LoyaltyPoints >= 200)
                customer.MembershipLevel = "High";
            else if (customer.LoyaltyPoints >= 100)
                customer.MembershipLevel = "Medium";
            else
                customer.MembershipLevel = "Basic";
            await _context.SaveChangesAsync();
        }

        public async Task AddLoyaltyPoints(int customerId, int points)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                return;

            customer.LoyaltyPoints += points;
            await UpdateMembershipLevel(customerId);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateCustomerStatus(int accountId, string newStatus)
        {
            var (currentAccountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(currentAccountId) || string.IsNullOrEmpty(role))
                return false;

            var customerAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountId == accountId);
            if (customerAccount == null)
                return false;

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(currentAccountId);
                if (!managerBranchId.HasValue)
                    return false;

                bool customerInManagerBranch = await _context.Bookings
                    .AnyAsync(b => b.BranchId == managerBranchId.Value && b.CustomerId == accountId);

                if (customerInManagerBranch)
                    return false;
            }

            customerAccount.Status = newStatus;
            _context.Accounts.Update(customerAccount);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetTotalCustomersForManagerBranch()
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return 0;

            IQueryable<int> customerIdsQuery;

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return 0;

                customerIdsQuery = _context.Bookings
                    .Where(b => b.BranchId == managerBranchId.Value && b.CustomerId.HasValue)
                    .Select(b => b.CustomerId.Value)
                    .Distinct();
            }
            else
            {
                customerIdsQuery = _context.Bookings
                    .Where(b => b.CustomerId.HasValue)
                    .Select(b => b.CustomerId.Value)
                    .Distinct();
            }

            return await customerIdsQuery.CountAsync();
        }


        public async Task<List<CustomerDTO>> GetNewCustomersList(int days)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<CustomerDTO>();

            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            IQueryable<Customer> query = _context.Customers
                .Where(c => c.CreatedAt != null && c.CreatedAt >= cutoffDate)
                .Include(c => c.Account); // Bao gồm thông tin tài khoản nếu cần

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<CustomerDTO>();

                query = query.Where(c => c.Bookings.Any(b => b.BranchId == managerBranchId.Value));
            }

            var customers = await query.ToListAsync();
            return _mapper.Map<List<CustomerDTO>>(customers);
        }


        public async Task<List<CustomerDTO>> GetTopServiceCustomers(int topCount)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<CustomerDTO>();

            IQueryable<Booking> bookingsQuery = _context.Bookings;
            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue)
                    return new List<CustomerDTO>();

                bookingsQuery = bookingsQuery.Where(b => b.BranchId == managerBranchId.Value);
            }

            var topCustomerStats = await bookingsQuery
                .GroupBy(b => b.CustomerId)
                .Select(g => new { CustomerId = g.Key, BookingCount = g.Count() })
                .OrderByDescending(x => x.BookingCount)
                .Take(topCount)
                .ToListAsync();

            var customerIds = topCustomerStats.Select(x => x.CustomerId).ToList();
            var customers = await _context.Customers
                .Include(c => c.Account)
                .Where(c => customerIds.Contains(c.AccountId))
                .ToListAsync();

            var sortedCustomers = customers
                .Join(topCustomerStats, c => c.AccountId, tc => tc.CustomerId, (c, tc) => new { Customer = c, tc.BookingCount })
                .OrderByDescending(x => x.BookingCount)
                .Select(x => x.Customer)
                .ToList();

            return _mapper.Map<List<CustomerDTO>>(sortedCustomers);
        }

        public async Task<List<CustomerDTO>> GetTopSpendingCustomersAsync(int topCount, int? branchId = null)
        {
            var (accountId, role) = GetCurrentUserClaims();
            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<CustomerDTO>();

            if (role == "2" || role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                var managerBranchId = await GetManagerBranchIdAsync(accountId);
                if (!managerBranchId.HasValue) return new List<CustomerDTO>();

                branchId = managerBranchId.Value;
            }
            else if (branchId == null)
            {
                return new List<CustomerDTO>();
            }

            // Tính tổng từ AmountPaid của các Payment thành công
            var topCustomerStats = await _context.Payments
                .Where(p => p.PaymentStatus == "Success" && p.Booking.BranchId == branchId)
                .GroupBy(p => p.Booking.CustomerId)
                .Select(g => new
                {
                    CustomerId = g.Key,
                    TotalSpent = g.Sum(p => p.AmountPaid)
                })
                .OrderByDescending(x => x.TotalSpent)
                .Take(topCount)
                .ToListAsync();

            var customerIds = topCustomerStats.Select(x => x.CustomerId).ToList();

            var customers = await _context.Customers
                .Include(c => c.Account)
                .Where(c => customerIds.Contains(c.AccountId))
                .ToListAsync();

            var result = customers
                .Join(topCustomerStats, c => c.AccountId, tc => tc.CustomerId, (c, tc) => new CustomerDTO
                {
                    AccountId = c.AccountId,
                    CustomerName = c.Account.Name,
                    Email = c.Account.Email,
                    PhoneNumber = c.Account.Phone,
                    MembershipLevel = c.MembershipLevel,
                    LoyaltyPoints = c.LoyaltyPoints ?? 0,
                    TotalSpent = tc.TotalSpent
                })
                .OrderByDescending(x => x.TotalSpent)
                .ToList();

            return result;
        }







        public (string accountId, string role) GetCurrentUserClaims()
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

        private async Task<int?> GetManagerBranchIdAsync(string accountId)
        {
            var manager = await _context.Employees.FirstOrDefaultAsync(e => e.AccountId.ToString() == accountId);
            return manager?.BranchId;
        }





    }
}
