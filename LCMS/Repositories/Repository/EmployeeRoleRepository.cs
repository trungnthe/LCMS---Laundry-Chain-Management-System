using BusinessObjects.Models;
using DataAccess.Dao;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class EmployeeRoleRepository : IEmployeeRoleRepository
    {
        private readonly EmployeeRoleDao _employeeRoleDao;

        public EmployeeRoleRepository(EmployeeRoleDao employeeRoleDao)
        {
            _employeeRoleDao = employeeRoleDao;
        }

        public async Task<List<EmployeeRole>> GetAllEmployeeRolesAsync()
        {
            return await _employeeRoleDao.GetAllEmployeeRolesAsync();
        }

        public async Task<EmployeeRole> GetEmployeeRoleByIdAsync(int id)
        {
            return await _employeeRoleDao.GetEmployeeRoleByIdAsync(id);
        }

        public async Task AddEmployeeRoleAsync(EmployeeRole employeeRole)
        {
            await _employeeRoleDao.AddEmployeeRoleAsync(employeeRole);
        }

        public async Task UpdateEmployeeRoleAsync(EmployeeRole employeeRole)
        {
            await _employeeRoleDao.UpdateEmployeeRoleAsync(employeeRole);
        }

        public async Task DeleteEmployeeRoleAsync(int id)
        {
            await _employeeRoleDao.DeleteEmployeeRoleAsync(id);
        }
    }
}
