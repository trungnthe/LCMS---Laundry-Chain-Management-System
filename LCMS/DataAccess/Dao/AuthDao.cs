using BusinessObjects.DTO;
using BusinessObjects.Models;
using BusinessObjects.SendMail;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;


namespace DataAccess.Dao
{
    public class AuthDao
    {
        private readonly LcmsContext _context;
        private readonly EmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;
       private readonly AttendanceDao _attendanceDao;


        public AuthDao(LcmsContext context, EmailService emailService, IConfiguration configuration, IMemoryCache cache,AttendanceDao attendanceDao)
        {
            _attendanceDao = attendanceDao;
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _cache = cache;
        }



        public async Task<object> LoginAsync(LoginDTO loginDTO)
        {
            var user = await _context.Accounts.Include(x => x.Role).Include(x => x.Customer).Include(x=>x.Employee).ThenInclude(x=>x.Branch)
                .FirstOrDefaultAsync(u => u.Email == loginDTO.Email);

            if (user == null || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Name))
            {
                throw new UnauthorizedAccessException("Invalid email.");
            }

            // Kiểm tra mật khẩu
            if (!VerifyPasswordHash(loginDTO.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid password.");
            }

            // Kiểm tra trạng thái tài khoản
            if (user.Status == "InActive")
            {
                await ResendConfirmationCodeAsync(loginDTO.Email);
                throw new UnauthorizedAccessException("Your account is not activated. A new confirmation code has been sent to your email.");
            }
            if (user.Status == "Blocked")
            {
                throw new UnauthorizedAccessException("Your account has been blocked. Please contact support.");
            }

            // Tạo Access Token và Refresh Token
            (string accessToken, string refreshToken) tokens = GenerateJwtTokens(user);

            // 🔹 Lưu Refresh Token vào DB
   
            return new TokenResponse
            {
                AccessToken = tokens.accessToken,
                RefreshToken = tokens.refreshToken
            };
        }

        public class TokenResponse
        {
            public string AccessToken { get; set; }
            public string RefreshToken { get; set; }
        }


        // ===[ ĐĂNG KÝ ]===
        public async Task<string> RegisterAsync(RegisterDTO registerDTO)
        {
            // Kiểm tra nếu email đã tồn tại trong cơ sở dữ liệu
            if (await _context.Accounts.AnyAsync(u => u.Email == registerDTO.Email))
            {
                throw new Exception("Email is already in use.");
            }

            // Tạo đối tượng tài khoản mới
            var newUser = new Account
            {
                Name = registerDTO.Name,
                Email = registerDTO.Email,
                PasswordHash = HashPassword(registerDTO.Password),
                RoleId = 4,
                Phone = registerDTO.Phone,
                Status = "InActive"
            };

            // Thêm tài khoản mới vào cơ sở dữ liệu và lưu thay đổi
            _context.Accounts.Add(newUser);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception message: " + ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("Inner exception: " + ex.InnerException.Message);
                }
                throw new Exception("An error occurred while saving the entity changes. Please see inner exception for details.");
            }

            // Tạo và lưu mã xác nhận vào cache
            var confirmationCode = GenerateRandomCode(6);
            _cache.Set("confirmation_" + newUser.Email, confirmationCode, TimeSpan.FromMinutes(5));
            _cache.Set("email_" + confirmationCode, newUser.Email, TimeSpan.FromMinutes(5));

