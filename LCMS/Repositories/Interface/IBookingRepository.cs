using BusinessObjects.DTO.AdminBookingDTO;

using BusinessObjects.DTO.BookingHistoryDTO;
using BusinessObjects.DTO.BookingStaffDTO;
using BusinessObjects.DTO.CartDTO;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IBookingRepository
    {
        List<string> GetAllBookingDetail();
        Task<Booking> CreateBookingFromCartAsync(BookingFromCartDto bookingData, CartDto cart);
        Task<int> CreateDirectBookingAsync(BookingStaffDTO bookingData);
        Task<int> AddBookingDetailAsync(int bookingId, List<BookingDetailDto> newDetails);
        Task<bool> EditBookingDetailAsync(int bookingId, int detailId, BookingDetailDto updatedDetail);
        Task<bool> DeleteBookingDetailAsync(int bookingId, int detailId);
        Task<bool> EditBookingAsync(int bookingId, BookingFromCartDto bookingData);
        Task<bool> DeleteBookingAsync(int bookingId);
        Task<List<BookingListStaffDTO>> GetBookingsAsync(int? customerId);
        Task<List<BookingListStaffDTO>> GetAllBookingsAsync();
        Task<List<BookingListDetailDto>> GetBookingDetailByIdAsync(int bookingId);
        Task<List<BookingDTO>> GetAllBookingsPendingAsync();
        Task<List<BookingDTO>> GetAllBookingsDeliveringAsync();
        Task<int?> GetBookingIdByBookingDetailIdAsync(int bookingDetailId);
        Task<BookingListStaffDTO> GetBookingByBookingDetailIdAsync(int bookingDetailId);

        Task<List<string>> GetAllStatus();
        Task<BookingDTOforSupport> GetBookingByIdAsync(long bookingId);

        Task<List<string>> GetAllDeliveryStatuses();
        Task<List<string>> GetAllPaymentType();
    }
}
