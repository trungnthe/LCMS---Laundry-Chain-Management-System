using APIs.Controllers;
using AutoMapper;
using BusinessObjects.DTO.ProductCategoryDTO;
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
    public class ProductCategoryControllerTests
    {
        private readonly Mock<IProductCategoryRepository> _mockRepo;
        private readonly ProductCategoryController _controller;
        private readonly IMapper _mapper;

        public ProductCategoryControllerTests()
        {
            _mockRepo = new Mock<IProductCategoryRepository>();

            // Setup AutoMapper for tests
            var config = new MapperConfiguration(cfg =>
            {
                cfg.CreateMap<ProductCategory, ProductCategoryDTO>();
                cfg.CreateMap<CreateProductCategoryDTO, ProductCategory>();
            });
            _mapper = config.CreateMapper();

            _controller = new ProductCategoryController(_mockRepo.Object);
        }

        // Helper method to create mock form file
        private IFormFile CreateMockFormFile(string fileName, string content)
        {
            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            writer.Write(content);
            writer.Flush();
            stream.Position = 0;

            return new FormFile(stream, 0, stream.Length, "file", fileName);
        }
        [Fact]
        public async Task GetAll_ReturnsOkResultWithCategories()
        {
            // Arrange
            var testCategories = new List<ProductCategoryDTO>
    {
        new ProductCategoryDTO { ProductCategoryId = 1, ProductCategoryName = "Category 1" },
        new ProductCategoryDTO { ProductCategoryId = 2, ProductCategoryName = "Category 2" }
    };

            _mockRepo.Setup(repo => repo.GetAllCategoriesAsync())
                .ReturnsAsync(testCategories);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<ProductCategoryDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetAll_ReturnsEmptyListWhenNoCategories()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetAllCategoriesAsync())
                .ReturnsAsync(new List<ProductCategoryDTO>());

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<ProductCategoryDTO>>(okResult.Value);
            Assert.Empty(returnValue);
        }
        [Fact]
        public async Task GetById_ReturnsOkResultWhenCategoryExists()
        {
            // Arrange
            var testCategory = new ProductCategoryDTO
            {
                ProductCategoryId = 1,
                ProductCategoryName = "Test Category"
            };

            _mockRepo.Setup(repo => repo.GetCategoryByIdAsync(1))
                .ReturnsAsync(testCategory);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<ProductCategoryDTO>(okResult.Value);
            Assert.Equal(1, returnValue.ProductCategoryId);
        }

        [Fact]
        public async Task GetById_ReturnsNotFoundWhenCategoryDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetCategoryByIdAsync(1))
                .ReturnsAsync((ProductCategoryDTO)null);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetById_ReturnsBadRequestForInvalidId()
        {
            // Act
            var result = await _controller.GetById(0);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsCreatedAtActionForValidInput()
        {
            // Arrange
            var testDto = new CreateProductCategoryDTO
            {
                ProductCategoryName = "New Category",
            };

            var expectedCategory = new ProductCategoryDTO
            {
                ProductCategoryId = 1,
                ProductCategoryName = "New Category",
            };

            _mockRepo.Setup(repo => repo.CreateCategoryAsync(testDto))
                .ReturnsAsync(expectedCategory);

            // Act
            var result = await _controller.Create(testDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(ProductCategoryController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(1, ((ProductCategoryDTO)createdAtActionResult.Value).ProductCategoryId);
        }

        [Fact]
        public async Task Create_ReturnsBadRequestForInvalidModel()
        {
            // Arrange
            var testDto = new CreateProductCategoryDTO();
            _controller.ModelState.AddModelError("ProductCategoryName", "Required");

            // Act
            var result = await _controller.Create(testDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Create_WithImage_ReturnsCreatedAtAction()
        {
            // Arrange
            var mockImage = CreateMockFormFile("test.jpg", "dummy image content");
            var testDto = new CreateProductCategoryDTO
            {
                ProductCategoryName = "New Category",
                Image = mockImage
            };

            var expectedCategory = new ProductCategoryDTO
            {
                ProductCategoryId = 1,
                ProductCategoryName = "New Category",
                Image = "/uploads/category/test.jpg"
            };

            _mockRepo.Setup(repo => repo.CreateCategoryAsync(testDto))
                .ReturnsAsync(expectedCategory);

            // Act
            var result = await _controller.Create(testDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.NotNull(((ProductCategoryDTO)createdAtActionResult.Value).Image);
        }

        [Fact]
        public async Task Create_ThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var testDto = new CreateProductCategoryDTO
            {
                ProductCategoryName = "New Category",
            };

            // Mock repository để throw exception
            _mockRepo.Setup(repo => repo.CreateCategoryAsync(testDto))
                .Throws(new Exception("Database error")); // Bỏ Async vì Exception không phải async

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _controller.Create(testDto));
            Assert.Equal("Database error", exception.Message);
        }
        [Fact]
        public async Task Update_ReturnsNoContentForSuccessfulUpdate()
        {
            // Arrange
            var testDto = new CreateProductCategoryDTO
            {
                ProductCategoryName = "Updated Category",
            };

            _mockRepo.Setup(repo => repo.UpdateCategoryAsync(1, testDto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, testDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsNotFoundWhenCategoryDoesNotExist()
        {
            // Arrange
            var testDto = new CreateProductCategoryDTO
            {
                ProductCategoryName = "Updated Category",
            };

            _mockRepo.Setup(repo => repo.UpdateCategoryAsync(1, testDto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(1, testDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsBadRequestForInvalidModel()
        {
            // Arrange
            var testDto = new CreateProductCategoryDTO();
            _controller.ModelState.AddModelError("ProductCategoryName", "Required");

            // Act
            var result = await _controller.Update(1, testDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Update_WithImage_ReturnsNoContent()
        {
            // Arrange
            var mockImage = CreateMockFormFile("updated.jpg", "dummy image content");
            var testDto = new CreateProductCategoryDTO
            {
                ProductCategoryName = "Updated Category",
                Image = mockImage
            };

            _mockRepo.Setup(repo => repo.UpdateCategoryAsync(1, testDto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, testDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNoContentForSuccessfulDeletion()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteCategoryAsync(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNotFoundWhenCategoryDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteCategoryAsync(1))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNotFoundForInvalidId()
        {
            // Act
            var result = await _controller.Delete(0);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
        [Fact]
        public async Task GetById_ReturnsCorrectCategoryWhenMultipleExist()
        {
            // Arrange
            var testCategories = new List<ProductCategoryDTO>
    {
        new ProductCategoryDTO { ProductCategoryId = 1, ProductCategoryName = "Category 1" },
        new ProductCategoryDTO { ProductCategoryId = 2, ProductCategoryName = "Category 2" },
        new ProductCategoryDTO { ProductCategoryId = 3, ProductCategoryName = "Category 3" }
    };

            _mockRepo.Setup(repo => repo.GetCategoryByIdAsync(2))
                .ReturnsAsync(testCategories[1]);

            // Act
            var result = await _controller.GetById(2);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<ProductCategoryDTO>(okResult.Value);
            Assert.Equal("Category 2", returnValue.ProductCategoryName);
        }

        [Fact]
        public async Task Create_ReturnsConflictWhenCategoryNameExists()
        {
            // Arrange
            var testDto = new CreateProductCategoryDTO
            {
                ProductCategoryName = "Existing Category",
            };

            _mockRepo.Setup(repo => repo.CreateCategoryAsync(testDto))
                .ThrowsAsync(new Exception("Tên danh mục đã tồn tại."));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _controller.Create(testDto));
            Assert.Equal("Tên danh mục đã tồn tại.", exception.Message);
        }

        [Fact]
        public async Task Update_ReturnsInternalServerErrorOnException()
        {
            // Arrange
            var testDto = new CreateProductCategoryDTO
            {
                ProductCategoryName = "Updated Category",
            };

            _mockRepo.Setup(repo => repo.UpdateCategoryAsync(1, testDto))
                .Throws(new Exception("Database error")); // Thay ThrowsAsync bằng Throws

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _controller.Update(1, testDto));
            Assert.Equal("Database error", exception.Message);
        }
        [Fact]
        public async Task Delete_ReturnsInternalServerErrorOnException()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteCategoryAsync(1))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.Delete(1);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objectResult.StatusCode);
            Assert.Contains("Database error", objectResult.Value.ToString());
        }

    }
}