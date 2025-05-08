using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.EmployeeDTO
{
    public class CreateEmployeeAccountDTO
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; } // 3 = Staff, 4 = Supervisor


        public int ? EmployeeRoleId { get; set; }

        public int BranchId { get; set; }
    }


}
