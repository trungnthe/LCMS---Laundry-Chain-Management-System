using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class ServiceType
{
    public int ServiceTypeId { get; set; }

    public string ServiceTypeName { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Image { get; set; }

    public bool? StatusDelete { get; set; }

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();
}
