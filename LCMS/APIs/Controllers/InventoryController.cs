using BusinessObjects;
using BusinessObjects.DTO.InventoryDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IHubContext<SignalHub> _hubContext;

        public InventoryController(IInventoryRepository inventoryRepository, IHubContext<SignalHub> hubContext)
        {
            _inventoryRepository = inventoryRepository;
            _hubContext = hubContext;   
        }
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var inventories = await _inventoryRepository.GetAllAsync();
            return Ok(inventories);
        }
        [HttpGet("get-By-BranchID/{id}")]
        public async Task<IActionResult> GetAll1(int id)
        {
            var inventories = await _inventoryRepository.GetAllAsync(id);
            return Ok(inventories);
        }

        [HttpGet("get-low-stock-warnings")] 
        public async Task<IActionResult> GetLowStockWarnings()
        {
            var inventories = await _inventoryRepository.GetLowStockWarningsAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveUpdate", "lowStock", inventories);

            return Ok(inventories);
        }

        [HttpGet("get-byID/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var inventory = await _inventoryRepository.GetByIdAsync(id);
            if (inventory == null) return NotFound();
            return Ok(inventory);
        }
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] CreateInventoryDTO dto)
        {
            var result = await _inventoryRepository.CreateAsync(dto);
            if (!result)
                return BadRequest("Failed to create inventory.");

            return Ok("Inventory created successfully.");
        }


        [HttpPut("update-inventory/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateInventoryDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _inventoryRepository.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _inventoryRepository.DeleteAsync(id);
            if (!success) return NotFound("Inventory not found.");
            return NoContent();
        }
        [HttpPost("deduct")]
        public async Task<IActionResult> DeductInventory([FromBody] DeductInventoryRequest request)
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "AccountId");
            if (userIdClaim == null)
                return BadRequest("Không tìm thấy ID nhân viên trong token");

            int employeeId = int.Parse(userIdClaim.Value);
            var result = await _inventoryRepository.DeductInventoryAsync(
                request.ItemId, request.Quantity, employeeId, request.Note);

            if (!result)
                return BadRequest("Không đủ hàng hoặc sản phẩm không tồn tại");


            await _hubContext.Clients.All.SendAsync("updateNotification", "notificationInventory", result);

            return Ok(new { message = "Cập nhật và thêm lịch sử thành công", request.ItemId, code = "SUCCESS" });
        }
        public class DeductInventoryRequest
        {
            public int ItemId { get; set; }             // ID sản phẩm trong kho
            public int Quantity { get; set; }           // Số lượng muốn trừ
            public string? Note { get; set; }           // Ghi chú (nếu có)
        }

    }


}
