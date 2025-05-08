using BusinessObjects.DTO.PaymentDTO;
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
    public class PaymentRepository : IPaymentRepository
    {
        private readonly PaymentDao paymentDao;
        public PaymentRepository(PaymentDao paymentDao)
        {
            this.paymentDao = paymentDao;
        }

        public Task AddLoyaltyPoints(int bookingID)
        {
            return paymentDao.AddLoyaltyPoints(bookingID);
        }

       
        public Task DeletePaymentsByBookingIdAsync(int bookingId)
        {
            return paymentDao.DeletePaymentsByBookingIdAsync((int)bookingId);
        }

        public Task<Payment> CreatePayment(Payment payment)
        {
            return paymentDao.CreatePayment(payment);
        }

        public Task<(int TotalQuantity, int TotalWeight)> GetBookingDetailsAsync(int bookingId)
        {
           return paymentDao.GetBookingDetailsAsync(bookingId);
        }

        public Task<Booking?> GetCompletedBookingAsync(int bookingId)
        {
            return paymentDao.GetCompletedBookingAsync(bookingId);
        }

        public Task<Customer?> GetCurrentUserAsync(int bookingID)
        {
            return paymentDao.GetCurrentUserAsync(bookingID);
        }

        public Task<string?> GetCurrentUserMembershipLevelAsync(int bookingID)
        {
            return paymentDao.GetCurrentUserMembershipLevelAsync(bookingID);
        }

        public Task<int> GetCurrentUserPoints(int bookingId)
        {
            return paymentDao.GetCurrentUserPoints(bookingId);
        }

        public Task<Payment?> GetLatestPaymentByOrderCode(int orderCode)
        {
          return paymentDao.GetLatestPaymentByOrderCode(orderCode);
        }

        public Task<PaymentDTO> GetPaymentByBookingId(int bookingId)
        {
           return paymentDao.GetPaymentByBookingId(bookingId);
        }

        public Task<Payment?> GetPaymentByIdAsync(int paymentId)
        {
            return paymentDao.GetPaymentByIdAsync(paymentId);
        }

        public Task<List<Payment?>> GetPendingPaymentByBookingIdAsync(int bookingId)
        {
          return paymentDao.GetPendingPaymentByBookingIdAsync((int)bookingId);
        }

        public Task<Payment?> GetSuccessfulPaymentByBookingIdAsync(int bookingId)
        {
            return paymentDao.GetSuccessfulPaymentByBookingIdAsync(bookingId);
        }

        public Task RemovePendingPaymentsAsync(IEnumerable<Payment> pendingPayments)
        {
            return paymentDao.RemovePendingPaymentsAsync(pendingPayments);
        }

        public Task SaveAsync()
        {
            return paymentDao.SaveAsync();
        }

        public Task UpdateBookingDetailsStatus(int bookingId, string newStatus)
        {
           return paymentDao.UpdateBookingDetailsStatus(bookingId, newStatus);
        }

        public Task UpdateCurrentUserMembershipLevel(int bookingID)
        {
            return paymentDao.UpdateCurrentUserMembershipLevel(bookingID);
        }

        public Task<bool> UpdatePaymentStatus(int paymentId, string status)
        {
            return paymentDao.UpdatePaymentStatus(paymentId, status);
        }

        public Task UpdateUserPoints( int pointsUsed, int bookingID)
        {
           return paymentDao.UpdateUserPoints( pointsUsed,bookingID);
        }

      

        public Task<decimal> CalculateBookingDetailPrice(Booking booking)
        {
            return paymentDao.CalculateBookingDetailPrice(booking);
        }

        public Task DeletePaymentsByPaymentIdAsync(long paymentId)
        {
            return paymentDao.DeletePaymentsByPaymentIdAsync(paymentId);
        }

     

        public Task ApplySubscriptionToBookingAsync(int bookingId)
        {
            return paymentDao.ApplySubscriptionToBookingAsync(bookingId);
        }
    }
}
