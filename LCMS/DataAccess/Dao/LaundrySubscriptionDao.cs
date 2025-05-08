using Microsoft.AspNetCore.Http;
using BusinessObjects.Models;
using BusinessObjects.DTO.LaundrySubscriptionDTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace DataAccess.Dao
{
    public class LaundrySubscriptionDao
    {
        private readonly LcmsContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LaundrySubscriptionDao(LcmsContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<int> AddAsync(string packageName, int customerId)
        {
            var existingSubscription = await _context.LaundrySubscriptions
      .Where(s => s.CustomerId == customerId
               && s.EndDate >= DateOnly.FromDateTime(DateTime.Now)
               && s.Status == "Active")
      .FirstOrDefaultAsync();

            if (existingSubscription != null)
            {
                throw new Exception("Bạn đã có gói giặt đang hoạt động. Vui lòng chờ gói hiện tại hết hạn để mua gói mới.");
            }


            var fixedPackages = GetFixedPackages();
            var package = fixedPackages.FirstOrDefault(p => p.PackageName.Equals(packageName));

            if (package == null)
            {
                throw new Exception("Gói giặt không tồn tại.");
            }

            var subscription = new LaundrySubscription
            {
                CustomerId = customerId,
                PackageName = package.PackageName,
                Price = package.Price,
                MaxWeight = package.MaxWeight,
                RemainingWeight = package.MaxWeight,
                Status = "Active",
                StartDate = DateOnly.FromDateTime(DateTime.Now),
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddMonths(package.PackageName.Contains("1 tháng") ? 1 :
                                                                package.PackageName.Contains("3 tháng") ? 3 : 6))
            };

            _context.LaundrySubscriptions.Add(subscription);
            await _context.SaveChangesAsync();
                
            return subscription.SubscriptionId;
        }

        public async Task<int> AddSubByStaffAsync(string packageName, int customerId)
        {
            var existingSubscription = await _context.LaundrySubscriptions
                .Where(s => s.CustomerId == customerId && s.EndDate >= DateOnly.FromDateTime(DateTime.Now))
                .FirstOrDefaultAsync();

            if (existingSubscription != null)
            {
                throw new Exception("Khác hàng đã có gói giặt đang hoạt động. Vui lòng chờ gói hiện tại hết hạn để mua gói mới.");
            }

            var fixedPackages = GetFixedPackages();
            var package = fixedPackages.FirstOrDefault(p => p.PackageName == packageName);

            if (package == null)
            {
                throw new Exception("Gói giặt không tồn tại.");
            }

            var subscription = new LaundrySubscription
            {
                CustomerId = customerId,
                PackageName = package.PackageName,
                Price = package.Price,
                MaxWeight = package.MaxWeight,
                RemainingWeight = package.MaxWeight,
                Status = "Active",
                StartDate = DateOnly.FromDateTime(DateTime.Now),
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddMonths(package.PackageName.Contains("1 tháng") ? 1 :
                                                                package.PackageName.Contains("3 tháng") ? 3 : 6))
            };

            _context.LaundrySubscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return subscription.SubscriptionId;
        }


        public async Task<List<LaundrySubscriotionDTO>> GetAllSubscriptionsAsync()
        {
            await ExpireSubscriptionsAsync();
            return await _context.LaundrySubscriptions
                .Select(s => new LaundrySubscriotionDTO
                {
                    SubscriptionId = s.SubscriptionId,
                    CustomerId = s.CustomerId,
                    PackageName = s.PackageName,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    MaxWeight = s.MaxWeight,
                    RemainingWeight = s.RemainingWeight,
                    Status = s.Status,
                    Price = s.Price
                })
                .ToListAsync();
        }
        public async Task ExpireSubscriptionsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Now);

            var subscriptions = await _context.LaundrySubscriptions
                .Where(s => s.Status == "Active" &&
                           (s.EndDate < today ||  s.RemainingWeight <= 0))
                .ToListAsync();

            if (subscriptions.Any())
            {
                foreach (var subscription in subscriptions)
                {
                    subscription.Status = "Expired";
                }

                await _context.SaveChangesAsync();
            }
        }


        public async Task<List<LaundrySubscriotionDTO>> GetAllSubscriptionsByAccountIdAsync(int accountId)
        {
            await ExpireSubscriptionsAsync();
            return await _context.LaundrySubscriptions
                .Where(s => s.CustomerId == accountId)
                .Select(s => new LaundrySubscriotionDTO
                {
                    SubscriptionId = s.SubscriptionId,
                    CustomerId = s.CustomerId,
                    PackageName = s.PackageName,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    MaxWeight = s.MaxWeight,
                    RemainingWeight = s.RemainingWeight,
                    Status = s.Status,
                    Price = s.Price,
                    CustomerName = s.Customer.Account.Name,
                    MembershipLevel = s.Customer.MembershipLevel,
                    LoyaltyPoints = s.Customer.LoyaltyPoints,
                    Email = s.Customer.Account.Email,
                    PhoneNumber = s.Customer.Account.Phone,
                    StatusAccount = s.Customer.Account.Status
                })
                .ToListAsync();
        }

        public async Task<LaundrySubscriotionDTO> GetSubscriptionsByAccountIdAsync(int accountId)
        {
            await ExpireSubscriptionsAsync();  // Nếu có logic này

            // Trả về một đối tượng thay vì danh sách và chỉ lấy các bản ghi có Status = "Active"
            return await _context.LaundrySubscriptions
                .Where(s => s.CustomerId == accountId && s.Status == "Active")  // Thêm điều kiện Status = "Active"
                .Select(s => new LaundrySubscriotionDTO
                {
                    SubscriptionId = s.SubscriptionId,
                    CustomerId = s.CustomerId,
                    PackageName = s.PackageName,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    MaxWeight = s.MaxWeight,
                    RemainingWeight = s.RemainingWeight,
                    Status = s.Status,
                    Price = s.Price,
                    CustomerName = s.Customer.Account.Name,
                    MembershipLevel = s.Customer.MembershipLevel,
                    LoyaltyPoints = s.Customer.LoyaltyPoints,
                    Email = s.Customer.Account.Email,
                    PhoneNumber = s.Customer.Account.Phone,
                    StatusAccount = s.Customer.Account.Status
                })
                .FirstOrDefaultAsync();  // Dùng FirstOrDefaultAsync() để lấy 1 đối tượng
        }

        public async Task<List<LaundryDTO>> GetSubscriptionsByBookingIDc(int bookingID)
        {
            await ExpireSubscriptionsAsync();

          
            var customerId = await _context.Bookings
                .Where(b => b.BookingId == bookingID)
                .Select(b => b.CustomerId)
                .FirstOrDefaultAsync();

            if (customerId == 0) 
            {
                return new List<LaundryDTO>(); 
            }

           
            var subscriptions = await _context.LaundrySubscriptions
                .Where(s => s.CustomerId == customerId)
                .Select(s => new LaundryDTO
                {
                    SubscriptionId = s.SubscriptionId,
                    CustomerName = s.Customer.Account.Name,
                    PackageName = s.PackageName,
                    Status = s.Status
                })
                .ToListAsync();

            return subscriptions;
        }




        public List<LaundrySubscriotionDTO> GetFixedPackages()
        {
            var packages = new List<LaundrySubscriotionDTO>
    {
        new LaundrySubscriotionDTO { PackageName = "Gói 1 tháng", MaxWeight = 20, RemainingWeight = 30, Price = 399000, Status = "Active" },
        new LaundrySubscriotionDTO { PackageName = "Gói 3 tháng", MaxWeight = 75, RemainingWeight = 75, Price = 999000, Status = "Active" },
        new LaundrySubscriotionDTO { PackageName = "Gói 6 tháng", MaxWeight = 180, RemainingWeight = 180, Price = 1799000, Status = "Active" }
    };

            return packages;
        }


        public List<string> GetPackageNames()
        {
            return GetFixedPackages().Select(p => p.PackageName).ToList();
        }
        public async Task<bool> HasActiveSubscriptionAsync(int customerId)
        {
            var today = DateOnly.FromDateTime(DateTime.Now);
            return await _context.LaundrySubscriptions.AnyAsync(s =>
                s.CustomerId == customerId &&
                s.Status == "Active" &&
                s.EndDate >= today &&
                (s.RemainingWeight > 0));
        }


    }
}