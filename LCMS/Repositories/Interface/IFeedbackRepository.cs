using BusinessObjects.DTO.FeedbackDTO;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IFeedbackRepository
    {
        Task<FeedbackDTO> CreateFeedbackAsync(CreateFeedbackDTO feedbackDto);
        Task<FeedbackDTO> ReplyToFeedbackAsync(int parentFeedbackId, ReplyFeedbackDTO replyDto);
        Task<List<FeedbackDTO>> GetFeedbacksByBookingDetailIdAsync(int bookingDetailId);
        Task<FeedbackDTO> UpdateFeedbackAsync(int feedbackId, UpdateFeedbackDTO updateDto);

        Task<List<FeedbackGetAllDTO>> GetAllFeedbacksByBranchAsync(int branchId);

    }
}
