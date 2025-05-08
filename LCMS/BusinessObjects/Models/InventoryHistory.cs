using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class InventoryHistory
{
    public int HistoryId { get; set; }

    public int ItemId { get; set; }

    public string ChangeType { get; set; } = null!;

    public int QuantityChanged { get; set; }

    public int OldQuantity { get; set; }

    public int NewQuantity { get; set; }

    public string? ChangedBy { get; set; }

    public DateTime? ChangeDate { get; set; }

    public int? EmployeeId { get; set; }

    public string? Note { get; set; }

    public virtual Employee? Employee { get; set; }

    public virtual InventoryDetail Item { get; set; } = null!;
}
