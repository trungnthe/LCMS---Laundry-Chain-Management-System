using BusinessObjects.DTO.BookingHistoryDTO;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IBookingHistory
    {
        Task<bool> UpdateBookingStatusAsync(int bookingId, string newStatus);
        Task<List<BookingStatusHistoryDto>> GetAllBookingHistoryAsync();
        Task<List<BookingStatusHistoryDto>> GetBookingHistoryByIdAsync(int bookingId);
        Task<bool> UpdateBookingDetailStatusAsync(int bookingDetailId, string newStatusLaundry);
        Task<bool> UpdateWeightBookingDetailAsync(int bookingDetailId, decimal? weight);
        Task<bool> UpdateShippingFeeBookingAsync(int bookingId, decimal? shippingFee);
        Task UpdateBookingAsync(BookingDTOforSupport booking);
        Task<decimal> CalculateTotalAmountAsync(int bookingId);
        Task<bool> UpdateBookingStatusDoneAsync(int updatedById, int bookingId, string newStatus);
    }
}
