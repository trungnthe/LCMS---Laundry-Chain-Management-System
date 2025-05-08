using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class WeatherSuggestion
{
    public int Id { get; set; }

    public string WeatherKeyword { get; set; } = null!;

    public int? ProductId { get; set; }

    public int? ServiceId { get; set; }

    public virtual Product? Product { get; set; }

    public virtual Service? Service { get; set; }
}
