using APIs.Controllers;
using AutoMapper;
using BusinessObjects.DTO.GuesDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace APIs.Tests.Controllers
{
    public class GuestControllerTests
    {
        private readonly Mock<IGuest> _mockGuestRepo;
        private readonly GuestController _controller;

        public GuestControllerTests()
        {
            _mockGuestRepo = new Mock<IGuest>();
            _controller = new GuestController(_mockGuestRepo.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult_WithListOfGuests()
        {
            // Arrange
            var expectedGuests = new List<GuestDTO>
            {
                new GuestDTO { GuestId = 1, FullName = "John Doe", PhoneNumber = "123456789", Email = "john@example.com" },
                new GuestDTO { GuestId = 2, FullName = "Jane Smith", PhoneNumber = "987654321", Email = "jane@example.com" }
            };

            _mockGuestRepo.Setup(repo => repo.GetAll())
                .ReturnsAsync(expectedGuests);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<GuestDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetGuestById_ReturnsOkResult_WhenGuestExists()
        {
            // Arrange
            var expectedGuest = new GuestDTO
            {
                GuestId = 1,
                FullName = "John Doe",
                PhoneNumber = "123456789",
                Email = "john@example.com"
            };

            _mockGuestRepo.Setup(repo => repo.GetGuestById(1))
                .ReturnsAsync(expectedGuest);

            // Act
            var result = await _controller.GetGuestById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedGuest, okResult.Value);
        }

        [Fact]
        public async Task GetGuestById_ReturnsNotFound_WhenGuestDoesNotExist()
        {
            // Arrange
            _mockGuestRepo.Setup(repo => repo.GetGuestById(1))
                .ThrowsAsync(new Exception("Guest not found"));

            // Act
            var result = await _controller.GetGuestById(1);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Guest not found", notFoundResult.Value.GetType().GetProperty("message").GetValue(notFoundResult.Value));
        }

        [Fact]
        public async Task CreateGuest_ReturnsCreatedAtAction_WhenValidInput()
        {
            // Arrange
            var guestDto = new GuestCreateDTO
            {
                FullName = "New Guest",
                PhoneNumber = "111222333",
                Email = "new@example.com"
            };

            var createdGuest = new GuestDTO
            {
                GuestId = 3,
                FullName = "New Guest",
                PhoneNumber = "111222333",
                Email = "new@example.com"
            };

            _mockGuestRepo.Setup(repo => repo.CreateGuest(guestDto))
                .ReturnsAsync(createdGuest);

            // Act
            var result = await _controller.CreateGuest(guestDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(GuestController.GetGuestById), createdAtActionResult.ActionName);
            Assert.Equal(3, ((GuestDTO)createdAtActionResult.Value).GuestId);
        }

        [Fact]
        public async Task CreateGuest_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            var guestDto = new GuestCreateDTO();
            _controller.ModelState.AddModelError("FullName", "Required");

            // Act
            var result = await _controller.CreateGuest(guestDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task UpdateGuest_ReturnsOkResult_WhenValidInput()
        {
            // Arrange
            var guestDto = new GuestCreateDTO
            {
                FullName = "Updated Guest",
                PhoneNumber = "444555666",
                Email = "updated@example.com"
            };

            var updatedGuest = new GuestDTO
            {
                GuestId = 1,
                FullName = "Updated Guest",
                PhoneNumber = "444555666",
                Email = "updated@example.com"
            };

            _mockGuestRepo.Setup(repo => repo.UpdateGuest(1, guestDto))
                .ReturnsAsync(updatedGuest);

            // Act
            var result = await _controller.UpdateGuest(1, guestDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(updatedGuest, okResult.Value);
        }

        [Fact]
        public async Task UpdateGuest_ReturnsNotFound_WhenGuestDoesNotExist()
        {
            // Arrange
            var guestDto = new GuestCreateDTO();
            _mockGuestRepo.Setup(repo => repo.UpdateGuest(1, guestDto))
                .ThrowsAsync(new Exception("Guest not found"));

            // Act
            var result = await _controller.UpdateGuest(1, guestDto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Guest not found", notFoundResult.Value.GetType().GetProperty("message").GetValue(notFoundResult.Value));
        }

        [Fact]
        public async Task DeleteGuest_ReturnsNoContent_WhenSuccessful()
        {
            // Arrange
            _mockGuestRepo.Setup(repo => repo.DeleteGuest(1))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteGuest(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteGuest_ReturnsNotFound_WhenGuestDoesNotExist()
        {
            // Arrange
            _mockGuestRepo.Setup(repo => repo.DeleteGuest(1))
                .ThrowsAsync(new Exception("Guest not found"));

            // Act
            var result = await _controller.DeleteGuest(1);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Guest not found", notFoundResult.Value.GetType().GetProperty("message").GetValue(notFoundResult.Value));
        }

        [Fact]
        public async Task CreateGuest_ReturnsBadRequest_WhenFullNameIsTooLong()
        {
            // Arrange
            var guestDto = new GuestCreateDTO
            {
                FullName = new string('A', 101), // Giả sử giới hạn là 100 ký tự
                PhoneNumber = "123456789",
                Email = "test@example.com"
            };

            _controller.ModelState.AddModelError("FullName", "Maximum length is 100 characters");

            // Act
            var result = await _controller.CreateGuest(guestDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateGuest_ReturnsBadRequest_WhenPhoneNumberIsInvalid()
        {
            // Arrange
            var guestDto = new GuestCreateDTO
            {
                FullName = "Test Guest",
                PhoneNumber = "not-a-phone",
                Email = "test@example.com"
            };

            _controller.ModelState.AddModelError("PhoneNumber", "Invalid phone number format");

            // Act
            var result = await _controller.CreateGuest(guestDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }


        [Fact]
        public async Task CreateGuest_ThrowsNullReferenceException_WhenInputIsNull()
        {
            // Act & Assert
            await Assert.ThrowsAsync<NullReferenceException>(() => _controller.CreateGuest(null));
        }

        [Fact]
        public async Task CreateGuest_ReturnsBadRequest_WhenEmailIsInvalid()
        {
            // Arrange
            var guestDto = new GuestCreateDTO
            {
                FullName = "Test Guest",
                PhoneNumber = "123456789",
                Email = "invalid-email"
            };

            _controller.ModelState.AddModelError("Email", "Invalid email format");

            // Act
            var result = await _controller.CreateGuest(guestDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateGuest_ThrowsException_WhenDatabaseErrorOccurs()
        {
            // Arrange
            var guestDto = new GuestCreateDTO
            {
                FullName = "Test Guest",
                PhoneNumber = "123456789",
                Email = "test@example.com"
            };

            _mockGuestRepo.Setup(repo => repo.CreateGuest(guestDto))
                .ThrowsAsync(new Exception("Database connection failed"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _controller.CreateGuest(guestDto));
        }

        [Fact]
        public async Task UpdateGuest_ReturnsOk_EvenWhenIdIsZero()
        {
            // Arrange
            var guestDto = new GuestCreateDTO
            {
                FullName = "Test Guest",
                PhoneNumber = "123456789",
                Email = "test@example.com"
            };

            var expectedGuest = new GuestDTO
            {
                GuestId = 0,
                FullName = "Test Guest",
                PhoneNumber = "123456789",
                Email = "test@example.com"
            };

            _mockGuestRepo.Setup(repo => repo.UpdateGuest(0, guestDto))
                .ReturnsAsync(expectedGuest);

            // Act
            var result = await _controller.UpdateGuest(0, guestDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
    }
}