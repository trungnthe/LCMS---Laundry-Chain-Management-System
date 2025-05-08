using BusinessObjects;
using BusinessObjects.DTO.BookingHistoryDTO;
using BusinessObjects.DTO.BookingStaffDTO;
using BusinessObjects.Models;
using BusinessObjects.SendMail;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace DataAccess.Dao
{
    public class BookingHistoryDao
    {
        private readonly LcmsContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly EmailService _emailService;
        private readonly ILogger<BookingHistoryDao> _logger;


        public BookingHistoryDao(LcmsContext context, IHttpContextAccessor httpContextAccessor, EmailService emailService, ILogger<BookingHistoryDao> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
            _logger = logger;

        }
        public async Task<bool> UpdateBookingStatusAsync(int bookingId, string newStatus)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var (accountId, role) = GetCurrentUserClaims();
                    if (accountId == null)
                        throw new UnauthorizedAccessException("User is not authenticated!");

                    var booking = await _context.Bookings
                       .Include(b => b.BookingDetails)
                       .Include(b => b.Customer).ThenInclude(c => c.Account)
                       .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                    if (booking == null)
                        throw new InvalidOperationException("Booking not found!");

                    if (booking.Status == newStatus)
                        throw new InvalidOperationException("The new status is the same as the current status!");

                    var bookingEntity = await _context.Bookings.FindAsync(bookingId);
                    string oldStatus = bookingEntity.Status;

                    if (role == "Customer")
                    {
                        if (!(booking.Status == "Pending" && newStatus == "Canceled") && newStatus != "Done")
                            throw new UnauthorizedAccessException("Customers can only cancel a pending booking or mark it as done.");

                        bookingEntity.Status = newStatus;
                    }
                    else
                    {
                        if (booking.Status == "InProgress")
                        {
                            bool allDetailsCompleted = booking.BookingDetails.All(bd => bd.StatusLaundry == "Completed");
                            if (!allDetailsCompleted)
                                throw new InvalidOperationException("Cannot update booking status unless all booking details are completed!");

                          
                        }

                        bookingEntity.Status = newStatus;
                        bookingEntity.StaffId = int.Parse(accountId);
                    }
                  


                    var updatedBy = int.TryParse(accountId, out var parsedAccountId) &&
                        await _context.Employees.AnyAsync(e => e.AccountId == parsedAccountId)
                            ? parsedAccountId
                            : (int?)null;

                    _context.BookingStatusHistories.Add(new BookingStatusHistory
                    {
                        BookingId = bookingId,
                        OldStatus = oldStatus,
                        NewStatus = newStatus,
                        UpdatedAt = DateTime.Now,
                        UpdatedBy = updatedBy
                    });

                    await _context.SaveChangesAsync();

                    if (Enum.TryParse(newStatus, out BookingStatus bookingStatus))
                    {
                    
                        await SendNotificationToCustomer(bookingId, newStatus);

                        var tasks = new List<Task>();

                        if (booking.Customer?.Account != null)
                        {
                            string email = booking.Customer.Account.Email;
                            string name = booking.Customer.Account.Name;

                         
                            if (bookingStatus == BookingStatus.Confirmed || bookingStatus == BookingStatus.Done)
                            {
                                tasks.Add(SendBookingStatusEmail(email, name, bookingId.ToString(), bookingStatus));
                            }

                          
                            if (bookingStatus == BookingStatus.Done)
                            {
                                tasks.Add(SendEmailToCustomerWithTotalAmountAsync(bookingId));
                            }
                        }

                        await Task.WhenAll(tasks);
                    }

                    else
                    {
                        throw new InvalidOperationException($"Invalid booking status: {newStatus}");
                    }

                    await transaction.CommitAsync();
                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, $"Error updating booking status: {ex.Message}");
                    throw new ApplicationException($"Failed to update booking status: {ex.Message}", ex);
                }
            });
        }

        public async Task<bool> UpdateBookingStatusDoneAsync(int updatedById, int bookingId, string newStatus)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.BookingDetails)
                    .Include(b => b.Customer).ThenInclude(c => c.Account)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null)
                {
                    throw new ArgumentException($"Booking ID {bookingId} does not exist!");
                }

             
                var statusHistory = new BookingStatusHistory
                {
                    BookingId = bookingId,
                    OldStatus = booking.Status,
                    NewStatus = newStatus,
                    UpdatedAt = DateTime.Now,
                    UpdatedBy = await _context.Employees.AnyAsync(e => e.AccountId == updatedById) ? updatedById : (int?)null
                };
                _context.BookingStatusHistories.Add(statusHistory);
                // Cập nhật trạng thái mới cho booking
                booking.Status = newStatus;
                booking.StaffId = null;

                await _context.SaveChangesAsync();

                // Gửi email và thông báo nếu trạng thái hợp lệ
                if (Enum.TryParse(newStatus, out BookingStatus bookingStatus))
                {
                    var tasks = new List<Task>();

                    // Chỉ gửi email nếu khách hàng có account và trạng thái là Confirmed hoặc Done
                    if (booking.Customer?.Account != null &&
                        (bookingStatus == BookingStatus.Confirmed || bookingStatus == BookingStatus.Done))
                    {
                        tasks.Add(SendBookingStatusEmail(
                            booking.Customer.Account.Email,
                            booking.Customer.Account.Name,
                            bookingId.ToString(),
                            bookingStatus));

                        if (bookingStatus == BookingStatus.Done)
                        {
                            tasks.Add(SendEmailToCustomerWithTotalAmountAsync(bookingId));
                        }

                        tasks.Add(SendNotificationToCustomer(bookingId, newStatus));
                    }

                    await Task.WhenAll(tasks);
                }
                else
                {
                    throw new InvalidOperationException($"Invalid booking status: {newStatus}");
                }

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }


        private async Task SendNotificationToCustomer(int bookingId, string newStatus)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Staff)
                    .Include(b => b.Customer).ThenInclude(c => c.Account)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null || booking.Customer == null)
                {
                    _logger.LogWarning($"Booking {bookingId} hoặc Customer không tồn tại.");
                    return;
                }

                var customerId = booking.CustomerId;

                var encryptedOrderCode = AesEncryptionHelper.EncryptToShortCode(booking.BookingId.ToString());

                // Lấy mã số từ mã hóa
                var orderCode = booking.BookingId;

                var statusMessages = new Dictionary<string, (string title, string message)>
                {
                    ["Pending"] = (
                        $"Đơn hàng #{orderCode} chờ xác nhận",
                        "Đơn hàng của bạn đang chờ xác nhận từ hệ thống."
                    ),
                    ["Confirmed"] = (
                        $"Đơn hàng #{orderCode} đã xác nhận",
                        "Đơn giặt của bạn đã được xác nhận thành công."
                    ),
                    ["Received"] = (
                        $"Đơn hàng #{orderCode} đã nhận đồ",
                        "Chúng tôi đã nhận được đồ của bạn."
                    ),
                    ["InProgress"] = (
                        $"Đơn hàng #{orderCode} đang xử lý",
                        "Đơn hàng của bạn đang được tiến hành giặt."
                    ),
                    ["Completed"] = (
                        $"Đơn hàng #{orderCode} hoàn tất",
                        "Đơn giặt của bạn đã được hoàn tất, chọn phương thức thanh toán và thanh toán ngay."
                    ),
                    ["Delivering"] = (
                        $"Đơn hàng #{orderCode} đang giao",
                        "Đơn hàng của bạn đang trên đường giao, vui lòng để ý điện thoại."
                    ),
                    ["Done"] = (
                        $"Đơn hàng #{orderCode} đã hoàn tất",
                        "Bạn đã hoàn tất đơn hàng. Cảm ơn bạn đã sử dụng dịch vụ!"
                    ),
                    ["Canceled"] = (
                        $"Đơn hàng #{orderCode} đã hủy",
                        "Đơn hàng của bạn đã được hủy thành công."
                    ),
                    ["Rejected"] = (
                        $"Đơn hàng #{orderCode} bị từ chối",
                        "Rất tiếc, đơn hàng của bạn đã bị từ chối."
                    )
                };

                (string title, string message) = statusMessages.ContainsKey(newStatus)
                    ? statusMessages[newStatus]
                    : ($"Cập nhật trạng thái đơn hàng #{booking.BookingId}", $"Đơn hàng #{booking.BookingId} của bạn đã được cập nhật trạng thái: {newStatus}.");

                var notification = new Notification
                {
                    Title = title,
                    Content = message,
                    AccountId = customerId,
                    CreatedById = booking.StaffId ?? 0,
                    CreatedAt = DateTime.Now,
                    BookingId = booking.BookingId,
                    Type = "đơn hàng",
                    IsRead = false
                };


                await _context.Notifications.AddAsync(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã gửi thông báo cho khách hàng {customerId} về trạng thái mới của đơn hàng {bookingId}.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi gửi thông báo cho khách hàng Booking {bookingId}: {ex.Message}");
            }
        }

        public async Task<bool> UpdateBookingDetailStatusAsync(int bookingDetailId, string newStatusLaundry)
        {
            try
            {
                var (accountId, role) = GetCurrentUserClaims();
                if (accountId == null)
                {

                    return false;
                }

                var bookingDetail = await _context.BookingDetails
              .Include(bd => bd.Booking)
              .FirstOrDefaultAsync(bd => bd.BookingDetailId == bookingDetailId);

                if (bookingDetail == null)
                    return false;

                // Không cần cập nhật nếu trạng thái không thay đổi
                if (bookingDetail.StatusLaundry == newStatusLaundry)
                    return false;

                var booking1 = bookingDetail.Booking;

                // Nếu cả LaundryType và DeliveryType đều trống
                if (string.IsNullOrEmpty(booking1.LaundryType) && string.IsNullOrEmpty(booking1.DeliveryType))
                {
                    // Nạp lại Booking để tính lại tổng tiền (bao gồm các chi tiết)
                    var fullBooking = await _context.Bookings
                        .Include(b => b.BookingDetails)
                        .FirstOrDefaultAsync(b => b.BookingId == booking1.BookingId);

                    if (fullBooking == null)
                    {
                        Console.Error.WriteLine($"Booking with ID {booking1.BookingId} not found.");
                        return false;
                    }

                    decimal totalPrice = fullBooking.BookingDetails.Sum(bd => bd.Price ?? 0);

                    if (fullBooking.ShippingFee.HasValue)
                        totalPrice += fullBooking.ShippingFee.Value;

                    fullBooking.TotalAmount = totalPrice;

                    await _context.SaveChangesAsync();
                }


                if (bookingDetail.StatusLaundry == newStatusLaundry)
                {

                    return false;
                }

                var updatedAt = DateTime.Now;

                var detailStatusHistory = new BookingDetailHistory
                {
                    BookingDetailId = bookingDetailId,
                    BookingId = bookingDetail.BookingId,
                    OldStatusLaundry = bookingDetail.StatusLaundry,
                    NewStatusLaundry = newStatusLaundry,
                    UpdatedAt = updatedAt,
                    UpdatedBy = int.TryParse(accountId, out var userId) ? userId : 0
                };

                await _context.BookingDetailHistories.AddAsync(detailStatusHistory);

                bookingDetail.StatusLaundry = newStatusLaundry;
                await _context.SaveChangesAsync();

                bool isFirstInProgress = await _context.BookingDetails
           .Where(bd => bd.BookingId == bookingDetail.BookingId)
           .AnyAsync(bd => bd.StatusLaundry == "Washing");

                if (isFirstInProgress && newStatusLaundry == "Washing")
                {
                    var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BookingId == bookingDetail.BookingId);
                    if (booking != null && booking.Status == "Received")
                    {
                        booking.Status = "InProgress";
                        await _context.SaveChangesAsync();
                    }
                }


                var allDetailsInProgress = await _context.BookingDetails
                    .Where(bd => bd.BookingId == bookingDetail.BookingId)
                    .AllAsync(bd => bd.StatusLaundry == "Washing");

                bool allDetailsCompleted = await _context.BookingDetails
            .Where(bd => bd.BookingId == bookingDetail.BookingId)
            .AllAsync(bd => bd.StatusLaundry == "Completed");

                if (allDetailsInProgress)
                {
                    var finishTime = await CalculateFinishTime(bookingDetail.BookingId);
                    await SendEmailToCustomerAsync(bookingDetail.BookingId);
                    await SendNotificationToCustomer(bookingDetail.BookingId);
                  


                    if (finishTime.HasValue)
                    {
                        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BookingId == bookingDetail.BookingId);
                        if (booking != null)
                        {
                            booking.FinishTime = finishTime.Value;
                            await _context.SaveChangesAsync();

                        }

                    }

                }
                if (allDetailsCompleted)
                {
                    var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.BookingId == bookingDetail.BookingId);
                    if (booking != null)
                    {
                        await UpdateBookingStatusAsync(bookingDetail.BookingId, "Completed");
                    }
                }

                return true;
            }
            catch (DbUpdateException dbEx)
            {

                return false;
            }
            catch (Exception ex)
            {

                return false;
            }
        }

        private async Task SendNotificationToCustomer(int bookingId)
        {
            try
            {
                var booking = await _context.Bookings.Include(x => x.Staff)
                    .Include(b => b.Customer).ThenInclude(x => x.Account)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null || booking.Customer == null)
                {
                    _logger.LogWarning($"Booking {bookingId} hoặc Customer không tồn tại.");
                    return;
                }

                if (booking.FinishTime == null)
                {
                    _logger.LogWarning($"Booking {bookingId} chưa có FinishTime.");
                    return;
                }

                var customerId = booking.Customer.AccountId;
                var finishTime = booking.FinishTime.Value.ToString("HH:mm dd/MM/yyyy");

                var notification = new Notification
                {
                    Title = "Thời gian hoàn thành đơn hàng",
                    Content = $"Đơn hàng #{booking.BookingId} của bạn sẽ hoàn thành vào {finishTime}.",
                    AccountId = customerId,
                    CreatedById = booking.StaffId.Value,
                    CreatedAt = DateTime.Now,
                    BookingId = booking.BookingId,
                    Type = "đơn hàng",
                    IsRead = false
                };

                await _context.Notifications.AddAsync(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Đã gửi thông báo cho khách hàng {customerId} về thời gian hoàn thành đơn hàng {bookingId}.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi gửi thông báo cho khách hàng Booking {bookingId}: {ex.Message}");
            }
        }


        public async Task SendEmailToCustomerAsync(int bookingId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Customer).ThenInclude(x => x.Account)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null || booking.Customer == null)
                {
                    _logger.LogWarning($"Booking {bookingId} hoặc Customer không tồn tại.");
                    return;
                }

                if (booking.FinishTime == null)
                {
                    _logger.LogWarning($"Booking {bookingId} chưa có FinishTime.");
                    return;
                }

                string customerEmail = booking.Customer.Account.Email;
                if (string.IsNullOrEmpty(customerEmail))
                {
                    _logger.LogWarning($"Khách hàng không có email (Booking {bookingId}).");
                    return;
                }

                string customerName = booking.Customer.Account.Name;
                string finishTime = booking.FinishTime.Value.ToString("HH:mm dd/MM/yyyy");

                string subject = "Thông báo thời gian hoàn thành đơn hàng của bạn";
                string body = $@"
        <p>Xin chào <strong>{customerName}</strong>,</p>
        <p>Đơn hàng <strong>#{booking.BookingId}</strong> của bạn sẽ hoàn thành vào:</p>
        <h3>{finishTime}</h3>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>";

                await _emailService.SendEmailAsync(customerEmail, subject, body);

                _logger.LogInformation($"Đã gửi email cho khách hàng {customerEmail} về thời gian hoàn thành đơn hàng {bookingId}.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi gửi email cho Booking {bookingId}: {ex.Message}");
            }
        }
        public async Task SendEmailToCustomerWithTotalAmountAsync(int bookingId)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Customer).ThenInclude(c => c.Account)
                    .FirstOrDefaultAsync(b => b.BookingId == bookingId);

                if (booking == null || booking.Customer == null)
                {
                    _logger.LogWarning($"Booking {bookingId} hoặc Customer không tồn tại.");
                    return;
                }

                string customerEmail = booking.Customer.Account.Email;
                if (string.IsNullOrEmpty(customerEmail))
                {
                    _logger.LogWarning($"Khách hàng không có email (Booking {bookingId}).");
                    return;
                }

                string customerName = booking.Customer.Account.Name;
                decimal totalAmount = booking.TotalAmount ?? 0;

                string subject = "Xác nhận hoàn thành đơn hàng & Hóa đơn thanh toán";
                string body = $@"
        <p>Xin chào <strong>{customerName}</strong>,</p>
        <p>Đơn hàng <strong>#{booking.BookingId}</strong> của bạn đã được hoàn thành.</p>
     <p><strong>Tổng số tiền:</strong> {totalAmount.ToString("C", CultureInfo.GetCultureInfo("vi-VN"))}</p>

        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>";

                await _emailService.SendEmailAsync(customerEmail, subject, body);

                _logger.LogInformation($"Đã gửi email hóa đơn cho khách hàng {customerEmail} với tổng số tiền {totalAmount:C}.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi gửi email hóa đơn cho Booking {bookingId}: {ex.Message}");
            }
        }
        private async Task<decimal> CalculateBookingTotalAmount(Booking booking)
        {
            try
            {
                decimal totalAmount = 0;
                Console.WriteLine($"[INFO] Booking {booking.BookingId} has {booking.BookingDetails.Count} details.");

                foreach (var detail in booking.BookingDetails)
                {



                    decimal detailPrice = detail.Price ?? 0;


                    totalAmount += detailPrice;
                }

                return totalAmount;
            }
            catch (Exception ex)
            {

                throw;
            }
        }








        private async Task SendBookingStatusEmail(string email, string name, string orderId, BookingStatus status)
        {
            string subject = GetEmailSubject(status);
            string body = GetEmailBody(name, orderId, status);

            await _emailService.SendEmailAsync(email, subject, body);
        }


        private string GetEmailSubject(BookingStatus status)
        {
            return status switch
            {
                BookingStatus.Confirmed => "✅ Đơn hàng đã được xác nhận!",
                BookingStatus.Done => "👍 Bạn đã nhận được đơn hàng",
                _ => "📌 Cập nhật đơn hàng"
            };
        }


        private string GetEmailBody(string name, string orderId, BookingStatus status)
        {
            string statusMessage = status switch
            {
                BookingStatus.Confirmed => "Đơn hàng của bạn đã được xác nhận và sẽ sớm được xử lý.",
                BookingStatus.Done => "Bạn đã nhận được đơn hàng. Hy vọng bạn hài lòng với sản phẩm!",
                _ => "Đơn hàng của bạn đã được cập nhật."
            };

            return $"Xin chào {name},<br/><br/>" +
                   $"🛒 <b>Mã đơn hàng:</b> {orderId}<br/>" +
                   $"{statusMessage}<br/><br/>" +
                   $"Bạn có thể kiểm tra trạng thái đơn hàng tại trang web của chúng tôi.<br/><br/>" +
                   $"Trân trọng,<br/>Đội ngũ hỗ trợ.";
        }

        private async Task AddLoyaltyPoints(Booking booking)
        {
            if (booking.CustomerId == null)
                throw new InvalidOperationException("Booking does not have a valid CustomerId!");


            var customer = await _context.Customers.FindAsync(booking.CustomerId);
            if (customer == null)
                throw new InvalidOperationException($"Customer with ID {booking.CustomerId} not found!");

            decimal totalPrice = booking.TotalAmount ?? 0;
            int pointsEarned = (int)(totalPrice / 100000) * 20;



            customer.LoyaltyPoints = (customer.LoyaltyPoints ?? 0) + pointsEarned;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new Exception($"Database update failed: {ex.InnerException?.Message}");
            }
        }


        public async Task<List<BookingStatusHistoryDto>> GetAllBookingHistoryAsync()
        {
            var histories = await _context.BookingStatusHistories
                .Include(h => h.Booking)
                .Include(h => h.UpdatedByNavigation).ThenInclude(x => x.Account)
                .OrderByDescending(h => h.UpdatedAt)
                .ToListAsync();

            return histories.Select(h => new BookingStatusHistoryDto
            {
                Id = h.Id,
                BookingId = h.BookingId,
                OldStatus = h.OldStatus,
                NewStatus = h.NewStatus,
                UpdatedAt = h.UpdatedAt,
                UpdatedBy = h.UpdatedBy,
                UpdatedByName = h.UpdatedByNavigation != null
                    ? h.UpdatedByNavigation.Account.Name
                    : "Unknown"
            }).ToList();
        }
        public async Task<List<BookingStatusHistoryDto>> GetBookingHistoryByIdAsync(int bookingId)
        {
            var histories = await _context.BookingStatusHistories
                .Where(h => h.BookingId == bookingId)
                .Include(h => h.UpdatedByNavigation).ThenInclude(x => x.Account)
                .OrderByDescending(h => h.UpdatedAt)
                .ToListAsync();

            return histories.Select(h => new BookingStatusHistoryDto
            {
                Id = h.Id,
                BookingId = h.BookingId,
                OldStatus = h.OldStatus,
                NewStatus = h.NewStatus,
                UpdatedAt = h.UpdatedAt,
                UpdatedBy = h.UpdatedBy,
                UpdatedByName = h.UpdatedByNavigation != null
                    ? h.UpdatedByNavigation.Account.Name
                    : "Unknown"
            }).ToList();
        }



        public async Task<DateTime?> CalculateFinishTime(int bookingId)
        {
            var bookingDetails = await _context.BookingDetails
                .Where(d => d.BookingId == bookingId && d.StatusLaundry == "Washing")
                .ToListAsync();

            if (!bookingDetails.Any())
            {

                return null;
            }

            DateTime? maxFinishTime = null;
            DateTime? lastInProgressTime = null;

            foreach (var detail in bookingDetails)
            {

                var lastHistory = await _context.BookingDetailHistories
                    .Where(h => h.BookingDetailId == detail.BookingDetailId)
                    .OrderByDescending(h => h.UpdatedAt)
                    .FirstOrDefaultAsync();

                if (lastHistory == null || lastHistory.UpdatedAt == null)
                {

                    continue;
                }

                DateTime updateTime = lastHistory.UpdatedAt;

                if (lastInProgressTime == null || updateTime > lastInProgressTime)
                {
                    lastInProgressTime = updateTime;
                }


                var service = await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == detail.ServiceId);
                if (service == null || !service.EstimatedTime.HasValue)
                {
                    Console.Error.WriteLine($"Lỗi: Không tìm thấy dịch vụ hoặc EstimatedTime bị null cho ServiceId {detail.ServiceId}");
                    continue;
                }

                int estimatedMinutes = (int)service.EstimatedTime.Value.ToTimeSpan().TotalMinutes;
                var estimatedFinish = updateTime.AddMinutes(estimatedMinutes);

                if (maxFinishTime == null || estimatedFinish > maxFinishTime)
                {
                    maxFinishTime = estimatedFinish;
                }
            }

            Console.WriteLine($"FinishTime được tính: {maxFinishTime}");

            return maxFinishTime > lastInProgressTime ? maxFinishTime : lastInProgressTime;
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

        public async Task<bool> UpdateWeightBookingDetailAsync(int bookingDetailId, decimal? weight)
        {
            try
            {
                // Lấy thông tin người dùng hiện tại
                var (accountId, role) = GetCurrentUserClaims();
                if (accountId == null)
                {
                    Console.Error.WriteLine("Account ID is null.");
                    return false;
                }

                // Tìm BookingDetail cần cập nhật
                var bookingDetail = await _context.BookingDetails
                    .Include(bd => bd.Booking)
                    .Include(bd => bd.Service) // Nếu cần thêm thông tin Booking, có thể include
                    .FirstOrDefaultAsync(bd => bd.BookingDetailId == bookingDetailId);

                // Kiểm tra xem BookingDetail có tồn tại không
                if (bookingDetail == null)
                {
                    Console.Error.WriteLine($"BookingDetail with ID {bookingDetailId} not found.");
                    return false;
                }

                // Kiểm tra giá trị cân nặng (nếu cần)
                if (weight != null)
                {
                    bookingDetail.Weight = weight;
                }
                else
                {
                    Console.Error.WriteLine($"Provided weight is null for BookingDetail ID {bookingDetailId}.");
                    return false;
                }

                // Cập nhật Price trong BookingDetail
                bookingDetail.Price = weight * bookingDetail.Service.Price;

                // Cập nhật thời gian sửa đổi
                bookingDetail.UpdateAt = DateTime.Now;


                // Lưu thay đổi vào cơ sở dữ liệu
                await _context.SaveChangesAsync();

                return true;  // Cập nhật thành công
            }
            catch (DbUpdateException dbEx)
            {
                // Lỗi khi cập nhật cơ sở dữ liệu
                Console.Error.WriteLine($"Database update error: {dbEx.Message}");  // Ghi log chi tiết lỗi
                return false;
            }
            catch (Exception ex)
            {
                // Lỗi chung
                Console.Error.WriteLine($"General error: {ex.Message}");  // Ghi log chi tiết lỗi
                return false;
            }
        }


        public async Task<bool> UpdateShippingFeeBookingAsync(int bookingId, decimal? shippingFee)
        {
            // Lấy thông tin người dùng hiện tại
            var (accountId, role) = GetCurrentUserClaims();
            if (accountId == null)
            {
                Console.Error.WriteLine("Account ID is null.");
                return false;
            }

            // Tìm Booking cần cập nhật, bao gồm các BookingDetails
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            // Kiểm tra xem Booking có tồn tại không
            if (booking == null)
            {
                Console.Error.WriteLine($"Booking with ID {bookingId} not found.");
                return false;
            }

            // Kiểm tra giá trị shippingFee (nếu cần)
            if (shippingFee != null)
            {
                booking.ShippingFee = shippingFee;
            }
            else
            {
                Console.Error.WriteLine($"Provided shipping fee is null for Booking ID {bookingId}.");
                return false;
            }

            // Tính lại tổng tiền cho Booking
            decimal totalPrice = (decimal)booking.BookingDetails.Sum(bd => bd.Price); // Tổng tiền từ các BookingDetails
            if (booking.ShippingFee.HasValue)
            {
                totalPrice += booking.ShippingFee.Value; // Cộng phí giao hàng vào tổng tiền
            }

            // Cập nhật tổng tiền vào booking
            booking.TotalAmount = totalPrice;

            // Lưu thay đổi vào cơ sở dữ liệu
            await _context.SaveChangesAsync();

            return true;  // Cập nhật thành công
        }
        public async Task UpdateBookingAsync(BookingDTOforSupport booking)
        {
            try
            {
                // Kiểm tra xem booking có tồn tại trong cơ sở dữ liệu không
                var existingBooking = await _context.Bookings
                    .FirstOrDefaultAsync(b => b.BookingId == booking.BookingId);

                if (existingBooking != null)
                {
                    // Cập nhật thông tin Booking
                    existingBooking.TotalAmount = booking.TotalAmount; // Cập nhật tổng tiền

                    // Đánh dấu Entity như đã sửa đổi
                    _context.Bookings.Update(existingBooking);

                    // Lưu thay đổi vào cơ sở dữ liệu
                    await _context.SaveChangesAsync();
                }
                else
                {
                    throw new KeyNotFoundException($"Booking with Id {booking.BookingId} not found.");
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating booking: {ex}");
                throw; // Ném lại ngoại lệ để có thể xử lý ở nơi gọi phương thức này
            }
        }

        public async Task<decimal> CalculateTotalAmountAsync(int bookingId)
        {
            var totalAmount = await _context.BookingDetails
                .Where(bd => bd.BookingId == bookingId)
                .SumAsync(bd => bd.Price);
            return (decimal)totalAmount;
        }

    }
}



