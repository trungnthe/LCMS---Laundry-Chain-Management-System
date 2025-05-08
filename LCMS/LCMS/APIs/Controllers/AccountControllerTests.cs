using APIs.Controllers;
using BusinessObjects.DTO.AccountDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using System.Security.Claims;

namespace Tests.APIs.Controllers
{
    public class AccountControllerTests
    {
        private readonly Mock<IAccountRepository> _mockRepo;
        private readonly AccountController _controller;

        public AccountControllerTests()
        {
            _mockRepo = new Mock<IAccountRepository>();
            _controller = new AccountController(_mockRepo.Object);
        }

        public static IEnumerable<object[]> GetAccountByIdTestData => new List<object[]>
        {
            new object[] { 1, new AccountDTO1 { Name = "User A", Email = "a@email.com", Phone = "111" } },
            new object[] { 2, new AccountDTO1 { Name = "User B", Email = "b@email.com", Phone = "222" } },
            new object[] { 3, null },
            new object[] { 4, null },
            new object[] { 5, new AccountDTO1 { Name = "User E", Email = "e@email.com", Phone = null } },
            new object[] { 6, new AccountDTO1 { Name = "User F", Email = "f@email.com", Phone = "" } },
            new object[] { 7, new AccountDTO1 { Name = "User G", Email = "g@email.com", Phone = "999" } },
            new object[] { 8, null },
            new object[] { 9, new AccountDTO1 { Name = "User I", Email = "i@email.com", Phone = "000" } },
            new object[] { 10, null }
        };

    

