using BusinessObjects.DTO.CartDTO;
using BusinessObjects.DTO.SessionHelper;
using DataAccess.Dao;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;

        public CartController(ICartRepository cartRepository)
        {
           _cartRepository = cartRepository;
        }




        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] CartAddItemDto item)
        {
           

            if (item.ProductId == 0) item.ProductId = null;

            bool isValid = await _cartRepository.ValidateCartItem(item);
            if (!isValid)
            {
                return BadRequest(new { Message = "Invalid product or service!" });
            }

            await _cartRepository.AddToCart(item);
            return Ok(_cartRepository.GetCart());
        }

        [HttpPut("update/{itemId}/{quantity}")]
        public IActionResult UpdateCartItem(int itemId, int quantity)
        {
            if (_cartRepository.UpdateCartItem(itemId, quantity))
                return Ok(new { message = "Item updated successfully" });
            return NotFound(new { message = "Item not found" });
        }


        [HttpGet]
        public IActionResult GetCart()
        {
            return Ok(_cartRepository.GetCart());
        }
        [HttpDelete("remove/{itemId}")]
        public IActionResult RemoveFromCart(int itemId)
        {
            bool removed = _cartRepository.RemoveFromCart(itemId);
            if (!removed)
            {
                return NotFound(new { Message = "Item not found in cart!" });
            }
            return Ok(_cartRepository.GetCart());
        }

      


        [HttpDelete("clear")]
        public IActionResult ClearCart()
        {
            _cartRepository.ClearCart();
            return Ok(new { Message = "Cart has been cleared!" });
        }
    }
}
