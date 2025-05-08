using BusinessObjects.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccess.Dao
{
    public class EmployeeRoleDao
    {
        private readonly LcmsContext _context;

        public EmployeeRoleDao(LcmsContext context)
        {
            _context = context;
        }

        public async Task<List<EmployeeRole>> GetAllEmployeeRolesAsync()
        {
            return await _context.EmployeeRoles.ToListAsync();
        }

        public async Task<EmployeeRole> GetEmployeeRoleByIdAsync(int id)
        {
            return await _context.EmployeeRoles.FindAsync(id);
        }

        public async Task AddEmployeeRoleAsync(EmployeeRole employeeRole)
        {
            if (string.IsNullOrEmpty(employeeRole.EmployeeRoleName))
            {
                throw new ArgumentException("EmployeeRoleName không được để trống.");
            }

            if (string.IsNullOrEmpty(employeeRole.Description))
            {
                throw new ArgumentException("Description không được để trống.");
            }

            await _context.EmployeeRoles.AddAsync(employeeRole);
            await _context.SaveChangesAsync();

            var salaryStructure = new SalaryStructure
            {
                EmployeeRoleId = employeeRole.EmployeeRoleId,
                BaseSalary = 0,
                Allowance = 0,
                CreatedAt = DateTime.UtcNow
            };

            await _context.SalaryStructures.AddAsync(salaryStructure);
            await _context.SaveChangesAsync();
        }



        public async Task UpdateEmployeeRoleAsync(EmployeeRole employeeRole)
        {
            _context.EmployeeRoles.Update(employeeRole);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEmployeeRoleAsync(int id)
        {
            var employeeRole = await _context.EmployeeRoles.FindAsync(id);
            if (employeeRole != null)
            {
                // Tìm và xóa SalaryStructure trước
                var salary = await _context.SalaryStructures
                    .FirstOrDefaultAsync(s => s.EmployeeRoleId == id);

                if (salary != null)
                {
                    _context.SalaryStructures.Remove(salary);
                }
                employeeRole.StatusDelete = false;

                
             
                await _context.SaveChangesAsync();
            }
        }

    }
}
