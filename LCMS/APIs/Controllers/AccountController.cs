using BusinessObjects.DTO.AccountDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IAccountRepository _accountRepository;
        public AccountController(IAccountRepository accountRepository)
        {
            _accountRepository = accountRepository;
        }

        [HttpGet("get-all-account")]
        public async Task<IActionResult> GetAllAccount()
        {
            var result = await _accountRepository.GetListAccount();
            return Ok(result);

        }
        [HttpGet("getaccountById/{Id}")]
        public async Task<IActionResult> GetAll(int Id)
        {
            var result = await _accountRepository.GetAccountById(Id);
            return Ok(result);

        }
        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] AccountDTO accountDto)
        {
            try
            {
                var result = await _accountRepository.UpdateProfileAsync(User, accountDto);

                if (result.Success)
                {
                    return Ok(new { message = result.Message, token = result.Token, refreshToken = result.RefreshToken });
                }

                return BadRequest(new { error = result.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }







        [HttpGet("get-all-role")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _accountRepository.GetAllRole();
            return Ok(result);

        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("update-employee")]
        public async Task<IActionResult> UpdateEmployee([FromBody] UpdateRoleDTO request)
        {
            try
            {
                var result = await _accountRepository.UpdateRoleAsync(request.AccountId, request.NewRoleId, request.EmployeeRoleId, request.BranchId);
                return Ok(new { success = result, message = "Role updated successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
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






        [Authorize]
        [HttpPost("send-update-email-code")]
        public async Task<IActionResult> SendUpdateEmailCode([FromBody] UpdateEmailDTO model)
        {
            await _accountRepository.SendUpdateEmailCodeAsync(User, model);
            return Ok("A confirmation code has been sent to your new email.");
        }

        [HttpPost("verify-update-email-code")]
        public async Task<IActionResult> VerifyUpdateEmailCode([FromBody] VerifyEmailDTO model)
        {
            var result = await _accountRepository.VerifyUpdateEmailCodeAsync(User,model);
            if (result)
                return Ok("Email updated successfully.");
            return BadRequest("Invalid confirmation code.");
        }
    }
}
