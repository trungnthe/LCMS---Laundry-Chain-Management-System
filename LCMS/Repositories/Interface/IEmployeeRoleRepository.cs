using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IEmployeeRoleRepository
    {
        Task<List<EmployeeRole>> GetAllEmployeeRolesAsync(); // Lấy tất cả vai trò nhân viên
        Task<EmployeeRole> GetEmployeeRoleByIdAsync(int id); // Lấy vai trò theo ID
        Task AddEmployeeRoleAsync(EmployeeRole employeeRole); // Thêm vai trò mới
        Task UpdateEmployeeRoleAsync(EmployeeRole employeeRole); // Cập nhật vai trò
        Task DeleteEmployeeRoleAsync(int id); // Xóa vai trò
    }
}
