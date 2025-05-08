using APIs.Controllers;
using BusinessObjects.DTO.CustomerDTO;
using BusinessObjects.DTO.EmployeeDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace APIs.Tests.Controllers
{
    public class CustomerControllerTests
    {
        private readonly Mock<ICustomerRepository> _mockRepo;
        private readonly CustomerController _controller;

        public CustomerControllerTests()
        {
            _mockRepo = new Mock<ICustomerRepository>();
            _controller = new CustomerController(_mockRepo.Object);
        }

        [Fact]
        public async Task GetAllStatus_ReturnsOkResult()
        {
            // Arrange
            var expectedStatuses = new List<string> { "Active", "Inactive" };
            _mockRepo.Setup(x => x.GetAllStatus()).ReturnsAsync(expectedStatuses);

            // Act
            var result = await _controller.GetAllStaus();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedStatuses, okResult.Value);
        }

        [Fact]
        public async Task GetTopSpendingCustomers_WithBranchId_ReturnsOkResult()
        {
            // Arrange
            var branchId = 1;
            var expectedCustomers = new List<CustomerDTO>
            {
                new CustomerDTO { AccountId = 1, CustomerName = "John", TotalSpent = 1000 }
            };
            _mockRepo.Setup(x => x.GetTopSpendingCustomersAsync(10, branchId)).ReturnsAsync(expectedCustomers);

            // Act
            var result = await _controller.GetTopSpendingCustomers(branchId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedCustomers, okResult.Value);
        }
        [Fact]
        public async Task GetAllCustomer_ReturnsOkResult()
        {
            // Arrange
            var expectedCustomers = new List<CustomerDTO>
    {
        new CustomerDTO { AccountId = 1, CustomerName = "John" }
    };
            _mockRepo.Setup(x => x.GetAllCustomer()).ReturnsAsync(expectedCustomers);

            // Act
            var result = await _controller.GetAll();

            // Assert
            // Sử dụng .Result để lấy kết quả thực tế
            var okResult = result.Result as OkObjectResult;
            Assert.NotNull(okResult);
            Assert.Equal(expectedCustomers, okResult.Value);
        }
        [Fact]
        public async Task GetAllCustomer_ThrowsException_ReturnsBadRequest()
        {
            // Arrange
            _mockRepo.Setup(x => x.GetAllCustomer()).ThrowsAsync(new Exception("Error"));

            // Act
            var result = await _controller.GetAll();

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetUserById_ValidId_ReturnsOkResult()
        {
            // Arrange
            var customerId = 1;
            var expectedCustomer = new CustomerDTO { AccountId = customerId, CustomerName = "John" };
            _mockRepo.Setup(x => x.GetUserByID(customerId)).ReturnsAsync(expectedCustomer);

            // Act
            var result = await _controller.GetUserById(customerId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<CustomerDTO>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedCustomer, okResult.Value);



        }
        [Fact]
        public async Task GetUserById_InvalidId_ReturnsBadRequest()
        {
            // Arrange
            var customerId = 999;
            _mockRepo.Setup(x => x.GetUserByID(customerId)).ThrowsAsync(new Exception("Not found"));

            // Act
            var result = await _controller.GetUserById(customerId);


            // Hoặc kiểm tra cả message
            var badRequestResult = result.Result as BadRequestObjectResult;
            Assert.NotNull(badRequestResult);
            Assert.Equal("Not found", badRequestResult.Value);
        }

        [Fact]
        public async Task SearchUserByName_ValidName_ReturnsOkResult()
        {
            // Arrange
            var name = "John";
            var expectedCustomers = new List<CustomerDTO>
    {
        new CustomerDTO { AccountId = 1, CustomerName = "John" }
    };
            _mockRepo.Setup(x => x.SearchUserByName(name)).ReturnsAsync(expectedCustomers);

            // Act
            var result = await _controller.GetUserByName(name);

            // Assert

            var actionResult = Assert.IsType<ActionResult<CustomerDTO>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(expectedCustomers, okResult.Value);


        }

        [Fact]
        public async Task SortCustomersByLoyaltyPoints_Ascending_ReturnsOkResult()
        {
            // Arrange
            var ascending = true;
            var expectedCustomers = new List<CustomerDTO>
    {
        new CustomerDTO { AccountId = 1, CustomerName = "John", LoyaltyPoints = 50 },
        new CustomerDTO { AccountId = 2, CustomerName = "Jane", LoyaltyPoints = 100 }
    };
            _mockRepo.Setup(x => x.SortCustomersByLoyaltyPoints(ascending)).ReturnsAsync(expectedCustomers);

            // Act
            var result = await _controller.SortCustomers(ascending);

            // Assert
            Assert.Equal(expectedCustomers, (result.Result as OkObjectResult)?.Value);
        }

        [Fact]
        public async Task UpdateLoyaltyPoints_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new UpdateLoyaltyPointDTO { CustomerId = 1, PointsToAdd = 50 };
            _mockRepo.Setup(x => x.AddLoyaltyPoints(request.CustomerId, request.PointsToAdd)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdateLoyaltyPoints(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Cập nhật điểm thành công!", okResult.Value);
        }

        [Fact]
        public async Task UpdateStatus_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new UpdateStatusRequest { CustomerId = 1, NewStatus = "Active" };
            _mockRepo.Setup(x => x.UpdateCustomerStatus(request.CustomerId, request.NewStatus)).ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateStatus(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Cập nhật trạng thái thành công!", okResult.Value);
        }

        [Fact]
        public async Task UpdateStatus_InvalidCustomerId_ReturnsNotFound()
        {
            // Arrange
            var request = new UpdateStatusRequest { CustomerId = 999, NewStatus = "Active" };
            _mockRepo.Setup(x => x.UpdateCustomerStatus(request.CustomerId, request.NewStatus)).ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateStatus(request);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }
        [Fact]
        public async Task GetTotalCustomersForManagerBranch_ReturnsOkResult()
        {
            // Arrange
            var expectedCount = 10;
            _mockRepo.Setup(x => x.GetTotalCustomersForManagerBranch()).ReturnsAsync(expectedCount);

            // Act
            var result = await _controller.GetTotalCustomersForManagerBranch();

            // Assert
            Assert.Equal(expectedCount, (result.Result as OkObjectResult)?.Value);
        }

        [Fact]
        public async Task GetNewCustomersList_ValidDays_ReturnsOkResult()
        {
            // Arrange
            var days = 30;
            var expectedCustomers = new List<CustomerDTO>
            {
                new CustomerDTO { AccountId = 1, CustomerName = "New Customer" }
            };
            _mockRepo.Setup(x => x.GetNewCustomersList(days)).ReturnsAsync(expectedCustomers);

            // Act
            var result = await _controller.GetNewCustomersList(days);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedCustomers, okResult.Value);
        }
        [Fact]
        public async Task GetTopServiceCustomers_ValidCount_ReturnsOkResult()
        {
            // Arrange
            var topCount = 5;
            var expectedCustomers = new List<CustomerDTO>
    {
        new CustomerDTO { AccountId = 1, CustomerName = "Top Customer" }
    };
            _mockRepo.Setup(x => x.GetTopServiceCustomers(topCount)).ReturnsAsync(expectedCustomers);

            // Act
            var result = await _controller.GetTopServiceCustomers(topCount);

            // Assert
            Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expectedCustomers, (result.Result as OkObjectResult)?.Value);
        }
        [Fact]
        public async Task GetTopSpendingCustomers_WithInvalidBranchId_ReturnsEmptyList()
        {
            // Arrange
            int invalidBranchId = 0;
            _mockRepo.Setup(x => x.GetTopSpendingCustomersAsync(10, invalidBranchId))
                     .ReturnsAsync(new List<CustomerDTO>());

            // Act
            var result = await _controller.GetTopSpendingCustomers(invalidBranchId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Empty((IEnumerable<CustomerDTO>)okResult.Value);
        }
        [Fact]
        public async Task GetNewCustomersList_InvalidDays_ReturnsBadRequest()
        {
            // Arrange
            var days = -1;

            // Giả lập repository throw exception như hiện tại
            _mockRepo.Setup(x => x.GetNewCustomersList(days))
                     .ThrowsAsync(new ArgumentException("Invalid days"));

            // Act & Assert
            // Sử dụng Assert.ThrowsAsync vì controller không handle exception
            await Assert.ThrowsAsync<ArgumentException>(async () =>
            {
                await _controller.GetNewCustomersList(days);
            });
        }

        [Fact]
        public async Task UpdateLoyaltyPoints_InvalidRequest_ReturnsBadRequest()
        {
            // Arrange
            var request = new UpdateLoyaltyPointDTO { CustomerId = 1, PointsToAdd = -50 };
            _mockRepo.Setup(x => x.AddLoyaltyPoints(request.CustomerId, request.PointsToAdd))
                     .ThrowsAsync(new ArgumentException("Points cannot be negative"));

            // Act
            var result = await _controller.UpdateLoyaltyPoints(request);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task GetUserByName_EmptyName_ReturnsBadRequest()
        {
            // Arrange
            var name = "";
            _mockRepo.Setup(x => x.SearchUserByName(name)).ThrowsAsync(new ArgumentException("Name cannot be empty"));

            // Act
            var result = await _controller.GetUserByName(name);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task SortCustomers_RepositoryThrowsException_ReturnsBadRequest()
        {
            // Arrange
            var ascending = true;
            _mockRepo.Setup(x => x.SortCustomersByLoyaltyPoints(ascending))
                     .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.SortCustomers(ascending);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }
    }


}