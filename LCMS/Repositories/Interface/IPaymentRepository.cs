using BusinessObjects.DTO.PaymentDTO;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IPaymentRepository
    {
        Task<Booking?> GetCompletedBookingAsync(int bookingId);
        Task<Payment?> GetPaymentByIdAsync(int paymentId);
        Task<Payment> CreatePayment(Payment payment);
        Task<bool> UpdatePaymentStatus(int paymentId, string status);
        Task<Payment?> GetSuccessfulPaymentByBookingIdAsync(int bookingId);
        Task<int> GetCurrentUserPoints(int bookingID);
        Task UpdateUserPoints( int pointsUsed,int bookingID);
        Task UpdateCurrentUserMembershipLevel(int bookingID);
        Task<Customer?> GetCurrentUserAsync(int bookingID);
        Task<string?> GetCurrentUserMembershipLevelAsync(int bookingID);
        Task<PaymentDTO> GetPaymentByBookingId(int bookingId);
        Task DeletePaymentsByBookingIdAsync(int bookingId);
        Task AddLoyaltyPoints(int bookingID);
        Task UpdateBookingDetailsStatus(int bookingId, string newStatus);
        Task<List<Payment?>> GetPendingPaymentByBookingIdAsync(int bookingId);
        Task SaveAsync();
        Task<(int TotalQuantity, int TotalWeight)> GetBookingDetailsAsync(int bookingId);

        Task ApplySubscriptionToBookingAsync(int bookingId);
        Task RemovePendingPaymentsAsync(IEnumerable<Payment> pendingPayments);
        Task<Payment?> GetLatestPaymentByOrderCode(int orderCode);
        Task<decimal> CalculateBookingDetailPrice(Booking booking);
        Task DeletePaymentsByPaymentIdAsync(long orderId);
    }
}
