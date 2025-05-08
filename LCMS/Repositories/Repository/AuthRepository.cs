using BusinessObjects.DTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Repositories.Interface;
using System.Security.Claims;
using System.Threading.Tasks;
using static QRCoder.PayloadGenerator;

namespace Repositories.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AuthDao _authDao;
        private readonly IMemoryCache _cache;

        public AuthRepository(AuthDao authDao, IMemoryCache cache)
        {
            _authDao = authDao; 
            _cache = cache;
        }

        public async Task<object> LoginAsync(LoginDTO loginDTO)
        {
            // Gọi phương thức từ AuthDao để kiểm tra đăng nhập và lấy JWT token
            return await _authDao.LoginAsync(loginDTO);
        }
        public async Task<string> RegisterAsync(RegisterDTO registerDTO)
        {
            // Gọi phương thức từ AuthDao để thực hiện đăng ký người dùng
            return await _authDao.RegisterAsync(registerDTO);
        }

     

        public async Task<bool> VerifyConfirmationCodeAsync(string code)
        {
            return await _authDao.VerifyConfirmationCodeAsync( code);
        }

        public async Task<bool> ResendConfirmationCodeAsync(string email)
        {
            return await _authDao.ResendConfirmationCodeAsync(email);
        }

        public async Task<bool> ChangePasswordAsync(ClaimsPrincipal userClaims, string oldPassword, string newPassword)
        {
           return await _authDao.ChangePasswordAsync(userClaims, oldPassword, newPassword);
        }

        public async Task<bool> SendResetPasswordCodeAsync(string email)
        {
            return await _authDao.SendResetPasswordCodeAsync(email);
        }

        public async Task<bool> VerifyResetCodeAsync(string email, string code)
        {
           return await _authDao.VerifyResetCodeAsync(email, code);
        }

        public async Task<bool> ResetPasswordAsync(string email, string newPassword)
        {
           return await _authDao.ResetPasswordAsync(email, newPassword);
        }

        public Task<bool> LogoutAsync(string token)
        {
           return _authDao.LogoutAsync(token);
        }

        public async Task<string> RegisterForCustomerAsync(RegisterDTO registerDTO)
        {
            return await _authDao.RegisterForCustomerAsync(registerDTO);
        }
    }
}
