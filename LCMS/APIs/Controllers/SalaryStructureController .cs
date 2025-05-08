using AutoMapper;
using BusinessObjects.DTO.SalaryStructureDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalaryStructureController : ControllerBase
    {
        private readonly ISalaryStructureRepository _salaryStructureRepository;
        private readonly IMapper _mapper;

        public SalaryStructureController(ISalaryStructureRepository salaryStructureRepository, IMapper mapper)
        {
            _salaryStructureRepository = salaryStructureRepository;
            _mapper = mapper;
        }

        [HttpGet("get-all")]
        public async Task<ActionResult<List<SalaryStructureDTO>>> GetAllSalaries()
        {
            try
            {
                var salaries = await _salaryStructureRepository.GetAllSalariesAsync();
                var salaryDtos = _mapper.Map<List<SalaryStructureDTO>>(salaries); // Chuyển đổi sang DTO
                return Ok(salaryDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }


        [HttpGet("get-salary-by-id/{id}")]
        public async Task<ActionResult<SalaryStructureDTO>> GetSalaryById(int id)
        {
            try
            {
                var salary = await _salaryStructureRepository.GetSalaryByIdAsync(id);
                if (salary == null) return NotFound("Không tìm thấy mức lương.");

                var salaryDto = _mapper.Map<SalaryStructureDTO>(salary); // Chuyển đổi sang DTO
                return Ok(salaryDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi máy chủ: {ex.Message}");
            }
        }


        [HttpPut("update-salary/{id}")]
        public async Task<IActionResult> UpdateSalary(int id, [FromBody] SalaryStructureUpdateDTO salaryDto)
        {
            try
            {
                // Thêm validation
                if (salaryDto.BaseSalary < 0)
                    return BadRequest("Base salary cannot be negative");

                if (salaryDto.Allowance < 0)
                    return BadRequest("Allowance cannot be negative");

                var existingSalary = await _salaryStructureRepository.GetSalaryByIdAsync(id);
                if (existingSalary == null)
                    return NotFound("Không tìm thấy mức lương để cập nhật.");

                _mapper.Map(salaryDto, existingSalary);
                await _salaryStructureRepository.UpdateSalaryAsync(existingSalary);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi cập nhật mức lương: {ex.Message}");
            }
        }


    }
}
