using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int BookingDetailId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? FeedbackDate { get; set; }

    public int? AccountId { get; set; }

    public DateTime? ReplyDate { get; set; }

    public int? ParentFeedbackId { get; set; }

    public virtual Account? Account { get; set; }

    public virtual BookingDetail BookingDetail { get; set; } = null!;
}
