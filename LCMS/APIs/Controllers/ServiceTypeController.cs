using BusinessObjects.DTO;
using BusinessObjects.DTO.ServiceTypeDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Route("api/ServiceType")]
    [ApiController]
    public class ServiceTypeController : ControllerBase
    {
        private readonly IServiceTypeRepository _serviceTypeDao;

        public ServiceTypeController(IServiceTypeRepository serviceTypeDao)
        {
            _serviceTypeDao = serviceTypeDao;
        }

        // 🔹 Lấy tất cả ServiceType
        [HttpGet("get-all")]
        public async Task<ActionResult<List<ServiceTypeDTO>>> GetAllServiceTypes()
        {
            var serviceTypes = await _serviceTypeDao.GetAllServiceTypesAsync();
            return Ok(serviceTypes);
        }

        // GET: api/ServiceType/{id}
        [HttpGet("getServiceById/{id}")]
        public async Task<ActionResult<ServiceTypeDTO>> GetServiceTypeById(int id)
        {
            var serviceType = await _serviceTypeDao.GetServiceTypeByIdAsync(id);
            if (serviceType == null) return NotFound();
            return Ok(serviceType);
        }

        // POST: api/ServiceType
        [HttpPost("Create")]
        public async Task<ActionResult<ServiceTypeDTO>> CreateServiceType([FromForm] CreateServiceTypeDTO dto)
        {
            if (dto == null) return BadRequest("Invalid data");

            try
            {
                var newServiceType = await _serviceTypeDao.CreateServiceTypeAsync(dto);
                return CreatedAtAction(nameof(GetServiceTypeById), new { id = newServiceType.ServiceTypeId }, newServiceType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/ServiceType/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateServiceType(int id, [FromForm] UpdateServiceTypeDTO dto)
        {
            if (dto == null) return BadRequest("Invalid data");

            var updated = await _serviceTypeDao.UpdateServiceTypeAsync(id, dto);
            if (!updated) return NotFound();

            return NoContent();
        }

        // DELETE: api/ServiceType/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteServiceType(int id)
        {
            var deleted = await _serviceTypeDao.DeleteServiceTypeAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }
    }
}
