using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class SalaryStructure
{
    public int EmployeeRoleId { get; set; }

    public decimal BaseSalary { get; set; }

    public decimal Allowance { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public decimal? OvertimeRate { get; set; }

    public int? StandardHoursPerMonth { get; set; }

    public virtual EmployeeRole EmployeeRole { get; set; } = null!;
}
