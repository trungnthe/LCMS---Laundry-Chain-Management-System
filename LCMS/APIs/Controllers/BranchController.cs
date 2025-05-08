using AutoMapper;
using BusinessObjects.DTO.BranchDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using System;
using System.Threading.Tasks;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]

    public class BranchController : ControllerBase
    {
        private readonly IBranchRepository _branchRepository;
        private readonly IMapper _mapper;

        public BranchController(IBranchRepository branchRepository, IMapper mapper)
        {
            _branchRepository = branchRepository;
            _mapper = mapper;
        }
        [HttpGet("List-all-status")]
        public IActionResult GetBranchStatuses()
        {
            var result = _branchRepository.GetAllStatuses();
            return Ok(result);
        }
        [HttpGet("getbranchByRole")]
        public async Task<IActionResult> GetBranchesByRoleId()
        {
            try
            {
                var branches = await _branchRepository.GetBranchesByRoleIdAsync();

                if (branches == null || !branches.Any())
                {
                    return NotFound(new { message = "No branches found with the specified role." });
                }

                return Ok(branches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the branches.", error = ex.Message });
            }
        }


        // Lấy tất cả branch
        [HttpGet("get-all")]
        public async Task<IActionResult> GetBranches()
        {
            try
            {
                var branches = await _branchRepository.GetAllBranchesAsync();
                return Ok(branches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        // Lấy chi tiết branch theo ID
        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetBranchById(int id)
        {
            var branch = await _branchRepository.GetBranchByIdAsync(id);
            if (branch == null) return NotFound();
            return Ok(branch);
        }

        // Tạo mới branch
        [HttpPost("create")]
        public async Task<IActionResult> CreateBranch([FromForm] UpdateBranchDto dto)
        {
            var branch = await _branchRepository.CreateBranchAsync(dto);
            return CreatedAtAction(nameof(GetBranchById), new { id = branch.BranchId }, branch);
        }

        // Cập nhật branch theo ID
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateBranch(int id, [FromForm] UpdateBranchDto dto)
        {
            var success = await _branchRepository.UpdateBranchAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        // Xóa branch theo ID
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteBranch(int id)
        {
            var success = await _branchRepository.DeleteBranchAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        // Tìm kiếm branch theo từ khóa
        [HttpGet("search")]
        public async Task<IActionResult> SearchBranches([FromQuery] string keyword)
        {
            var branches = await _branchRepository.SearchBranchesAsync(keyword);
            return Ok(branches);
        }

        // Lấy branch ID từ account ID
        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetBranchIdByAccountId(int accountId)
        {
            var branchId = await _branchRepository.GetBranchIdByAccountId(accountId);
            if (branchId == 0) return NotFound("Branch not found for this account.");
            return Ok(branchId);
        }
    }
}