        public static IEnumerable<object[]> UpdateProfileTestData => new List<object[]>
        {
            new object[] { new AccountDTO { Name = "User 1", Phone = "0123456789" }, true, typeof(OkObjectResult) },
            new object[] { new AccountDTO { Name = "", Phone = "" }, false, typeof(BadRequestObjectResult) },
            new object[] { new AccountDTO { Name = null, Phone = "000" }, false, typeof(BadRequestObjectResult) },
            new object[] { new AccountDTO { Name = "User 4", Phone = null }, true, typeof(OkObjectResult) },
            new object[] { new AccountDTO { Name = "User 5", Phone = "999" }, true, typeof(OkObjectResult) },
            new object[] { new AccountDTO { Name = "User 6", Phone = "111" }, false, typeof(BadRequestObjectResult) },
            new object[] { new AccountDTO { Name = "", Phone = "01234" }, false, typeof(BadRequestObjectResult) },
            new object[] { new AccountDTO { Name = "User 8", Phone = "" }, true, typeof(OkObjectResult) },
            new object[] { new AccountDTO { Name = null, Phone = null }, false, typeof(BadRequestObjectResult) },
            new object[] { new AccountDTO { Name = "Final", Phone = "999999999" }, true, typeof(OkObjectResult) }
        };
        [Theory]
        [MemberData(nameof(UpdateProfileTestData))]
        public async Task UpdateProfile_VariousInputs_ShouldReturnExpectedResult(ClaimsPrincipal userClaims, AccountDTO dto, bool repoResult, Type expectedResultType)
        {
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("Email", "test@email.com") }));
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claims } };

            // Tạo kết quả mock tương ứng với kiểu UpdateProfileResponse
            var response = new UpdateProfileResponse
            {
                Success = repoResult,
                Message = repoResult ? "Updated successfully" : "No changes were made to the profile.",
                Token = repoResult ? "dummy_token" : null,
                RefreshToken = repoResult ? "dummy_refresh_token" : null
            };

            _mockRepo.Setup(r => r.UpdateProfileAsync(It.IsAny<ClaimsPrincipal>(), dto)).ReturnsAsync(response);

            var result = await _controller.UpdateProfile(dto);

            result.Should().BeOfType(expectedResultType);
        }


        public static IEnumerable<object[]> VerifyCodeTestData => new List<object[]>
        {
            new object[] { new VerifyEmailDTO { Code = "123456" }, true, typeof(OkObjectResult) },
            new object[] { new VerifyEmailDTO { Code = "wrong" }, false, typeof(BadRequestObjectResult) },
            new object[] { new VerifyEmailDTO { Code = "000000" }, false, typeof(BadRequestObjectResult) },
            new object[] { new VerifyEmailDTO { Code = "abcdef" }, false, typeof(BadRequestObjectResult) },
            new object[] { new VerifyEmailDTO { Code = "123456" }, true, typeof(OkObjectResult) },
            new object[] { new VerifyEmailDTO { Code = "" }, false, typeof(BadRequestObjectResult) },
            new object[] { new VerifyEmailDTO { Code = "111111" }, true, typeof(OkObjectResult) },
            new object[] { new VerifyEmailDTO { Code = null }, false, typeof(BadRequestObjectResult) },
            new object[] { new VerifyEmailDTO { Code = " ", }, false, typeof(BadRequestObjectResult) },
            new object[] { new VerifyEmailDTO { Code = "333333" }, true, typeof(OkObjectResult) }
        };

        [Theory]
        [MemberData(nameof(VerifyCodeTestData))]
        public async Task VerifyUpdateEmailCode_MultipleInputs_ShouldReturnExpectedResult(ClaimsPrincipal userClaims, VerifyEmailDTO dto, bool mockResult, Type expectedType)
        {
            _mockRepo.Setup(r => r.VerifyUpdateEmailCodeAsync(userClaims, dto)).ReturnsAsync(mockResult);
            var result = await _controller.VerifyUpdateEmailCode(dto);
            result.Should().BeOfType(expectedType);
        }

        public static IEnumerable<object[]> SendEmailTestData => new List<object[]>
        {
            new object[] { new UpdateEmailDTO { NewEmail = "n1@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n2@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n3@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n4@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n5@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n6@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n7@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n8@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n9@email.com" }, true },
            new object[] { new UpdateEmailDTO { NewEmail = "n10@email.com" }, true }
        };

        [Theory]
        [MemberData(nameof(SendEmailTestData))]
        public async Task SendUpdateEmailCode_VariousInputs_ShouldReturnOk(ClaimsPrincipal claims,UpdateEmailDTO dto, bool expected)
        {
            _mockRepo.Setup(r => r.SendUpdateEmailCodeAsync(claims, dto)).ReturnsAsync(expected);
            var result = await _controller.SendUpdateEmailCode(dto);
            result.Should().BeOfType<OkObjectResult>();
        }

        public static IEnumerable<object[]> UpdateEmployeeTestData => new List<object[]>
        {
            new object[] { new UpdateRoleDTO { AccountId = 1, NewRoleId = 2, EmployeeRoleId = 3, BranchId = 4 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 2, NewRoleId = 3, EmployeeRoleId = 4, BranchId = 5 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 3, NewRoleId = 1, EmployeeRoleId = 5, BranchId = 6 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 4, NewRoleId = 2, EmployeeRoleId = 6, BranchId = 7 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 5, NewRoleId = 3, EmployeeRoleId = 7, BranchId = 8 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 6, NewRoleId = 4, EmployeeRoleId = 8, BranchId = 9 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 7, NewRoleId = 2, EmployeeRoleId = 3, BranchId = 10 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 8, NewRoleId = 3, EmployeeRoleId = 4, BranchId = 11 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 9, NewRoleId = 1, EmployeeRoleId = 5, BranchId = 12 }, true, typeof(OkObjectResult) },
            new object[] { new UpdateRoleDTO { AccountId = 10, NewRoleId = 4, EmployeeRoleId = 6, BranchId = 13 }, true, typeof(OkObjectResult) }
        };

        [Theory]
        [MemberData(nameof(UpdateEmployeeTestData))]
        public async Task UpdateEmployee_VariousInputs_ShouldReturnExpectedResult(UpdateRoleDTO dto, bool resultRepo, Type expectedType)
        {
            _mockRepo.Setup(r => r.UpdateRoleAsync(dto.AccountId, dto.NewRoleId, dto.EmployeeRoleId, dto.BranchId))
                     .ReturnsAsync(resultRepo);
            var result = await _controller.UpdateEmployee(dto);
            result.Should().BeOfType(expectedType);
        }

        [Fact]
        public async Task GetAllAccount_ShouldReturnOk_WithListOfAccountDTO1()
        {
            var accounts = new List<AccountDTO1>
            {
                new AccountDTO1 { Name = "Test A", Email = "a@email.com", Phone = "0123" },
                new AccountDTO1 { Name = "Test B", Email = "b@email.com", Phone = "0456" }
            };
            _mockRepo.Setup(r => r.GetListAccount()).ReturnsAsync(accounts);
            var result = await _controller.GetAllAccount();
            result.Should().BeOfType<OkObjectResult>();
            (result as OkObjectResult)?.Value.Should().BeEquivalentTo(accounts);
        }

        [Fact]
        public async Task GetAllAccount_ShouldReturnOk_WithEmptyList()
        {
            _mockRepo.Setup(r => r.GetListAccount()).ReturnsAsync(new List<AccountDTO1>());
            var result = await _controller.GetAllAccount();
            result.Should().BeOfType<OkObjectResult>();
            ((OkObjectResult)result).Value.Should().BeAssignableTo<IEnumerable<AccountDTO1>>();
        }

        [Fact]
        public async Task GetAllRole_ShouldReturnOk_WithRoleList()
        {
            var roles = new List<RoleDTO>
            {
                new RoleDTO { RoleId = 1, RoleName = "Admin" },
                new RoleDTO { RoleId = 2, RoleName = "Manager" },
                new RoleDTO { RoleId = 3, RoleName = "Staff" },
                new RoleDTO { RoleId = 4, RoleName = "Customer" }
            };
            _mockRepo.Setup(r => r.GetAllRole()).ReturnsAsync(roles);
            var result = await _controller.GetAll();
            result.Should().BeOfType<OkObjectResult>();
            (result as OkObjectResult)?.Value.Should().BeEquivalentTo(roles);
        }
    }
}