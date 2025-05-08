using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Account
{
    public int AccountId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public int? RoleId { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Blog> Blogs { get; set; } = new List<Blog>();

    public virtual Customer? Customer { get; set; }

    public virtual Employee? Employee { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Notification> NotificationAccounts { get; set; } = new List<Notification>();

    public virtual ICollection<Notification> NotificationCreatedBies { get; set; } = new List<Notification>();

    public virtual Role? Role { get; set; }
}
