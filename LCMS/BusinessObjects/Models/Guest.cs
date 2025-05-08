using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Guest
{
    public int GuestId { get; set; }

    public string FullName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string? Email { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
