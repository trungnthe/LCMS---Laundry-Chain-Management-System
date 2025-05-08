using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int? BookingId { get; set; }

    public DateTime PaymentDate { get; set; }

    public decimal AmountPaid { get; set; }

    public string? PaymentStatus { get; set; }

    public string? Qrcode { get; set; }

    public decimal? Discount { get; set; }

    public decimal? TotalPrice { get; set; }

    public string? PaymentType { get; set; }

    public int? Points { get; set; }

    public int? CreateBy { get; set; }

    public int? OrderCode { get; set; }

    public string? PackageName { get; set; }

    public virtual Booking? Booking { get; set; }

    public virtual ICollection<SubscriptionUsageHistory> SubscriptionUsageHistories { get; set; } = new List<SubscriptionUsageHistory>();
}
