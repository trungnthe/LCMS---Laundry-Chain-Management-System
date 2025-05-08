using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class BookingDetail
{
    public int BookingDetailId { get; set; }

    public int BookingId { get; set; }

    public int ServiceId { get; set; }

    public int? ProductId { get; set; }

    public decimal? Weight { get; set; }

    public int? Quantity { get; set; }

    public decimal? Price { get; set; }

    public string? StatusLaundry { get; set; }

    public DateTime? UpdateAt { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual ICollection<BookingDetailHistory> BookingDetailHistories { get; set; } = new List<BookingDetailHistory>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual Product? Product { get; set; }

    public virtual Service Service { get; set; } = null!;
}
