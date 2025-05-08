using BusinessObjects.DTO.FeedbackDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class FeedbackRepository : IFeedbackRepository
    {
        private readonly FeedbackDao _feedbackDao;

        public FeedbackRepository(FeedbackDao feedbackDao)
        {
            _feedbackDao = feedbackDao;
        }

        public Task<FeedbackDTO> CreateFeedbackAsync(CreateFeedbackDTO feedbackDto)
        {
           return _feedbackDao.CreateFeedbackAsync(feedbackDto);
        }

        public Task<List<FeedbackGetAllDTO>> GetAllFeedbacksByBranchAsync(int branchId)
        {
            return _feedbackDao.GetAllFeedbacksByBranchAsync(branchId);
        }

        public Task<List<FeedbackDTO>> GetFeedbacksByBookingDetailIdAsync(int bookingDetailId)
        {
            return _feedbackDao.GetFeedbacksByBookingDetailIdAsync(bookingDetailId);
        }

        public Task<FeedbackDTO> ReplyToFeedbackAsync(int parentFeedbackId, ReplyFeedbackDTO replyDto)
        {
            return _feedbackDao.ReplyToFeedbackAsync(parentFeedbackId, replyDto);
        }

        public Task<FeedbackDTO> UpdateFeedbackAsync(int feedbackId, UpdateFeedbackDTO updateDto)
        {
           return _feedbackDao.UpdateFeedbackAsync(feedbackId, updateDto);
        }
    }
}
