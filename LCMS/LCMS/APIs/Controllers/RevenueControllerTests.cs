using APIs.Controllers;
using BusinessObjects.DTO.RevenueDTO;
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
    public class RevenueControllerTests
    {
        private readonly Mock<IRevenueRepository> _mockRevenueRepo;
        private readonly Mock<IBranchRepository> _mockBranchRepo;
        private readonly RevenueController _controller;

        public RevenueControllerTests()
        {
            _mockRevenueRepo = new Mock<IRevenueRepository>();
            _mockBranchRepo = new Mock<IBranchRepository>();
            _controller = new RevenueController(_mockRevenueRepo.Object, _mockBranchRepo.Object);
        }

        private void SetupUser(string role, int accountId = 1)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, role),
                new Claim("AccountId", accountId.ToString())
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

  

        #region GetBranchRevenueByMonthAndYearAsync Tests - Expanded
        [Theory]
        [InlineData("Admin", null, false)] // Admin với branchId null -> BadRequest
        [InlineData("Admin", 1, true)]     // Admin với branchId hợp lệ -> Ok
        [InlineData("Manager", null, true)] // Manager tự động dùng branchId của họ -> Ok
        public async Task GetBranchRevenueByMonthAndYearAsync_RoleBranchCombinations_ReturnsCorrectly(
     string role, int? branchId, bool expectedSuccess)
        {
            // Arrange
            SetupUser(role);
            var date = new DateTime(2023, 6, 1);

            if (role == "Manager")
            {
                var managerBranchId = 1;
                _mockBranchRepo.Setup(b => b.GetBranchIdByAccountId(1)).ReturnsAsync(managerBranchId);
                branchId = managerBranchId; // Gán branchId cho Manager
            }

            if (expectedSuccess)
            {
                _mockRevenueRepo.Setup(r => r.GetBranchRevenueByMonthAndYearAsync(branchId.Value, date))
                    .ReturnsAsync(new BranchRevenueDTO
                    {
                        BranchID = branchId.Value,
                        TotalRevenue = 5000
                    });
            }

            // Act
            var result = await _controller.GetBranchRevenueByMonthAndYearAsync(branchId, date);

            // Assert
            if (expectedSuccess)
            {
                var okResult = Assert.IsType<OkObjectResult>(result);
                Assert.Equal(branchId.Value, ((BranchRevenueDTO)okResult.Value).BranchID);
            }
            else
            {
                Assert.IsType<BadRequestObjectResult>(result);
            }
        }
        [Fact]
        public async Task GetBranchRevenueByMonthAndYearAsync_FutureDate_ReturnsEmptyData()
        {
            // Arrange
            SetupUser("Admin");
            var futureDate = DateTime.Now.AddYears(1);
            _mockRevenueRepo.Setup(r => r.GetBranchRevenueByMonthAndYearAsync(1, futureDate))
                .ReturnsAsync((BranchRevenueDTO)null);

            // Act
            var result = await _controller.GetBranchRevenueByMonthAndYearAsync(1, futureDate);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Không tìm thấy dữ liệu", notFoundResult.Value.ToString());
        }
        #endregion

        #region GetCustomerRevenueByBranchAndMonth Tests - Expanded
        [Theory]
        [InlineData(1, 1, true)]  // Manager truy cập đúng branch
        [InlineData(1, 2, false)] // Manager truy cập branch khác
        public async Task GetCustomerRevenueByBranchAndMonth_ManagerAccess_ValidatesCorrectly(
            int managerBranchId, int requestedBranchId, bool shouldSucceed)
        {
            // Arrange
            SetupUser("Manager");
            var date = DateTime.Now;

            _mockBranchRepo.Setup(b => b.GetBranchIdByAccountId(1)).ReturnsAsync(managerBranchId);

            if (shouldSucceed)
            {
                _mockRevenueRepo.Setup(r => r.GetCustomerRevenueByBranchAndMonthAsync(requestedBranchId, date))
                    .ReturnsAsync(new List<CustomerRevenueDTO> { new CustomerRevenueDTO() });
            }

            // Act
            var result = await _controller.GetCustomerRevenueByBranchAndMonth(requestedBranchId, date);

            // Assert
            if (shouldSucceed)
            {
                Assert.IsType<OkObjectResult>(result);
            }
            else
            {
                Assert.IsType<ForbidResult>(result);
            }
        }

        [Fact]
        public async Task GetCustomerRevenueByBranchAndMonth_NoData_ReturnsNotFound()
        {
            // Arrange
            SetupUser("Admin");
            var date = DateTime.Now;
            _mockRevenueRepo.Setup(r => r.GetCustomerRevenueByBranchAndMonthAsync(1, date))
                .ReturnsAsync(new List<CustomerRevenueDTO>());

            // Act
            var result = await _controller.GetCustomerRevenueByBranchAndMonth(1, date);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Không tìm thấy dữ liệu", notFoundResult.Value.ToString());
        }
        #endregion

        #region ExportFullRevenue Tests - Expanded
        [Fact]
        public async Task ExportFullRevenue_NoDate_ReturnsBadRequest()
        {
            // Arrange
            SetupUser("Admin");

            // Act
            var result = await _controller.ExportFullRevenue(null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task ExportFullRevenue_LargeData_ReturnsValidFile()
        {
            // Arrange
            SetupUser("Admin");
            var date = new DateTime(2023, 1, 1);
            var largeFileBytes = new byte[1024 * 1024 * 5]; // 5MB file
            new Random().NextBytes(largeFileBytes);

            _mockRevenueRepo.Setup(r => r.ExportFullRevenueReportAsync(date))
                .ReturnsAsync(largeFileBytes);

            // Act
            var result = await _controller.ExportFullRevenue(date);

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal(largeFileBytes.Length, fileResult.FileContents.Length);
        }
        #endregion

        #region GetRevenueByPaymentMethod Tests - Expanded
        [Fact]
        public async Task GetRevenueByPaymentMethod_Admin_GetsAllBranchesData()
        {
            // Arrange
            SetupUser("Admin");
            _mockRevenueRepo.Setup(r => r.GetRevenueByPaymentMethodAsync())
                .ReturnsAsync(new List<PaymentRevenueDTO> { new PaymentRevenueDTO() });

            // Act
            var result = await _controller.GetRevenueByPaymentMethod();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var data = Assert.IsType<List<PaymentRevenueDTO>>(okResult.Value);
            Assert.Single(data);
        }

        [Fact]
        public async Task GetRevenueByPaymentMethod_Manager_GetsOnlyTheirBranchData()
        {
            // Arrange
            SetupUser("Manager");
            _mockBranchRepo.Setup(b => b.GetBranchIdByAccountId(1)).ReturnsAsync(1);
            _mockRevenueRepo.Setup(r => r.GetRevenueByPaymentMethodAsync(1))
                .ReturnsAsync(new List<PaymentRevenueDTO> { new PaymentRevenueDTO() });

            // Act
            var result = await _controller.GetRevenueByPaymentMethod();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var data = Assert.IsType<List<PaymentRevenueDTO>>(okResult.Value);
            Assert.Single(data);
        }
        #endregion

        #region Edge Cases and Security Tests
        [Fact]
        public async Task GetBranchRevenueByMonthAndYearAsync_InvalidBranchId_ReturnsNotFound()
        {
            // Arrange
            SetupUser("Admin");
            var date = DateTime.Now;
            _mockRevenueRepo.Setup(r => r.GetBranchRevenueByMonthAndYearAsync(999, date))
                .ReturnsAsync((BranchRevenueDTO)null);

            // Act
            var result = await _controller.GetBranchRevenueByMonthAndYearAsync(999, date);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

   

        [Fact]
        public async Task ExportFullRevenue_UnauthorizedAccess_ReturnsForbid()
        {
            // Arrange
            SetupUser("Manager"); // Manager không có quyền export
            var date = DateTime.Now;

            // Bỏ qua mock repository vì không mong đợi được gọi

            // Act
            var result = await _controller.ExportFullRevenue(date);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }
        #endregion

        // Có thể thêm nhiều test case khác cho các endpoint còn lại
    }
}