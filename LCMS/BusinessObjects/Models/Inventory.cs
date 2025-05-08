using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class Inventory
{
    public int InventoryId { get; set; }

    public string InventoryName { get; set; } = null!;

    public int BranchId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? CreatedDate { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public decimal TotalAmount { get; set; }

    public string? Image { get; set; }

    public bool? StatusDelete { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual ICollection<InventoryDetail> InventoryDetails { get; set; } = new List<InventoryDetail>();
}
