using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class BookingDetailHistory
{
    public int Id { get; set; }

    public int BookingDetailId { get; set; }

    public int BookingId { get; set; }

    public string? OldStatusLaundry { get; set; }

    public string NewStatusLaundry { get; set; } = null!;

    public DateTime UpdatedAt { get; set; }

    public int UpdatedBy { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual BookingDetail BookingDetail { get; set; } = null!;
}
