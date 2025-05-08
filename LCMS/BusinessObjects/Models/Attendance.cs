using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Attendance
{
    public int Id { get; set; }

    public int WorkScheduleId { get; set; }

    public decimal? HoursWorked { get; set; }

    public decimal? OvertimeHours { get; set; }

    public int? LateMinutes { get; set; }

    public int? EarlyLeaveMinutes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? EmployeeId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateOnly? ShiftDate { get; set; }

    public TimeOnly? CheckIn { get; set; }

    public TimeOnly? CheckOut { get; set; }

    public string? Status { get; set; }

    public string? Note { get; set; }

    public virtual Employee? Employee { get; set; }

    public virtual WorkSchedule WorkSchedule { get; set; } = null!;
}
