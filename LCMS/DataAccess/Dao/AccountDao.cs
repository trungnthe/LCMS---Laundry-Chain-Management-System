using AutoMapper;
using BusinessObjects.DTO.AccountDTO;
using BusinessObjects.Models;
using BusinessObjects.SendMail;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class AccountDao
    {
        private readonly LcmsContext _context;
        private readonly IMemoryCache _cache;
        private readonly EmailService _emailService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;
        private readonly AuthDao _authDao;
        public AccountDao(LcmsContext context,IMemoryCache cache,EmailService emailService, IHttpContextAccessor httpContextAccessor,IMapper mapper,AuthDao authDao)
        {
            _context = context;
            _cache = cache;
            _emailService = emailService;
            _httpContextAccessor= httpContextAccessor;
            _mapper = mapper;
            _authDao = authDao;
        }
        public async Task<List<AccountDTO1>> GetListAccount()
        {
            var acc =  _context.Accounts.ToList();
            var result = _mapper.Map<List<AccountDTO1>>(acc);
            return result;
        }
        public async Task<AccountDTO2> GetAccountById(int Id)
        {
            var acc = await _context.Accounts
                                    .Include(x => x.Employee) // Lấy thông tin Employee
                                    .Include(x => x.Role)     // Lấy thông tin Role
                                    .FirstOrDefaultAsync(x => x.AccountId == Id); // Dùng async cho database query

            if (acc == null)
                return null;

            // Map Account entity sang AccountDTO1
            var result = _mapper.Map<AccountDTO2>(acc);

            // Kiểm tra nếu BranchId trong Employee là null và đặt giá trị mặc định là 0
            if (acc.Employee?.BranchId == null)
            {
                result.BranchId = 0; // Hoặc giá trị mặc định khác
            }
            else
            {
                result.BranchId = acc.Employee.BranchId; // Lấy BranchId từ Employee
            }

            // Kiểm tra nếu RoleName trong Role có tồn tại và gán vào RoleName trong DTO
            result.RoleName = acc.Role?.RoleName; // Lấy RoleName từ Role nếu có

            return result;
        }



        public async Task<UpdateProfileResponse> UpdateProfileAsync(ClaimsPrincipal userClaims, AccountDTO accountDto)
        {
            var userEmail = userClaims.FindFirst("Email")?.Value;

            if (string.IsNullOrEmpty(userEmail))
            {
                throw new UnauthorizedAccessException("User email not found in token.");
            }

            var user = await _context.Accounts
                .Include(u => u.Role)
                .Include(u => u.Employee)
                .ThenInclude(e => e.Branch)
                .FirstOrDefaultAsync(u => u.Email == userEmail);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            bool isUpdated = false;

            if (!string.IsNullOrEmpty(accountDto.Phone) && accountDto.Phone != user.Phone)
            {
                if (!IsValidPhoneNumber(accountDto.Phone))
                {
                    throw new ArgumentException("Invalid phone number format.");
                }
                user.Phone = accountDto.Phone;
                isUpdated = true;
            }

            if (!string.IsNullOrEmpty(accountDto.Name) && accountDto.Name != user.Name)
            {
                user.Name = accountDto.Name;
                isUpdated = true;
            }

            if (!isUpdated)
            {
                return new UpdateProfileResponse
                {
                    Success = false,
                    Message = "No changes were made to the profile."
                };
            }

            user.UpdatedAt = DateTime.Now;
            _context.Accounts.Update(user);
            await _context.SaveChangesAsync();

            var tokens = _authDao.GenerateJwtTokens(user);

            return new UpdateProfileResponse
            {
                Success = true,
                Message = "Profile updated successfully!",
                Token = tokens.accessToken,
                RefreshToken = tokens.refreshToken
            };
        }






        // === LOG OUT ===
        public async Task<bool> LogoutAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return false;
            }

            // Store token in cache for 2 hours
            _cache.Set("revoked_token_" + token, true, TimeSpan.FromHours(2));

            return true;
        }


        public async Task<bool> SendUpdateEmailCodeAsync(ClaimsPrincipal userClaims, UpdateEmailDTO dto)
        {
            var userEmail = userClaims.FindFirst("Email")?.Value;

            if (string.IsNullOrEmpty(userEmail))
                throw new UnauthorizedAccessException("User email not found in token.");

            var user = await _context.Accounts
                .Include(u => u.Role)
                .Include(u => u.Employee)
                .ThenInclude(e => e.Branch)
                .FirstOrDefaultAsync(u => u.Email == userEmail);

            if (user == null)
                throw new KeyNotFoundException("User not found.");

            var newEmail = dto.NewEmail.ToLower();

            if (await _context.Accounts.AnyAsync(u => u.Email.ToLower() == newEmail))
                throw new Exception("This email is already in use.");

            var updateCode = GenerateRandomCode(6);

            var updateInfo = new { Code = updateCode, NewEmail = newEmail };
            _cache.Set("update_email_" + userEmail.ToLower(), updateInfo, TimeSpan.FromMinutes(5));

            string subject = "Xác nhận thay đổi email";
            string body = $"Xin chào {user.Name},<br/><br/>" +
                          $"Bạn đã yêu cầu thay đổi email của mình thành: <b>{newEmail}</b>.<br/><br/>" +
                          $"Mã xác nhận của bạn là: <b>{updateCode}</b>.<br/><br/>" +
                          $"Mã này có hiệu lực trong vòng 5 phút.<br/><br/>" +
                          $"Trân trọng,<br/>Đội ngũ hỗ trợ.";

            await _emailService.SendEmailAsync(newEmail, subject, body);

            return true;
        }




        public async Task<bool> VerifyUpdateEmailCodeAsync(ClaimsPrincipal userClaims, VerifyEmailDTO dto)
        {
            var userEmail = userClaims.FindFirst("Email")?.Value?.ToLower();

            if (string.IsNullOrEmpty(userEmail))
                throw new UnauthorizedAccessException("User email not found in token.");

            if (!_cache.TryGetValue("update_email_" + userEmail, out var cacheValue) || cacheValue == null)
                throw new Exception("Invalid or expired confirmation code.");

            var updateInfo = (dynamic)cacheValue;
            if (updateInfo.Code != dto.Code)
                throw new Exception("Invalid or expired confirmation code.");

            var user = await _context.Accounts.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail);
            if (user == null)
                throw new Exception("User not found.");

            user.Email = updateInfo.NewEmail;
            await _context.SaveChangesAsync();

            _cache.Remove("update_email_" + userEmail);

            return true;
        }



        public async Task<bool> UpdateRoleAsync(int accountId, int newRoleId, int employeeRoleId, int branchId)
        {
            var (currentUserId, currentUserRole) = GetCurrentUserClaims();

            if (currentUserId == null || currentUserRole == null)
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // 🔍 Tìm tài khoản theo ID
            var account = await _context.Accounts
                .Include(a => a.Employee)
                .Include(a => a.Customer)
                .FirstOrDefaultAsync(a => a.AccountId == accountId);

            if (account == null)
            {
                throw new KeyNotFoundException("Account not found.");
            }

            // 🛑 **Ngăn chặn hạ cấp hoặc thay đổi role của người có quyền cao hơn**
            if (currentUserRole >= account.RoleId)
            {
                throw new UnauthorizedAccessException("You cannot update the role of someone with equal or higher authority.");
            }

            // 🛑 **Kiểm tra quyền hạn của người đăng nhập**
            if (currentUserRole == 1 && newRoleId == 1)
            {
                throw new UnauthorizedAccessException("Admin cannot assign another Admin.");
            }
            if (currentUserRole == 2 && (newRoleId == 1 || newRoleId == 2))
            {
                throw new UnauthorizedAccessException("Manager cannot assign Admin or another Manager.");
            }

            if (account.RoleId == newRoleId)
            {
                throw new InvalidOperationException("The account already has this role.");
            }

            // ✅ Cập nhật RoleId trong bảng Account
            account.RoleId = newRoleId;

            // 🔍 Kiểm tra EmployeeRoleId hợp lệ không (nếu cần)
            if (newRoleId == 2 || newRoleId == 3)
            {
                bool employeeRoleExists = await _context.EmployeeRoles
                    .AnyAsync(er => er.EmployeeRoleId == employeeRoleId);

                if (!employeeRoleExists)
                {
                    throw new InvalidOperationException("Invalid EmployeeRoleId.");
                }
            }

            // 🔍 Kiểm tra BranchId hợp lệ không (nếu cần)
            if (newRoleId == 2 || newRoleId == 3)
            {
                bool branchExists = await _context.Branches.AnyAsync(b => b.BranchId == branchId);
                if (!branchExists)
                {
                    throw new InvalidOperationException("No valid Branch found in the database.");
                }
            }

            // 🔥 **Xử lý cập nhật bảng Employee và Customer**
            if (newRoleId == 2 || newRoleId == 3) // Nếu role mới là Employee (Manager/Nhân viên)
            {
                if (account.Employee == null)
                {
                    // Thêm mới nhân viên
                    var newEmployee = new Employee
                    {
                        AccountId = account.AccountId,
                        EmployeeRoleId = employeeRoleId,
                        BranchId = branchId,
                        HireDate = DateOnly.FromDateTime(DateTime.UtcNow)
                    };
                    _context.Employees.Add(newEmployee);
                }
                else
                {
                    // Cập nhật nhân viên hiện tại
                    account.Employee.EmployeeRoleId = employeeRoleId;
                    account.Employee.BranchId = branchId;
                    account.Employee.HireDate = DateOnly.FromDateTime(DateTime.UtcNow);
                }

                // ❌ **Xóa khỏi bảng Customers nếu tồn tại**
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.AccountId == accountId);
                if (customer != null)
                {
                    _context.Customers.Remove(customer);
                }
            }
            else if (newRoleId == 4) // Nếu role mới là Customer
            {
                if (account.Customer == null)
                {
                    // Thêm vào bảng Customers
                    var newCustomer = new Customer
                    {
                        AccountId = account.AccountId
                    };
                    _context.Customers.Add(newCustomer);
                }

                // ❌ **Xóa khỏi bảng Employees nếu tồn tại**
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.AccountId == accountId);
                if (employee != null)
                {
                    _context.Employees.Remove(employee);
                }
            }

            await _context.SaveChangesAsync(); // Lưu thay đổi vào DB
            return true;
        }





        private (int?, int?) GetCurrentUserClaims()
        {
            var identity = _httpContextAccessor.HttpContext?.User;
            if (identity == null || !identity.Identity.IsAuthenticated)
            {
                return (null, null);
            }

            var accountIdClaim = identity.FindFirst("AccountId")?.Value;
            var roleClaim = identity.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(accountIdClaim, out int accountId))
            {
                return (null, null);
            }

            int roleId;
            if (int.TryParse(roleClaim, out roleId))
            {
                return (accountId, roleId);
            }

            // 🛠 Nếu role là chuỗi "Admin", "Manager" -> Ánh xạ sang số
            var roleMapping = new Dictionary<string, int>
    {
        { "Admin", 1 },
        { "Manager", 2 },
        { "Employee", 3 },
        { "Customer", 4 }
    };

            if (roleMapping.TryGetValue(roleClaim, out roleId))
            {
                return (accountId, roleId);
            }

            return (null, null);
        }

        public async Task<List<RoleDTO>> GetAllRole()
        {
            var result = await _context.Roles.ToListAsync();

           
            var roleDTOs = result.Select(role => new RoleDTO
            {
                RoleId = role.RoleId,
                RoleName = role.RoleName
            }).ToList();

            return roleDTOs;
        }










        private bool IsValidPhoneNumber(string phone)
        {
            string pattern = @"^(0[1-9]\d{8,9}|(\+?\d{1,3})?\d{9,15})$";
            return Regex.IsMatch(phone, pattern);
        }
        private string GenerateRandomCode(int length) =>
               string.Join("", Enumerable.Range(0, length).Select(_ => new Random().Next(0, 10)));
    }
}
