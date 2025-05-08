using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class BookingStatusHistory
{
    public int Id { get; set; }

    public int BookingId { get; set; }

    public string? OldStatus { get; set; }

    public string NewStatus { get; set; } = null!;

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual Employee? UpdatedByNavigation { get; set; }
}
