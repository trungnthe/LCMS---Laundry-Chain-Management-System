using BusinessObjects.DTO.EmployeeDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly EmployeeDao employeeDao;
        private readonly IWebHostEnvironment _env;
        private readonly FileRepository _fileRepository;

        public EmployeeRepository(EmployeeDao employeeDao, IWebHostEnvironment env, FileRepository fileRepository)
        {
            this.employeeDao = employeeDao;
            _env = env;
            _fileRepository = fileRepository;
        }
        public async Task<bool> CreateEmployeeAccountAsync(ClaimsPrincipal userClaims, CreateEmployeeAccountDTO model, IFormFile? avatar)
        {
            // ✅ Kiểm tra email đã tồn tại chưa
            var existingEmployee = await employeeDao.GetByEmailAsync(model.Email);
            if (existingEmployee != null)
            {
                throw new InvalidOperationException("Email already exists.");
            }

            // ✅ Tạo tài khoản trước, chưa upload ảnh
            bool isCreated = await employeeDao.CreateEmployeeAccountAsync(userClaims, model, null);
            if (!isCreated) return false;

            // ✅ Nếu có avatar, upload sau khi tài khoản đã tạo
            string avatarUrl = null;
            if (avatar != null)
            {
                try
                {
                    avatarUrl = await _fileRepository.UploadFileAsync(avatar, "avatar-employee");
                    // ✅ Cập nhật đường dẫn avatar vào tài khoản
                    await employeeDao.UpdateAvatarAsync(model.Email, avatarUrl);
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("Upload avatar failed: " + ex.Message);
                }
            }

            return true;
        }



        public Task<bool> DemoteEmployeeToCustomerAsync(ClaimsPrincipal userClaims, int employeeId)
        {
            return employeeDao.DemoteEmployeeToCustomerAsync(userClaims, employeeId);
        }

        public Task<List<EmployeeDTO>> GetAllEmployee()
        {
            return employeeDao.GetAllEmployee();
        }

        public Task<EmployeeDTO> GetEmployeeById(int id)
        {
            return employeeDao.GetEmployeeById(id);
        }

        public Task<List<EmployeeDTO>> GetEmployeeByIdAsync(List<int> ids)
        {
            return employeeDao.GetEmployeeByIdAsync(ids);
        }

        public Task<List<EmployeeDTO>> SearchEmployeesAsync(string? name, string? branchName)
        {
            return employeeDao.SearchEmployeesAsync(name, branchName);
        }

     

    }
}
