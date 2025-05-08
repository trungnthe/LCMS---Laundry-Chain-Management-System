using APIs.Controllers;
using BusinessObjects.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;
using System.Dynamic;

namespace Tests.APIs.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthRepository> _authRepo;
        private readonly Mock<IAccountRepository> _accRepo;
        private readonly Mock<IConfiguration> _config;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _authRepo = new Mock<IAuthRepository>();
            _config = new Mock<IConfiguration>();
            _accRepo = new Mock<IAccountRepository>();
            _controller = new AuthController(_authRepo.Object, _config.Object, _accRepo.Object);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ShouldReturnOk()
        {
            var loginDto = new LoginDTO { Email = "test@email.com", Password = "password" };

            dynamic tokens = new ExpandoObject();
            tokens.AccessToken = "access_token_sample";
            tokens.RefreshToken = "refresh_token_sample";

            _authRepo.Setup(r => r.LoginAsync(It.Is<LoginDTO>(x => x.Email == loginDto.Email && x.Password == loginDto.Password)))
                     .ReturnsAsync((object)tokens); // Ép kiểu về object để khớp với dynamic trong controller

            var httpContext = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            var result = await _controller.Login(loginDto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            var tokenProperty = okResult.Value.GetType().GetProperty("token");
            Assert.NotNull(tokenProperty);
            var tokenValue = tokenProperty.GetValue(okResult.Value);
            Assert.Equal("access_token_sample", tokenValue);
        }



        [Fact]
        public async Task Login_WithMissingCredentials_ShouldReturnBadRequest()
        {
            var result = await _controller.Login(new LoginDTO());
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Register_WithValidInfo_ShouldReturnOk()
        {
            var dto = new RegisterDTO { Email = "abc@email.com", Name = "Test", Password = "123" };
            _authRepo.Setup(x => x.RegisterAsync(dto)).ReturnsAsync("Success");

            var result = await _controller.Register(dto);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Register_WithMissingInfo_ShouldReturnBadRequest()
        {
            var result = await _controller.Register(new RegisterDTO());
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void RefreshToken_WithEmptyCookie_ShouldReturnUnauthorized()
        {
            var context = new DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext { HttpContext = context };

            var result = _controller.RefreshToken();
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public void GetCustomerId_WithValidToken_ShouldReturnOk()
        {
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("AccountId", "1") }, "mock"));
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claims } };

            var result = _controller.GetCustomerId();
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void GetCustomerId_WithoutToken_ShouldReturnUnauthorized()
        {
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
            var result = _controller.GetCustomerId();
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task ChangePassword_ShouldReturnOk()
        {
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("Email", "a@email.com") }, "mock"));
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = claims } };

            _authRepo.Setup(x => x.ChangePasswordAsync(It.IsAny<ClaimsPrincipal>(), It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(true); // hoặc false nếu muốn test lỗi


            var result = await _controller.ChangePassword(new ChangePasswordDTO { OldPassword = "old", NewPassword = "new" });
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task VerifyCode_ShouldReturnOk_WhenValid()
        {
            _authRepo.Setup(x => x.VerifyConfirmationCodeAsync("123456")).ReturnsAsync(true);

            var result = await _controller.VerifyCode(new VerifyCodeDTO { Code = "123456" });
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task VerifyCode_ShouldReturnUnauthorized_WhenInvalid()
        {
            _authRepo.Setup(x => x.VerifyConfirmationCodeAsync("123456")).ReturnsAsync(false);

            var result = await _controller.VerifyCode(new VerifyCodeDTO { Code = "123456" });
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task ResendCode_ShouldReturnOk()
        {
            _authRepo.Setup(x => x.ResendConfirmationCodeAsync("a@email.com")).ReturnsAsync(true); 

            var result = await _controller.ResendCode(new ResendCodeDTO { Email = "a@email.com" });
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task ForgotPassword_ShouldReturnOk()
        {
            _authRepo.Setup(x => x.SendResetPasswordCodeAsync("a@email.com")).ReturnsAsync(true);
            var result = await _controller.ForgotPassword(new ResendCodeDTO { Email = "a@email.com" });
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task VerifyOTP_ShouldReturnOk()
        {
            _authRepo.Setup(x => x.VerifyResetCodeAsync("a@email.com", "123456")).ReturnsAsync(true);

            var result = await _controller.VerifyOTP(new VerifyCodeDTO { Email = "a@email.com", Code = "123456" });
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task ResetPassword_ShouldReturnOk()
        {
            _authRepo.Setup(x => x.ResetPasswordAsync("a@email.com", "newpass")).ReturnsAsync(true); 

            var result = await _controller.ResetPassword(new ResetPasswordDTO { Email = "a@email.com", NewPassword = "newpass" });
            Assert.IsType<OkObjectResult>(result);
        }
    }
}
