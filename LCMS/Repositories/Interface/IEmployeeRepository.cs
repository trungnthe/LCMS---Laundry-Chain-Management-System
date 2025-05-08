using BusinessObjects.DTO.EmployeeDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IEmployeeRepository
    {
        Task<List<EmployeeDTO>> GetAllEmployee();
        Task<EmployeeDTO> GetEmployeeById(int Id);
        Task<List<EmployeeDTO>> GetEmployeeByIdAsync(List<int> Ids);
        Task<List<EmployeeDTO>> SearchEmployeesAsync(string? name, string? branchName);
        Task<bool> CreateEmployeeAccountAsync(ClaimsPrincipal userClaims, CreateEmployeeAccountDTO model, IFormFile? avatar);
        Task<bool> DemoteEmployeeToCustomerAsync(ClaimsPrincipal userClaims, int employeeId);
    }
}
