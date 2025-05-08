using APIs.Controllers;
using BusinessObjects.DTO;
using BusinessObjects.DTO.EmployeeDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System.Security.Claims;
using System.Text;
using Xunit;

namespace APIs.Tests.Controllers
{
    public class EmployeeControllerTests
    {
        private readonly Mock<IEmployeeRepository> _mockEmployeeRepo;
        private readonly Mock<IAuthRepository> _mockAuthRepo;
        private readonly EmployeeController _controller;

        public EmployeeControllerTests()
        {
            _mockEmployeeRepo = new Mock<IEmployeeRepository>();
            _mockAuthRepo = new Mock<IAuthRepository>();
            _controller = new EmployeeController(_mockEmployeeRepo.Object, _mockAuthRepo.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult_WithEmployeeList()
        {
            // Arrange
            var expectedEmployees = new List<EmployeeDTO>
    {
        new EmployeeDTO { AccountId = 1, EmployeeName = "John Doe" }
    };
            _mockEmployeeRepo.Setup(x => x.GetAllEmployee()).ReturnsAsync(expectedEmployees);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Equal(expectedEmployees, okResult.Value);
        }
        [Fact]
        public async Task GetAll_ThrowsException_ReturnsBadRequest()
        {
            // Arrange
            _mockEmployeeRepo.Setup(x => x.GetAllEmployee()).ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetAll();

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.Equal("Database error", (result.Result as BadRequestObjectResult)?.Value);
        }

        [Fact]
        public async Task GetEmployeeById_ValidId_ReturnsOkResult()
        {
            // Arrange
            var employeeId = 1;
            var expectedEmployee = new EmployeeDTO
            {
                AccountId = employeeId,
                EmployeeName = "John Doe"
            };

            _mockEmployeeRepo.Setup(x => x.GetEmployeeById(employeeId))
                           .ReturnsAsync(expectedEmployee);

            // Act
            var result = await _controller.GetEmployeeById(employeeId);

            // Assert
            Assert.Equal(expectedEmployee, (result.Result as OkObjectResult)?.Value);
        }
        [Fact]
        public async Task GetEmployeeById_InvalidId_ReturnsBadRequest()
        {
            // Arrange
            var employeeId = 999;
            _mockEmployeeRepo.Setup(x => x.GetEmployeeById(employeeId))
                           .ThrowsAsync(new Exception("Not found"));

            // Act
            var result = await _controller.GetEmployeeById(employeeId);

            // Assert
            Assert.Equal("Not found", (result.Result as BadRequestObjectResult)?.Value);
        }

        [Fact]
        public async Task GetEmployeesByIds_ValidIds_ReturnsOkResult()
        {
            // Arrange
            var ids = new List<int> { 1, 2 };
            var expectedEmployees = new List<EmployeeDTO>
            {
                new EmployeeDTO { AccountId = 1 },
                new EmployeeDTO { AccountId = 2 }
            };
            _mockEmployeeRepo.Setup(x => x.GetEmployeeByIdAsync(ids)).ReturnsAsync(expectedEmployees);

            // Act
            var result = await _controller.GetEmployeesByIds(ids);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedEmployees, okResult.Value);
        }

     
        [Fact]
        public async Task GetEmployeesByIds_EmptyList_ReturnsBadRequest()
        {
            // Arrange
            var emptyIds = new List<int>();

            // Act
            var result = await _controller.GetEmployeesByIds(emptyIds);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var responseJson = Newtonsoft.Json.JsonConvert.SerializeObject(badRequestResult.Value);
            Assert.Contains("\"error\":\"List of IDs cannot be empty.\"", responseJson);
        }

        [Fact]
        public async Task SearchEmployees_WithName_ReturnsOkResult()
        {
            // Arrange
            var name = "John";
            var expectedEmployees = new List<EmployeeDTO>
            {
                new EmployeeDTO { AccountId = 1, EmployeeName = "John Doe" }
            };
            _mockEmployeeRepo.Setup(x => x.SearchEmployeesAsync(name, null)).ReturnsAsync(expectedEmployees);

            // Act
            var result = await _controller.SearchEmployees(name, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedEmployees, okResult.Value);
        }

        [Fact]
        public async Task SearchEmployees_NoResults_ReturnsNotFound()
        {
            // Arrange
            var name = "Nonexistent";
            _mockEmployeeRepo.Setup(x => x.SearchEmployeesAsync(name, null)).ReturnsAsync(new List<EmployeeDTO>());

            // Act
            var result = await _controller.SearchEmployees(name, null);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task Register_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var registerDto = new RegisterDTO
            {
                Name = "John Doe",
                Email = "john@example.com",
                Password = "password123",
                Phone = "1234567890"
            };

            const string expectedMessage = "Registration successful";
            _mockAuthRepo.Setup(x => x.RegisterForCustomerAsync(registerDto))
                       .ReturnsAsync(expectedMessage);

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Cách 1: Dùng Json serialization (recommended)
            var responseJson = Newtonsoft.Json.JsonConvert.SerializeObject(okResult.Value);
            var response = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, string>>(responseJson);
            Assert.Equal(expectedMessage, response["Message"]);

           
        }

        [Fact]
        public async Task Register_InvalidRequest_ReturnsBadRequest()
        {
            // Arrange
            var invalidDto = new RegisterDTO { Name = "", Email = "", Password = "" };

            // Act
            var result = await _controller.Register(invalidDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }
        [Fact]
        public async Task CreateEmployeeAccount_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new CreateEmployeeAccountDTO
            {
                Name = "New Employee",
                Email = "employee@example.com",
                Phone = "1234567890",
                Password = "password123",
                RoleId = 3,
                BranchId = 1,
                EmployeeRoleId = 1
            };

            // Tạo FormFile thực
            var content = "fake image content";
            var fileName = "test.jpg";
            var ms = new MemoryStream(Encoding.UTF8.GetBytes(content));
            var file = new FormFile(ms, 0, ms.Length, "avatar", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };

            // Mock user claims
            var claims = new List<Claim>
    {
        new Claim("Email", "admin@example.com"),
        new Claim(ClaimTypes.Role, "Admin")
    };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };

            // Mock repository
            _mockEmployeeRepo.Setup(x => x.CreateEmployeeAccountAsync(
                It.IsAny<ClaimsPrincipal>(),
                It.IsAny<CreateEmployeeAccountDTO>(),
                It.IsAny<IFormFile>()
            )).ReturnsAsync(true);

            // Act
            var result = await _controller.CreateAccount(request, file);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            // Cách 1: Dùng Json serialization (recommended)
            var responseJson = Newtonsoft.Json.JsonConvert.SerializeObject(okResult.Value);
            var response = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(responseJson);
            Assert.True((bool)response["success"]);
            Assert.Equal("Employee account created successfully.", response["message"].ToString());       
        }

