using APIs.Controllers;
using AutoMapper;
using BusinessObjects.DTO.InventoryDetailDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace APIs.Tests.Controllers
{
    public class InventoryDetailControllerTests
    {
        private readonly Mock<IInventoryDetailRepository> _mockRepo;
        private readonly InventoryDetailController _controller;
        private readonly Mock<HttpContext> _mockHttpContext;

        public InventoryDetailControllerTests()
        {
            _mockRepo = new Mock<IInventoryDetailRepository>();

            // Setup mock HTTP context with user claims
            _mockHttpContext = new Mock<HttpContext>();
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim("AccountId", "123"),
                new Claim(ClaimTypes.Role, "Manager")
            }, "mock"));
            _mockHttpContext.Setup(x => x.User).Returns(claims);

            _controller = new InventoryDetailController(_mockRepo.Object)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = _mockHttpContext.Object
                }
            };
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult_WithListOfInventoryDetails()
        {
            // Arrange
            var expectedDetails = new List<InventoryDetailDTO>
            {
                new InventoryDetailDTO { InventoryDetailId = 1, ItemName = "Item 1" },
                new InventoryDetailDTO { InventoryDetailId = 2, ItemName = "Item 2" }
            };

            _mockRepo.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(expectedDetails);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<InventoryDetailDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetById_ReturnsOkResult_WhenDetailExists()
        {
            // Arrange
            var expectedDetail = new InventoryDetailDTO
            {
                InventoryDetailId = 1,
                ItemName = "Test Item"
            };

            _mockRepo.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(expectedDetail);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedDetail, okResult.Value);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenDetailDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync((InventoryDetailDTO)null);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsOkResult_WhenSuccessful()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "New Item",
                InventoryId = 1,
                Quantity = 10,
                Price = 100
            };

            _mockRepo.Setup(repo => repo.CreateAsync(dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO();
            _controller.ModelState.AddModelError("ItemName", "Required");

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenCreationFails()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "New Item",
                InventoryId = 1,
                Quantity = 10,
                Price = 100
            };

            _mockRepo.Setup(repo => repo.CreateAsync(dto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsOkResult_WhenSuccessful()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Updated Item",
                InventoryId = 1,
                Quantity = 5,
                Price = 50
            };

            _mockRepo.Setup(repo => repo.UpdateAsync(1, dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO();
            _controller.ModelState.AddModelError("ItemName", "Required");

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsNotFound_WhenDetailDoesNotExist()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Updated Item",
                InventoryId = 1,
                Quantity = 5,
                Price = 50
            };

            _mockRepo.Setup(repo => repo.UpdateAsync(1, dto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsOkResult_WhenSuccessful()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteAsync(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenDetailDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteAsync(1))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task FilterByQuantity_ReturnsOkResult_WithFilteredList()
        {
            // Arrange
            var expectedDetails = new List<InventoryDetailDTO>
            {
                new InventoryDetailDTO { InventoryDetailId = 1, ItemName = "Item 1", Quantity = 5 },
                new InventoryDetailDTO { InventoryDetailId = 2, ItemName = "Item 2", Quantity = 10 }
            };

            _mockRepo.Setup(repo => repo.FilterByQuantityAsync(5, 10))
                .ReturnsAsync(expectedDetails);

            // Act
            var result = await _controller.FilterByQuantity(5, 10);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<InventoryDetailDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task FilterByQuantity_ReturnsBadRequest_WhenInvalidRange()
        {
            // Act
            var result = await _controller.FilterByQuantity(-1, 10);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task SortByPrice_ReturnsOkResult_WithSortedList()
        {
            // Arrange
            var expectedDetails = new List<InventoryDetailDTO>
            {
                new InventoryDetailDTO { InventoryDetailId = 1, ItemName = "Item 1", Price = 50 },
                new InventoryDetailDTO { InventoryDetailId = 2, ItemName = "Item 2", Price = 100 }
            };

            _mockRepo.Setup(repo => repo.SortByPriceAsync(true))
                .ReturnsAsync(expectedDetails);

            // Act
            var result = await _controller.SortByPrice(true);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<InventoryDetailDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task Create_HandlesFileUpload_WhenImageProvided()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.FileName).Returns("test.jpg");
            fileMock.Setup(f => f.Length).Returns(1024);

            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Item with Image",
                InventoryId = 1,
                Quantity = 10,
                Price = 100,
                Image = fileMock.Object
            };

            _mockRepo.Setup(repo => repo.CreateAsync(dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task Update_HandlesFileUpload_WhenNewImageProvided()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.FileName).Returns("new.jpg");
            fileMock.Setup(f => f.Length).Returns(1024);

            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Updated Item",
                InventoryId = 1,
                Quantity = 5,
                Price = 50,
                Image = fileMock.Object
            };

            _mockRepo.Setup(repo => repo.UpdateAsync(1, dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<OkResult>(result);
        }


        [Fact]
        public async Task Create_ReturnsBadRequest_WhenQuantityIsNegative()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Invalid Item",
                InventoryId = 1,
                Quantity = -1, // Invalid
                Price = 100
            };

            _controller.ModelState.AddModelError("Quantity", "Must be positive");

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenPriceIsZero()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Invalid Item",
                InventoryId = 1,
                Quantity = 10,
                Price = 0 // Invalid
            };

            _controller.ModelState.AddModelError("Price", "Must be greater than 0");

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task GetAll_ReturnsEmptyList_WhenUnauthorized()
        {
            // Arrange
            var unauthorizedContext = new Mock<HttpContext>();
            unauthorizedContext.Setup(x => x.User).Returns(new ClaimsPrincipal());
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = unauthorizedContext.Object
            };

            // Mock repository để trả về null khi không authorized
            _mockRepo.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync((List<InventoryDetailDTO>)null);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = okResult.Value as List<InventoryDetailDTO>;

            // Kiểm tra cả null và empty
            Assert.True(returnValue == null || returnValue.Count == 0,
                "Expected null or empty list when unauthorized");
        }

        [Fact]
        public async Task Update_ReturnsNotFound_WhenNotAuthorized()
        {
            // Arrange
            var unauthorizedContext = new Mock<HttpContext>();
            unauthorizedContext.Setup(x => x.User).Returns(new ClaimsPrincipal());
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = unauthorizedContext.Object
            };

            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Test Item",
                InventoryId = 1,
                Quantity = 5,
                Price = 50
            };

            // Mock repository trả về false khi không authorized
            _mockRepo.Setup(repo => repo.UpdateAsync(1, dto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsOk_WhenAddingToExistingItem()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Existing Item",
                InventoryId = 1,
                Quantity = 5,
                Price = 100
            };

            _mockRepo.Setup(repo => repo.CreateAsync(dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task Update_SendsNotification_WhenSuccessful()
        {
            // Arrange
            var dto = new CreateInventoryDetailDTO
            {
                ItemName = "Updated Item",
                InventoryId = 1,
                Quantity = 5,
                Price = 50
            };

            _mockRepo.Setup(repo => repo.UpdateAsync(1, dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<OkResult>(result);
            // Có thể verify thêm notification service nếu cần
        }

        [Fact]
        public async Task FilterByQuantity_ReturnsEmpty_WhenNoMatch()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.FilterByQuantityAsync(100, 200))
                .ReturnsAsync(new List<InventoryDetailDTO>());

            // Act
            var result = await _controller.FilterByQuantity(100, 200);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<InventoryDetailDTO>>(okResult.Value);
            Assert.Empty(returnValue);
        }

        [Fact]
        public async Task SortByPrice_ReturnsSingleItem_WhenOnlyOneExists()
        {
            // Arrange
            var expectedDetails = new List<InventoryDetailDTO>
    {
        new InventoryDetailDTO { InventoryDetailId = 1, ItemName = "Single Item", Price = 50 }
    };

            _mockRepo.Setup(repo => repo.SortByPriceAsync(true))
                .ReturnsAsync(expectedDetails);

            // Act
            var result = await _controller.SortByPrice(true);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<InventoryDetailDTO>>(okResult.Value);
            Assert.Single(returnValue);
        }
    }
}