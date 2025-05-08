using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.SalaryStructureDTO
{
    public class SalaryStructureDTO
    {
        public int EmployeeRoleId { get; set; }
        public decimal BaseSalary { get; set; }
        public decimal Allowance { get; set; }
        public decimal? OvertimeRate { get; set; }
        public int? StandardHoursPerMonth { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public String EmployeeRoleName { get; set; }
        public String EmployeeRoleDescription { get; set; }
    }
  

    public class SalaryStructureUpdateDTO
    {
        public decimal BaseSalary { get; set; }
        public decimal Allowance { get; set; }
        public decimal? OvertimeRate { get; set; }
        public int? StandardHoursPerMonth { get; set; }

    }
}
