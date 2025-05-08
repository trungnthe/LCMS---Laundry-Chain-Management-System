using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class SubscriptionUsageHistory
{
    public int UsageId { get; set; }

    public int SubscriptionId { get; set; }

    public DateTime UsedDate { get; set; }

    public double WeightUsed { get; set; }

    public int? BookingId { get; set; }

    public string? Note { get; set; }

    public int? PaymentId { get; set; }

    public virtual Booking? Booking { get; set; }

    public virtual Payment? Payment { get; set; }

    public virtual LaundrySubscription Subscription { get; set; } = null!;
}
