using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.BookingStaffDTO
{
    public class BookingStaffDTO
    {
        public int? CustomerId { get; set; }
        public int BranchId { get; set; }
        public int? StaffId { get; set; }
        public string? GuestName { get; set; }  // ✅ Cho phép null
        public string? PhoneNumber { get; set; }  // ✅ Cho phép null
        public BookingStatus Status { get; set; }
        public string? Note { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? PickupAddress { get; set; }
        public string? LaundryType { get; set; }
        public string? DeliveryType { get; set; }
        

        public List<BookingDetailDto> BookingDetails { get; set; } = new();
    }

    public class BookingListStaffDTO
    {
        public int BookingId { get; set; }
        public int? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public int? GuestId { get; set; }
        public string GuestName { get; set; }
        public int BranchId { get; set; }
        public string BranchName { get; set; }
        public int? StaffId { get; set; }
        public string StaffName { get; set; }
        public string Status { get; set; } 
        public string? PaymentType { get; set; }
        public string? Note { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime? FinishTime { get; set; }
        public DateTime BookingDate { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? PickupAddress { get; set; }
        public string? LaundryType { get; set; }
        public string? DeliveryType { get; set; }
        public decimal? ShippingFee { get; set; }

    }

    public class BookingDetailDto
    {
      
        public int ServiceId { get; set; }

        public int? ProductId { get; set; }
        public decimal? Weight { get; set; }
        public int? Quantity { get; set; }
        public decimal? Price { get; set; }
        public int? QuantityOfKilo { get; set; }

        public string? Image { get; set; }
        public int? IndexNumber { get; set; }
    }
    public class BookingListDetailDto
    {
        public int BookingDetailId { get; set; }
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public string StatusLaundry { get; set; }
        public decimal? servicePrice { get; set; }
        public decimal? productPrice { get; set; }

        public int? ProductId { get; set; }
        public string ProductName { get; set; }
        public int? QuantityOfKilo { get; set; }

        public decimal? Weight { get; set; }
        public int? Quantity { get; set; }
        public decimal? Price { get; set; }
        public string? Image { get; set; }
        public int? IndexNumber { get; set; }
    }
    public class BookingFromCartDto
    {
        public int? CustomerId { get; set; }
        public int? GuestId { get; set; }
        public int BranchId { get; set; }
        public int? StaffId { get; set; }
        public BookingStatus Status { get; set; }
     
        public string? Note { get; set; }
  
        public string? DeliveryAddress { get; set; }
        public string? PickupAddress { get; set; }
        public string? LaundryType { get; set; }
        public string? DeliveryType { get; set; }
        public decimal? ShippingFee { get; set; }

    }

}