        public class DemotionResponse
        {
            public bool success { get; set; }
            public string message { get; set; }
        }

        [Fact]
        public async Task DemoteEmployeeToCustomer_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var employeeId = 1;

            // Setup user claims
            var claims = new List<Claim>
    {
        new Claim("Email", "admin@example.com"),
        new Claim(ClaimTypes.Role, "Admin") // Thêm role claim để phù hợp với logic authorization
    };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            _mockEmployeeRepo.Setup(x => x.DemoteEmployeeToCustomerAsync(
                It.Is<ClaimsPrincipal>(u => u.FindFirstValue("Email") == "admin@example.com"),
                employeeId
            )).ReturnsAsync(true);

            // Act
            var result = await _controller.DemoteEmployeeToCustomer(employeeId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Newtonsoft.Json.JsonConvert.DeserializeObject<DemotionResponse>(
                Newtonsoft.Json.JsonConvert.SerializeObject(okResult.Value));

            Assert.True(response.success);
            Assert.Equal("Employee demoted to customer successfully.", response.message);

        }

        [Fact]
        public async Task DemoteEmployeeToCustomer_Unauthorized_ReturnsForbid()
        {
            // Arrange
            var employeeId = 1;

            // Setup user claims with insufficient privileges
            var claims = new List<Claim>
            {
                new Claim("Email", "staff@example.com")
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            _mockEmployeeRepo.Setup(x => x.DemoteEmployeeToCustomerAsync(It.IsAny<ClaimsPrincipal>(), employeeId))
                .ThrowsAsync(new UnauthorizedAccessException());

            // Act
            var result = await _controller.DemoteEmployeeToCustomer(employeeId);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task CreateEmployeeAccount_InvalidRequest_ReturnsBadRequest()
        {
            // Arrange
            var invalidRequest = new CreateEmployeeAccountDTO
            {
                // Thiếu các trường bắt buộc
                Name = null,
                Email = "invalid",
                Password = "short",
                RoleId = 99 // RoleId không hợp lệ
            };

            // Mock repository throw exception khi nhận input không hợp lệ
            _mockEmployeeRepo.Setup(x => x.CreateEmployeeAccountAsync(
                It.IsAny<ClaimsPrincipal>(),
                It.Is<CreateEmployeeAccountDTO>(r =>
                    r.Name == null ||
                    !r.Email.Contains("@") ||
                    r.Password.Length < 6 ||
                    r.RoleId == 99),
                It.IsAny<IFormFile>()
            )).ThrowsAsync(new ArgumentException("Invalid request data"));

            // Setup user claims để bypass authorization
            var claims = new List<Claim>
    {
        new Claim("Email", "admin@example.com"),
        new Claim(ClaimTypes.Role, "Admin")
    };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var result = await _controller.CreateAccount(invalidRequest, null);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Invalid request data", badRequestResult.Value.ToString());
        }




        [Fact]
        public async Task GetEmployeeById_RepositoryReturnsNull_ReturnsOkWithNull()
        {
            // Arrange
            var employeeId = 999;
            _mockEmployeeRepo.Setup(x => x.GetEmployeeById(employeeId))
                           .ReturnsAsync((EmployeeDTO)null);

            // Act
            var result = await _controller.GetEmployeeById(employeeId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Null(okResult.Value);
        }

        [Fact]
        public async Task SearchEmployees_WithBranchName_ReturnsFilteredResults()
        {
            // Arrange
            var name = "John";
            var branchName = "Ha Noi";
            var expectedEmployees = new List<EmployeeDTO>
    {
        new EmployeeDTO { AccountId = 1, EmployeeName = "John Doe", BranchName = "Ha Noi" }
    };

            _mockEmployeeRepo.Setup(x => x.SearchEmployeesAsync(name, branchName))
                           .ReturnsAsync(expectedEmployees);

            // Act
            var result = await _controller.SearchEmployees(name, branchName);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedEmployees, okResult.Value);
        }

        // Thêm class này vào test project
        public class ErrorResponse
        {
            public string error { get; set; }
        }

        // Trong test

        [Fact]
        public async Task CreateEmployeeAccount_Unauthorized_ReturnsUnauthorized()
        {
            // Arrange
            var request = new CreateEmployeeAccountDTO
            {
                Name = "New Employee",
                Email = "employee@example.com",
                RoleId = 2 // Manager role
            };

            // Setup user claims không có quyền
            var claims = new List<Claim>
    {
        new Claim("Email", "staff@example.com"),
        new Claim(ClaimTypes.Role, "Staff")
    };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Mock repository throw UnauthorizedAccessException
            _mockEmployeeRepo.Setup(x => x.CreateEmployeeAccountAsync(
                It.Is<ClaimsPrincipal>(u => u.FindFirstValue(ClaimTypes.Role) == "Staff"),
                It.IsAny<CreateEmployeeAccountDTO>(),
                It.IsAny<IFormFile>()
            )).ThrowsAsync(new UnauthorizedAccessException("Unauthorized"));

            // Act
            var result = await _controller.CreateAccount(request, null);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);

      

           
            var response = Newtonsoft.Json.JsonConvert.DeserializeObject<ErrorResponse>(
                Newtonsoft.Json.JsonConvert.SerializeObject(unauthorizedResult.Value));
            Assert.Equal("Unauthorized", response.error);      
        }
    }
}