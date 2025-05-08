using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.AdminBookingDTO
{
    public class BookingDTO
    {
        public int BookingId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = null!;
        public string GuestName { get; set; } = null!;
        public string GuestPhoneNumber { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public int BranchId { get; set; }
        public string BranchName { get; set; } = null!;
        public string Status { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public DateTime BookingDate { get; set; }
        public int StaffId { get; set; }
        public string StaffName { get; set; } = null!;
        public string? PaymentType { get; set; }
        public string? Note { get; set; }
        public string MembershipLevel { get;  set; }

        public string? DeliveryAddress { get; set; }

        public string? PickupAddress { get; set; }

        public string? LaundryType { get; set; }

        public string? DeliveryType { get; set; }

        public decimal? ShippingFee { get; set; }   
        public DateTime? FinishTime { get; set; }
        public List<int?> BookingDetailIds { get; set; } = new List<int?>();
        public List<string?> BookingDetailItems { get; set; } = new List<string?>();
        public List<string?> BookingDetailService { get; set; } = new List<string?>();


    }

}