            // Gửi email xác nhận
            await SendConfirmationEmail(newUser.Email, newUser.Name, confirmationCode);
            return "User registered successfully. Please check your email for the confirmation code.";
        }
        public async Task<string> RegisterForCustomerAsync(RegisterDTO registerDTO)
        {
            // Kiểm tra nếu email đã tồn tại trong cơ sở dữ liệu
            if (await _context.Accounts.AnyAsync(u => u.Email == registerDTO.Email))
            {
                throw new Exception("Email is already in use.");
            }

            // Tạo đối tượng tài khoản mới
            var newUser = new Account
            {
                Name = registerDTO.Name,
                Email = registerDTO.Email,
                PasswordHash = HashPassword(registerDTO.Password),
                RoleId = 4, // Role Customer
                Phone = registerDTO.Phone,
                Status = "Active"
            };

            _context.Accounts.Add(newUser);
            try
            {
                await _context.SaveChangesAsync(); // newUser.Id sẽ có giá trị sau dòng này

                // Tạo bản ghi Customer liên kết với Account vừa tạo
                var newCustomer = new Customer
                {
                    AccountId = newUser.AccountId,
                    MembershipLevel = "Basic", // hoặc mặc định nào đó
                    LoyaltyPoints = 0,          
                };

                _context.Customers.Add(newCustomer);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception message: " + ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("Inner exception: " + ex.InnerException.Message);
                }
                throw new Exception("An error occurred while saving the entity changes.");
            }

            return "Registered successfully.";
        }


        // ===[ XÁC THỰC MÃ CODE ]===
        public async Task<bool> VerifyConfirmationCodeAsync(string code)
        {
            // Kiểm tra mã có tồn tại không
            if (!_cache.TryGetValue("email_" + code, out string email))
                return false; // Mã không hợp lệ hoặc đã hết hạn

            // Kiểm tra xem mã này có khớp với email không
            if (!_cache.TryGetValue("confirmation_" + email, out string correctCode) || correctCode != code)
                return false; // Mã nhập không đúng

            var user = await _context.Accounts.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false;

            // Cập nhật trạng thái tài khoản
            user.Status = "Active";
            await _context.SaveChangesAsync();

            // Xóa mã xác nhận sau khi đã sử dụng
            _cache.Remove("email_" + code);
            _cache.Remove("confirmation_" + email);

            // Thêm tài khoản vào bảng Customer sau khi xác nhận thành công
            var newCustomer = new Customer
            {
                AccountId = user.AccountId,
                MembershipLevel = "Basic"
            };

            _context.Customers.Add(newCustomer);
            await _context.SaveChangesAsync();

            return true;
        }



        // ===[ GỬI LẠI MÃ CODE ]===
        public async Task<bool> ResendConfirmationCodeAsync(string email)
        {
            var user = await _context.Accounts.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new Exception("Email không tồn tại.");

            // Xóa mã xác nhận cũ nếu có
            if (_cache.TryGetValue("confirmation_" + email, out string oldCode))
            {
                _cache.Remove("email_" + oldCode);  // Xóa key mã cũ
                _cache.Remove("confirmation_" + email); // Xóa mã xác nhận cũ theo email
            }

            // Tạo mã mới
            var newCode = GenerateRandomCode(6);

            // Lưu mã mới vào cache
            _cache.Set("confirmation_" + email, newCode, TimeSpan.FromMinutes(5));
            _cache.Set("email_" + newCode, email, TimeSpan.FromMinutes(5));

            // Gửi email chứa mã xác nhận mới
            string subject = "Xác nhận đăng ký";
            string body = $"Xin chào  ,<br/><br/>" +
                          $"Mã xác nhận đăng ký tài khoản mới của bạn là: <b>{newCode}</b>.<br/><br/>" +
                          $"Mã này có hiệu lực trong vòng 5 phút. Vui lòng sử dụng mã này để kích hoạt tài khoản của bạn.<br/><br/>" +
                          $"Trân trọng,<br/>Đội ngũ hỗ trợ.";

            await _emailService.SendEmailAsync(email, subject, body);
            return true;
        }



        // ===[ ĐỔI MẬT KHẨU ]===
        public async Task<bool> ChangePasswordAsync(ClaimsPrincipal userClaims, string oldPassword, string newPassword)
        {
            try
            {
                var email = userClaims.FindFirst(ClaimTypes.Email)?.Value
                            ?? userClaims.FindFirst("Email")?.Value;

                if (string.IsNullOrEmpty(email))
                    throw new UnauthorizedAccessException("User email not found in token.");

                var user = await _context.Accounts.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                    throw new KeyNotFoundException("User not found.");

                if (!VerifyPasswordHash(oldPassword, user.PasswordHash))
                    throw new UnauthorizedAccessException("Old password is incorrect.");

                if (VerifyPasswordHash(newPassword, user.PasswordHash))
                    throw new ArgumentException("New password cannot be the same as the old password.");

                user.PasswordHash = HashPassword(newPassword);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error changing password: {ex.Message}");
                throw;
            }
        }



        // ===[ RESET PASSWORD - GỬI MÃ ]===
        public async Task<bool> SendResetPasswordCodeAsync(string email)
        {
            var user = await _context.Accounts.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false;

            _cache.Remove(email);

            var resetCode = GenerateRandomCode(6);
            _cache.Set(email, resetCode, TimeSpan.FromMinutes(5));

            string subject = "Đặt lại mật khẩu";
            string body = $"Xin chào {user.Name},<br/><br/>" +
                          $"Mã xác nhận đặt lại mật khẩu của bạn là: <b>{resetCode}</b>.<br/><br/>" +
                          $"Mã này có hiệu lực trong vòng 5 phút. Vui lòng sử dụng mã này để tiếp tục quá trình đặt lại mật khẩu.<br/><br/>" +
                          $"Trân trọng,<br/>Đội ngũ hỗ trợ.";

            await _emailService.SendEmailAsync(email, subject, body);
            return true;
        }





        // ===[ RESET PASSWORD - XÁC NHẬN MÃ CODE ]===
        public async Task<bool> VerifyResetCodeAsync(string email, string code)
        {
            if (!_cache.TryGetValue(email, out string storedCode))
                throw new Exception("The verification code is invalid or expired..");

            if (storedCode != code)
                throw new Exception("Incorrect confirmation code.");

            // Xóa mã OTP ngay sau khi nhập đúng (tránh việc nhập lại)
            _cache.Remove(email);

            // Lưu trạng thái đã xác thực
            _cache.Set(email + "_verified", true, TimeSpan.FromMinutes(10));

            return true;
        }




        // ===[ ĐẶT LẠI MẬT KHẨU ]===
        public async Task<bool> ResetPasswordAsync(string email, string newPassword)
        {
            if (!_cache.TryGetValue(email + "_verified", out bool isVerified) || !isVerified)
                throw new Exception("You have not verified the OTP code.");

            var user = await _context.Accounts.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new Exception("User does not exist.");

            user.PasswordHash = HashPassword(newPassword);
            await _context.SaveChangesAsync();

            _cache.Remove(email);
            _cache.Remove(email + "_verified");

            return true;
        }

        public async Task<bool> LogoutAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return false;
            }
            // Vô hiệu hóa token trong cache
            _cache.Set($"revoked_token_{token}", true, TimeSpan.FromHours(2));

            return true;
        }
       



        // ===[ HELPER METHODS ]===
        private string GenerateRandomCode(int length) =>
            string.Join("", Enumerable.Range(0, length).Select(_ => new Random().Next(0, 10)));

        private string HashPassword(string password) =>
            BCrypt.Net.BCrypt.HashPassword(password);

        private bool VerifyPasswordHash(string password, string storedHash) =>
            BCrypt.Net.BCrypt.Verify(password, storedHash);

        private async Task SendConfirmationEmail(string email, string name, string confirmationCode)
        {
            string subject = "Đăng ký thành công";
            string body = $"Xin chào {name},<br/><br/>" +
                          $"Bạn đã đăng ký thành công tài khoản của chúng tôi. Mã xác nhận của bạn là: <b>{confirmationCode}</b>.<br/><br/>" +
                          $"Mã này có hiệu lực trong vòng 5 phút. Vui lòng nhập mã để kích hoạt tài khoản của bạn.<br/><br/>" +
                          $"Trân trọng,<br/>Đội ngũ hỗ trợ.";

            await _emailService.SendEmailAsync(email, subject, body);
        }


        public (string accessToken, string refreshToken) GenerateJwtTokens(Account user)
        {
            // Giữ nguyên phần access token như cũ
            var secretKey = _configuration["Jwt:SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            int accessTokenExpiryMinutes = int.Parse(_configuration["Jwt:AccessTokenExpiresInMinutes"]);

            var claims = new List<Claim>
    {
        new Claim("AccountId", user.AccountId.ToString()),
        new Claim("Name", user.Name ?? "Unknown"),
        new Claim("Email", user.Email ?? "Unknown"),
        new Claim(ClaimTypes.Role, user.Role.RoleName)
    };

            if (user.Employee?.Branch?.BranchId != null)
            {
                claims.Add(new Claim("BranchId", user.Employee.Branch.BranchId.ToString()));
            }

            var accessToken = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(accessTokenExpiryMinutes),
                signingCredentials: creds
            );

            // Sửa phần refresh token
            var refreshToken = GenerateRefreshToken(user);

            return (new JwtSecurityTokenHandler().WriteToken(accessToken), refreshToken);
        }

        private string GenerateRefreshToken(Account user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Refresh token chỉ nên chứa thông tin tối thiểu
            var claims = new List<Claim>
    {
        new Claim("AccountId", user.AccountId.ToString()),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Thêm ID duy nhất cho refresh token
    };

            // Thời gian sống dài hơn
            var refreshTokenExpiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiresInDays"] ?? "7");

            var refreshToken = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(refreshTokenExpiryDays),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(refreshToken);
        }







    }
}
