using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.BookingHistoryDTO
{
    public class BookingStatusHistoryDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public string? OldStatus { get; set; }
        public string NewStatus { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public string UpdatedByName { get; set; }
    }
    public class UpdateBookingStatusRequest
    {
        public int BookingId { get; set; }
        public string NewStatus { get; set; }
    }

    public class BookingDTOforSupport
    {
        public int BookingId { get; set; }
        public int CustomerId { get; set; }
        public int BranchId { get; set; }
        public string Status { get; set; }
        public decimal? ShippingFee { get; set; }

        public decimal? TotalAmount { get; set; }
        public DateTime BookingDate { get; set; }
        public string? PaymentType { get; set; }
    }

}
