using APIs.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.IO;
using System.Threading.Tasks;
using Xunit;

namespace APIs.Tests.Controllers
{
    public class UploadControllerTests
    {
        private readonly Mock<IWebHostEnvironment> _mockEnv;
        private readonly UploadController _controller;

        public UploadControllerTests()
        {
            _mockEnv = new Mock<IWebHostEnvironment>();
            _controller = new UploadController(_mockEnv.Object);
        }

        [Fact]
        public async Task UploadImage_NullFile_ReturnsBadRequest()
        {
            // Arrange
            IFormFile nullFile = null;

            // Act
            var result = await _controller.UploadImage(nullFile);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("File không hợp lệ.", badRequestResult.Value);
        }

        [Fact]
        public async Task UploadImage_EmptyFile_ReturnsBadRequest()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.Length).Returns(0);

            // Act
            var result = await _controller.UploadImage(mockFile.Object);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("File không hợp lệ.", badRequestResult.Value);
        }

        [Fact]
        public async Task UploadImage_ValidFile_ReturnsOkWithUrl()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            var content = "test content";
            var fileName = "test.jpg";
            var ms = new MemoryStream();
            var writer = new StreamWriter(ms);
            writer.Write(content);
            writer.Flush();
            ms.Position = 0;

            mockFile.Setup(f => f.FileName).Returns(fileName);
            mockFile.Setup(f => f.Length).Returns(ms.Length);
            mockFile.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), default))
                .Returns((Stream stream, CancellationToken token) => ms.CopyToAsync(stream));

            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            _mockEnv.Setup(m => m.WebRootPath).Returns(webRootPath);

            // Act
            var result = await _controller.UploadImage(mockFile.Object);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var resultValue = okResult.Value as dynamic; // Sửa cách truy cập dynamic object
            Assert.NotNull(resultValue);

            // Cách 1: Sử dụng reflection
            var urlProperty = okResult.Value.GetType().GetProperty("url");
            Assert.NotNull(urlProperty);
            var urlValue = urlProperty.GetValue(okResult.Value) as string;
            Assert.NotNull(urlValue);
            Assert.Contains("/uploads/", urlValue);

            // Hoặc Cách 2: Chuyển thành Dictionary
            // var dictionary = new RouteValueDictionary(okResult.Value);
            // Assert.True(dictionary.ContainsKey("url"));
            // Assert.Contains("/uploads/", dictionary["url"].ToString());

            // Cleanup
            var uploadsFolder = Path.Combine(webRootPath, "uploads");
            if (Directory.Exists(uploadsFolder))
            {
                Directory.Delete(uploadsFolder, true);
            }
        }

        [Fact]
        public async Task UploadImage_DirectoryCreationFailure_StillReturnsSuccess()
        {
            // Arrange
            var mockFile = new Mock<IFormFile>();
            mockFile.Setup(f => f.Length).Returns(1);
            mockFile.Setup(f => f.FileName).Returns("test.jpg");

            // Sử dụng đường dẫn không hợp lệ
            _mockEnv.Setup(m => m.WebRootPath).Returns("invalid_path");

            // Act
            var result = await _controller.UploadImage(mockFile.Object);

            // Assert - Kiểm tra vẫn trả về thành công
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void GetImage_NonExistentFile_ReturnsNotFound()
        {
            // Arrange
            var fileName = "nonexistent.jpg";
            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            _mockEnv.Setup(m => m.WebRootPath).Returns(webRootPath);

            // Act
            var result = _controller.GetImage(fileName);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Ảnh không tồn tại.", notFoundResult.Value);
        }

        [Fact]
        public void GetImage_ValidFile_ReturnsFileResult()
        {
            // Arrange
            var fileName = "test.jpg";
            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads", "avatar-employee");

            Directory.CreateDirectory(uploadsFolder);
            var filePath = Path.Combine(uploadsFolder, fileName);
            File.WriteAllText(filePath, "test content");

            _mockEnv.Setup(m => m.WebRootPath).Returns(webRootPath);

            // Act
            var result = _controller.GetImage(fileName);

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal("image/jpeg", fileResult.ContentType);

            // Cleanup
            if (Directory.Exists(uploadsFolder))
            {
                Directory.Delete(uploadsFolder, true);
            }
        }

        [Fact]
        public void GetImage_UnsupportedExtension_ReturnsOctetStream()
        {
            // Arrange
            var fileName = "test.xyz";
            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads", "avatar-employee");

            Directory.CreateDirectory(uploadsFolder);
            var filePath = Path.Combine(uploadsFolder, fileName);
            File.WriteAllText(filePath, "test content");

            _mockEnv.Setup(m => m.WebRootPath).Returns(webRootPath);

            // Act
            var result = _controller.GetImage(fileName);

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal("application/octet-stream", fileResult.ContentType);

            // Cleanup
            if (Directory.Exists(uploadsFolder))
            {
                Directory.Delete(uploadsFolder, true);
            }
        }
    }
}