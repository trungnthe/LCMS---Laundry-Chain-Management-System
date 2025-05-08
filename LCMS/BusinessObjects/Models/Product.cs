using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Product
{
    public int ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public decimal Price { get; set; }

    public int ProductCategoryId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Image { get; set; }

    public string? ServiceList { get; set; }

    public bool? StatusDelete { get; set; }

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual ProductCategory ProductCategory { get; set; } = null!;

    public virtual ICollection<WeatherSuggestion> WeatherSuggestions { get; set; } = new List<WeatherSuggestion>();
}
