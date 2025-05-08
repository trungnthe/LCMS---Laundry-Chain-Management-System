using System;
using System.Collections.Generic;

namespace BusinessObjects.Models;

public partial class EmployeeRole
{
    public int EmployeeRoleId { get; set; }

    public string EmployeeRoleName { get; set; } = null!;

    public string Description { get; set; } = null!;

    public bool? StatusDelete { get; set; }

    public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();

    public virtual SalaryStructure? SalaryStructure { get; set; }
}
