using BusinessObjects.DTO.FeedbackDTO;
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
    public class FeedbackDao
    {
        private readonly LcmsContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public FeedbackDao(LcmsContext context,IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<FeedbackDTO> CreateFeedbackAsync(CreateFeedbackDTO feedbackDto)
        {
            var (accountId, role) = GetCurrentUserClaims();

            if (string.IsNullOrEmpty(accountId))
            {
                throw new UnauthorizedAccessException("Không thể xác định tài khoản.");
            }

            int parsedAccountId = int.Parse(accountId);

            var lastFeedback = await _context.Feedbacks
                .Where(f => f.BookingDetailId == feedbackDto.BookingDetailId)
                .OrderByDescending(f => f.FeedbackDate)
                .FirstOrDefaultAsync();

            if (role == "Customer")
            {
                if (lastFeedback != null && !(await IsStaff(lastFeedback.AccountId.Value)))
                {
                    throw new InvalidOperationException("Bạn chỉ có thể phản hồi khi nhân viên đã phản hồi lại");
                }
            }

            bool isFirstFeedbackForBookingDetail = !await _context.Feedbacks
                .AnyAsync(f => f.BookingDetailId == feedbackDto.BookingDetailId && f.AccountId == parsedAccountId);

            var feedback = new Feedback
            {
                BookingDetailId = feedbackDto.BookingDetailId,
                Rating = feedbackDto.Rating,
                Comment = feedbackDto.Comment,
                FeedbackDate = DateTime.Now,
                AccountId = parsedAccountId,
                ParentFeedbackId = null
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

          
            if (isFirstFeedbackForBookingDetail)
            {
                var user = await _context.Accounts
                    .Include(a => a.Customer) 
                    .FirstOrDefaultAsync(a => a.AccountId == parsedAccountId);

                if (user?.Customer != null)
                {
                    user.Customer.LoyaltyPoints += 10;
                    await _context.SaveChangesAsync();
                }
            }

            return new FeedbackDTO
            {
                FeedbackId = feedback.FeedbackId,
                BookingDetailId = feedback.BookingDetailId,
                Rating = feedback.Rating,
                Comment = feedback.Comment,
                FeedbackDate = feedback.FeedbackDate,
                AccountId = feedback.AccountId
            };
        }

        public async Task<FeedbackDTO> ReplyToFeedbackAsync(int parentFeedbackId, ReplyFeedbackDTO replyDto)
        {
            try
            {
                var (accountId, role) = GetCurrentUserClaims();

                if (string.IsNullOrEmpty(accountId))
                {
                    throw new UnauthorizedAccessException("Không thể xác định tài khoản.");
                }
                var parentFeedback = await _context.Feedbacks
                    .FirstOrDefaultAsync(f => f.FeedbackId == parentFeedbackId);

                if (parentFeedback == null)
                {
                    throw new KeyNotFoundException("Feedback không tồn tại.");
                }

                int parsedAccountId;
                if (!int.TryParse(accountId, out parsedAccountId))
                {
                    throw new InvalidOperationException("ID tài khoản không hợp lệ.");
                }

                var replyFeedback = new Feedback
                {
                    BookingDetailId = replyDto.BookingDetailId,
                    Comment = replyDto.Comment,
                    FeedbackDate = DateTime.Now,
                    AccountId = parsedAccountId,
                    ParentFeedbackId = parentFeedbackId
                };

                _context.Feedbacks.Add(replyFeedback);
                await _context.SaveChangesAsync();

                return new FeedbackDTO
                {
                    FeedbackId = replyFeedback.FeedbackId,
                    BookingDetailId = replyFeedback.BookingDetailId,
                    Comment = replyFeedback.Comment,
                    FeedbackDate = replyFeedback.FeedbackDate,
                    AccountId = replyFeedback.AccountId,
                    ParentFeedbackId = parentFeedbackId,
                    ReplyDate = replyFeedback.FeedbackDate
                };
            }
            catch (DbUpdateException ex)
            {
                throw new Exception($"Lỗi khi lưu phản hồi: {ex.InnerException?.Message ?? ex.Message}");
            }
        }
        public async Task<List<FeedbackGetAllDTO>> GetAllFeedbacksByBranchAsync(int branchId)
        {
            // Lấy toàn bộ phản hồi gốc theo chi nhánh
            var feedbacks = await _context.Feedbacks
                .Include(f => f.Account)
                .Include(f => f.BookingDetail)
                    .ThenInclude(bd => bd.Service)
                .Include(f => f.BookingDetail)
                    .ThenInclude(bd => bd.Booking)
                    .ThenInclude(b => b.Customer)
                    .ThenInclude(c => c.Account)
                .Where(f =>
                    f.ParentFeedbackId == null &&
                    f.BookingDetail.Booking.BranchId == branchId)
                .OrderBy(f => f.FeedbackDate)
                .ToListAsync();

            // Lọc lại: chỉ lấy feedback chưa được nhân viên phản hồi
            var result = feedbacks
                .Where(f => !_context.Feedbacks.Any(reply =>
                    reply.ParentFeedbackId == f.FeedbackId &&
                    reply.Account != null &&
                    reply.Account.RoleId == 3)) // nhân viên
                .Select(f => new FeedbackGetAllDTO
                {
                    FeedbackId = f.FeedbackId,
                    BookingDetailId = f.BookingDetailId,
                    Rating = f.Rating,
                    Comment = f.Comment,
                    ServiceName = f.BookingDetail.Service.ServiceName,
                    FeedbackDate = f.FeedbackDate,
                    CustomerName = f.BookingDetail.Booking.Customer.Account.Name,
                })
                .ToList();

            return result;
        }



        public async Task<List<FeedbackDTO>> GetFeedbacksByBookingDetailIdAsync(int bookingDetailId)
        {
            var feedbacks = await _context.Feedbacks.Include(x => x.Account)
                .Where(f => f.BookingDetailId == bookingDetailId)
                .OrderBy(f => f.FeedbackDate)
                .Select(f => new FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    BookingDetailId = f.BookingDetailId,
                    Rating = f.Rating,
                    Comment = f.Comment,
                    FeedbackDate = f.FeedbackDate,
                    AccountId = f.AccountId,
                    AccountName = f.Account.Name,
                    ParentFeedbackId = f.ParentFeedbackId,
                    ReplyDate = f.ParentFeedbackId != null ? f.FeedbackDate : null
                })
                .ToListAsync();

            return feedbacks;
        }
        public async Task<FeedbackDTO> UpdateFeedbackAsync(int feedbackId, UpdateFeedbackDTO updateDto)
        {
           
            var (accountId, role) = GetCurrentUserClaims();

            if (string.IsNullOrEmpty(accountId))
            {
                throw new UnauthorizedAccessException("Không thể xác định tài khoản.");
            }

           
            var feedback = await _context.Feedbacks
                .FirstOrDefaultAsync(f => f.FeedbackId == feedbackId && f.AccountId == int.Parse(accountId));

            if (feedback == null)
            {
                throw new KeyNotFoundException("Phản hồi không tồn tại hoặc không phải của bạn.");
            }

           
            if (!feedback.FeedbackDate.HasValue)
            {
                throw new InvalidOperationException("Ngày phản hồi không hợp lệ.");
            }

        
            var daysPassed = (DateTime.Now - feedback.FeedbackDate.Value).Days;

         
            if (daysPassed > 3)
            {
                throw new InvalidOperationException("Bạn chỉ có thể chỉnh sửa phản hồi trong vòng 3 ngày kể từ khi phản hồi được tạo.");
            }

        
            feedback.Rating = updateDto.Rating;
            feedback.Comment = updateDto.Comment;
            feedback.FeedbackDate = DateTime.Now; 

         
            _context.Entry(feedback).State = EntityState.Modified;
            await _context.SaveChangesAsync();

       
            return new FeedbackDTO
            {
                FeedbackId = feedback.FeedbackId,
                BookingDetailId = feedback.BookingDetailId,
                Rating = feedback.Rating,
                Comment = feedback.Comment,
                FeedbackDate = feedback.FeedbackDate,
                AccountId = feedback.AccountId
            };
        }
        private async Task<bool> IsStaff(int accountId)
        {
            var user = await _context.Accounts
                .Include(u => u.Role)
                .Where(u => u.AccountId == accountId && u.Role.RoleName == "Staff")
                .FirstOrDefaultAsync();

            return user != null;
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
    }




}
