using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessObjects;
using BusinessObjects.DTO.AdminBookingDTO;
using BusinessObjects.DTO.BookingStaffDTO;
using BusinessObjects.DTO.CartDTO;
using BusinessObjects.DTO.NotificationDTO;
using BusinessObjects.Models;
using Grpc.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.NetworkInformation;
using System.Security.Claims;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class BookingDAO
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IHubContext<SignalHub> _hubContext;

        public BookingDAO(LcmsContext context, IMapper mapper, IHttpContextAccessor httpContextAccessor, IHubContext<SignalHub> hubContext)
        {
            _context = context;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _hubContext = hubContext;
        }
        public static readonly List<string> StatusLaundry = new List<string>
{
    "Pending",
    "Washing",
    "Completed"
};

        public List<string> GetAllBookingDetail()
        {
            return StatusLaundry;
        }

        public async Task<Booking> CreateBookingFromCartAsync(BookingFromCartDto bookingData, CartDto cart)
        {
            if (cart == null || cart.Items == null || cart.Items.Count == 0)
            {
                throw new ArgumentException("Cart is empty or invalid!");
            }

            var (accountId,branchId ,role) = GetCurrentUserClaims();

            if (role == "4" || role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
            {
                if (!int.TryParse(accountId, out int customerIdInt))
                {
                    throw new Exception("Invalid account ID format!");
                }

                var customerExists = await _context.Customers.AnyAsync(c => c.AccountId == customerIdInt);
                if (!customerExists)
                {
                    throw new Exception("Customer account not found!");
                }

                bookingData.CustomerId = customerIdInt;
                bookingData.StaffId = null;
            }
            else if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
            {
                if (!int.TryParse(accountId, out int staffIdInt))
                {
                    throw new Exception("Invalid account ID format!");
                }

                var staff = await _context.Employees.FirstOrDefaultAsync(s => s.AccountId == staffIdInt);
                if (staff == null)
                {
                    throw new Exception("Staff account not found!");
                }

                bookingData.StaffId = staff.AccountId;
                bookingData.BranchId = staff.BranchId;
            }


            var branch = await _context.Branches.FirstOrDefaultAsync(b => b.BranchId == bookingData.BranchId);
            if (branch == null)
            {
                throw new ArgumentException("Branch does not exist or is invalid!");
            }


            switch (branch.Status)
            {
                case "Mở Cửa":

                    break;

                case "Không hoạt động":
                    throw new Exception("Chi nhánh này hiện không hoạt động. Vui lòng chọn chi nhánh khác.");

                case "Bảo Trì":
                    throw new Exception("Chi nhánh này đang bảo trì. Bạn có thể đặt trước sau khi bảo trì kết thúc.");

                case "Quá tải":

                    var currentBookings = await _context.Bookings.CountAsync(b => b.BranchId == bookingData.BranchId && b.Status == "Pending");
                    if (currentBookings >= 10)
                    {
                        throw new Exception("Chi nhánh này đang quá tải. Vui lòng chọn thời gian khác hoặc chi nhánh khác.");
                    }
                    break;

                case "Đóng Cửa":
                    throw new Exception("Chi nhánh này đang đóng cửa. Vui lòng chọn chi nhánh gần nhất còn hoạt động.");

                default:
                    throw new Exception("Trạng thái chi nhánh không hợp lệ.");
            }

            var bookingDate = DateTime.Now;

            var newBooking = new Booking
            {
                CustomerId = bookingData.CustomerId,
                GuestId = bookingData.GuestId,
                BranchId = bookingData.BranchId,
                StaffId = bookingData.StaffId,
                Status = "Pending",
                Note = bookingData.Note,
                DeliveryAddress = bookingData.DeliveryAddress,
                PickupAddress = bookingData.PickupAddress,
                LaundryType = bookingData.LaundryType,
                DeliveryType = bookingData.DeliveryType,
                BookingDate = bookingDate,
                BookingDetails = new List<BookingDetail>()
            };

            foreach (var item in cart.Items)
            {
                if (item == null) throw new ArgumentException("Cart contains null items!");

                var service = await _context.Services.FirstOrDefaultAsync(s => s.ServiceId == item.ServiceId);
                if (service == null)
                {
                    throw new ArgumentException($"Service ID {item.ServiceId} does not exist!");
                }

                if (item.ProductId.HasValue)
                {
                    var productExists = await _context.Products.AnyAsync(p => p.ProductId == item.ProductId);
                    if (!productExists)
                    {
                        throw new ArgumentException($"Product ID {item.ProductId} does not exist!");
                    }
                }

                newBooking.BookingDetails.Add(new BookingDetail
                {
                    ServiceId = item.ServiceId,
                    ProductId = item.ProductId,
                    StatusLaundry = "Pending",
                    Quantity = item.Quantity,
                    Price = item.Price,
                });
            }

            try
            {
                _context.Bookings.Add(newBooking);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Database update error: {ex.ToString()}");
                throw new Exception($"Failed to save booking. Details: {ex.ToString()}");
            }


            try
            {
                await SendNotificationToStaffAndManagerAsync(newBooking);
            }
            catch (Exception notifyEx)
            {
                Console.WriteLine($"Notification error: {notifyEx.ToString()}");
            }

            return newBooking;
        }


        public async Task<int> CreateDirectBookingAsync(BookingStaffDTO bookingData)
        {
            if (bookingData == null) throw new ArgumentException("Invalid booking data!");

            var (accountId, branchId, role) = GetCurrentUserClaims();
            int? staffIdFromToken = null;
            int? customerIdFromToken = null;
            int? branchIdFromToken = null;

            try
            {
                if (role == "4" || role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
                {
                    if (!int.TryParse(accountId, out int customerIdInt))
                        throw new Exception("Invalid account ID format!");

                    if (!await _context.Customers.AnyAsync(c => c.AccountId == customerIdInt))
                        throw new Exception("Customer account not found!");

                    customerIdFromToken = customerIdInt;
                }
                else if (role == "3" || role.Equals("Staff", StringComparison.OrdinalIgnoreCase))
                {
                    if (!int.TryParse(accountId, out int staffIdInt))
                        throw new Exception("Invalid account ID format!");

                    var staff = await _context.Employees
                        .Where(s => s.AccountId == staffIdInt)
                        .Select(s => new { s.AccountId, s.BranchId })
                        .FirstOrDefaultAsync();

                    if (staff == null)
                    {
                        Console.WriteLine("Staff not found for account ID: " + staffIdInt);
                    }
                    else
                    {
                        staffIdFromToken = staff.AccountId;
                        branchIdFromToken = staff.BranchId;
                    }
                }

                bookingData.CustomerId = customerIdFromToken ?? bookingData.CustomerId ?? 0;
                bookingData.StaffId = staffIdFromToken ?? bookingData.StaffId ?? 0;
                bookingData.BranchId = branchIdFromToken ?? bookingData.BranchId;

                if (bookingData.BranchId == null || bookingData.BranchId <= 0)
                    throw new ArgumentException("BranchId is required and must be greater than zero!");

                var branch = await _context.Branches
                    .Where(b => b.BranchId == bookingData.BranchId)
                    .Select(b => new { b.BranchId, b.Status })
                    .FirstOrDefaultAsync();

                if (branch == null)
                    throw new ArgumentException("Branch does not exist!");

                switch (branch.Status)
                {
                    case "Không hoạt động":
                    case "Đóng cửa":
                        throw new Exception("Chi nhánh này hiện không hoạt động. Vui lòng chọn chi nhánh khác.");
                    case "Bảo trì":
                        throw new Exception("Chi nhánh này đang bảo trì. Vui lòng đặt lịch sau khi bảo trì kết thúc.");
                    case "Quá tải":
                        int bookingCount = await _context.Bookings.CountAsync(b => b.BranchId == branch.BranchId && b.Status == "Pending");
                        if (bookingCount > 10)
                            throw new Exception("Chi nhánh này đang quá tải. Vui lòng chọn thời gian khác hoặc chi nhánh khác.");
                        break;
                }

                int? guestId = null;

                // ✅ Sử dụng ExecutionStrategy để xử lý transaction
                var strategy = _context.Database.CreateExecutionStrategy();

                return await strategy.ExecuteAsync(async () =>
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        if (guestId == null && bookingData.CustomerId == null)
                            throw new ArgumentException("CustomerId is required!");

                        if (bookingData.CustomerId == null || bookingData.CustomerId == 0)
                        {
                            if (string.IsNullOrWhiteSpace(bookingData.GuestName) || string.IsNullOrWhiteSpace(bookingData.PhoneNumber))
                                throw new ArgumentException("GuestName and PhoneNumber are required for walk-in guests!");

                            var newGuest = new Guest { FullName = bookingData.GuestName, PhoneNumber = bookingData.PhoneNumber };
                            _context.Guests.Add(newGuest);
                            await _context.SaveChangesAsync();
                            guestId = newGuest.GuestId;
                        }

                        var newBooking = new Booking
                        {
                            CustomerId = guestId.HasValue ? null : bookingData.CustomerId,
                            BranchId = bookingData.BranchId,
                            GuestId = guestId,
                            StaffId = bookingData.StaffId,
                            Status = bookingData.Status.ToString() ?? BookingStatus.Pending.ToString(),
                            Note = bookingData.Note,
                            BookingDate = DateTime.Now,
                            DeliveryAddress = bookingData.DeliveryAddress,
                            PickupAddress = bookingData.PickupAddress,
                            LaundryType = bookingData.LaundryType,
                            DeliveryType = bookingData.DeliveryType,
                            BookingDetails = new List<BookingDetail>()
                            
                        };

                        if (bookingData.BookingDetails?.Any() == true)
                        {
                            Console.WriteLine($"BookingDetails count: {bookingData.BookingDetails?.Count()}");

                            if (bookingData.BookingDetails == null || !bookingData.BookingDetails.Any())
                            {
                                throw new ArgumentException("Booking details are required!");
                            }

                            var serviceIds = bookingData.BookingDetails.Select(d => d.ServiceId).Distinct().ToList();
                            var existingServices = await _context.Services
                                .Where(s => serviceIds.Contains(s.ServiceId))
                                .Select(s => new { s.ServiceId, s.Price })
                                .ToListAsync();

                            var productIds = bookingData.BookingDetails.Where(d => d.ProductId.HasValue && d.ProductId.Value > 0)
                                .Select(d => d.ProductId.Value).Distinct().ToList();

                            var existingProducts = await _context.Products
                                .Where(p => productIds.Contains(p.ProductId))
                                .Select(p => new { p.ProductId, p.Price })
                                .ToListAsync();

                            foreach (var detail in bookingData.BookingDetails)
                            {
                                var service = existingServices.FirstOrDefault(s => s.ServiceId == detail.ServiceId);
                                if (service == null)
                                    throw new ArgumentException($"Service ID {detail.ServiceId} does not exist!");

                                int? productId = detail.ProductId.HasValue && detail.ProductId > 0 ? detail.ProductId : null;
                                var product = productId.HasValue ? existingProducts.FirstOrDefault(p => p.ProductId == productId.Value) : null;

                                if (productId.HasValue && product == null)
                                    throw new ArgumentException($"Product ID {productId} does not exist!");

                                int quantity = detail.Quantity ?? 0;

                                decimal? price = 0;

                                if (productId.HasValue)
                                {
                                    price = service.Price + (product.Price * quantity);
                                }
                                else
                                {
                                    price = service.Price;
                                }
                                newBooking.BookingDetails.Add(new BookingDetail
                                {
                                    ServiceId = detail.ServiceId,
                                    ProductId = productId,
                                    StatusLaundry = "Pending",
                                    Quantity = detail.Quantity ?? 0,
                                    Price = price
                                });
                            }

                            newBooking.TotalAmount = newBooking.BookingDetails.Sum(d => d.Price);
                        }

                        _context.Bookings.Add(newBooking);
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        try
                        {
                            await SendNotificationStaffAsync(newBooking);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error in SendNotificationToStaffAndManagerAsync: {ex.Message}");
                        }

                        return newBooking.BookingId;
                    }
                    catch (Exception ex)
                    {
                        if (_context.Database.CurrentTransaction != null)
                        {
                            await transaction.RollbackAsync();
                        }
                        throw new Exception($"Failed to create direct booking: {ex.Message}. Booking Details");
                    }
                });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error processing booking request: {ex.Message}");
            }
        }


        public async Task<Booking> GetBookingByIdAsync(long bookingId)
        {
            return await _context.Bookings
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }




       









        public async Task<int> AddBookingDetailAsync(int bookingId, List<BookingDetailDto> newDetails)
        {
            var (accountId, branchId, role) = GetCurrentUserClaims();
            bool isStaff = role == "Staff";

            if (newDetails == null || !newDetails.Any())
                throw new ArgumentException("Booking details cannot be empty!");

            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                throw new ArgumentException($"Booking ID {bookingId} does not exist!");

            if (!isStaff && booking.Status != "Pending")
                throw new InvalidOperationException($"Booking ID {bookingId} is not in 'Pending' status for customers!");

            var serviceIds = newDetails.Select(d => d.ServiceId).Distinct().ToList();
            var existingServices = await _context.Services
                .Where(s => serviceIds.Contains(s.ServiceId))
                .Select(s => s.ServiceId)
                .ToListAsync();

            var productIds = newDetails.Where(d => d.ProductId.HasValue)
                .Select(d => d.ProductId.Value)
                .Distinct()
                .ToList();
            var existingProducts = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .Select(p => p.ProductId)
                .ToListAsync();

            foreach (var detail in newDetails)
            {
                if (!existingServices.Contains(detail.ServiceId))
                    throw new ArgumentException($"Service ID {detail.ServiceId} does not exist!");

                if (detail.ProductId.HasValue && !existingProducts.Contains(detail.ProductId.Value))
                    throw new ArgumentException($"Product ID {detail.ProductId} does not exist!");

                booking.BookingDetails.Add(new BookingDetail
                {
                    ServiceId = detail.ServiceId,
                    ProductId = detail.ProductId,

                    Quantity = detail.Quantity,


                });
            }



            await _context.SaveChangesAsync();
            return bookingId;
        }



        public async Task<bool> EditBookingDetailAsync(int bookingId, int detailId, BookingDetailDto updatedDetail)
        {
            var (accountId, branchId, role) = GetCurrentUserClaims();
            bool isStaff = role == "Staff";
            bool isCustomer = role == "Customer";

            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                throw new ArgumentException($"Booking ID {bookingId} does not exist!");

            if (int.TryParse(accountId, out int accountIdInt) && booking.CustomerId != accountIdInt)
            {
                throw new UnauthorizedAccessException("You can only edit your own bookings!");
            }



            if (isCustomer && booking.Status != "Pending")
                throw new InvalidOperationException($"Booking ID {bookingId} is not in 'Pending' status for customers!");

            var detail = booking.BookingDetails.FirstOrDefault(d => d.BookingDetailId == detailId);
            if (detail == null)
                throw new ArgumentException($"Booking Detail ID {detailId} does not exist!");

            var serviceExists = await _context.Services.AnyAsync(s => s.ServiceId == updatedDetail.ServiceId);
            if (!serviceExists)
                throw new ArgumentException($"Service ID {updatedDetail.ServiceId} does not exist!");

            if (updatedDetail.ProductId.HasValue)
            {
                var productExists = await _context.Products.AnyAsync(p => p.ProductId == updatedDetail.ProductId.Value);
                if (!productExists)
                    throw new ArgumentException($"Product ID {updatedDetail.ProductId} does not exist!");
            }

            detail.ServiceId = updatedDetail.ServiceId;
            detail.ProductId = updatedDetail.ProductId;
            detail.Weight = updatedDetail.Weight;
            detail.Quantity = updatedDetail.Quantity;
            detail.Price = updatedDetail.Price;





            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<decimal> CalculateTotalAmountAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                throw new ArgumentException($"❌ Booking ID {bookingId} không tồn tại!");

            return (decimal)booking.BookingDetails.Sum(d => d.Price);
        }


        public async Task<bool> DeleteBookingDetailAsync(int bookingId, int detailId)
        {
            var (accountId, branchId, role) = GetCurrentUserClaims();
            bool isStaff = role == "Staff";

            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                throw new ArgumentException($"Booking ID {bookingId} does not exist!");

            if (!isStaff && booking.CustomerId != int.Parse(accountId))
                throw new UnauthorizedAccessException("You can only delete details from your own booking!");

            if (!isStaff && booking.Status != "Pending")
                throw new InvalidOperationException("Booking is not in 'Pending' status!");

            var detail = booking.BookingDetails.FirstOrDefault(d => d.BookingDetailId == detailId);
            if (detail == null)
                throw new ArgumentException($"Booking Detail ID {detailId} does not exist!");

            _context.BookingDetails.Remove(detail);



            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> EditBookingAsync(int bookingId, BookingFromCartDto bookingData)
        {
            if (bookingData == null)
                throw new ArgumentException("Invalid booking data!");

            var (accountId, branchId, role) = GetCurrentUserClaims();
            bool isStaff = role == "Staff";

            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                throw new ArgumentException("Booking does not exist!");

            if (!isStaff && booking.CustomerId != int.Parse(accountId))
                throw new UnauthorizedAccessException("You can only edit your own bookings!");

            if (!isStaff && booking.Status != "Pending")
                throw new InvalidOperationException("Booking is not in 'Pending' status!");

            bool isLaundryOrDeliveryChanged =
                booking.LaundryType != bookingData.LaundryType ||
                booking.DeliveryType != bookingData.DeliveryType;

            booking.CustomerId = bookingData.CustomerId;
            booking.GuestId = bookingData.GuestId;
            booking.BranchId = bookingData.BranchId;
            booking.StaffId = bookingData.StaffId;
            booking.Status = bookingData.Status != null
     ? bookingData.Status.ToString()
     : BookingStatus.Pending.ToString();
            booking.Note = bookingData.Note;
            booking.DeliveryAddress = bookingData.DeliveryAddress;
            booking.PickupAddress = bookingData.PickupAddress;
            booking.LaundryType = bookingData.LaundryType;
            booking.DeliveryType = bookingData.DeliveryType;
            booking.ShippingFee = bookingData.ShippingFee;





            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> DeleteBookingAsync(int bookingId)
        {
            var (accountId, branchId, role) = GetCurrentUserClaims();
            bool isStaff = role == "Staff";

            var booking = await _context.Bookings
                .Include(b => b.BookingDetails)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                throw new ArgumentException("Booking does not exist!");

            if (!isStaff && booking.CustomerId != int.Parse(accountId))
                throw new UnauthorizedAccessException("You can only delete your own bookings!");

            if (!isStaff && booking.Status != "Pending")
                throw new InvalidOperationException("Booking is not in 'Pending' status!");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (booking.BookingDetails.Any())
                {
                    _context.BookingDetails.RemoveRange(booking.BookingDetails);
                }

                _context.Bookings.Remove(booking);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Failed to delete booking: " + ex.Message);
            }
        }



        public async Task<List<BookingListStaffDTO>> GetBookingsAsync(int? customerId)
        {
            var query = _context.Bookings
                .Include(b => b.Customer).ThenInclude(b => b.Account)
                .Include(b => b.Staff).ThenInclude(b => b.Account)
                .Include(b => b.Guest)
                .Include(b => b.Branch)

                .Include(b => b.BookingDetails)
                .AsQueryable();

            if (customerId.HasValue)
            {
                query = query.Where(b => b.CustomerId == customerId.Value);
            }

            var bookings = await query.ToListAsync();
            return _mapper.Map<List<BookingListStaffDTO>>(bookings);
        }
        public async Task<List<BookingListStaffDTO>> GetAllBookingsAsync()
        {
            var (accountId, branchId, role) = GetCurrentUserClaims();

            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
            {
                throw new UnauthorizedAccessException("Không thể xác định tài khoản.");
            }

            IQueryable<Booking> query = _context.Bookings
                .Include(b => b.Customer).ThenInclude(c => c.Account)
                .Include(b => b.Staff).ThenInclude(s => s.Account)
                .Include(b => b.Guest)
                .Include(b => b.Branch)
                .Include(b => b.BookingDetails);

            switch (role)
            {
                case "Admin":
                    break;

                case "Manager":
                case "Staff":
                    int? branchIdd = await _context.Employees
                        .Where(s => s.AccountId == int.Parse(accountId))
                        .Select(s => s.BranchId)
                        .FirstOrDefaultAsync();

                    if (branchIdd.HasValue)
                    {
                        query = query.Where(b => b.BranchId == branchIdd.Value);
                    }
                    else
                    {
                        return new List<BookingListStaffDTO>();
                    }
                    break;

                case "Customer":
                    query = query.Where(b => b.Customer.AccountId == int.Parse(accountId));
                    break;

                default:
                    return new List<BookingListStaffDTO>(); // Không có quyền
            }

            var bookings = await query.ToListAsync();
            return _mapper.Map<List<BookingListStaffDTO>>(bookings);
        }



        public async Task<List<BookingDTO>> GetAllBookingsPendingAsync()
        {
            var (accountId, branchId, role) = GetCurrentUserClaims();

            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<BookingDTO>();

            // Kiểm tra _context và _mapper có null không
            if (_context == null || _mapper == null)
                throw new InvalidOperationException("Database context or mapper is not initialized.");

            // Ép kiểu branchId sang int
            if (!int.TryParse(branchId, out int branchIdInt))
            {
                // Nếu không thể ép kiểu, trả về danh sách trống hoặc thông báo lỗi.
                return new List<BookingDTO>();
            }

            IQueryable<Booking> query = _context.Bookings
                .Include(b => b.Customer).ThenInclude(c => c.Account)
                .Include(b => b.Staff).ThenInclude(s => s.Account)
                .Include(b => b.Branch)
                .Include(b => b.Guest)
                .Where(b => b.Status == "Pending" && b.BranchId == branchIdInt);



            if (role == "3" || role.Equals("Employee", StringComparison.OrdinalIgnoreCase))
            {
                var staffId = await GetStaffIdByAccountIdAsync(accountId);
                if (!staffId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.StaffId == staffId.Value || b.StaffId == null);
            }

            var bookings = await query
                .OrderByDescending(b => b.BookingDate) // Sắp xếp theo ngày đặt phòng mới nhất
                .ProjectTo<BookingDTO>(_mapper.ConfigurationProvider) // Map trực tiếp trên query để tối ưu hiệu suất
                .ToListAsync();

            return bookings;
        }
        public async Task<List<BookingDTO>> GetAllBookingsDeliveringAsync()
        {
            var (accountId, branchId, role) = GetCurrentUserClaims();

            if (string.IsNullOrEmpty(accountId) || string.IsNullOrEmpty(role))
                return new List<BookingDTO>();

            // Kiểm tra _context và _mapper có null không
            if (_context == null || _mapper == null)
                throw new InvalidOperationException("Database context or mapper is not initialized.");

            // Ép kiểu branchId sang int
            if (!int.TryParse(branchId, out int branchIdInt))
            {
                // Nếu không thể ép kiểu, trả về danh sách trống hoặc thông báo lỗi.
                return new List<BookingDTO>();
            }
            IQueryable<Booking> query = _context.Bookings
                .Include(b => b.Customer).ThenInclude(c => c.Account)
                .Include(b => b.Staff).ThenInclude(s => s.Account)
                .Include(b => b.Branch)
                .Include(b => b.Guest)
                .Where(b => b.Status == "Completed" && b.BranchId == branchIdInt && b.DeliveryType == "HomeDelivery"); // ✅ Thêm điều kiện lọc

            if (role == "3" || role.Equals("Employee", StringComparison.OrdinalIgnoreCase))
            {
                var staffId = await GetStaffIdByAccountIdAsync(accountId);
                if (!staffId.HasValue)
                    return new List<BookingDTO>();

                query = query.Where(b => b.StaffId == staffId.Value || b.StaffId == null);
            }

            var bookings = await query
                .OrderByDescending(b => b.BookingDate)
                .ProjectTo<BookingDTO>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return bookings;
        }

        public async Task<List<BookingListDetailDto>> GetBookingDetailByIdAsync(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.BookingDetails).ThenInclude(x => x.Product)
                .Include(b => b.BookingDetails).ThenInclude(x => x.Service)

                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
            {
                throw new ArgumentException($"Booking with ID {bookingId} not found.");
            }

            return _mapper.Map<List<BookingListDetailDto>>(booking.BookingDetails);
        }

        public async Task<List<string>> GetAllStatus()
        {
            return await Task.FromResult(Enum.GetNames(typeof(BookingStatus)).ToList());
        }
        public enum DeliveryType
        {
            None,
            Pickup,
            HomeDelivery
        }
        public async Task<List<string>> GetAllPaymentType()
        {
            return await Task.FromResult(Enum.GetNames(typeof(PaymentType)).ToList());
        }
        public enum PaymentType
        {
            None,
            [Description("Tiền mặt")]
            TienMat,
            [Description("QR Code")]
            QRCode,
        }

        public async Task<List<string>> GetAllDeliveryStatuses()
        {
            return Enum.GetNames(typeof(DeliveryType)).ToList();
        }

        private async Task<int?> GetStaffIdByAccountIdAsync(string accountId)
        {
            if (!int.TryParse(accountId, out int parsedAccountId))
                return null;

            return await _context.Employees
                .Where(s => s.AccountId == parsedAccountId && s.Account.Role.RoleName == "Employee")
                .Select(s => s.AccountId)
                .FirstOrDefaultAsync();
        }
        private async Task SendNotificationToStaffAndManagerAsync(Booking dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Booking DTO is null");
            if (dto.BranchId == null)
                throw new ArgumentNullException(nameof(dto.BranchId), "BranchId is null");
            if (dto.CustomerId == null)
                throw new ArgumentNullException(nameof(dto.CustomerId), "CustomerId is null");

            var staffAndManagers = await _context.Accounts
                .Where(a => a.Employee.BranchId == dto.BranchId && (a.RoleId == 2 || a.RoleId == 3))
                .Select(a => a.AccountId)
                .ToListAsync();

            if (staffAndManagers == null || !staffAndManagers.Any()) return;

            var branchName = dto.Branch?.BranchName ?? "không xác định"; // Tránh lỗi null

            var notifications = staffAndManagers.Select(accountId => new NotificationDirectDTO
            {
                Title = "Đơn hàng mới",
                Content = $"Có một đơn hàng mới tại cửa hàng {branchName},vui lòng kiểm tra  để không bỏ lỡ bất kỳ thông tin nào! ",
                AccountId = accountId,
                CreatedById = dto.CustomerId.Value,
                CreatedAt = DateTime.Now,
                BookingId = dto.BookingId,
                Type = "đơn hàng",
                IsRead = false
            }).ToList();

            var notificationEntities = notifications.Select(n => new Notification
            {
                Title = n.Title,
                Content = n.Content,
                AccountId = n.AccountId,
                CreatedById = n.CreatedById,
                CreatedAt = n.CreatedAt,
                BookingId = n.BookingId,
                Type = n.Type,
                IsRead = n.IsRead
            }).ToList();

            try
            {
                await _context.Notifications.AddRangeAsync(notificationEntities);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving notifications: {ex.Message}");
                throw;
            }
        }


        private async Task SendNotificationStaffAsync(Booking dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Booking DTO is null");
            if (dto.BranchId == null)
                throw new ArgumentNullException(nameof(dto.BranchId), "BranchId is null");
            if (dto.CustomerId == null)
                throw new ArgumentNullException(nameof(dto.CustomerId), "CustomerId is null");

            var staffAndManagers = await _context.Accounts
                .Where(a => a.Employee.BranchId == dto.BranchId && (a.RoleId == 2 || a.RoleId == 3))
                .Select(a => a.AccountId)
                .ToListAsync();

            if (staffAndManagers == null || !staffAndManagers.Any()) return;

            var branchName = dto.Branch?.BranchName ?? "không xác định"; // Tránh lỗi null
            var acc = await _context.Accounts
         .FirstOrDefaultAsync(i => i.AccountId  == dto.CustomerId);  // Truy vấn Inventory liên quan đến item

            var notifications = staffAndManagers.Select(accountId => new NotificationDirectDTO
            {
                Title = "Đơn hàng mới",
                Content = $"Tạo thành công đơn hàng #{dto.BookingId} cho khách hàng : {acc.Name} ,số điện thoại : {acc.Phone}",
                AccountId = accountId,
                CreatedById = dto.CustomerId.Value,
                CreatedAt = DateTime.Now,
                BookingId = dto.BookingId,
                Type = "đơn hàng",
                IsRead = false
            }).ToList();

            var notificationEntities = notifications.Select(n => new Notification
            {
                Title = n.Title,
                Content = n.Content,
                AccountId = n.AccountId,
                CreatedById = n.CreatedById,
                CreatedAt = n.CreatedAt,
                BookingId = n.BookingId,
                Type = n.Type,
                IsRead = n.IsRead
            }).ToList();

            try
            {
                await _context.Notifications.AddRangeAsync(notificationEntities);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving notifications: {ex.Message}");
                throw;
            }
        }

        private (string accountId,string branchId ,string role) GetCurrentUserClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return (null, null, null);
            }
            var identity = httpContext.User.Identity as ClaimsIdentity;
            if (identity == null)
            {
                return (null, null, null);
            }
            var accountId = identity.FindFirst("AccountId")?.Value;
            var branchId = identity.FindFirst("BranchId")?.Value;

            var role = identity.FindFirst(ClaimTypes.Role)?.Value;
            return (accountId, branchId, role);
        }

        public async Task<int?> GetBookingIdByBookingDetailIdAsync(int bookingDetailId)
        {
            var bookingDetail = await _context.BookingDetails
                .FirstOrDefaultAsync(bd => bd.BookingDetailId == bookingDetailId); // Lọc theo BookingDetailId

            if (bookingDetail == null)
            {
                return null; // Không tìm thấy booking detail
            }

            return bookingDetail.BookingId; // Trả về bookingId từ booking detail
        }

        public async Task<BookingListStaffDTO> GetBookingByBookingDetailIdAsync(int bookingDetailId)
        {
            var bookingDetail = await _context.BookingDetails
                .Include(bd => bd.Booking) // Chỉ Include 1 lần
                .Include(bd => bd.Service)
                .FirstOrDefaultAsync(bd => bd.BookingDetailId == bookingDetailId); // Lọc theo BookingDetailId

            if (bookingDetail == null)
            {
                return null; // Không tìm thấy booking detail
            }

            // Chuyển đổi từ Entity sang DTO
            return new BookingListStaffDTO
            {
                BookingId = bookingDetail.Booking.BookingId,
                Status = bookingDetail.Booking.Status,
                GuestName = bookingDetail.Booking.Guest.FullName, // Kiểm tra null tránh lỗi
                CustomerName = bookingDetail.Booking.Customer.Account.Name,

            };
        }
    }
}
    

