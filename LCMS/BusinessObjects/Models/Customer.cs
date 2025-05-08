using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Customer
{
    public int AccountId { get; set; }

    public string? MembershipLevel { get; set; }

    public int? LoyaltyPoints { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<LaundrySubscription> LaundrySubscriptions { get; set; } = new List<LaundrySubscription>();
}
