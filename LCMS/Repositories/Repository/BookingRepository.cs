using BusinessObjects.DTO.AdminBookingDTO;
using AutoMapper;
using BusinessObjects.DTO.BookingHistoryDTO;
using BusinessObjects.DTO.BookingStaffDTO;
using BusinessObjects.DTO.CartDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Org.BouncyCastle.Asn1.Cmp;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class BookingRepository : IBookingRepository
    {
        private readonly BookingDAO _bookingDao;
        private readonly IMapper _mapper;

        public BookingRepository(BookingDAO bookingDao, IMapper mapper)
        {
            _bookingDao = bookingDao;
            _mapper = mapper;
        }
        public async Task<int> AddBookingDetailAsync(int bookingId, List<BookingDetailDto> newDetails)
        {
           return await _bookingDao.AddBookingDetailAsync(bookingId, newDetails);
        }

        public async Task<Booking> CreateBookingFromCartAsync(BookingFromCartDto bookingData, CartDto cart)
        {
            return await _bookingDao.CreateBookingFromCartAsync(bookingData,cart);
        }

        public async Task<int> CreateDirectBookingAsync(BookingStaffDTO bookingData)
        {
          return await _bookingDao.CreateDirectBookingAsync(bookingData);
        }

        public async Task<bool> DeleteBookingAsync(int bookingId)
        {
            return await _bookingDao.DeleteBookingAsync(bookingId);
        }

        public async Task<bool> DeleteBookingDetailAsync(int bookingId, int detailId)
        {
            return await _bookingDao.DeleteBookingDetailAsync(bookingId, detailId);
        }

        public async Task<bool> EditBookingAsync(int bookingId, BookingFromCartDto bookingData)
        {
            return await _bookingDao.EditBookingAsync(bookingId, bookingData);
        }

        public async Task<bool> EditBookingDetailAsync(int bookingId, int detailId, BookingDetailDto updatedDetail)
        {
            return await _bookingDao.EditBookingDetailAsync(bookingId,detailId,updatedDetail);
        }

        public List<string> GetAllBookingDetail()
        {
            return _bookingDao.GetAllBookingDetail();
        }

        public async Task<List<BookingListStaffDTO>> GetAllBookingsAsync()
        {
           return await _bookingDao.GetAllBookingsAsync();
        }

        public async Task<List<BookingDTO>> GetAllBookingsDeliveringAsync()
        {
            return await _bookingDao.GetAllBookingsDeliveringAsync();
        }

        public async Task<List<BookingDTO>> GetAllBookingsPendingAsync()
        {
            return  await _bookingDao.GetAllBookingsPendingAsync();
        }

        public async Task<List<string>> GetAllDeliveryStatuses()
        {
            return await _bookingDao.GetAllDeliveryStatuses();
        }

        public Task<List<string>> GetAllPaymentType()
        {
           return _bookingDao.GetAllPaymentType();
        }

        public async Task<List<string>> GetAllStatus()
        {
            return await _bookingDao.GetAllStatus();
        }

        public async Task<BookingListStaffDTO> GetBookingByBookingDetailIdAsync(int bookingDetailId)
        {
            return await _bookingDao.GetBookingByBookingDetailIdAsync(bookingDetailId);
        }

        public async Task<BookingDTOforSupport> GetBookingByIdAsync(long bookingId)
        {
            var booking = await _bookingDao.GetBookingByIdAsync(bookingId);
            var result = _mapper.Map<BookingDTOforSupport>(booking);
            return result;

        }

        public async Task<List<BookingListDetailDto>> GetBookingDetailByIdAsync(int bookingId)
        {
            return await _bookingDao.GetBookingDetailByIdAsync(bookingId) ;
        }

        public async Task<int?> GetBookingIdByBookingDetailIdAsync(int bookingDetailId)
        {
            return await _bookingDao.GetBookingIdByBookingDetailIdAsync(bookingDetailId);
        }

        public async Task<List<BookingListStaffDTO>> GetBookingsAsync(int? customerId)
        {
           return await _bookingDao.GetBookingsAsync(customerId) ;
        }

    }
}
