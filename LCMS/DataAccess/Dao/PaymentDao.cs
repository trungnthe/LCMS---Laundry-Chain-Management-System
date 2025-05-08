using BusinessObjects.DTO.LaundrySubscriptionDTO;
using BusinessObjects.DTO.LaundrySubscriptionDTO;
using BusinessObjects.DTO.PaymentDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using System.Security.Claims;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class PaymentDao
    {
        private readonly LcmsContext _context;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public PaymentDao(LcmsContext context,IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<PaymentDTO> GetPaymentByBookingId(int bookingId)
        {
            var payment = await _context.Payments
                .Where(p => p.BookingId == bookingId)
                  .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentDTO
                {
                    PaymentId = p.PaymentId,
                    BookingId = p.BookingId.Value,
                    PaymentDate = p.PaymentDate,
                    AmountPaid = p.AmountPaid,
                    PaymentStatus = p.PaymentStatus,
                    Qrcode = p.Qrcode,
                    Discount = p.Discount,
                    TotalPrice = p.TotalPrice,
                    PaymentType = p.PaymentType,
                    Points = p.Points,
                    CreateBy = p.CreateBy,
                    Name = _context.Accounts
                        .Where(a => a.AccountId == p.CreateBy)
                        .Select(a => a.Name)
                        .FirstOrDefault() ?? "Unknown"
                })
                .FirstOrDefaultAsync();

            if (payment == null)
            {
                return payment;
            }

            return payment;
        }

        public async Task DeletePaymentsByBookingIdAsync(int bookingId)
        {
            var payments = _context.Payments.Where(p => p.BookingId == bookingId);
            _context.Payments.RemoveRange(payments);
            await _context.SaveChangesAsync();
        }
        

        public async Task AddLoyaltyPoints(int bookingID)
        {
          
            var customerId = await _context.Bookings
                .Where(b => b.BookingId == bookingID)
                .Select(b => b.CustomerId)

                .FirstOrDefaultAsync();

            if (customerId == null)
                throw new InvalidOperationException($"No customer found for BookingID {bookingID}");

            var payment = await _context.Payments
     .AsNoTracking()
     .Where(p => p.BookingId == bookingID)
     .OrderByDescending(p => p.PaymentDate) 
     .FirstOrDefaultAsync();



            if (payment == null)
                throw new InvalidOperationException("Payment record not found!");

            if (payment.PaymentStatus != "Success")
                return;

            if (payment.CreateBy == null)
                throw new InvalidOperationException("Payment does not have a valid CreateBy ID!");

          
            var account = await _context.Customers.FindAsync(customerId);
            if (account == null)
                throw new InvalidOperationException($"Account with ID {payment.CreateBy} not found!");

     
            decimal totalAmount = payment.AmountPaid;
            decimal pointsEarned = (totalAmount / 100000) * 20;

         
            account.LoyaltyPoints = (account.LoyaltyPoints ?? 0) + (int)pointsEarned;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new Exception($"Database update failed: {ex.InnerException?.Message}");
            }
        }


        public async Task<int> GetPoint(int accountId)
        {
            var account = await _context.Customers
                .Where(a => a.AccountId == accountId)
                .Select(a => a.LoyaltyPoints)
                .FirstOrDefaultAsync();

            return account.Value; 
        }
        public async Task UpdateUserPoints(int pointsUsed, int bookingID)
        {
            var accountId = await _context.Bookings
                   .Where(b => b.BookingId == bookingID)
                   .Select(b => b.CustomerId)
                   .FirstOrDefaultAsync();
            if (accountId == null) return; 

            var user = await _context.Customers.FirstOrDefaultAsync(u => u.AccountId == accountId);
            if (user != null)
            {
                user.LoyaltyPoints = Math.Max(user.LoyaltyPoints.Value - pointsUsed, 0);
                await _context.SaveChangesAsync();
            }
        }




        public async Task<int> GetCurrentUserPoints(int bookingID)
        {
            var booking = await _context.Bookings
                .Where(b => b.BookingId == bookingID)
                .Select(b => b.CustomerId)
                .FirstOrDefaultAsync(); 

            if (booking == null)
            {
                return 0; 
            }

            return await GetPoint(booking.Value);
        }
        public async Task UpdateBookingDetailsStatus(int bookingId, string newStatus)
        {
            var bookingDetails = await _context.Bookings
                .Where(bd => bd.BookingId == bookingId)
                .ToListAsync();

            foreach (var detail in bookingDetails)
            {
                detail.Status = newStatus;
            }

            await _context.SaveChangesAsync();
        }


        public async Task SaveAsync()
        {
            _context.SaveChanges();
        }




  public async Task<Booking?> GetCompletedBookingAsync(int bookingId)
{
    return await _context.Bookings.Include(x=>x.BookingDetails)
        .FirstOrDefaultAsync(b => b.BookingId == bookingId && (b.Status == "Completed" || b.Status == "Delivering"));
}


        public async Task<List<Payment?>> GetPendingPaymentByBookingIdAsync(int bookingId)
        {
            var pendingPayment = await _context.Payments
                .Where(p => p.BookingId == bookingId && p.PaymentStatus == "Pending").ToListAsync();
                


            return pendingPayment;
        }

    

        public async Task<Payment?> GetSuccessfulPaymentByBookingIdAsync(int bookingId)
        {
            return await _context.Payments.Include(x=>x.SubscriptionUsageHistories)
                .FirstOrDefaultAsync(p => p.BookingId == bookingId && p.PaymentStatus == "Success");
        }


        public async Task<Payment?> GetPaymentByIdAsync(int paymentId)
        {
            return await _context.Payments.FirstOrDefaultAsync(x => x.OrderCode.Value == paymentId);
        }



        public async Task<Payment> CreatePayment(Payment payment)
        {
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<bool> UpdatePaymentStatus(int paymentId, string status)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null) return false;


            if (payment.PaymentStatus == status) return true;

            payment.PaymentStatus = status;
            _context.Entry(payment).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return true;
        }
        private string GetMembershipLevel(decimal totalSpent)
        {
            if (totalSpent >= 10000000) return "Diamond";
            if (totalSpent >= 5000000) return "Gold";
            if (totalSpent >= 2000000) return "Silver";
            return "Bronze";
        }
        public async Task<decimal> GetTotalSpentAsync(int accountId)
        {
            return await _context.Payments
                .Where(p => p.Booking.Customer.AccountId == accountId && p.PaymentStatus == "Success")
                .SumAsync(p => p.AmountPaid);
        }

        public async Task UpdateMembershipLevel(int bookingID)
        {
            var accountId = await _context.Bookings
                .Where(b => b.BookingId == bookingID)
                .Select(b => b.CustomerId)
                .FirstOrDefaultAsync();

            if (accountId == null) return;

            var user = await _context.Customers.FirstOrDefaultAsync(u => u.AccountId == accountId);
            if (user != null)
            {
                decimal totalSpent = await GetTotalSpentAsync(accountId.Value);
                user.MembershipLevel = GetMembershipLevel(totalSpent);
                

               
                try
                {
                    _context.Entry(user).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                   
                }
                catch (DbUpdateException ex)
                {
                   
                }

            }
        }


        public async Task UpdateCurrentUserMembershipLevel(int bookingID)
        {


            await UpdateMembershipLevel(bookingID);
        }
        public async Task<Customer?> GetCurrentUserAsync(int bookingID)
        {
           
            var accountId = await _context.Bookings
                .Where(b => b.BookingId == bookingID)
                .Select(b => b.CustomerId)
                .FirstOrDefaultAsync();

            if (accountId == null) return null; 

            
            return await _context.Customers
                .FirstOrDefaultAsync(c => c.AccountId == accountId);
        }

        public async Task<string?> GetCurrentUserMembershipLevelAsync( int bookingID)
        {
            var accountId = await _context.Bookings
                   .Where(b => b.BookingId == bookingID)
                   .Select(b => b.CustomerId)
                   .FirstOrDefaultAsync(); 
            if (accountId == null) return null;

            var user = await _context.Customers
                .Where(c => c.AccountId == accountId)
                .Select(c => c.MembershipLevel)
                .FirstOrDefaultAsync();

            return user;
        }
        public async Task<(int TotalQuantity, int TotalWeight)> GetBookingDetailsAsync(int bookingId)
        {
            var bookingDetails = await _context.BookingDetails
                .Where(bd => bd.BookingId == bookingId)
                .GroupBy(bd => bd.BookingId)
                .Select(group => new
                {
                    TotalQuantity = group.Sum(bd => bd.Quantity),
                    TotalWeight = group.Sum(bd => bd.Weight)
                })
                .FirstOrDefaultAsync();

            if (bookingDetails == null)
            {
                return (0, 0);
            }

            return (bookingDetails.TotalQuantity.Value, (int)bookingDetails.TotalWeight);
        }

        public decimal CalculateExtraCost(decimal remainingWeight, decimal weight, decimal servicePrice, out decimal updatedRemaining)
        {
            if (remainingWeight >= weight)
            {
                updatedRemaining = remainingWeight - weight;
                return 0; // Không vượt cân ⇒ không có phụ phí
            }

            // Trường hợp chỉ còn lại một phần trong subscription
            decimal unpaidWeight = weight - remainingWeight;
            updatedRemaining = 0;
            return unpaidWeight * servicePrice;
        }

        public async Task<decimal> CalculateBookingDetailPrice(Booking booking)
        {
            decimal totalPrice = 0;

            var subscription = await _context.LaundrySubscriptions
                .Where(s => s.CustomerId == booking.CustomerId && s.Status == "Active")
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync();

            bool hasValidSubscription = subscription != null && subscription.EndDate >= DateOnly.FromDateTime(DateTime.Now);
            decimal remainingWeight = hasValidSubscription ? subscription.RemainingWeight.Value : 0;

            foreach (var detail in booking.BookingDetails)
            {
                var service = await _context.Services
                    .Include(s => s.ServiceType)
                    .FirstOrDefaultAsync(s => s.ServiceId == detail.ServiceId);

                if (service == null)
                    throw new ArgumentException($"Dịch vụ ID {detail.ServiceId} không tồn tại!");

                decimal servicePrice = service.Price ?? 0;
                string serviceTypeName = service.ServiceType.ServiceTypeName?.Trim() ?? "";

                if (serviceTypeName.Equals("Giặt lẻ", StringComparison.OrdinalIgnoreCase))
                {
                    if (detail.ProductId.HasValue)
                    {
                        var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == detail.ProductId);
                        if (product == null)
                            throw new ArgumentException($"Sản phẩm ID {detail.ProductId} không tồn tại!");

                        decimal productPrice = product.Price;
                        int quantity = detail.Quantity ?? 1;

                        totalPrice += (productPrice * quantity) + servicePrice;
                    }
                    else
                    {
                        throw new ArgumentException("Sản phẩm là bắt buộc cho dịch vụ 'Giặt lẻ'!");
                    }
                }
                else // Dịch vụ theo cân
                {
                    decimal weight = detail.Weight ?? 1;

                    if (hasValidSubscription && remainingWeight > 0)
                    {
                        decimal extraCost = CalculateExtraCost(remainingWeight, weight, servicePrice, out remainingWeight);
                        totalPrice += extraCost;
                    }
                    else
                    {
                        totalPrice += weight * servicePrice;
                    }
                }
            }

            return totalPrice + (booking.ShippingFee ?? 0);
        }



        public async Task ApplySubscriptionToBookingAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .Include(b => b.Payments)  // Make sure to include the Payments collection (or single relationship)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null || booking.BookingDetails == null || !booking.BookingDetails.Any())
                return;

            var subscription = await _context.LaundrySubscriptions
                .Where(s => s.CustomerId == booking.CustomerId && s.Status == "Active")
                .OrderByDescending(s => s.EndDate)
                .FirstOrDefaultAsync();

            if (subscription == null || subscription.EndDate < DateOnly.FromDateTime(DateTime.Now))
                return;

            decimal totalUsedWeight = 0;  // Variable to accumulate total used weight

            foreach (var detail in booking.BookingDetails)
            {
                var service = await _context.Services
                    .Include(s => s.ServiceType)
                    .FirstOrDefaultAsync(s => s.ServiceId == detail.ServiceId);

                if (service == null)
                    continue;

                string serviceTypeName = service.ServiceType.ServiceTypeName?.Trim() ?? "";

                if (!serviceTypeName.Equals("Giặt lẻ", StringComparison.OrdinalIgnoreCase))
                {
                    decimal weight = detail.Weight ?? 1;
                    decimal usedWeight = 0;

                    if (subscription.RemainingWeight >= weight)
                    {
                        subscription.RemainingWeight -= weight;
                        usedWeight = weight;
                    }
                    else
                    {
                        usedWeight = subscription.RemainingWeight ?? 0;
                        subscription.RemainingWeight = 0;
                    }

                    totalUsedWeight += usedWeight;  // Accumulate the used weight

                    if (subscription.RemainingWeight == 0)
                    {
                        subscription.Status = "Expired";
                    }
                }
            }

            // If there's any used weight, create a single history entry
            if (totalUsedWeight > 0)
            {
                var payment = booking.Payments?.FirstOrDefault();
                if (payment != null)
                {
                    var usageHistory = new SubscriptionUsageHistory
                    {
                        SubscriptionId = subscription.SubscriptionId,
                        BookingId = booking.BookingId,
                        WeightUsed = (double)totalUsedWeight,
                        UsedDate = DateTime.Now,
                        PaymentId = payment.PaymentId,
                        Note = "Sử dụng vé tháng"
                    };
                    _context.SubscriptionUsageHistories.Add(usageHistory);
                }
                else
                {
                    // Handle the case where no payment is found
                    throw new InvalidOperationException("No payment record found for the booking.");
                }
            }

            await _context.SaveChangesAsync();
        }







        public async Task RemovePendingPaymentsAsync(IEnumerable<Payment> pendingPayments)
        {
            _context.Payments.RemoveRange(pendingPayments); 
            await _context.SaveChangesAsync();
        }
        public async Task<Payment?> GetLatestPaymentByOrderCode(int orderCode)
        {
            return await _context.Payments
                .Where(p => p.OrderCode == orderCode)
                .FirstOrDefaultAsync();
        }

        public async Task DeletePaymentsByPaymentIdAsync(long paymentId)
        {
            var payments = _context.Payments.Where(p => p.PaymentId == paymentId);
            _context.Payments.RemoveRange(payments);
            await _context.SaveChangesAsync();
        }
    }
}
