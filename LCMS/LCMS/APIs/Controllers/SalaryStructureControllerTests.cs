using APIs.Controllers;
using AutoMapper;
using BusinessObjects.DTO.SalaryStructureDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace APIs.Tests.Controllers
{
    public class SalaryStructureControllerTests
    {
        private readonly Mock<ISalaryStructureRepository> _mockRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly SalaryStructureController _controller;

        public SalaryStructureControllerTests()
        {
            _mockRepo = new Mock<ISalaryStructureRepository>();
            _mockMapper = new Mock<IMapper>();
            _controller = new SalaryStructureController(_mockRepo.Object, _mockMapper.Object);
        }

        #region GetAllSalaries Tests
        [Fact]
        public async Task GetAllSalaries_ReturnsOkResultWithList()
        {
            // Arrange
            var salaries = new List<SalaryStructure>
            {
                new SalaryStructure { EmployeeRoleId = 1, BaseSalary = 1000 },
                new SalaryStructure { EmployeeRoleId = 2, BaseSalary = 2000 }
            };

            var salaryDtos = new List<SalaryStructureDTO>
            {
                new SalaryStructureDTO { EmployeeRoleId = 1, BaseSalary = 1000 },
                new SalaryStructureDTO { EmployeeRoleId = 2, BaseSalary = 2000 }
            };

            _mockRepo.Setup(repo => repo.GetAllSalariesAsync()).ReturnsAsync(salaries);
            _mockMapper.Setup(m => m.Map<List<SalaryStructureDTO>>(salaries)).Returns(salaryDtos);

            // Act
            var result = await _controller.GetAllSalaries();

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<SalaryStructureDTO>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<List<SalaryStructureDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetAllSalaries_EmptyList_ReturnsOk()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetAllSalariesAsync()).ReturnsAsync(new List<SalaryStructure>());
            _mockMapper.Setup(m => m.Map<List<SalaryStructureDTO>>(It.IsAny<List<SalaryStructure>>()))
                .Returns(new List<SalaryStructureDTO>());

            // Act
            var result = await _controller.GetAllSalaries();

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<SalaryStructureDTO>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var returnValue = Assert.IsType<List<SalaryStructureDTO>>(okResult.Value);
            Assert.Empty(returnValue);
        }

        [Fact]
        public async Task GetAllSalaries_RepositoryError_ReturnsServerError()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetAllSalariesAsync())
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetAllSalaries();

            // Assert
            var actionResult = Assert.IsType<ActionResult<List<SalaryStructureDTO>>>(result);
            var objectResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, objectResult.StatusCode);
            Assert.Contains("Lỗi máy chủ", objectResult.Value.ToString());
        }
        #endregion

        #region GetSalaryById Tests
        [Fact]
        public async Task GetSalaryById_ExistingId_ReturnsSalary()
        {
            // Arrange
            var salary = new SalaryStructure { EmployeeRoleId = 1, BaseSalary = 1000 };
            var salaryDto = new SalaryStructureDTO { EmployeeRoleId = 1, BaseSalary = 1000 };

            _mockRepo.Setup(repo => repo.GetSalaryByIdAsync(1)).ReturnsAsync(salary);
            _mockMapper.Setup(m => m.Map<SalaryStructureDTO>(salary)).Returns(salaryDto);

            // Act
            var result = await _controller.GetSalaryById(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<SalaryStructureDTO>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            Assert.Equal(salaryDto, okResult.Value);
        }

        [Fact]
        public async Task GetSalaryById_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetSalaryByIdAsync(99)).ReturnsAsync((SalaryStructure)null);

            // Act
            var result = await _controller.GetSalaryById(99);

            // Assert
            var actionResult = Assert.IsType<ActionResult<SalaryStructureDTO>>(result);
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(actionResult.Result);
            Assert.Equal("Không tìm thấy mức lương.", notFoundResult.Value);
        }

        [Fact]
        public async Task GetSalaryById_RepositoryError_ReturnsServerError()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetSalaryByIdAsync(1))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetSalaryById(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<SalaryStructureDTO>>(result);
            var objectResult = Assert.IsType<ObjectResult>(actionResult.Result);
            Assert.Equal(500, objectResult.StatusCode);
            Assert.Contains("Lỗi máy chủ", objectResult.Value.ToString());
        }
        #endregion

        #region UpdateSalary Tests
        [Fact]
        public async Task UpdateSalary_ValidData_ReturnsNoContent()
        {
            // Arrange
            var dto = new SalaryStructureUpdateDTO
            {
                BaseSalary = 1500,
                Allowance = 200,
                OvertimeRate = 1.5m,
                StandardHoursPerMonth = 160
            };

            var existingSalary = new SalaryStructure { EmployeeRoleId = 1 };
            _mockRepo.Setup(repo => repo.GetSalaryByIdAsync(1)).ReturnsAsync(existingSalary);
            _mockRepo.Setup(repo => repo.UpdateSalaryAsync(existingSalary)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdateSalary(1, dto);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _mockMapper.Verify(m => m.Map(dto, existingSalary), Times.Once);
        }

        [Fact]
        public async Task UpdateSalary_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            var dto = new SalaryStructureUpdateDTO { BaseSalary = 1500 };
            _mockRepo.Setup(repo => repo.GetSalaryByIdAsync(99)).ReturnsAsync((SalaryStructure)null);

            // Act
            var result = await _controller.UpdateSalary(99, dto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Không tìm thấy mức lương để cập nhật.", notFoundResult.Value);
        }

        [Fact]
        public async Task UpdateSalary_NegativeBaseSalary_ReturnsBadRequest()
        {
            // Arrange
            var dto = new SalaryStructureUpdateDTO { BaseSalary = -1000 };
            var existingSalary = new SalaryStructure { EmployeeRoleId = 1 };
            _mockRepo.Setup(repo => repo.GetSalaryByIdAsync(1)).ReturnsAsync(existingSalary);

            // Act
            var result = await _controller.UpdateSalary(1, dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Base salary cannot be negative", badRequestResult.Value.ToString());
        }

        [Fact]
        public async Task UpdateSalary_RepositoryError_ReturnsServerError()
        {
            // Arrange
            var dto = new SalaryStructureUpdateDTO { BaseSalary = 1500 };
            var existingSalary = new SalaryStructure { EmployeeRoleId = 1 };
            _mockRepo.Setup(repo => repo.GetSalaryByIdAsync(1)).ReturnsAsync(existingSalary);
            _mockRepo.Setup(repo => repo.UpdateSalaryAsync(existingSalary))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.UpdateSalary(1, dto);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objectResult.StatusCode);
            Assert.Contains("Lỗi khi cập nhật mức lương", objectResult.Value.ToString());
        }
        #endregion
    }
}