using BusinessObjects.DTO;
using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IAuthRepository
    {
        Task<object> LoginAsync(LoginDTO loginDTO);
        Task<string> RegisterAsync(RegisterDTO registerDTO);
        Task<bool> VerifyConfirmationCodeAsync(string code);
        Task<bool> ResendConfirmationCodeAsync(string email);
        Task<bool> ChangePasswordAsync(ClaimsPrincipal userClaims, string oldPassword, string newPassword);
        Task<bool> SendResetPasswordCodeAsync(string email);
        Task<bool> VerifyResetCodeAsync(string email, string code);
        Task<bool> ResetPasswordAsync(string email, string newPassword);
        Task<bool> LogoutAsync(string token);
        Task<string> RegisterForCustomerAsync(RegisterDTO registerDTO); 
    }


}
