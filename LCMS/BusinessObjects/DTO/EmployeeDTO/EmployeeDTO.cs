using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.EmployeeDTO
{
    public class EmployeeDTO
    {
        public int AccountId { get; set; }

        public int EmployeeRoleId { get; set; }

        public int? BranchId { get; set; }

        public DateOnly? Dob { get; set; }

        public DateOnly? HireDate { get; set; }
        public string EmployeeName {  get; set; }
        public string EmployeeRoleName {  get; set; }
        public string? BranchAddress { get; set; }

        public string? BranchPhoneNumber { get; set; }

        public string? BranchEmail { get; set; }

        public string BranchName { get; set; }
        public string Status { get; set; }
        public string AvatarUrl { get; set; } // Đường dẫn ảnh đại diện


    }
}
