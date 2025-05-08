using BusinessObjects.DTO;
using BusinessObjects.DTO.AccountDTO;
using BusinessObjects.DTO.EmployeeDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Repositories.Interface;
using Repositories.Repository;
using System.Security.Claims;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IAuthRepository  _authRepository;

        public EmployeeController(IEmployeeRepository employeeRepository, IAuthRepository authRepository)
        {
            _employeeRepository = employeeRepository;
            _authRepository = authRepository;
        }
        [HttpGet("get-all-employee")]

        public async Task<ActionResult<EmployeeDTO>> GetAll()
        {
            try
            {
                var accounts = await _employeeRepository.GetAllEmployee();
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("get-employee-by-id")]

        public async Task<ActionResult<EmployeeDTO>> GetEmployeeById(int id)
        {
            try
            {
                var accounts = await _employeeRepository.GetEmployeeById(id);

                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        /*[Authorize(Roles = "Admin,Manager")]*/
        [HttpPost("get-employees-by-ids")]
        public async Task<IActionResult> GetEmployeesByIds([FromBody] List<int> ids)
        {
            if (ids == null || ids.Count == 0)
            {
                return BadRequest(new { error = "List of IDs cannot be empty." });
            }

            var employees = await _employeeRepository.GetEmployeeByIdAsync(ids);
            if (employees == null || employees.Count == 0)
            {
                return NotFound(new { error = "No employees found for the given IDs." });
            }

            return Ok(employees);
        }
        /*[Authorize(Roles = "Admin,Manager")]*/
        [HttpGet("search-employees")]
        public async Task<IActionResult> SearchEmployees([FromQuery] string? name, [FromQuery] string? branchName)
        {
            var employees = await _employeeRepository.SearchEmployeesAsync(name, branchName);

            if (employees == null || employees.Count == 0)
            {
                return NotFound(new { error = "No employees found matching the criteria." });
            }

            return Ok(employees);
        }
        [Authorize(Roles = "Staff")]
        [HttpPost("register-for-customer")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
        {
            if (registerDTO == null || string.IsNullOrEmpty(registerDTO.Email) || string.IsNullOrEmpty(registerDTO.Password) || string.IsNullOrEmpty(registerDTO.Name))
            {
                return BadRequest("All fields must be provided.");
            }

            try
            {
                var message = await _authRepository.RegisterForCustomerAsync(registerDTO);
                return Ok(new { Message = message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
        [Authorize(Roles = "Admin,Manager")]
        [HttpPost("create-employee-account")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateAccount([FromForm] CreateEmployeeAccountDTO request, IFormFile? avatar)
        {
            try
            {
                // ✅ Kiểm tra email có tồn tại trước khi upload ảnh
              

                var result = await _employeeRepository.CreateEmployeeAccountAsync(User, request, avatar);
                return Ok(new { success = result, message = "Employee account created successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred.", details = ex.Message });
            }
        }




        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("demote-to-customer/{employeeId}")]
        public async Task<IActionResult> DemoteEmployeeToCustomer(int employeeId)
        {
            try
            {
                var result = await _employeeRepository.DemoteEmployeeToCustomerAsync(User, employeeId);
                return Ok(new { success = result, message = "Employee demoted to customer successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred.", details = ex.Message });
            }
        }








    }
}
