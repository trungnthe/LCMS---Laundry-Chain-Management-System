using BusinessObjects.DTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Repositories.Interface;
using Repositories.Repository;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IAuthRepository _authRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IConfiguration _configuration;
   

        public AuthController(IAuthRepository authRepository, IConfiguration configuration, IAccountRepository accountRepository)
        {
            _authRepository = authRepository;
            _configuration = configuration;
            _accountRepository = accountRepository;
        }

 

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            if (loginDTO == null || string.IsNullOrEmpty(loginDTO.Email) || string.IsNullOrEmpty(loginDTO.Password))
            {
                return BadRequest("Email and password must be provided.");
            }

            try
            {
                dynamic tokens = await _authRepository.LoginAsync(loginDTO);
                Response.Cookies.Append("refreshToken", tokens.RefreshToken, new CookieOptions
                {
                    HttpOnly = true, // Chặn truy cập từ JavaScript (bảo vệ chống XSS)
                    Secure = false,  // Chỉ dùng HTTPS (bật khi deploy)
                    SameSite = SameSiteMode.Strict, // Ngăn chặn CSRF tốt hơn
                    Expires = DateTime.UtcNow.AddDays(int.Parse(_configuration["Jwt:RefreshTokenExpiresInDays"])),
                });


                return Ok(new { token = tokens.AccessToken });

            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            // 1. Kiểm tra tồn tại refresh token
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { message = "Refresh token is missing" });

            // 2. Kiểm tra tính hợp lệ của refresh token
            var principal = ValidateRefreshToken(refreshToken);
            if (principal == null)
                return Unauthorized(new { message = "Invalid refresh token" });

            // 3. Kiểm tra thời gian hết hạn
            var jwtToken = new JwtSecurityTokenHandler().ReadJwtToken(refreshToken);
            if (jwtToken.ValidTo < DateTime.UtcNow)
                return Unauthorized(new { message = "Refresh token expired" });

            // 4. Lấy AccountId từ refresh token
            var accountIdClaim = jwtToken?.Claims.FirstOrDefault(c => c.Type == "AccountId")?.Value;
            if (accountIdClaim == null)
                return Unauthorized(new { message = "Invalid token: missing AccountId" });

            var accountId = int.Parse(accountIdClaim);

            // 5. Truy vấn thông tin user từ database
            var user = await _accountRepository.GetAccountById(accountId); // Hoặc DbContext.Users.Find(accountId)
            if (user == null)
                return Unauthorized(new { message = "User not found" });

            // 6. Tạo danh sách claims đầy đủ để đưa vào access token mới
            var claims = new List<Claim>
    {
        new Claim("AccountId", user.AccountId.ToString() ),
        new Claim("Name", user.Name),
        new Claim("Email", user.Email),
        new Claim(ClaimTypes.Role, user.RoleName),
    };
            if (user.BranchId != null) // hoặc != 0 nếu giá trị mặc định là 0
            {
                claims.Add(new Claim("BranchId", user.BranchId.ToString()));
            }
            // 7. Tạo access token mới
            string newAccessToken = GenerateAccessToken(claims);

            return Ok(new { token = newAccessToken });
        }






        private string GenerateAccessToken(IEnumerable<Claim> userClaims)
        {
            var secretKey = _configuration["Jwt:SecretKey"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var expiresInMinutes = int.Parse(_configuration["Jwt:AccessTokenExpiresInMinutes"]);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: userClaims,
                expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }


        private IEnumerable<Claim>? ValidateRefreshToken(string refreshToken)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();

                // Kiểm tra xem token có đúng định dạng không
                if (!tokenHandler.CanReadToken(refreshToken))
                {
                    Console.WriteLine("❌ Invalid token format");
                    return null;
                }

                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]);

                var parameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = true, // Kiểm tra thời gian hết hạn
                    ClockSkew = TimeSpan.FromMinutes(double.Parse(_configuration["Jwt:ClockSkew"] ?? "5"))
                };

                var principal = tokenHandler.ValidateToken(refreshToken, parameters, out _);
                return principal.Claims;
            }
            catch (SecurityTokenExpiredException)
            {
                Console.WriteLine("❌ Refresh token expired");
                return null;
            }
            catch (SecurityTokenInvalidSignatureException)
            {
                Console.WriteLine("❌ Invalid token signature");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Token validation error: {ex.Message}");
                return null;
            }
        }



        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var token = HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Token is required.");
            }

            // Log chi tiết về token




            var result = await _authRepository.LogoutAsync(token);
            if (!result)
            {
                return BadRequest("Logout failed.");
            }

            // Log xóa cookie
            Console.WriteLine("Logging out, attempting to delete refreshToken cookie");
            Console.WriteLine("Cookies before logout:");
            foreach (var cookie in Request.Cookies)
            {
                Console.WriteLine($"{cookie.Key}: {cookie.Value}");
            }

            // Thực hiện xóa cookie  
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                Path = "/",
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
            });



            // Kiểm tra lại cookies sau khi xóa  
            Console.WriteLine("Cookies after logout:");
            var cookiesAfterLogout = Request.Cookies;
            foreach (var cookie in cookiesAfterLogout)
            {
                Console.WriteLine($"{cookie.Key}: {cookie.Value}");
            }

            HttpContext.Session.Remove("Cart");

            return Ok(new { message = "Logged out successfully" });
        }






        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            if (registerDTO == null || string.IsNullOrEmpty(registerDTO.Email) || string.IsNullOrEmpty(registerDTO.Password) || string.IsNullOrEmpty(registerDTO.Name))
            {
                return BadRequest("All fields must be provided.");
            }

            try
            {
                var message = await _authRepository.RegisterAsync(registerDTO);
                return Ok(new { Message = message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }




        [HttpPost("validate-token")]
        public IActionResult ValidateToken([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request?.Token))
            {
                return BadRequest(new { message = "Token is required" });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]);

            try
            {
                tokenHandler.ValidateToken(request.Token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true, // Kiểm tra thời gian hết hạn
                    ClockSkew = TimeSpan.Zero, // Không cho phép chênh lệch thời gian
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidAudience = _configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                }, out SecurityToken validatedToken);

                return Ok(new { message = "Token is valid", isValid = true });
            }
            catch (SecurityTokenExpiredException)
            {
                return Unauthorized(new { message = "Token has expired", isValid = false });
            }
            catch (SecurityTokenNotYetValidException)
            {
                return Unauthorized(new { message = "Token is not yet valid", isValid = false });
            }
            catch (SecurityTokenValidationException)
            {
                return Unauthorized(new { message = "Token is invalid", isValid = false });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "An error occurred while validating the token", error = ex.Message });
            }
        }



        [HttpGet("get-id")]
        [Authorize] // Yêu cầu token hợp lệ
        public IActionResult GetCustomerId()
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");

            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Invalid or missing token" });
            }

            int customerId = int.Parse(userIdClaim.Value);
            return Ok(new { customerId });
        }

        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeDTO model)
        {
            if (string.IsNullOrEmpty(model.Code))
            {
                return BadRequest(new { Message = "Code must be provided." });
            }

            bool isValid = await _authRepository.VerifyConfirmationCodeAsync(model.Code);

            if (!isValid)
            {
                return Unauthorized(new { Message = "Invalid or expired code." });
            }

            return Ok(new { Message = "Code verified successfully! Your account is now active." });
        }
        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendCode([FromBody] ResendCodeDTO model)
        {
            if (string.IsNullOrEmpty(model.Email))
            {
                return BadRequest(new { Message = "Email must be provided." });
            }

            try
            {
                await _authRepository.ResendConfirmationCodeAsync(model.Email);
                return Ok(new { Message = "Confirmation code has been resent successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }



        }
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO model)
        {
            try
            {

                await _authRepository.ChangePasswordAsync(User, model.OldPassword, model.NewPassword);
                return Ok(new { Message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ResendCodeDTO model)
        {
            try
            {
                var result = await _authRepository.SendResetPasswordCodeAsync(model.Email);
                if (result == true)
                {
                    return Ok(new { Message = "Confirmation code has been sent via email." });
                }
                else throw new Exception("Cannot find email");
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }


        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyCodeDTO model)
        {
            try
            {
                await _authRepository.VerifyResetCodeAsync(model.Email, model.Code);
                return Ok(new { Message = "Valid confirmation code, you can reset password." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO model)
        {
            try
            {
                await _authRepository.ResetPasswordAsync(model.Email, model.NewPassword);
                return Ok(new { Message = "Password was reset successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }



        }

    }
    public class ChangePasswordDTO
    {

        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
    public class ResetPasswordDTO
    {
        public string Email { get; set; }
        public string NewPassword { get; set; }
    }


    public class VerifyCodeRegisterDTO
    {

        public string Code { get; set; }
    }

    public class VerifyCodeDTO
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }
    public class TokenRequest
    {
        public string Token { get; set; }
    }
    public class ResendCodeDTO
    {
        public string Email { get; set; }
    }




}



