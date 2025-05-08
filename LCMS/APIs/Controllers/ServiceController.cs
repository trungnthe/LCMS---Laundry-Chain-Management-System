using BusinessObjects.DTO.ServiceDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceRepository _serviceDao;

        public ServiceController(IServiceRepository serviceDao)
        {
            _serviceDao = serviceDao;
        }

        // GET: api/service
        [HttpGet("get-all")]
        public async Task<ActionResult<List<ServiceDTO>>> GetAllServices()
        {
            var services = await _serviceDao.GetAllServiceAsync();
            return Ok(services);
        }

        // GET: api/service/{id}
        [HttpGet("getbyId/{id}")]
        public async Task<ActionResult<ServiceDTO>> GetServiceById(int id)
        {
            var service = await _serviceDao.GetServiceByIdAsync(id);
            if (service == null) return NotFound("Service not found.");
            return Ok(service);
        }
        // GET: api/service/byServiceType/{serviceTypeId}
        [HttpGet("byServiceType/{serviceTypeId}")]
        public async Task<ActionResult<List<ServiceDTO>>> GetServicesByServiceTypeId(int serviceTypeId)
        {
            var services = await _serviceDao.GetServiceByServiceTypeIdAsync(serviceTypeId);
            if (services == null || services.Count == 0) return NotFound("No services found for this service type.");
            return Ok(services);
        }


        // POST: api/service
        [HttpPost("create")]
        public async Task<ActionResult<ServiceDTO>> CreateService([FromForm] CreateServiceDTO dto)
        {
            var createdService = await _serviceDao.CreateServiceAsync(dto);
            return CreatedAtAction(nameof(GetServiceById), new { id = createdService.ServiceId }, createdService);
        }

        // PUT: api/service/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromForm] UpdateServiceDTO dto)
        {
            var result = await _serviceDao.UpdateServiceAsync(id, dto);
            if (!result) return NotFound("Service not found.");
            return NoContent();
        }

        // DELETE: api/service/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var result = await _serviceDao.DeleteServiceAsync(id);
            if (!result) return NotFound("Service not found.");
            return NoContent();
        }
    }
}
