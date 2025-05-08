using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class InventoryDetail
{
    public int InventoryDetailId { get; set; }

    public string ItemName { get; set; } = null!;

    public int InventoryId { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public DateOnly? ExpirationDate { get; set; }

    public string? Image { get; set; }

    public decimal? TotalPrice { get; set; }

    public int? UpdateBy { get; set; }

    public bool? StatusDelete { get; set; }

    public DateTime? CreateAt { get; set; }

    public virtual Inventory Inventory { get; set; } = null!;

    public virtual ICollection<InventoryHistory> InventoryHistories { get; set; } = new List<InventoryHistory>();
}
