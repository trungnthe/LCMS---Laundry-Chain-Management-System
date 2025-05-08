using API.Controllers;
using BusinessObjects.DTO.ServiceDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Controllers;
using Xunit;

namespace API.Tests.Controllers
{
    public class ServiceControllerTests
    {
        private readonly Mock<IServiceRepository> _mockRepo;
        private readonly ServiceController _controller;

        public ServiceControllerTests()
        {
            _mockRepo = new Mock<IServiceRepository>();
            _controller = new ServiceController(_mockRepo.Object);
        }

        #region GetAllServices Tests
        [Fact]
        public async Task GetAllServices_ReturnsOkResultWithList()
        {
            // Arrange
            var services = new List<ServiceDTO>
            {
                new ServiceDTO { ServiceId = 1, ServiceName = "Service 1" },
                new ServiceDTO { ServiceId = 2, ServiceName = "Service 2" }
            };

            _mockRepo.Setup(repo => repo.GetAllServiceAsync())
                .ReturnsAsync(services);

            // Act
            var result = await _controller.GetAllServices();

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<ServiceDTO>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<List<ServiceDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetAllServices_EmptyList_ReturnsOk()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetAllServiceAsync())
                .ReturnsAsync(new List<ServiceDTO>());

            // Act
            var result = await _controller.GetAllServices();

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<ServiceDTO>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<List<ServiceDTO>>(okResult.Value);
            Assert.Empty(returnValue);
        }
        #endregion

        #region GetServiceById Tests
        [Fact]
        public async Task GetServiceById_ExistingId_ReturnsService()
        {
            // Arrange
            var service = new ServiceDTO { ServiceId = 1, ServiceName = "Service 1" };
            _mockRepo.Setup(repo => repo.GetServiceByIdAsync(1))
                .ReturnsAsync(service);

            // Act
            var result = await _controller.GetServiceById(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<ServiceDTO>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(service, okResult.Value);
        }

        [Fact]
        public async Task GetServiceById_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetServiceByIdAsync(99))
                .ReturnsAsync((ServiceDTO)null);

            // Act
            var result = await _controller.GetServiceById(99);

            // Assert
            var actionResult = Assert.IsType<ActionResult<ServiceDTO>>(result);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }
        #endregion

        #region GetServicesByServiceTypeId Tests
        [Fact]
        public async Task GetServicesByServiceTypeId_ExistingType_ReturnsServices()
        {
            // Arrange
            var services = new List<ServiceDTO>
            {
                new ServiceDTO { ServiceId = 1, ServiceTypeId = 1 },
                new ServiceDTO { ServiceId = 2, ServiceTypeId = 1 }
            };

            _mockRepo.Setup(repo => repo.GetServiceByServiceTypeIdAsync(1))
                .ReturnsAsync(services);

            // Act
            var result = await _controller.GetServicesByServiceTypeId(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<ServiceDTO>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<List<ServiceDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetServicesByServiceTypeId_NonExistingType_ReturnsNotFound()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetServiceByServiceTypeIdAsync(99))
                .ReturnsAsync(new List<ServiceDTO>());

            // Act
            var result = await _controller.GetServicesByServiceTypeId(99);

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<ServiceDTO>>>(result);
            Assert.IsType<NotFoundObjectResult>(actionResult.Result);
        }
        #endregion

        #region CreateService Tests
        [Fact]
        public async Task CreateService_ValidData_ReturnsCreatedAtAction()
        {
            // Arrange
            var dto = new CreateServiceDTO
            {
                ServiceName = "New Service",
                Description = "Description",
                Price = 100,
                ServiceTypeId = 1
            };

            var createdService = new ServiceDTO
            {
                ServiceId = 1,
                ServiceName = dto.ServiceName,
                Description = dto.Description,
                Price = dto.Price,
                ServiceTypeId = dto.ServiceTypeId
            };

            _mockRepo.Setup(repo => repo.CreateServiceAsync(dto))
                .ReturnsAsync(createdService);

            // Act
            var result = await _controller.CreateService(dto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<ServiceDTO>>(result);
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            Assert.Equal(nameof(ServiceController.GetServiceById), createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
            Assert.Equal(createdService, createdAtActionResult.Value);
        }

        [Fact]
        public async Task CreateService_WithImage_ReturnsCreatedWithImagePath()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.Length).Returns(1);
            mockFile.Setup(f => f.FileName).Returns("test.jpg");

            var dto = new CreateServiceDTO
            {
                ServiceName = "New Service",
                Image = mockFile.Object
            };

            var createdService = new ServiceDTO
            {
                ServiceId = 1,
                ServiceName = dto.ServiceName,
                Image = "/uploads/service/test.jpg"
            };

            _mockRepo.Setup(repo => repo.CreateServiceAsync(dto))
                .ReturnsAsync(createdService);

            // Act
            var result = await _controller.CreateService(dto);

            // Assert
            var actionResult = Assert.IsType<ActionResult<ServiceDTO>>(result);
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var returnedService = Assert.IsType<ServiceDTO>(createdAtActionResult.Value);
            Assert.NotNull(returnedService.Image);
        }

        [Fact]
        public async Task CreateService_DuplicateName_ThrowsException()
        {
            // Arrange
            var dto = new CreateServiceDTO { ServiceName = "Existing Service" };

            _mockRepo.Setup(repo => repo.CreateServiceAsync(dto))
                .ThrowsAsync(new Exception("Service name already exists"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.CreateService(dto));
        }
        #endregion

        #region UpdateService Tests
        [Fact]
        public async Task UpdateService_ValidData_ReturnsNoContent()
        {
            // Arrange
            var dto = new UpdateServiceDTO
            {
                ServiceName = "Updated Service",
                Description = "Updated Description",
                Price = 150,
                ServiceTypeId = 2
            };

            _mockRepo.Setup(repo => repo.UpdateServiceAsync(1, dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateService(1, dto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateService_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            var dto = new UpdateServiceDTO { ServiceName = "Updated Service" };

            _mockRepo.Setup(repo => repo.UpdateServiceAsync(99, dto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateService(99, dto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task UpdateService_WithNewImage_ReturnsNoContent()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.Length).Returns(1);
            mockFile.Setup(f => f.FileName).Returns("new.jpg");

            var dto = new UpdateServiceDTO
            {
                ServiceName = "Updated Service",
                Image = mockFile.Object
            };

            _mockRepo.Setup(repo => repo.UpdateServiceAsync(1, dto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateService(1, dto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }
        #endregion

        #region DeleteService Tests
        [Fact]
        public async Task DeleteService_ExistingId_ReturnsNoContent()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteServiceAsync(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteService(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteService_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteServiceAsync(99))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteService(99);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetServiceById_NotFound_ReturnsCorrectMessage()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetServiceByIdAsync(99))
                .ReturnsAsync((ServiceDTO)null);

            // Act
            var result = await _controller.GetServiceById(99);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Equal("Service not found.", notFoundResult.Value);
        }
   

        [Fact]
        public async Task CreateService_NegativePrice_ThrowsArgumentException()
        {
            // Arrange
            var dto = new CreateServiceDTO
            {
                ServiceName = "Test Service",
                Price = -100,
                ServiceTypeId = 1
            };

            _mockRepo.Setup(repo => repo.CreateServiceAsync(dto))
                .ThrowsAsync(new ArgumentException("Price cannot be negative"));

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _controller.CreateService(dto));
        }

        #endregion
    }
}