using APIs.Controllers;
using AutoMapper;
using BusinessObjects.DTO.FeedbackDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
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
    public class FeedbackControllerTests
    {
        private readonly Mock<IFeedbackRepository> _mockFeedbackRepo;
        private readonly Mock<IAttendanceRepository> _mockAttendanceRepo;
        private readonly FeedbackController _controller;
        private readonly Mock<HttpContext> _mockHttpContext;
        private readonly ClaimsPrincipal _userClaims;

        public FeedbackControllerTests()
        {
            _mockFeedbackRepo = new Mock<IFeedbackRepository>();
            _mockAttendanceRepo = new Mock<IAttendanceRepository>();

            // Setup mock HTTP context with user claims
            _mockHttpContext = new Mock<HttpContext>();
            _userClaims = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim("AccountId", "123"),
                new Claim(ClaimTypes.Role, "Staff")
            }, "mock"));
            _mockHttpContext.Setup(x => x.User).Returns(_userClaims);

            _controller = new FeedbackController(_mockFeedbackRepo.Object, _mockAttendanceRepo.Object)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = _mockHttpContext.Object
                }
            };
        }

        [Fact]
        public async Task CreateFeedback_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var feedbackDto = new CreateFeedbackDTO
            {
                BookingDetailId = 1,
                Rating = 5,
                Comment = "Great service!"
            };

            var expectedResult = new FeedbackDTO
            {
                FeedbackId = 1,
                BookingDetailId = 1,
                Rating = 5,
                Comment = "Great service!"
            };

            _mockFeedbackRepo.Setup(x => x.CreateFeedbackAsync(feedbackDto))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.CreateFeedback(feedbackDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedResult, okResult.Value);
        }

        [Fact]
        public async Task CreateFeedback_ReturnsUnauthorized_WhenUnauthorizedAccessException()
        {
            // Arrange
            var feedbackDto = new CreateFeedbackDTO();
            _mockFeedbackRepo.Setup(x => x.CreateFeedbackAsync(feedbackDto))
                .ThrowsAsync(new UnauthorizedAccessException("Unauthorized"));

            // Act
            var result = await _controller.CreateFeedback(feedbackDto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task ReplyToFeedback_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var parentFeedbackId = 1;
            var replyDto = new ReplyFeedbackDTO
            {
                BookingDetailId = 1,
                Comment = "Thank you for your feedback!"
            };

            var expectedResult = new FeedbackDTO
            {
                FeedbackId = 2,
                ParentFeedbackId = 1,
                Comment = "Thank you for your feedback!"
            };

            _mockFeedbackRepo.Setup(x => x.ReplyToFeedbackAsync(parentFeedbackId, replyDto))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.ReplyToFeedback(parentFeedbackId, replyDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedResult, okResult.Value);
        }

        [Fact]
        public async Task ReplyToFeedback_ReturnsBadRequest_WhenAccountIdMissing()
        {
            // Arrange
            var controller = new FeedbackController(_mockFeedbackRepo.Object, _mockAttendanceRepo.Object)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = new DefaultHttpContext()
                }
            };

            // Act
            var result = await controller.ReplyToFeedback(1, new ReplyFeedbackDTO());

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Không tìm thấy ID nhân viên trong token", badRequestResult.Value.GetType().GetProperty("Message").GetValue(badRequestResult.Value));
        }

        [Fact]
        public async Task UpdateFeedback_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var feedbackId = 1;
            var updateDto = new UpdateFeedbackDTO
            {
                Rating = 4,
                Comment = "Updated comment"
            };

            var expectedResult = new FeedbackDTO
            {
                FeedbackId = 1,
                Rating = 4,
                Comment = "Updated comment"
            };

            _mockFeedbackRepo.Setup(x => x.UpdateFeedbackAsync(feedbackId, updateDto))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.UpdateFeedback(feedbackId, updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedResult, okResult.Value);
        }

        [Fact]
        public async Task UpdateFeedback_ReturnsNotFound_WhenFeedbackNotFound()
        {
            // Arrange
            var feedbackId = 1;
            var updateDto = new UpdateFeedbackDTO();

            _mockFeedbackRepo.Setup(x => x.UpdateFeedbackAsync(feedbackId, updateDto))
                .ThrowsAsync(new KeyNotFoundException("Not found"));

            // Act
            var result = await _controller.UpdateFeedback(feedbackId, updateDto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Not found", notFoundResult.Value.GetType().GetProperty("message").GetValue(notFoundResult.Value));
        }

        [Fact]
        public async Task GetFeedbacksByBookingDetail_ReturnsOk_WhenFeedbacksExist()
        {
            // Arrange
            var bookingDetailId = 1;
            var expectedFeedbacks = new List<FeedbackDTO>
            {
                new FeedbackDTO { FeedbackId = 1, BookingDetailId = 1 }
            };

            _mockFeedbackRepo.Setup(x => x.GetFeedbacksByBookingDetailIdAsync(bookingDetailId))
                .ReturnsAsync(expectedFeedbacks);

            // Act
            var result = await _controller.GetFeedbacksByBookingDetail(bookingDetailId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedFeedbacks, okResult.Value);
        }

        [Fact]
        public async Task GetFeedbacksByBookingDetail_ReturnsNotFound_WhenNoFeedbacks()
        {
            // Arrange
            var bookingDetailId = 1;
            _mockFeedbackRepo.Setup(x => x.GetFeedbacksByBookingDetailIdAsync(bookingDetailId))
                .ReturnsAsync(new List<FeedbackDTO>());

            // Act
            var result = await _controller.GetFeedbacksByBookingDetail(bookingDetailId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Không có feedback nào cho BookingDetailId này.", notFoundResult.Value.GetType().GetProperty("message").GetValue(notFoundResult.Value));
        }

        [Fact]
        public async Task GetAllFeedbacksByBranch_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var expectedFeedbacks = new List<FeedbackGetAllDTO>
            {
                new FeedbackGetAllDTO { FeedbackId = 1 }
            };

            _mockAttendanceRepo.Setup(x => x.GetBranchIdByEmployeeId(123))
                .ReturnsAsync(1);
            _mockFeedbackRepo.Setup(x => x.GetAllFeedbacksByBranchAsync(1))
                .ReturnsAsync(expectedFeedbacks);

            // Act
            var result = await _controller.GetAllFeedbacksByBranch();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedFeedbacks, okResult.Value);
        }

        [Fact]
        public async Task GetAllFeedbacksByBranch_ReturnsBadRequest_WhenAccountIdMissing()
        {
            // Arrange
            var controller = new FeedbackController(_mockFeedbackRepo.Object, _mockAttendanceRepo.Object)
            {
                ControllerContext = new ControllerContext()
                {
                    HttpContext = new DefaultHttpContext()
                }
            };

            // Act
            var result = await controller.GetAllFeedbacksByBranch();

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Không tìm thấy ID nhân viên trong token", badRequestResult.Value.GetType().GetProperty("Message").GetValue(badRequestResult.Value));
        }

        [Fact]
        public async Task GetAllFeedbacksByBranch_ReturnsNotFound_WhenNoFeedbacks()
        {
            // Arrange
            _mockAttendanceRepo.Setup(x => x.GetBranchIdByEmployeeId(123))
                .ReturnsAsync(1);
            _mockFeedbackRepo.Setup(x => x.GetAllFeedbacksByBranchAsync(1))
                .ReturnsAsync((List<FeedbackGetAllDTO>)null);

            // Act
            var result = await _controller.GetAllFeedbacksByBranch();

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Không có feedback nào cho BookingDetailId này.", notFoundResult.Value.GetType().GetProperty("message").GetValue(notFoundResult.Value));
        }

        [Fact]
        public async Task CreateFeedback_ReturnsOk_EvenWhenRatingIsInvalid()
        {
            // Arrange
            var feedbackDto = new CreateFeedbackDTO
            {
                BookingDetailId = 1,
                Rating = 6, // Invalid rating (should be 1-5)
                Comment = "Test comment"
            };

            var expectedResult = new FeedbackDTO
            {
                FeedbackId = 1,
                BookingDetailId = 1,
                Rating = 6,
                Comment = "Test comment"
            };

            _mockFeedbackRepo.Setup(x => x.CreateFeedbackAsync(feedbackDto))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.CreateFeedback(feedbackDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedResult, okResult.Value);
        }

        [Fact]
        public async Task CreateFeedback_Returns500_WhenInputIsNull()
        {
            // Arrange
            _mockFeedbackRepo.Setup(x => x.CreateFeedbackAsync(null))
                .ThrowsAsync(new ArgumentNullException());

            // Act
            var result = await _controller.CreateFeedback(null);

            // Assert
            Assert.IsType<ObjectResult>(result);
            var objectResult = (ObjectResult)result;
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task CreateFeedback_Returns500_WhenDatabaseErrorOccurs()
        {
            // Arrange
            var feedbackDto = new CreateFeedbackDTO
            {
                BookingDetailId = 1,
                Rating = 5,
                Comment = "Great service!"
            };

            _mockFeedbackRepo.Setup(x => x.CreateFeedbackAsync(feedbackDto))
                .ThrowsAsync(new Exception("Database connection failed"));

            // Act
            var result = await _controller.CreateFeedback(feedbackDto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task UpdateFeedback_ReturnsUnauthorized_WhenUpdatingOthersFeedback()
        {
            // Arrange
            var feedbackId = 1;
            var updateDto = new UpdateFeedbackDTO
            {
                Rating = 4,
                Comment = "Updated comment"
            };

            _mockFeedbackRepo.Setup(x => x.UpdateFeedbackAsync(feedbackId, updateDto))
                .ThrowsAsync(new UnauthorizedAccessException("Không có quyền chỉnh sửa feedback này"));

            // Act
            var result = await _controller.UpdateFeedback(feedbackId, updateDto);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Không có quyền chỉnh sửa feedback này",
                unauthorizedResult.Value.GetType().GetProperty("message").GetValue(unauthorizedResult.Value));
        }

        [Fact]
        public async Task UpdateFeedback_ReturnsBadRequest_WhenUpdatingAfter3Days()
        {
            // Arrange
            var feedbackId = 1;
            var updateDto = new UpdateFeedbackDTO
            {
                Rating = 4,
                Comment = "Updated comment"
            };

            _mockFeedbackRepo.Setup(x => x.UpdateFeedbackAsync(feedbackId, updateDto))
                .ThrowsAsync(new InvalidOperationException("Bạn chỉ có thể chỉnh sửa phản hồi trong vòng 3 ngày"));

            // Act
            var result = await _controller.UpdateFeedback(feedbackId, updateDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Bạn chỉ có thể chỉnh sửa phản hồi trong vòng 3 ngày",
                badRequestResult.Value.GetType().GetProperty("message").GetValue(badRequestResult.Value));
        }
    }
}