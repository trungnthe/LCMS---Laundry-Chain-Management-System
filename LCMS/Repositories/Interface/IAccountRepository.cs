using BusinessObjects.DTO.AccountDTO;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IAccountRepository
    {
        Task<UpdateProfileResponse> UpdateProfileAsync(ClaimsPrincipal userClaims, AccountDTO accountDto);
        /*  Task<bool> SendUpdateEmailCodeAsync(string userEmail, string newEmail);*/
        Task<bool> SendUpdateEmailCodeAsync(ClaimsPrincipal userClaims, UpdateEmailDTO dto);
        Task<bool> VerifyUpdateEmailCodeAsync(ClaimsPrincipal userClaims,VerifyEmailDTO dto);
        Task<bool> UpdateRoleAsync(int accountId, int newRoleId, int employeeRoleId, int branchId);
        Task<List<RoleDTO>> GetAllRole();
        Task<List<AccountDTO1>> GetListAccount();
        Task<AccountDTO2> GetAccountById(int Id);
    }
}
 