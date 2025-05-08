using APIs.Controllers;
using BusinessObjects.DTO.ProductDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace ProductAPI.Tests
{
    public class ProductControllerTests
    {
        private readonly Mock<IProductRepository> _mockRepo;
        private readonly ProductController _controller;

        public ProductControllerTests()
        {
            _mockRepo = new Mock<IProductRepository>();
            _controller = new ProductController(_mockRepo.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult_WithListOfProducts()
        {
            // Arrange
            var testProducts = GetTestProducts();
            _mockRepo.Setup(repo => repo.GetAllProductsAsync())
                .ReturnsAsync(testProducts);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnProducts = Assert.IsType<List<ProductDTO>>(okResult.Value);
            Assert.Equal(2, returnProducts.Count);
        }

        [Fact]
        public async Task GetById_ReturnsOkResult_WhenProductExists()
        {
            // Arrange
            var testProduct = GetTestProducts()[0];
            _mockRepo.Setup(repo => repo.GetProductByIdAsync(1))
                .ReturnsAsync(testProduct);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnProduct = Assert.IsType<ProductDTO>(okResult.Value);
            Assert.Equal(testProduct.ProductName, returnProduct.ProductName);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetProductByIdAsync(999))
                .ReturnsAsync((ProductDTO)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsCreatedAtAction_WithNewProduct()
        {
            // Arrange
            var newProductDto = new CreateProductDTO
            {
                ProductName = "New Product",
                Price = 19.99m,
                ProductCategoryId = 1
            };

            var expectedProduct = new ProductDTO
            {
                ProductId = 3,
                ProductName = "New Product",
                Price = 19.99m,
                ProductCategoryId = 1,
                ProductCategoryName = "Category 1"
            };

            _mockRepo.Setup(repo => repo.CreateProductAsync(newProductDto))
                .ReturnsAsync(expectedProduct);

            // Act
            var result = await _controller.Create(newProductDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnProduct = Assert.IsType<ProductDTO>(createdAtActionResult.Value);
            Assert.Equal(expectedProduct.ProductName, returnProduct.ProductName);
            Assert.Equal("GetById", createdAtActionResult.ActionName);
        }

        [Fact]
        public async Task Update_ReturnsNoContent_WhenProductExists()
        {
            // Arrange
            var updateDto = new CreateProductDTO
            {
                ProductName = "Updated Product",
                Price = 29.99m,
                ProductCategoryId = 2
            };

            _mockRepo.Setup(repo => repo.UpdateProductAsync(1, updateDto))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Update(1, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Update_ReturnsNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            var updateDto = new CreateProductDTO
            {
                ProductName = "Updated Product",
                Price = 29.99m,
                ProductCategoryId = 2
            };

            _mockRepo.Setup(repo => repo.UpdateProductAsync(999, updateDto))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Update(999, updateDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNoContent_WhenProductExists()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteProductAsync(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_ReturnsNotFound_WhenProductDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.DeleteProductAsync(999))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.Delete(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetProductByCategoryById_ReturnsOkResult_WhenProductsExist()
        {
            // Arrange
            var testProducts = new List<ProductDTO>
            {
                new ProductDTO { ProductId = 1, ProductName = "Product 1", ProductCategoryId = 1 },
                new ProductDTO { ProductId = 2, ProductName = "Product 2", ProductCategoryId = 1 }
            };

            _mockRepo.Setup(repo => repo.GetProductByCategoryById(1))
                .ReturnsAsync(testProducts);

            // Act
            var result = await _controller.GetProductByCategoryById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnProducts = Assert.IsType<List<ProductDTO>>(okResult.Value);
            Assert.Equal(2, returnProducts.Count);
        }

        [Fact]
        public async Task GetProductByCategoryById_ReturnsNotFound_WhenNoProductsExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetProductByCategoryById(999))
                .ReturnsAsync((List<ProductDTO>)null);

            // Act
            var result = await _controller.GetProductByCategoryById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Create_WithImage_ReturnsCreatedAtAction_WithImageUrl()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.FileName).Returns("test.jpg");
            mockFile.Setup(f => f.Length).Returns(1024);

            var newProductDto = new CreateProductDTO
            {
                ProductName = "Product with Image",
                Price = 19.99m,
                ProductCategoryId = 1,
                Image = mockFile.Object
            };

            var expectedProduct = new ProductDTO
            {
                ProductId = 4,
                ProductName = "Product with Image",
                Price = 19.99m,
                ProductCategoryId = 1,
                ProductCategoryName = "Category 1",
                Image = "/uploads/product/guid_test.jpg"
            };

            _mockRepo.Setup(repo => repo.CreateProductAsync(newProductDto))
                .ReturnsAsync(expectedProduct);

            // Act
            var result = await _controller.Create(newProductDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnProduct = Assert.IsType<ProductDTO>(createdAtActionResult.Value);
            Assert.NotNull(returnProduct.Image);
        }

        private List<ProductDTO> GetTestProducts()
        {
            return new List<ProductDTO>
            {
                new ProductDTO
                {
                    ProductId = 1,
                    ProductName = "Product 1",
                    Price = 10.99m,
                    ProductCategoryId = 1,
                    ProductCategoryName = "Category 1"
                },
                new ProductDTO
                {
                    ProductId = 2,
                    ProductName = "Product 2",
                    Price = 20.99m,
                    ProductCategoryId = 2,
                    ProductCategoryName = "Category 2"
                }
            };
        }

       

        [Fact]
        public async Task Create_AllowsNegativePriceInController()
        {
            // Arrange
            var invalidDto = new CreateProductDTO
            {
                ProductName = "Invalid Product",
                Price = -10.99m,
                ProductCategoryId = 1
            };

            var expectedProduct = new ProductDTO
            {
                ProductId = 1,
                ProductName = "Invalid Product",
                Price = -10.99m,
                ProductCategoryId = 1
            };

            _mockRepo.Setup(repo => repo.CreateProductAsync(invalidDto))
                .ReturnsAsync(expectedProduct);

            // Act
            var result = await _controller.Create(invalidDto);

            // Assert
            var createdAtResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnedProduct = Assert.IsType<ProductDTO>(createdAtResult.Value);
            Assert.Equal(-10.99m, returnedProduct.Price);
        }
        [Fact]
        public async Task Create_ReturnsCreatedResult_WhenProductIsValid()
        {
            // Arrange
            var validDto = new CreateProductDTO
            {
                ProductName = "New Product",
                Price = 10.99m,
                ProductCategoryId = 1
            };

            var expectedProduct = new ProductDTO
            {
                ProductId = 1,
                ProductName = "New Product",
                Price = 10.99m,
                ProductCategoryId = 1
            };

            _mockRepo.Setup(repo => repo.CreateProductAsync(validDto))
                .ReturnsAsync(expectedProduct);

            // Act
            var result = await _controller.Create(validDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(ProductController.GetById), createdAtActionResult.ActionName);
            Assert.Equal(expectedProduct.ProductId, ((ProductDTO)createdAtActionResult.Value).ProductId);
        }



        [Fact]
        public async Task Create_WithImage_ReturnsCreatedResult()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.FileName).Returns("test.jpg");
            mockFile.Setup(f => f.Length).Returns(1024);

            var dtoWithImage = new CreateProductDTO
            {
                ProductName = "Product with Image",
                Price = 19.99m,
                ProductCategoryId = 1,
                Image = mockFile.Object
            };

            var expectedProduct = new ProductDTO
            {
                ProductId = 3,
                ProductName = "Product with Image",
                Price = 19.99m,
                ProductCategoryId = 1,
                Image = "/uploads/product/guid_test.jpg"
            };

            _mockRepo.Setup(repo => repo.CreateProductAsync(dtoWithImage))
                .ReturnsAsync(expectedProduct);

            // Act
            var result = await _controller.Create(dtoWithImage);

            // Assert
            var createdAtResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnedProduct = Assert.IsType<ProductDTO>(createdAtResult.Value);
            Assert.NotNull(returnedProduct.Image);
        }
    }
}