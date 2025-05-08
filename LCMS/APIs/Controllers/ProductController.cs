using BusinessObjects.DTO.ProductDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository _productRepository;
        public ProductController(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productRepository.GetAllProductsAsync();
            return Ok(products);
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productRepository.GetProductByIdAsync(id);
            if (product == null)
            {
                return NotFound("Product not found.");
            }
            return Ok(product);
        }

        [HttpGet("get-product-by-category-id/{id}")]
        public async Task<IActionResult> GetProductByCategoryById(int id)
        {
            var product = await _productRepository.GetProductByCategoryById(id);
            if (product == null)
            {
                return NotFound("Product not found.");
            }
            return Ok(product);
        }
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromForm] CreateProductDTO dto)
        {
            var product = await _productRepository.CreateProductAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, product);
        }

        
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] CreateProductDTO dto)
        {
            var updated = await _productRepository.UpdateProductAsync(id, dto);
            if (!updated)
            {
                return NotFound("Product not found.");
            }
            return NoContent();
        }

    
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _productRepository.DeleteProductAsync(id);
            if (!deleted)
            {
                return NotFound("Product not found.");
            }
            return NoContent();
        }
    }
}
