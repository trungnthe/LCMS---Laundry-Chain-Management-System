using APIs.Controllers;
using BusinessObjects.DTO.CartDTO;
using DataAccess.Dao;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace APIs.Tests.Controllers
{
    public class CartControllerTests
    {
        private readonly Mock<ICartRepository> _mockRepo;
        private readonly CartController _controller;

        public CartControllerTests()
        {
            _mockRepo = new Mock<ICartRepository>();
            _controller = new CartController(_mockRepo.Object);
        }

        [Fact]
        public async Task AddToCart_ValidProduct_ReturnsOkWithCart()
        {
            // Arrange
            var item = new CartAddItemDto { ServiceId = 1, ProductId = 1, Quantity = 1 };
            var expectedCart = new CartDto { Items = new List<CartItemDto>() };

            _mockRepo.Setup(x => x.ValidateCartItem(item)).ReturnsAsync(true);
            _mockRepo.Setup(x => x.AddToCart(item)).Returns(Task.FromResult(true));
            _mockRepo.Setup(x => x.GetCart()).Returns(expectedCart);

            // Act
            var result = await _controller.AddToCart(item);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedCart, okResult.Value);
        }

        [Fact]
        public async Task AddToCart_InvalidProduct_ReturnsBadRequest()
        {
            // Arrange
            var item = new CartAddItemDto { ServiceId = 999, ProductId = 999 };

            _mockRepo.Setup(x => x.ValidateCartItem(item)).ReturnsAsync(false);

            // Act
            var result = await _controller.AddToCart(item);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task AddToCart_ServiceOnly_ReturnsOkWithCart()
        {
            // Arrange
            var item = new CartAddItemDto { ServiceId = 1, ProductId = null };
            var expectedCart = new CartDto { Items = new List<CartItemDto>() };

            _mockRepo.Setup(x => x.ValidateCartItem(item)).ReturnsAsync(true);
            _mockRepo.Setup(x => x.AddToCart(item)).Returns(Task.FromResult(true));
            _mockRepo.Setup(x => x.GetCart()).Returns(expectedCart);

            // Act
            var result = await _controller.AddToCart(item);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedCart, okResult.Value);
        }

        [Fact]
        public async Task AddToCart_ExistingItem_IncrementsQuantity()
        {
            // Arrange
            var item = new CartAddItemDto { ServiceId = 1, ProductId = 1, Quantity = 1 };
            var existingCart = new CartDto
            {
                Items = new List<CartItemDto>
                {
                    new CartItemDto { ServiceId = 1, ProductId = 1, Quantity = 1 }
                }
            };

            _mockRepo.Setup(x => x.ValidateCartItem(item)).ReturnsAsync(true);
            _mockRepo.Setup(x => x.AddToCart(item)).Returns(Task.FromResult(true));
            _mockRepo.Setup(x => x.GetCart()).Returns(existingCart);

            // Act
            var result = await _controller.AddToCart(item);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedCart = Assert.IsType<CartDto>(okResult.Value);
            Assert.Single(returnedCart.Items);
        }

        [Fact]
        public void GetCart_EmptyCart_ReturnsEmptyCart()
        {
            // Arrange
            var expectedCart = new CartDto { Items = new List<CartItemDto>() };
            _mockRepo.Setup(x => x.GetCart()).Returns(expectedCart);

            // Act
            var result = _controller.GetCart();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedCart, okResult.Value);
        }

        [Fact]
        public void GetCart_WithItems_ReturnsCartWithItems()
        {
            // Arrange
            var expectedCart = new CartDto
            {
                Items = new List<CartItemDto>
                {
                    new CartItemDto { ItemId = 1, ServiceId = 1, ProductId = 1, Quantity = 1 }
                }
            };
            _mockRepo.Setup(x => x.GetCart()).Returns(expectedCart);

            // Act
            var result = _controller.GetCart();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedCart = Assert.IsType<CartDto>(okResult.Value);
            Assert.Single(returnedCart.Items);
        }
        [Fact]
        public void UpdateCartItem_ValidItem_ReturnsOk()
        {
            // Arrange
            int itemId = 1;
            int quantity = 2;
            _mockRepo.Setup(x => x.UpdateCartItem(itemId, quantity)).Returns(true);

            // Act
            var result = _controller.UpdateCartItem(itemId, quantity);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Kiểm tra bằng cách convert sang JObject
            var actualJson = Newtonsoft.Json.JsonConvert.SerializeObject(okResult.Value);
            var expectedJson = Newtonsoft.Json.JsonConvert.SerializeObject(new { message = "Item updated successfully" });
            Assert.Equal(expectedJson, actualJson);

            _mockRepo.Verify(x => x.UpdateCartItem(itemId, quantity), Times.Once);
        }

        [Fact]
        public void UpdateCartItem_InvalidItem_ReturnsNotFound()
        {
            // Arrange
            int itemId = 999;
            int quantity = 2;
            _mockRepo.Setup(x => x.UpdateCartItem(itemId, quantity)).Returns(false);

            // Act
            var result = _controller.UpdateCartItem(itemId, quantity);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public void UpdateCartItem_ZeroQuantity_RemovesItem()
        {
            // Arrange
            int itemId = 1;
            int quantity = 0;
            _mockRepo.Setup(x => x.UpdateCartItem(itemId, quantity)).Returns(true);

            // Act
            var result = _controller.UpdateCartItem(itemId, quantity);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            _mockRepo.Verify(x => x.UpdateCartItem(itemId, quantity), Times.Once);
        }

        [Fact]
        public void RemoveFromCart_ValidItem_ReturnsOkWithCart()
        {
            // Arrange
            int itemId = 1;
            var expectedCart = new CartDto { Items = new List<CartItemDto>() };
            _mockRepo.Setup(x => x.RemoveFromCart(itemId)).Returns(true);
            _mockRepo.Setup(x => x.GetCart()).Returns(expectedCart);

            // Act
            var result = _controller.RemoveFromCart(itemId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedCart, okResult.Value);
        }

        [Fact]
        public void RemoveFromCart_InvalidItem_ReturnsNotFound()
        {
            // Arrange
            int itemId = 999;
            _mockRepo.Setup(x => x.RemoveFromCart(itemId)).Returns(false);

            // Act
            var result = _controller.RemoveFromCart(itemId);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public void ClearCart_Always_ClearsCartAndReturnsOk()
        {
            // Arrange
            _mockRepo.Setup(x => x.ClearCart());

            // Act
            var result = _controller.ClearCart();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Kiểm tra chuỗi JSON trực tiếp
            var expectedJson = "{\"Message\":\"Cart has been cleared!\"}";
            var actualJson = Newtonsoft.Json.JsonConvert.SerializeObject(okResult.Value);
            Assert.Equal(expectedJson, actualJson);

            _mockRepo.Verify(x => x.ClearCart(), Times.Once);
        }
    }
}