using AutoMapper;
using BusinessObjects.DTO.EmployeeRoleDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeRoleController : ControllerBase
    {
        private readonly IEmployeeRoleRepository _employeeRoleRepository;
        private readonly IMapper _mapper;

        public EmployeeRoleController(IEmployeeRoleRepository employeeRoleRepository, IMapper mapper)
        {
            _employeeRoleRepository = employeeRoleRepository;
            _mapper = mapper;
        }

        // ✅ Lấy tất cả EmployeeRoles
        [HttpGet("get-all")]
        public async Task<ActionResult<List<EmployeeRoleDTO>>> GetAllRoles()
        {
            try
            {
                var roles = await _employeeRoleRepository.GetAllEmployeeRolesAsync();
                var rolesDto = _mapper.Map<List<EmployeeRoleDTO>>(roles);
                return Ok(rolesDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // ✅ Lấy EmployeeRole theo ID
        [HttpGet("get-role-by-id/{id}")]
        public async Task<ActionResult<EmployeeRoleDTO>> GetRoleById(int id)
        {
            try
            {
                var role = await _employeeRoleRepository.GetEmployeeRoleByIdAsync(id);
                if (role == null) return NotFound("Không tìm thấy vai trò.");

                var roleDto = _mapper.Map<EmployeeRoleDTO>(role);
                return Ok(roleDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // ✅ Thêm EmployeeRole
        [HttpPost("add-role")]
        public async Task<IActionResult> AddRole([FromBody] EmployeeRoleCreateDTO newRoleDto)
        {
            try
            {
                var newRole = _mapper.Map<EmployeeRole>(newRoleDto);
                await _employeeRoleRepository.AddEmployeeRoleAsync(newRole);

                var createdRoleDto = _mapper.Map<EmployeeRoleDTO>(newRole);
                return CreatedAtAction(nameof(GetRoleById), new { id = createdRoleDto.EmployeeRoleId }, createdRoleDto);
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi: {ex.Message}");
            }
        }

        // ✅ Cập nhật EmployeeRole
        [HttpPut("update-role/{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] EmployeeRoleUpdateDTO roleDto)
        {
            try
            {
                var existingRole = await _employeeRoleRepository.GetEmployeeRoleByIdAsync(id);
                if (existingRole == null) return NotFound("Không tìm thấy vai trò.");

                _mapper.Map(roleDto, existingRole);
                await _employeeRoleRepository.UpdateEmployeeRoleAsync(existingRole);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }

        // ✅ Xóa EmployeeRole
        [HttpDelete("delete-role/{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            try
            {
                var existingRole = await _employeeRoleRepository.GetEmployeeRoleByIdAsync(id);
                if (existingRole == null) return NotFound("Không tìm thấy vai trò.");

                await _employeeRoleRepository.DeleteEmployeeRoleAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }
    }
}
