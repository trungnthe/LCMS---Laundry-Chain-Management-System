using APIs.Controllers;
using AutoMapper;
using BusinessObjects.DTO.BranchDTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace APIs.Tests
{
    public class BranchControllerTests
    {
        private readonly Mock<IBranchRepository> _branchRepositoryMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly BranchController _controller;

        public BranchControllerTests()
        {
            _branchRepositoryMock = new Mock<IBranchRepository>();
            _mapperMock = new Mock<IMapper>();
            _controller = new BranchController(_branchRepositoryMock.Object, _mapperMock.Object);
       
        }

        #region Test for GetBranchStatuses

        [Theory]
        [InlineData(0)]  // "Mở Cửa"
        [InlineData(1)]  // "Không hoạt động"
        [InlineData(2)]  // "Bảo Trì"
        [InlineData(3)]  // "Quá tải"
        public void GetBranchStatuses_ShouldReturnStatuses(int index)
        {
            // Arrange
            var expectedStatuses = new List<string> { "Mở Cửa", "Không hoạt động", "Bảo Trì", "Quá tải" };
            _branchRepositoryMock.Setup(repo => repo.GetAllStatuses()).Returns(expectedStatuses);

            // Act
            var result = _controller.GetBranchStatuses();

            // Assert
            Assert.NotNull(result);  // Kiểm tra kết quả không phải null
            var okResult = Assert.IsType<OkObjectResult>(result);
            var statuses = Assert.IsType<List<string>>(okResult.Value);

            Assert.Equal(expectedStatuses[index], statuses[index]);
        }




        #endregion

        #region Test for GetBranchesByRoleId

        [Theory]
        [InlineData(1, "Branch 1")]
        [InlineData(2, "Branch 2")]
        [InlineData(3, "Branch 3")]
        public async Task GetBranchesByRoleId_ShouldReturnBranches(int branchId, string branchName)
        {
            // Arrange
            var branchList = new List<BranchDto>
            {
                new BranchDto { BranchId = branchId, BranchName = branchName }
            };
            _branchRepositoryMock.Setup(repo => repo.GetBranchesByRoleIdAsync()).ReturnsAsync(branchList);

            // Act
            var result = await _controller.GetBranchesByRoleId();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var branches = Assert.IsType<List<BranchDto>>(okResult.Value);
            Assert.Equal(branchName, branches[0].BranchName);
        }

        #endregion

        #region Test for GetBranches

        [Theory]
        [InlineData(1, "Branch 1")]
        [InlineData(2, "Branch 2")]
        [InlineData(3, "Branch 3")]
        public async Task GetBranches_ShouldReturnAllBranches(int branchId, string branchName)
        {
            // Arrange
            var branches = new List<BranchDto>
            {
                new BranchDto { BranchId = branchId, BranchName = branchName }
            };
            _branchRepositoryMock.Setup(repo => repo.GetAllBranchesAsync()).ReturnsAsync(branches);

            // Act
            var result = await _controller.GetBranches();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<BranchDto>>(okResult.Value);
            Assert.Equal(branchName, returnValue[0].BranchName);
        }

        #endregion

        #region Test for GetBranchById

        [Theory]
        [InlineData(1, "Branch 1")]
        [InlineData(2, "Branch 2")]
        [InlineData(3, "Branch 3")]
        public async Task GetBranchById_ShouldReturnBranch_WhenBranchExists(int branchId, string branchName)
        {
            // Arrange
            var branch = new BranchDto { BranchId = branchId, BranchName = branchName };
            _branchRepositoryMock.Setup(repo => repo.GetBranchByIdAsync(branchId)).ReturnsAsync(branch);

            // Act
            var result = await _controller.GetBranchById(branchId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<BranchDto>(okResult.Value);
            Assert.Equal(branchName, returnValue.BranchName);
        }

        [Theory]
        [InlineData(999)]
        [InlineData(1000)]
        [InlineData(1001)]
        public async Task GetBranchById_ShouldReturnNotFound_WhenBranchDoesNotExist(int branchId)
        {
            // Arrange
            _branchRepositoryMock.Setup(repo => repo.GetBranchByIdAsync(branchId)).ReturnsAsync((BranchDto)null);

            // Act
            var result = await _controller.GetBranchById(branchId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        #endregion

        #region Test for CreateBranch

        [Theory]
        [InlineData("New Branch 1", "Mở Cửa")]
        [InlineData("New Branch 2", "Không hoạt động")]
        [InlineData("New Branch 3", "Bảo Trì")]
        public async Task CreateBranch_ShouldReturnCreatedAtAction_WhenSuccessful(string branchName, string status)
        {
            // Arrange
            var newBranchDto = new UpdateBranchDto { BranchName = branchName, Status = status };
            var createdBranch = new BranchDto { BranchId = 1, BranchName = branchName };
            _branchRepositoryMock.Setup(repo => repo.CreateBranchAsync(newBranchDto)).ReturnsAsync(createdBranch);

            // Act
            var result = await _controller.CreateBranch(newBranchDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetBranchById", createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
        }

        [Theory]
        [InlineData("Branch 1", "Mở Cửa")]
        [InlineData("Branch 2", "Không hoạt động")]
        [InlineData("Branch 3", "Bảo Trì")]
        public async Task CreateBranch_ShouldReturnCreatedAtAction_WhenModelStateValid(string branchName, string status)
        {
            // Arrange (Chuẩn bị)
            var newBranchDto = new UpdateBranchDto { BranchName = branchName, Status = status };

            // Mô phỏng hành vi repository khi tạo chi nhánh mới
            var createdBranch = new BranchDto { BranchId = 1, BranchName = branchName };
            _branchRepositoryMock.Setup(repo => repo.CreateBranchAsync(It.IsAny<UpdateBranchDto>())).ReturnsAsync(createdBranch);

            // Act (Thực thi hành động)
            var result = await _controller.CreateBranch(newBranchDto);

            // Assert (Kiểm tra kết quả)
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetBranchById", createdAtActionResult.ActionName); // Kiểm tra xem actionName có phải là "GetBranchById"
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]); // Kiểm tra xem "id" có phải là 1
        }











        #endregion

        #region Test for UpdateBranch

        [Theory]
        [InlineData(1, "Updated Branch 1", "Mở Cửa")]
        [InlineData(2, "Updated Branch 2", "Không hoạt động")]
        [InlineData(3, "Updated Branch 3", "Bảo Trì")]
        public async Task UpdateBranch_ShouldReturnNoContent_WhenSuccessful(int branchId, string branchName, string status)
        {
            // Arrange
            var updateBranchDto = new UpdateBranchDto { BranchName = branchName, Status = status };
            _branchRepositoryMock.Setup(repo => repo.UpdateBranchAsync(branchId, updateBranchDto)).ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateBranch(branchId, updateBranchDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Theory]
        [InlineData(999, "Updated Branch", "Mở Cửa")]
        [InlineData(1000, "Updated Branch", "Không hoạt động")]
        [InlineData(1001, "Updated Branch", "Bảo Trì")]
        public async Task UpdateBranch_ShouldReturnNotFound_WhenBranchNotFound(int branchId, string branchName, string status)
        {
            // Arrange
            var updateBranchDto = new UpdateBranchDto { BranchName = branchName, Status = status };
            _branchRepositoryMock.Setup(repo => repo.UpdateBranchAsync(branchId, updateBranchDto)).ReturnsAsync(false);

            // Act
            var result = await _controller.UpdateBranch(branchId, updateBranchDto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        #endregion

        #region Test for DeleteBranch

        [Theory]
        [InlineData(1)]
        [InlineData(2)]
        [InlineData(3)]
        public async Task DeleteBranch_ShouldReturnNoContent_WhenSuccessful(int branchId)
        {
            // Arrange
            _branchRepositoryMock.Setup(repo => repo.DeleteBranchAsync(branchId)).ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteBranch(branchId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Theory]
        [InlineData(999)]
        [InlineData(1000)]
        [InlineData(1001)]
        public async Task DeleteBranch_ShouldReturnNotFound_WhenBranchNotFound(int branchId)
        {
            // Arrange
            _branchRepositoryMock.Setup(repo => repo.DeleteBranchAsync(branchId)).ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteBranch(branchId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        #endregion

        #region Test for SearchBranches
        [Theory]
        [InlineData("Branch 1", 1)]  // Tìm kiếm "Branch 1" và mong đợi có 1 kết quả
        [InlineData("Branch 2", 1)]  // Tìm kiếm "Branch 2" và mong đợi có 1 kết quả
        [InlineData("Branch 3", 0)]  // Tìm kiếm "Branch 3" và mong đợi không có kết quả
        public async Task SearchBranches_ShouldReturnBranches_WhenFound(string keyword, int expectedCount)
        {
            // Arrange
            var branches = new List<BranchDto>
    {
        new BranchDto { BranchId = 1, BranchName = "Branch 1" },
        new BranchDto { BranchId = 2, BranchName = "Branch 2" }
    };

            // Sửa lại mock để chỉ trả về các chi nhánh có tên chứa từ khóa tìm kiếm
            _branchRepositoryMock.Setup(repo => repo.SearchBranchesAsync(keyword))
                                 .ReturnsAsync(branches.Where(b => b.BranchName.Contains(keyword)).ToList());

            // Act
            var result = await _controller.SearchBranches(keyword);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<BranchDto>>(okResult.Value);

            // Kiểm tra số lượng chi nhánh trả về
            Assert.Equal(expectedCount, returnValue.Count);
        }


        #endregion

        #region Test for GetBranchIdByAccountId

        [Theory]
        [InlineData(1, 2)]
        [InlineData(2, 3)]
        [InlineData(3, 4)]
        public async Task GetBranchIdByAccountId_ShouldReturnBranchId_WhenFound(int accountId, int expectedBranchId)
        {
            // Arrange
            _branchRepositoryMock.Setup(repo => repo.GetBranchIdByAccountId(accountId)).ReturnsAsync(expectedBranchId);

            // Act
            var result = await _controller.GetBranchIdByAccountId(accountId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var branchId = Assert.IsType<int>(okResult.Value);
            Assert.Equal(expectedBranchId, branchId);
        }

        #endregion
    }
}
