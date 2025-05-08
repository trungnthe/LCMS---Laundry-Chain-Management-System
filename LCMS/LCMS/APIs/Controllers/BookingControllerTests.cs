using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using APIs.Controllers;
using BusinessObjects.DTO.AdminBookingDTO;
using BusinessObjects.DTO.BookingStaffDTO;
using BusinessObjects.DTO.CartDTO;
using BusinessObjects.Models;
using Repositories.Interface;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using BusinessObjects;
using Moq.Language.Flow;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.Features;

namespace APIs.Tests
{
    public class BookingControllerTests
    {
        private readonly Mock<IBookingRepository> _mockBookingRepository;
        private readonly Mock<IHubContext<SignalHub>> _mockHubContext;
        private readonly Mock<IBookingHistory> _mockBookingHistory;
        private readonly BookingController _controller;

        public BookingControllerTests()
        {
            _mockBookingRepository = new Mock<IBookingRepository>();
            _mockHubContext = new Mock<IHubContext<SignalHub>>();
            _mockBookingHistory = new Mock<IBookingHistory>();

            _controller = new BookingController(_mockBookingRepository.Object, _mockHubContext.Object, _mockBookingHistory.Object);
        }

        private string ExtractMessage(ObjectResult result)
        {
            var json = JsonSerializer.Serialize(result.Value);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("Message", out var msg1))
                return msg1.GetString();
            if (doc.RootElement.TryGetProperty("message", out var msg2))
                return msg2.GetString();
            return null;
        }

        private void SetUserClaims(string accountId, string role)
        {
            var claims = new List<Claim>
            {
                new Claim("AccountId", accountId),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);

            var context = new DefaultHttpContext
            {
                User = principal
            };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = context
            };
        }
        [Fact]
        public async Task CreateDirectBooking_ShouldReturnSuccess()
        {
            // Arrange user claims
            SetUserClaims("1", "Admin");

            var bookingData = new BookingStaffDTO
            {
                CustomerId = 1,
                BranchId = 1,
                StaffId = 1,
                Status = BookingStatus.Pending,
                BookingDetails = new List<BookingDetailDto>
        {
            new BookingDetailDto { ServiceId = 1, Quantity = 1 }
        }
            };

            // Mock repo
            _mockBookingRepository.Setup(repo => repo.CreateDirectBookingAsync(It.IsAny<BookingStaffDTO>()))
                .ReturnsAsync(123);

            // Mock hub
            var mockClientProxy = new Mock<IClientProxy>();
            var mockClients = new Mock<IHubClients>();
            mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);
            _mockHubContext.Setup(h => h.Clients).Returns(mockClients.Object);

            // Act
            var result = await _controller.CreateDirectBooking(bookingData);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var json = JsonSerializer.Serialize(okResult.Value);
            using var doc = JsonDocument.Parse(json);

            Assert.Equal("Booking created successfully", doc.RootElement.GetProperty("message").GetString());
            Assert.Equal(123, doc.RootElement.GetProperty("bookingId").GetInt32());
            Assert.Equal("SUCCESS", doc.RootElement.GetProperty("code").GetString());
        }








        [Fact]
        public async Task BookingFromCart_ShouldReturnBadRequest_WhenCartIsEmpty()
        {
            var sessionMock = new Mock<ISession>();
            byte[] dummy;
            sessionMock.Setup(s => s.TryGetValue("Cart", out dummy)).Returns(false);

            var context = new DefaultHttpContext();
            context.Features.Set<ISessionFeature>(new SessionFeature { Session = sessionMock.Object });
            context.Session = sessionMock.Object;

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = context
            };

            var bookingData = new BookingFromCartDto();
            var result = await _controller.BookingFromCart(bookingData);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            var message = ExtractMessage(badRequest);
            Assert.Equal("Cart is empty!", message);
        }

        [Fact]
        public async Task AddBookingDetail_ShouldReturnSuccess()
        {
            var newDetails = new List<BookingDetailDto> { new BookingDetailDto() };
            _mockBookingRepository.Setup(repo => repo.AddBookingDetailAsync(It.IsAny<int>(), It.IsAny<List<BookingDetailDto>>()))
                .ReturnsAsync(1);
            var result = await _controller.AddBookingDetail(1, newDetails);
            var okResult = Assert.IsAssignableFrom<ObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode ?? 200);
            var message = ExtractMessage(okResult);
            Assert.Equal("Booking details added successfully!", message);
        }

        [Fact]
        public async Task EditBookingDetail_ShouldReturnSuccess()
        {
            var updatedDetail = new BookingDetailDto();
            _mockBookingRepository.Setup(repo => repo.EditBookingDetailAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<BookingDetailDto>()))
                .ReturnsAsync(true);
            var result = await _controller.EditBookingDetail(1, 1, updatedDetail);
            var okResult = Assert.IsAssignableFrom<ObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode ?? 200);
            var message = ExtractMessage(okResult);
            Assert.Equal("Booking detail updated successfully!", message);
        }

        [Fact]
        public async Task DeleteBookingDetail_ShouldReturnSuccess()
        {
            _mockBookingRepository.Setup(repo => repo.DeleteBookingDetailAsync(It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(true);
            var result = await _controller.DeleteBookingDetail(1, 1);
            var okResult = Assert.IsAssignableFrom<ObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode ?? 200);
            var message = ExtractMessage(okResult);
            Assert.Equal("Booking detail deleted successfully!", message);
        }

        [Fact]
        public async Task EditBooking_ShouldReturnSuccess()
        {
            var bookingData = new BookingFromCartDto();
            _mockBookingRepository.Setup(repo => repo.EditBookingAsync(It.IsAny<int>(), It.IsAny<BookingFromCartDto>()))
                .ReturnsAsync(true);
            var result = await _controller.EditBooking(1, bookingData);
            var okResult = Assert.IsAssignableFrom<ObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode ?? 200);
            var message = ExtractMessage(okResult);
            Assert.Equal("Booking updated successfully!", message);
        }

        [Fact]
        public async Task DeleteBooking_ShouldReturnSuccess()
        {
            _mockBookingRepository.Setup(repo => repo.DeleteBookingAsync(It.IsAny<int>()))
                .ReturnsAsync(true);
            var result = await _controller.DeleteBooking(1);
            var okResult = Assert.IsAssignableFrom<ObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode ?? 200);
            var message = ExtractMessage(okResult);
            Assert.Equal("Booking deleted successfully!", message);
        }
    }

    internal class SessionFeature : ISessionFeature
    {
        public ISession Session { get; set; }
    }
}