using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Service
{
    public int ServiceId { get; set; }

    public string ServiceName { get; set; } = null!;

    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public int ServiceTypeId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Image { get; set; }

    public TimeOnly? EstimatedTime { get; set; }

    public bool? StatusDelete { get; set; }

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual ServiceType ServiceType { get; set; } = null!;

    public virtual ICollection<WeatherSuggestion> WeatherSuggestions { get; set; } = new List<WeatherSuggestion>();
}
