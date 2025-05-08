using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class LaundrySubscription
{
    public int SubscriptionId { get; set; }

    public int CustomerId { get; set; }

    public string PackageName { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public decimal? MaxWeight { get; set; }

    public decimal? RemainingWeight { get; set; }

    public string Status { get; set; } = null!;

    public decimal Price { get; set; }

    public DateTime? CreatedDate { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<SubscriptionUsageHistory> SubscriptionUsageHistories { get; set; } = new List<SubscriptionUsageHistory>();
}
