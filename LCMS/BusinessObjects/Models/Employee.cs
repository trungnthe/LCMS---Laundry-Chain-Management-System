using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Employee
{
    public int AccountId { get; set; }

    public int? EmployeeRoleId { get; set; }

    public int BranchId { get; set; }

    public DateOnly? Dob { get; set; }

    public DateOnly? HireDate { get; set; }

    public string? AvatarUrl { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();

    public virtual ICollection<BookingStatusHistory> BookingStatusHistories { get; set; } = new List<BookingStatusHistory>();

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual Branch Branch { get; set; } = null!;

    public virtual EmployeeRole? EmployeeRole { get; set; }

    public virtual ICollection<InventoryHistory> InventoryHistories { get; set; } = new List<InventoryHistory>();
}
