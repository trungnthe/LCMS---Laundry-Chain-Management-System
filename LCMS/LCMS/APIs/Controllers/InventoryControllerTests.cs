using APIs.Controllers;
using AutoMapper;
using BusinessObjects;
using BusinessObjects.DTO.InventoryDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace APIs.Tests.Controllers
{
    public class InventoryControllerTests
    {
        private readonly Mock<IInventoryRepository> _mockRepo;
        private readonly Mock<IHubContext<SignalHub>> _mockHubContext;
        private readonly InventoryController _controller;
        private readonly Mock<HttpContext> _mockHttpContext;

        public InventoryControllerTests()
        {
            _mockRepo = new Mock<IInventoryRepository>();
            _mockHubContext = new Mock<IHubContext<SignalHub>>();

            // Setup mock HTTP context
            _mockHttpContext = new Mock<HttpContext>();
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim("AccountId", "123"),
                new Claim(ClaimTypes.Role, "Manager")
            }, "mock"));
            _mockHttpContext.Setup(x => x.User).Returns(claims);

            _controller = new InventoryController(_mockRepo.Object, _mockHubContext.Object)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = _mockHttpContext.Object
                }
            };
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult_WithListOfInventories()
        {
            // Arrange
            var expectedInventories = new List<InventoryDTO>
            {
                new InventoryDTO { InventoryId = 1, InventoryName = "Main Inventory" },
                new InventoryDTO { InventoryId = 2, InventoryName = "Secondary Inventory" }
            };

            _mockRepo.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(expectedInventories);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<InventoryDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }
        [Fact]
        public async Task GetLowStockWarnings_ReturnsOkResult_WithListOfWarnings()
        {
            // Arrange
            var expectedWarnings = new List<LowStockDTO>
    {
        new LowStockDTO { InventoryID = 1, ItemName = "Product A", Quantity = 3 },
        new LowStockDTO { InventoryID = 2, ItemName = "Product B", Quantity = 2 }
    };

            // Mock repository
            _mockRepo.Setup(repo => repo.GetLowStockWarningsAsync())
                .ReturnsAsync(expectedWarnings);

            // Mock SignalR HubContext
            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();
            mockClients.Setup(clients => clients.All).Returns(mockClientProxy.Object);
            _mockHubContext.Setup(x => x.Clients).Returns(mockClients.Object);

            // Setup SendAsync to return completed task
            mockClientProxy.Setup(x => x.SendCoreAsync(
                    "ReceiveUpdate",
                    It.Is<object[]>(o => o != null && o.Length == 2),
                    default(CancellationToken)))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.GetLowStockWarnings();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<LowStockDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);

            // Verify SignalR was called
            mockClientProxy.Verify(
                x => x.SendCoreAsync(
                    "ReceiveUpdate",
                    It.Is<object[]>(o => o != null && o.Length == 2),
                    default(CancellationToken)),
                Times.Once);
        }

        [Fact]
        public async Task GetById_ReturnsOkResult_WhenInventoryExists()
        {
            // Arrange
            var expectedInventory = new InventoryDTO1
            {
                InventoryId = 1,
                InventoryName = "Main Inventory"
            };

            _mockRepo.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(expectedInventory);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedInventory, okResult.Value);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenInventoryDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync((InventoryDTO1)null);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsOkResult_WhenSuccessful()
        {
            // Arrange
            var dto = new CreateInventoryDTO
            {
                InventoryName = "New Inventory",
                BranchId = 1,
                Status = "Active"
            };

            _mockRepo.Setup(repo => repo.CreateAsync(dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Inventory created successfully.", okResult.Value);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            var dto = new CreateInventoryDTO();
            _controller.ModelState.AddModelError("InventoryName", "Required");

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsBadRequest_WhenCreationFails()
        {
            // Arrange
            var dto = new CreateInventoryDTO
            {
                InventoryName = "New Inventory",
                BranchId = 1,
                Status = "Active"
            };

            _mockRepo.Setup(repo => repo.CreateAsync(dto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Failed to create inventory.", badRequestResult.Value);
        }

        [Fact]
        public async Task Update_ReturnsOkResult_WhenSuccessful()
        {
            // Arrange
            var dto = new UpdateInventoryDTO
            {
                InventoryName = "Updated Inventory",
                Status = "Active"
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
            var dto = new UpdateInventoryDTO();
            _controller.ModelState.AddModelError("InventoryName", "Required");

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsNotFound_WhenInventoryDoesNotExist()
        {
            // Arrange
            var dto = new UpdateInventoryDTO
            {
                InventoryName = "Updated Inventory",
                Status = "Active"
            };

            _mockRepo.Setup(repo => repo.UpdateAsync(1, dto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(1, dto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNoContent_WhenSuccessful()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteAsync(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenInventoryDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteAsync(1))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Inventory not found.", notFoundResult.Value);
        }

        [Fact]
        public async Task DeductInventory_ReturnsOkResult_WhenSuccessful()
        {
            // Arrange
            var request = new InventoryController.DeductInventoryRequest
            {
                ItemId = 1,
                Quantity = 5,
                Note = "Test deduction"
            };

            // Setup HttpContext with claims
            var claims = new[] { new Claim("AccountId", "123") };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Mock repository
            _mockRepo.Setup(repo => repo.DeductInventoryAsync(
                request.ItemId,
                request.Quantity,
                123, // Matches the AccountId from claims
                request.Note))
                .ReturnsAsync(true);

            // Mock SignalR if needed
            var mockClients = new Mock<IHubClients>();
            var mockClientProxy = new Mock<IClientProxy>();
            mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);
            _mockHubContext.Setup(x => x.Clients).Returns(mockClients.Object);

            // Act
            var result = await _controller.DeductInventory(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);



            // Option 2: Using reflection (more type-safe)
            var message = okResult.Value.GetType().GetProperty("message").GetValue(okResult.Value);
            var itemId = okResult.Value.GetType().GetProperty("ItemId").GetValue(okResult.Value);
            var code = okResult.Value.GetType().GetProperty("code").GetValue(okResult.Value);
            Assert.Equal("Cập nhật và thêm lịch sử thành công", message);
            Assert.Equal(1, itemId);
            Assert.Equal("SUCCESS", code);
        }

        [Fact]
        public async Task DeductInventory_ReturnsBadRequest_WhenAccountIdMissing()
        {
            // Arrange
            var controller = new InventoryController(_mockRepo.Object, _mockHubContext.Object)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = new DefaultHttpContext()
                }
            };

            var request = new InventoryController.DeductInventoryRequest();

            // Act
            var result = await controller.DeductInventory(request);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeductInventory_ReturnsBadRequest_WhenDeductionFails()
        {
            // Arrange
            var request = new InventoryController.DeductInventoryRequest
            {
                ItemId = 1,
                Quantity = 5,
                Note = "Test deduction"
            };

            _mockRepo.Setup(repo => repo.DeductInventoryAsync(1, 5, 123, "Test deduction"))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeductInventory(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Không đủ hàng hoặc sản phẩm không tồn tại", badRequestResult.Value);
        }
    }
}