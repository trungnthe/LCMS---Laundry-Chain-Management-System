using AutoMapper;
using BusinessObjects.DTO.EmployeeDTO;
using BusinessObjects.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class EmployeeDao
    {
        private readonly LcmsContext _context;
        private readonly IMapper _mapper;
        public EmployeeDao(LcmsContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<List<EmployeeDTO>> GetAllEmployee()
        {
            return await _context.Employees
                .Include(e => e.Account)
                .Include(e => e.EmployeeRole).ThenInclude(x => x.SalaryStructure)  
                .Include(e => e.Branch) 
                .Select(e => new EmployeeDTO
                {
                    AccountId = e.AccountId,
                    EmployeeRoleId = e.EmployeeRoleId ?? 0,
                    BranchId = e.BranchId,
                    Dob = e.Dob,
                    HireDate = e.HireDate,
                    EmployeeName = e.Account.Name,
                    EmployeeRoleName = e.EmployeeRole.EmployeeRoleName,
                    BranchName = e.Branch.BranchName,
                    Status= e.Account.Status,
                    AvatarUrl = e.AvatarUrl

                })
                .ToListAsync();
        }

        public async Task<EmployeeDTO> GetEmployeeById(int Id)
        {

            var result = await _context.Employees
                .Include(e => e.Account)
                .Include(e => e.EmployeeRole).ThenInclude(x => x.SalaryStructure)  // Lấy thông tin vai trò nhân viên
                .Include(e => e.Branch)  // Lấy thông tin chi nhánh
                .Select(e => new EmployeeDTO
                {
                    AccountId = e.AccountId,
                    EmployeeRoleId = e.EmployeeRoleId.Value,
                    BranchId = e.BranchId,
                    Dob = e.Dob,
                    HireDate = e.HireDate,
                    EmployeeName = e.Account.Name,
                    EmployeeRoleName = e.EmployeeRole.EmployeeRoleName,
                    BranchName = e.Branch.BranchName,
                    AvatarUrl =e.AvatarUrl,
                    BranchEmail = e.Branch.Email,
                    BranchAddress = e.Branch.Address,
                    BranchPhoneNumber = e.Branch.PhoneNumber,

                   
                }).FirstOrDefaultAsync(x=>x.AccountId==Id);
            return _mapper.Map<EmployeeDTO>(result);
        }
        public async Task<List<EmployeeDTO>> GetEmployeeByIdAsync(List<int> Ids)
        {
            var employees = await _context.Employees
                .Include(x => x.Account)
                .Include(x => x.EmployeeRole)
                .Include(x => x.Branch)
                .Where(x => Ids.Contains(x.AccountId)) 
                .ToListAsync();

            return _mapper.Map<List<EmployeeDTO>>(employees);
        }
        public async Task<List<EmployeeDTO>> SearchEmployeesAsync(string? name, string? branchName)
        {
            var query = _context.Employees
                .Include(x => x.Account)
                .Include(x => x.EmployeeRole)
                .Include(x => x.Branch)
                .AsQueryable();

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(x => x.Account.Name.Contains(name));
            }

            if (!string.IsNullOrEmpty(branchName))
            {
                query = query.Where(x => x.Branch.BranchName.Contains(branchName));
            }

            var employees = await query.ToListAsync();
            return _mapper.Map<List<EmployeeDTO>>(employees);
        }
        public async Task<bool> CreateEmployeeAccountAsync(ClaimsPrincipal userClaims, CreateEmployeeAccountDTO model, string? avatarUrl)
        {
            // ✅ Lấy email từ Claims
            var userEmail = userClaims.FindFirst("Email")?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                throw new UnauthorizedAccessException("Unauthorized: User email not found.");
            }

            // ✅ Kiểm tra người tạo có quyền hay không
            var creatorAccount = await _context.Accounts
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.Email == userEmail);

            if (creatorAccount == null || (creatorAccount.RoleId != 1 && creatorAccount.RoleId != 2))
            {
                throw new UnauthorizedAccessException("Only Admins or Managers can add employees.");
            }

            if (creatorAccount.RoleId == 2 && (creatorAccount.Employee?.BranchId != model.BranchId || model.RoleId <= 2))
            {
                throw new UnauthorizedAccessException("Managers can only add employees to their own branch and cannot create Admin or Manager accounts.");
            }

            if (creatorAccount.RoleId == 1 && model.RoleId == 1)
            {
                throw new UnauthorizedAccessException("Admins cannot create another Admin account.");
            }

            if (model.RoleId < 2 || model.RoleId > 4)
            {
                throw new ArgumentException("RoleId must be 2 (Manager) or 3 (Staff)");
            }

            // ✅ Kiểm tra email đã tồn tại chưa
            var existingAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.Email == model.Email);
            if (existingAccount != null)
            {
                throw new InvalidOperationException("An account with this email already exists.");
            }
            if (model.RoleId == 2)
            {
                var hasManager = await _context.Employees
                    .Include(e => e.Account)
                    .AnyAsync(e => e.BranchId == model.BranchId && e.Account.RoleId == 2);

                if (hasManager)
                {
                    throw new InvalidOperationException("This branch already has a Manager.");
                }
            }

            // ✅ Upload ảnh nếu có
            // (Tùy theo logic bạn thêm code cho upload ảnh vào)

            // ✅ Tạo tài khoản mới
            var account = new Account
            {
                Name = model.Name,
                Email = model.Email,
                Phone = model.Phone,
                RoleId = model.RoleId,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password),
                Status = "Active",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            // ✅ Tạo nhân viên với ảnh đại diện
            var employee = new Employee
            {
                AccountId = account.AccountId,
                EmployeeRoleId = model.EmployeeRoleId,
                BranchId = model.BranchId,
                HireDate = DateOnly.FromDateTime(DateTime.Now),
                AvatarUrl = avatarUrl // 🌟 Lưu đường dẫn ảnh vào DB
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<bool> DemoteEmployeeToCustomerAsync(ClaimsPrincipal userClaims, int employeeId)
        {
            // ✅ Lấy email từ Claims để xác định ai đang thực hiện thao tác
            var userEmail = userClaims.FindFirst("Email")?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                throw new UnauthorizedAccessException("Unauthorized: User email not found.");
            }

            // ✅ Lấy tài khoản người thực hiện thao tác
            var currentUser = await _context.Accounts
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.Email == userEmail);

            if (currentUser == null)
            {
                throw new UnauthorizedAccessException("Unauthorized: User not found in database.");
            }

            // ✅ Lấy thông tin nhân viên cần cập nhật
            var employee = await _context.Employees
                .Include(e => e.Account)
                .FirstOrDefaultAsync(e => e.AccountId == employeeId);

            if (employee == null)
            {
                throw new KeyNotFoundException("Employee not found.");
            }

            var account = employee.Account;
            if (account == null)
            {
                throw new InvalidOperationException("Account not found for the given employee.");
            }

            // ✅ Nếu là Manager, chỉ được cập nhật nhân viên trong cùng chi nhánh
            if (currentUser.RoleId == 2) // 2 = Manager
            {
                if (currentUser.Employee?.BranchId != employee.BranchId)
                {
                    throw new UnauthorizedAccessException("Managers can only demote employees from their own branch.");
                }
            }
            // ✅ Chỉ Admin hoặc Manager của chi nhánh mới có quyền cập nhật
            else if (currentUser.RoleId != 1) // 1 = Admin
            {
                throw new UnauthorizedAccessException("Only Admins or Managers can update employee roles.");
            }

            // ✅ Cập nhật RoleId xuống 4 (Customer)
            account.RoleId = 4;
            account.UpdatedAt = DateTime.UtcNow;

            // ✅ Kiểm tra xem đã có Customer chưa
            var existingCustomer = await _context.Customers.FirstOrDefaultAsync(c => c.AccountId == account.AccountId);
            if (existingCustomer == null)
            {
                // ✅ Thêm vào bảng Customer
                var newCustomer = new Customer
                {
                    AccountId = account.AccountId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Customers.Add(newCustomer);
            }

            // ✅ Xóa nhân viên khỏi bảng Employee
            _context.Employees.Remove(employee);

            // ✅ Lưu thay đổi vào DB
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await _context.Accounts
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task UpdateAvatarAsync(string email, string avatarUrl)
        {
            var account = await _context.Accounts
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.Email == email);

            if (account == null || account.Employee == null)
            {
                throw new KeyNotFoundException("Account not found or does not have an associated employee.");
            }

            // ✅ Cập nhật avatar
            account.Employee.AvatarUrl = avatarUrl;
            account.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

    }
}
