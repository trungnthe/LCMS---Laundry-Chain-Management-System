using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Booking
{
    public int BookingId { get; set; }

    public int? CustomerId { get; set; }

    public int BranchId { get; set; }

    public string Status { get; set; } = null!;

    public decimal? TotalAmount { get; set; }

    public DateTime BookingDate { get; set; }

    public int? StaffId { get; set; }

    public string? Note { get; set; }

    public DateTime? FinishTime { get; set; }

    public int? GuestId { get; set; }

    public string? DeliveryAddress { get; set; }

    public string? PickupAddress { get; set; }

    public string? LaundryType { get; set; }

    public string? DeliveryType { get; set; }

    public decimal? ShippingFee { get; set; }

    public virtual ICollection<BookingDetailHistory> BookingDetailHistories { get; set; } = new List<BookingDetailHistory>();

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual ICollection<BookingStatusHistory> BookingStatusHistories { get; set; } = new List<BookingStatusHistory>();

    public virtual Branch Branch { get; set; } = null!;

    public virtual Customer? Customer { get; set; }

    public virtual Guest? Guest { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Employee? Staff { get; set; }

    public virtual ICollection<SubscriptionUsageHistory> SubscriptionUsageHistories { get; set; } = new List<SubscriptionUsageHistory>();
}
