using APIs.Controllers;
using AutoMapper;
using BusinessObjects.DTO.EmployeeRoleDTO;
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
    public class EmployeeRoleControllerTests
    {
        private readonly Mock<IEmployeeRoleRepository> _mockRepo;
        private readonly Mock<IMapper> _mockMapper;
        private readonly EmployeeRoleController _controller;

        public EmployeeRoleControllerTests()
        {
            _mockRepo = new Mock<IEmployeeRoleRepository>();
            _mockMapper = new Mock<IMapper>();
            _controller = new EmployeeRoleController(_mockRepo.Object, _mockMapper.Object);
        }

        [Fact]
        public async Task GetAllRoles_ReturnsOkResult_WithListOfRoles()
        {
            // Arrange
            var roles = new List<EmployeeRole>
            {
                new EmployeeRole { EmployeeRoleId = 1, EmployeeRoleName = "Admin", Description = "Administrator" },
                new EmployeeRole { EmployeeRoleId = 2, EmployeeRoleName = "User", Description = "Regular user" }
            };

            var roleDtos = new List<EmployeeRoleDTO>
            {
                new EmployeeRoleDTO { EmployeeRoleId = 1, EmployeeRoleName = "Admin", Description = "Administrator" },
                new EmployeeRoleDTO { EmployeeRoleId = 2, EmployeeRoleName = "User", Description = "Regular user" }
            };

            _mockRepo.Setup(repo => repo.GetAllEmployeeRolesAsync()).ReturnsAsync(roles);
            _mockMapper.Setup(mapper => mapper.Map<List<EmployeeRoleDTO>>(roles)).Returns(roleDtos);

            // Act
            var result = await _controller.GetAllRoles();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<EmployeeRoleDTO>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetAllRoles_Returns500_WhenExceptionOccurs()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetAllEmployeeRolesAsync()).ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _controller.GetAllRoles();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetRoleById_ReturnsOkResult_WithRole()
        {
            // Arrange
            var role = new EmployeeRole { EmployeeRoleId = 1, EmployeeRoleName = "Admin", Description = "Administrator" };
            var roleDto = new EmployeeRoleDTO { EmployeeRoleId = 1, EmployeeRoleName = "Admin", Description = "Administrator" };

            _mockRepo.Setup(repo => repo.GetEmployeeRoleByIdAsync(1)).ReturnsAsync(role);
            _mockMapper.Setup(mapper => mapper.Map<EmployeeRoleDTO>(role)).Returns(roleDto);

            // Act
            var result = await _controller.GetRoleById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<EmployeeRoleDTO>(okResult.Value);
            Assert.Equal("Admin", returnValue.EmployeeRoleName);
        }

        [Fact]
        public async Task GetRoleById_ReturnsNotFound_WhenRoleDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetEmployeeRoleByIdAsync(1)).ReturnsAsync((EmployeeRole)null);

            // Act
            var result = await _controller.GetRoleById(1);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task AddRole_ReturnsCreatedAtAction_WithNewRole()
        {
            // Arrange
            var newRoleDto = new EmployeeRoleCreateDTO { EmployeeRoleName = "Manager", Description = "Manager role" };
            var newRole = new EmployeeRole { EmployeeRoleId = 3, EmployeeRoleName = "Manager", Description = "Manager role" };
            var createdRoleDto = new EmployeeRoleDTO { EmployeeRoleId = 3, EmployeeRoleName = "Manager", Description = "Manager role" };

            _mockMapper.Setup(mapper => mapper.Map<EmployeeRole>(newRoleDto)).Returns(newRole);
            _mockMapper.Setup(mapper => mapper.Map<EmployeeRoleDTO>(newRole)).Returns(createdRoleDto);
            _mockRepo.Setup(repo => repo.AddEmployeeRoleAsync(newRole)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.AddRole(newRoleDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(EmployeeRoleController.GetRoleById), createdAtActionResult.ActionName);
            Assert.Equal(3, ((EmployeeRoleDTO)createdAtActionResult.Value).EmployeeRoleId);
        }

        [Fact]
        public async Task AddRole_ReturnsBadRequest_WhenExceptionOccurs()
        {
            // Arrange
            var newRoleDto = new EmployeeRoleCreateDTO();
            _mockMapper.Setup(mapper => mapper.Map<EmployeeRole>(newRoleDto)).Throws(new Exception("Test exception"));

            // Act
            var result = await _controller.AddRole(newRoleDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task UpdateRole_ReturnsNoContent_WhenUpdateIsSuccessful()
        {
            // Arrange
            var roleDto = new EmployeeRoleUpdateDTO { EmployeeRoleName = "Updated Admin", Description = "Updated description" };
            var existingRole = new EmployeeRole { EmployeeRoleId = 1, EmployeeRoleName = "Admin", Description = "Administrator" };

            _mockRepo.Setup(repo => repo.GetEmployeeRoleByIdAsync(1)).ReturnsAsync(existingRole);
            _mockRepo.Setup(repo => repo.UpdateEmployeeRoleAsync(existingRole)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdateRole(1, roleDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateRole_ReturnsNotFound_WhenRoleDoesNotExist()
        {
            // Arrange
            var roleDto = new EmployeeRoleUpdateDTO();
            _mockRepo.Setup(repo => repo.GetEmployeeRoleByIdAsync(1)).ReturnsAsync((EmployeeRole)null);

            // Act
            var result = await _controller.UpdateRole(1, roleDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteRole_ReturnsNoContent_WhenDeleteIsSuccessful()
        {
            // Arrange
            var existingRole = new EmployeeRole { EmployeeRoleId = 1, EmployeeRoleName = "Admin", Description = "Administrator" };
            _mockRepo.Setup(repo => repo.GetEmployeeRoleByIdAsync(1)).ReturnsAsync(existingRole);
            _mockRepo.Setup(repo => repo.DeleteEmployeeRoleAsync(1)).Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteRole(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteRole_ReturnsNotFound_WhenRoleDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(repo => repo.GetEmployeeRoleByIdAsync(1)).ReturnsAsync((EmployeeRole)null);

            // Act
            var result = await _controller.DeleteRole(1);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task AddRole_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("EmployeeRoleName", "Required");
            var newRoleDto = new EmployeeRoleCreateDTO();

            // Act
            var result = await _controller.AddRole(newRoleDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task UpdateRole_Returns500_WhenConcurrencyExceptionOccurs()
        {
            // Arrange
            var roleDto = new EmployeeRoleUpdateDTO();
            var existingRole = new EmployeeRole();

            _mockRepo.Setup(r => r.GetEmployeeRoleByIdAsync(1)).ReturnsAsync(existingRole);
            _mockRepo.Setup(r => r.UpdateEmployeeRoleAsync(existingRole))
                .ThrowsAsync(new Exception("Concurrency conflict"));

            // Act
            var result = await _controller.UpdateRole(1, roleDto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

    }
}