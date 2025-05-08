using API.Controllers;
using BusinessObjects.DTO.ServiceTypeDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace API.Tests.Controllers
{
    public class ServiceTypeControllerTests
    {
        private readonly Mock<IServiceTypeRepository> _mockRepo;
        private readonly ServiceTypeController _controller;

        public ServiceTypeControllerTests()
        {
            _mockRepo = new Mock<IServiceTypeRepository>();
            _controller = new ServiceTypeController(_mockRepo.Object);
        }
        [Fact]
        public async Task GetAllServiceTypes_ReturnsOkResultWithList()
        {
            // Arrange
            var serviceTypes = new List<ServiceTypeDTO>
    {
        new ServiceTypeDTO { ServiceTypeId = 1, ServiceTypeName = "Type 1" },
        new ServiceTypeDTO { ServiceTypeId = 2, ServiceTypeName = "Type 2" }
    };

            _mockRepo.Setup(repo => repo.GetAllServiceTypesAsync())
                .ReturnsAsync(serviceTypes);

            // Act
            var result = await _controller.GetAllServiceTypes();

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<ServiceTypeDTO>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<List<ServiceTypeDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }
        [Fact]
        public async Task GetAllServiceTypes_EmptyList_ReturnsOk()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetAllServiceTypesAsync())
                .ReturnsAsync(new List<ServiceTypeDTO>());

            // Act
            var result = await _controller.GetAllServiceTypes();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<ServiceTypeDTO>>(okResult.Value);
            Assert.Empty(returnValue);
        }

        [Fact]
        public async Task GetServiceTypeById_ExistingId_ReturnsServiceType()
        {
            // Arrange
            var expectedService = new ServiceTypeDTO
            {
                ServiceTypeId = 1,
                ServiceTypeName = "Type 1"
            };

            _mockRepo.Setup(repo => repo.GetServiceTypeByIdAsync(1)).ReturnsAsync(expectedService);

            // Act
            var result = await _controller.GetServiceTypeById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expectedService, okResult.Value);
        }

        [Fact]
        public async Task GetServiceTypeById_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetServiceTypeByIdAsync(99)).ReturnsAsync((ServiceTypeDTO)null);

            // Act
            var result = await _controller.GetServiceTypeById(99);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }
        [Fact]
        public async Task CreateServiceType_ValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var dto = new CreateServiceTypeDTO { ServiceTypeName = "New Type", Description = "Description" };
            var createdService = new ServiceTypeDTO { ServiceTypeId = 1, ServiceTypeName = "New Type", Description = "Description" };

            _mockRepo.Setup(repo => repo.CreateServiceTypeAsync(dto)).ReturnsAsync(createdService);

            // Act
            var result = await _controller.CreateServiceType(dto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
        }
        [Fact]
        public async Task CreateServiceType_NullData_ReturnsBadRequest()
        {
            // Arrange
            CreateServiceTypeDTO nullDto = null;

            // Act
            var result = await _controller.CreateServiceType(nullDto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<ServiceTypeDTO>>(result);
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
            Assert.Equal("Invalid data", badRequestResult.Value);
        }

        [Fact]
        public async Task CreateServiceType_RepositoryError_ReturnsServerError()
        {
            // Arrange
            var dto = new CreateServiceTypeDTO
            {
                ServiceTypeName = "New Type",
                Description = "Description"
            };

            _mockRepo.Setup(repo => repo.CreateServiceTypeAsync(dto))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.CreateServiceType(dto);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, objectResult.StatusCode);
            Assert.Contains("Internal server error", objectResult.Value.ToString());
        }
        [Fact]
        public async Task UpdateServiceType_ValidData_ReturnsNoContent()
        {
            // Arrange
            var dto = new UpdateServiceTypeDTO
            {
                ServiceTypeName = "Updated Type",
                Description = "Updated Description"
            };

            _mockRepo.Setup(repo => repo.UpdateServiceTypeAsync(1, dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateServiceType(1, dto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateServiceType_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            var dto = new UpdateServiceTypeDTO
            {
                ServiceTypeName = "Updated Type",
                Description = "Updated Description"
            };

            _mockRepo.Setup(repo => repo.UpdateServiceTypeAsync(99, dto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateServiceType(99, dto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task UpdateServiceType_NullData_ReturnsBadRequest()
        {
            // Arrange
            UpdateServiceTypeDTO nullDto = null;

            // Act
            var result = await _controller.UpdateServiceType(1, nullDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Invalid data", badRequestResult.Value);
        }

        [Fact]
        public async Task DeleteServiceType_ExistingId_ReturnsNoContent()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteServiceTypeAsync(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteServiceType(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteServiceType_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteServiceTypeAsync(99))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteServiceType(99);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        // Additional tests for image upload scenarios
        [Fact]
        public async Task CreateServiceType_WithImage_ReturnsCreated()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.Length).Returns(1);
            mockFile.Setup(f => f.FileName).Returns("test.jpg");

            var dto = new CreateServiceTypeDTO
            {
                ServiceTypeName = "New Type",
                Description = "Description",
                Image = mockFile.Object
            };

            var createdService = new ServiceTypeDTO
            {
                ServiceTypeId = 1,
                ServiceTypeName = dto.ServiceTypeName,
                Description = dto.Description,
                Image = "path/to/image.jpg"
            };

            _mockRepo.Setup(repo => repo.CreateServiceTypeAsync(dto))
                .ReturnsAsync(createdService);

            // Act
            var result = await _controller.CreateServiceType(dto);

            // Assert
            // Kiểm tra kiểu ActionResult<ServiceTypeDTO> trước
            var actionResult = Assert.IsType<ActionResult<ServiceTypeDTO>>(result);

            // Sau đó kiểm tra Result là CreatedAtActionResult
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);

            // Kiểm tra giá trị trả về
            var returnedService = Assert.IsType<ServiceTypeDTO>(createdAtActionResult.Value);
            Assert.NotNull(returnedService.Image);
            Assert.Equal("path/to/image.jpg", returnedService.Image);

            // Kiểm tra route values
            Assert.Equal(nameof(ServiceTypeController.GetServiceTypeById), createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
        }
    }
}