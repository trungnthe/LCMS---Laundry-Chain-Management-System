using BusinessObjects.DTO.ProductCategoryDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductCategoryController : ControllerBase
    {
        private readonly IProductCategoryRepository _repository;

        public ProductCategoryController(IProductCategoryRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _repository.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _repository.GetCategoryByIdAsync(id);
            if (category == null) return NotFound(new { message = "Category not found." });
            return Ok(category);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] CreateProductCategoryDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var category = await _repository.CreateCategoryAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = category.ProductCategoryId }, category);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] CreateProductCategoryDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _repository.UpdateCategoryAsync(id, dto);
            if (!updated) return NotFound(new { message = "Category not found." });

            return NoContent();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _repository.DeleteCategoryAsync(id);
                if (!deleted) return NotFound(new { message = "Category not found." });
                return NoContent();
            }   
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = ex.Message });
            }
        }
    }
}
