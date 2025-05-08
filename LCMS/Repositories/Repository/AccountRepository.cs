using BusinessObjects.DTO.AccountDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class AccountRepository : IAccountRepository
    {
        private readonly AccountDao accountDao;
        public AccountRepository(AccountDao accountDao)
        {
            this.accountDao = accountDao;
        }

        public Task<AccountDTO2> GetAccountById(int Id)
        {
           return accountDao.GetAccountById(Id);
        }

        public Task<List<RoleDTO>> GetAllRole()
        {
           return accountDao.GetAllRole();
        }

        public Task<List<AccountDTO1>> GetListAccount()
        {
           return accountDao.GetListAccount();
        }

        public Task<bool> SendUpdateEmailCodeAsync(ClaimsPrincipal userClaims, UpdateEmailDTO dto)
        {
            return accountDao.SendUpdateEmailCodeAsync(userClaims, dto);
        }

        public Task<UpdateProfileResponse> UpdateProfileAsync(ClaimsPrincipal userClaims, AccountDTO accountDto)
        {
            return accountDao.UpdateProfileAsync(userClaims, accountDto);
        }

        public Task<bool> UpdateRoleAsync(int accountId, int newRoleId, int employeeRoleId, int branchId)
        {
            return accountDao.UpdateRoleAsync(accountId, newRoleId, employeeRoleId, branchId);
        }

        public Task<bool> VerifyUpdateEmailCodeAsync(ClaimsPrincipal userClaims, VerifyEmailDTO dto)
        {
           return accountDao.VerifyUpdateEmailCodeAsync(userClaims, dto);
        }

    }
}
