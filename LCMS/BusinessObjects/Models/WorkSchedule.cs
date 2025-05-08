using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class WorkSchedule
{
    public int Id { get; set; }

    public string ShiftName { get; set; } = null!;

    public TimeOnly ShiftStart { get; set; }

    public TimeOnly ShiftEnd { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
