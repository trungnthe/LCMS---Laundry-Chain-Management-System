using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Notification
{
    public int NotificationId { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public int? AccountId { get; set; }

    public int CreatedById { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsRead { get; set; }

    public int? BookingId { get; set; }

    public int? BranchId { get; set; }

    public string? Type { get; set; }

    public string? Image { get; set; }

    public int? BlogId { get; set; }

    public int? SupportId { get; set; }

    public virtual Account? Account { get; set; }

    public virtual Account CreatedBy { get; set; } = null!;
}
