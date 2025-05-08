using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class ProductCategory
{
    public int ProductCategoryId { get; set; }

    public string ProductCategoryName { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Image { get; set; }

    public bool? StatusDelete { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
