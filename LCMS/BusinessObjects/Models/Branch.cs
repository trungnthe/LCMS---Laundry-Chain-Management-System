using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Branch
{
    public int BranchId { get; set; }

    public string BranchName { get; set; } = null!;

    public string? Address { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public string? OpeningHours { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedDate { get; set; }

    public DateTime? LastUpdated { get; set; }

    public string? Notes { get; set; }

    public string? IpAddress { get; set; }

    public string? Image { get; set; }

    public string? MapLink { get; set; }

    public bool? StatusDelete { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
}
