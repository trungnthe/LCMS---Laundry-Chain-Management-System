using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.EmployeeRoleDTO
{
    public class EmployeeRoleDTO
    {
        public int EmployeeRoleId { get; set; }
        public string EmployeeRoleName { get; set; }
        public string Description { get; set; }
        public bool? StatusDelete { get; set; }
    }


    public class EmployeeRoleCreateDTO
    {
        public string EmployeeRoleName { get; set; }
        public string Description { get; set; }
    }

    public class EmployeeRoleUpdateDTO
    {
        public string EmployeeRoleName { get; set; }
        public string Description { get; set; }
    }


}
