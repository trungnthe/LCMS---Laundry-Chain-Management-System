using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.AccountDTO
{
    public class AccountDTO
    {
        public string Name { get; set; }

        public string Phone { get; set; }
    }
    public class AccountDTO1
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

    }
    public class AccountDTO2
    {
        public int? AccountId { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? RoleName { get; set; }
        public string? Phone { get; set; }
        public int? BranchId { get; set; }

    }

    public class UpdateEmailDTO
    {
      
        public string NewEmail { get; set; }
    }

    public class VerifyEmailDTO
    {
    
        public string Code { get; set; }
    }
    public class UpdateRoleDTO
    {
        public int AccountId { get; set; }
        public int NewRoleId { get; set; }
        public int EmployeeRoleId { get; set; }
        public int BranchId { get; set; }
    }
    public class RoleDTO
    {
        public int RoleId { get; set; }

        public string RoleName { get; set; } = null!;
    }
    public class UpdateProfileResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }







}
