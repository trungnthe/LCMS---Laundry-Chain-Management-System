using BusinessObjects.DTO.BookingHistoryDTO;
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
    public class BookingHistoryRepository : IBookingHistory
    {
         private readonly BookingHistoryDao bookingHistoryDao;
        public BookingHistoryRepository(BookingHistoryDao bookingHistoryDao)
        {
            this.bookingHistoryDao = bookingHistoryDao;
        }

        public Task<decimal> CalculateTotalAmountAsync(int bookingId)
        {
            return bookingHistoryDao.CalculateTotalAmountAsync(bookingId);
        }

        public Task<List<BookingStatusHistoryDto>> GetAllBookingHistoryAsync()
        {
           return bookingHistoryDao.GetAllBookingHistoryAsync();
        }

        public Task<List<BookingStatusHistoryDto>> GetBookingHistoryByIdAsync(int bookingId)
        {
           return bookingHistoryDao.GetBookingHistoryByIdAsync(bookingId);
        }

        public Task UpdateBookingAsync(BookingDTOforSupport booking)
        {
            return bookingHistoryDao.UpdateBookingAsync(booking);
        }

        public Task<bool> UpdateBookingDetailStatusAsync(int bookingDetailId, string newStatusLaundry)
        {
          return bookingHistoryDao.UpdateBookingDetailStatusAsync(bookingDetailId, newStatusLaundry);
        }

        public Task<bool> UpdateBookingStatusAsync(int bookingId, string newStatus)
        {
          return bookingHistoryDao.UpdateBookingStatusAsync(bookingId, newStatus);
        }

        public Task<bool> UpdateBookingStatusDoneAsync(int updatedById, int bookingId, string newStatus)
        {
            return bookingHistoryDao.UpdateBookingStatusDoneAsync(updatedById, bookingId,newStatus);

        }

        public Task<bool> UpdateShippingFeeBookingAsync(int bookingId, decimal? shippingFee)
        {
            return bookingHistoryDao.UpdateShippingFeeBookingAsync(bookingId, shippingFee);
        }

        public Task<bool> UpdateWeightBookingDetailAsync(int bookingDetailId, decimal? weight)
        {
            return bookingHistoryDao.UpdateWeightBookingDetailAsync(bookingDetailId, weight);
        }


    }
}
