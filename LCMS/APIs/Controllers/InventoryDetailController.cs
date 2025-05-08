using BusinessObjects.DTO.InventoryDetailDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryDetailController : ControllerBase
    {
        private readonly IInventoryDetailRepository _iventoryDetailRepository;
        public InventoryDetailController(IInventoryDetailRepository iventoryDatailRepository)
        {
            _iventoryDetailRepository = iventoryDatailRepository;
        }
        [HttpGet("get-all-inventoryDetail")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _iventoryDetailRepository.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("get-inventoryDetailById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _iventoryDetailRepository.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

       
        [HttpPost("create-inventoryDetail")]
        public async Task<IActionResult> Create([FromForm] CreateInventoryDetailDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _iventoryDetailRepository.CreateAsync(dto);
            if (!success) return BadRequest();
            return Ok();
        }

    
        [HttpPut("update-inventoryDetail/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] CreateInventoryDetailDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _iventoryDetailRepository.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return Ok();
        }

      
        [HttpDelete("delete-inventoryDetail/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _iventoryDetailRepository.DeleteAsync(id);
            if (!success) return NotFound();
            return Ok();
        }
        [HttpGet("filter-by-quantity")]
        public async Task<IActionResult> FilterByQuantity([FromQuery] int minQuantity, [FromQuery] int maxQuantity)
        {
            if (minQuantity < 0 || maxQuantity < minQuantity)
            {
                return BadRequest("Giá trị không hợp lệ.");
            }

            var items = await _iventoryDetailRepository.FilterByQuantityAsync(minQuantity, maxQuantity);
            return Ok(items);
        }
        [HttpGet("sort-by-price")]
        public async Task<IActionResult> SortByPrice([FromQuery] bool ascending)
        {
            var sortedList = await _iventoryDetailRepository.SortByPriceAsync(ascending);
            return Ok(sortedList);
        }


    }

}
