// BookingHistoryControllerTests.cs
using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using APIs.Controllers;
using BusinessObjects.DTO.BookingHistoryDTO;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using BusinessObjects;

public class BookingHistoryControllerTests
{
    private readonly Mock<IBookingHistory> _mockBookingHistory;
    private readonly Mock<IHubContext<SignalHub>> _mockHubContext;
    private readonly Mock<IBookingRepository> _mockBookingRepo;
    private readonly BookingHistoryController _controller;

    public BookingHistoryControllerTests()
    {
        _mockBookingHistory = new Mock<IBookingHistory>();
        _mockHubContext = new Mock<IHubContext<SignalHub>>();
        _mockBookingRepo = new Mock<IBookingRepository>();
        _controller = new BookingHistoryController(_mockBookingHistory.Object, _mockHubContext.Object, _mockBookingRepo.Object);
    }

    #region GetAllBookingHistories
    [Theory]
    [MemberData(nameof(GetAllBookingHistoryMockData))]
    public async Task GetAllBookingHistories_ReturnsVariousLists(List<BookingStatusHistoryDto> mockList, int expectedCount)
    {
        _mockBookingHistory.Setup(x => x.GetAllBookingHistoryAsync()).ReturnsAsync(mockList);

        var result = await _controller.GetAllBookingHistories();
        var okResult = Assert.IsType<OkObjectResult>(result);

        if (mockList == null)
        {
            Assert.Null(okResult.Value);
        }
        else
        {
            var data = Assert.IsAssignableFrom<List<BookingStatusHistoryDto>>(okResult.Value);
            Assert.Equal(expectedCount, data.Count);
        }
    }

    public static IEnumerable<object[]> GetAllBookingHistoryMockData()
    {
        yield return new object[] { new List<BookingStatusHistoryDto> { new BookingStatusHistoryDto { BookingId = 1 } }, 1 };
        yield return new object[] { new List<BookingStatusHistoryDto>(), 0 };
        yield return new object[] { new List<BookingStatusHistoryDto> { new BookingStatusHistoryDto { BookingId = 1 }, new BookingStatusHistoryDto { BookingId = 2 } }, 2 };
        yield return new object[] { null, 0 }; // Null case
        yield return new object[] { new List<BookingStatusHistoryDto>(), 0 }; // Duplicate empty
    }

    [Theory]
    [InlineData("database error")]
    [InlineData("timeout")]
    [InlineData("network error")]
    [InlineData("null ref")]
    [InlineData("unexpected crash")]
    public async Task GetAllBookingHistories_ThrowsDifferentErrors(string message)
    {
        _mockBookingHistory.Setup(x => x.GetAllBookingHistoryAsync())
            .ThrowsAsync(new Exception(message));

        var ex = await Assert.ThrowsAsync<Exception>(() => _controller.GetAllBookingHistories());
        Assert.Equal(message, ex.Message);
    }

    [Fact]
    public async Task GetAllBookingHistories_ContainsInvalidItems()
    {
        var mockList = new List<BookingStatusHistoryDto>
        {
            null,
            new BookingStatusHistoryDto { BookingId = 1 },
            new BookingStatusHistoryDto { BookingId = 2, NewStatus = null, OldStatus = null, UpdatedAt = null, UpdatedBy = null }
        };

        _mockBookingHistory.Setup(x => x.GetAllBookingHistoryAsync()).ReturnsAsync(mockList);

        var result = await _controller.GetAllBookingHistories();
        var ok = Assert.IsType<OkObjectResult>(result);
        var data = Assert.IsAssignableFrom<List<BookingStatusHistoryDto>>(ok.Value);
        Assert.Equal(3, data.Count);
    }
    #endregion

    #region GetBookingHistoryById
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(999)]
    [InlineData(12345)]
    [InlineData(int.MaxValue)]
    public async Task GetBookingHistoryById_NotFoundTheory(int bookingId)
    {
        _mockBookingHistory.Setup(x => x.GetBookingHistoryByIdAsync(bookingId)).ReturnsAsync(new List<BookingStatusHistoryDto>());

        var result = await _controller.GetBookingHistoryById(bookingId);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("No history", notFound.Value.ToString());
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(10)]
    [InlineData(100)]
    [InlineData(2024)]
    public async Task GetBookingHistoryById_ValidTheory(int bookingId)
    {
        _mockBookingHistory.Setup(x => x.GetBookingHistoryByIdAsync(bookingId))
            .ReturnsAsync(new List<BookingStatusHistoryDto> { new BookingStatusHistoryDto { BookingId = bookingId } });

        var result = await _controller.GetBookingHistoryById(bookingId);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var data = Assert.IsType<List<BookingStatusHistoryDto>>(okResult.Value);
        Assert.Single(data);
    }

    [Theory]
    [InlineData(-100)]
    [InlineData(int.MinValue)]
    [InlineData(999999)]
    [InlineData(55)]
    [InlineData(77)]
    public async Task GetBookingHistoryById_ThrowsExceptionTheory(int bookingId)
    {
        _mockBookingHistory.Setup(x => x.GetBookingHistoryByIdAsync(bookingId))
            .ThrowsAsync(new Exception("Simulated error"));

        await Assert.ThrowsAsync<Exception>(() => _controller.GetBookingHistoryById(bookingId));
    }
    #endregion

    #region UpdateBookingStatus
    [Theory]
    [InlineData(0, null)]
    [InlineData(-1, "")]
    [InlineData(1, null)]
    [InlineData(2, "")]
    [InlineData(0, "Done")]
    public async Task UpdateBookingStatus_InvalidInput_ReturnsBadRequest(int bookingId, string newStatus)
    {
        var request = new UpdateBookingStatusRequest { BookingId = bookingId, NewStatus = newStatus };
        var result = await _controller.UpdateBookingStatus(request);
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Invalid request", badRequest.Value.ToString());
    }

    [Theory]
    [InlineData(10, "Done")]
    [InlineData(11, "Confirmed")]
    [InlineData(12, "Canceled")]
    [InlineData(13, "InProgress")]
    [InlineData(14, "Received")]
    public async Task UpdateBookingStatus_ValidInput_Success(int bookingId, string newStatus)
    {
        _mockBookingHistory.Setup(x => x.UpdateBookingStatusAsync(bookingId, newStatus)).ReturnsAsync(true);

        var mockClientProxy = new Mock<IClientProxy>();
        var mockClients = new Mock<IHubClients>();
        mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);
        _mockHubContext.Setup(h => h.Clients).Returns(mockClients.Object);

        var request = new UpdateBookingStatusRequest { BookingId = bookingId, NewStatus = newStatus };
        var result = await _controller.UpdateBookingStatus(request);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Contains("updated successfully", ok.Value.ToString());
    }

    [Theory]
    [InlineData(20, "Done")]
    [InlineData(21, "Confirmed")]
    [InlineData(22, "Canceled")]
    [InlineData(23, "InProgress")]
    [InlineData(24, "Received")]
    public async Task UpdateBookingStatus_UpdateFails_ReturnsNotFound(int bookingId, string newStatus)
    {
        _mockBookingHistory.Setup(x => x.UpdateBookingStatusAsync(bookingId, newStatus)).ReturnsAsync(false);
        var result = await _controller.UpdateBookingStatus(new UpdateBookingStatusRequest { BookingId = bookingId, NewStatus = newStatus });
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("update failed", notFound.Value.ToString());
    }

    [Theory]
    [InlineData(30, "Confirmed")]
    [InlineData(31, "Done")]
    [InlineData(32, "Rejected")]
    [InlineData(33, "Timeout")]
    [InlineData(34, "Error")]
    public async Task UpdateBookingStatus_ThrowsException_Returns500(int bookingId, string newStatus)
    {
        _mockBookingHistory.Setup(x => x.UpdateBookingStatusAsync(bookingId, newStatus))
            .ThrowsAsync(new Exception("Simulated error"));

        var request = new UpdateBookingStatusRequest { BookingId = bookingId, NewStatus = newStatus };
        var result = await _controller.UpdateBookingStatus(request);

        var error = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, error.StatusCode);
    }
    #endregion
    #region UpdateBookingDetailStatus
    [Theory]
    [InlineData(0, null)]
    [InlineData(-1, "")]
    [InlineData(5, null)]
    [InlineData(0, "Washing")]
    [InlineData(3, "")]
    public async Task UpdateBookingDetailStatus_InvalidInput_ReturnsBadRequest(int id, string status)
    {
        var request = new UpdateBookingDetailHistory { Id = id, NewStatus = status };
        var result = await _controller.UpdateBookingDetailStatus(request);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData(101, "Washing")]
    [InlineData(102, "Completed")]
    [InlineData(103, "Canceled")]
    [InlineData(104, "Received")]
    [InlineData(105, "InProgress")]
    public async Task UpdateBookingDetailStatus_UpdateFailsOrBookingNotFound_ReturnsNotFound(int id, string status)
    {
        _mockBookingHistory.Setup(x => x.UpdateBookingDetailStatusAsync(id, status)).ReturnsAsync(false);
        _mockBookingRepo.Setup(x => x.GetBookingIdByBookingDetailIdAsync(id)).ReturnsAsync((int?)null);

        var result = await _controller.UpdateBookingDetailStatus(new UpdateBookingDetailHistory { Id = id, NewStatus = status });

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("not found", notFound.Value.ToString());
    }

    [Theory]
    [InlineData(200, "Error")]
    [InlineData(201, "Boom")]
    [InlineData(202, "Exception")]
    [InlineData(203, "Unknown")]
    [InlineData(204, "Invalid")]
    public async Task UpdateBookingDetailStatus_ThrowsException_Returns500(int id, string status)
    {
        _mockBookingHistory.Setup(x => x.UpdateBookingDetailStatusAsync(id, status))
            .ThrowsAsync(new Exception("Simulated error"));

        var request = new UpdateBookingDetailHistory { Id = id, NewStatus = status };
        var result = await _controller.UpdateBookingDetailStatus(request);

        var error = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, error.StatusCode);
    }
    #endregion


    #region UpdateWeightBookingDetail

    public static IEnumerable<object[]> InvalidWeightCases => new List<object[]>
    {
        new object[] { 0, 3.5m },
        new object[] { -1, 4.0m },
        new object[] { 0, null },
        new object[] { 2, null },
        new object[] { 0, 0m }
    };
    [Theory]
    [MemberData(nameof(InvalidWeightCases))]
    public async Task UpdateWeightBookingDetail_InvalidInput_ReturnsBadRequest(int id, decimal? weight)
    {
        var request = new UpdateBookingDetailWeight { Id = id, Weight = weight };
        var result = await _controller.UpdateWeightBookingDetail(request);

        if (id <= 0)
        {
            Assert.IsType<BadRequestObjectResult>(result);
        }
        else
        {
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }

    [Fact]
    public async Task UpdateWeightBookingDetail_Success()
    {
        var request = new UpdateBookingDetailWeight { Id = 2, Weight = 3.5m };
        _mockBookingHistory.Setup(x => x.UpdateWeightBookingDetailAsync(request.Id, request.Weight)).ReturnsAsync(true);
        _mockBookingRepo.Setup(x => x.GetBookingIdByBookingDetailIdAsync(request.Id)).ReturnsAsync(1);
        _mockBookingHistory.Setup(x => x.CalculateTotalAmountAsync(1)).ReturnsAsync(100);
        _mockBookingRepo.Setup(x => x.GetBookingByIdAsync(1)).ReturnsAsync(new BusinessObjects.DTO.BookingHistoryDTO.BookingDTOforSupport
        {
            BookingId = 1,
            ShippingFee = 20,
            TotalAmount = 100
        });

        _mockBookingHistory.Setup(x => x.UpdateBookingAsync(It.IsAny<BusinessObjects.DTO.BookingHistoryDTO.BookingDTOforSupport>())).Returns(Task.CompletedTask);

        var mockClientProxy = new Mock<IClientProxy>();
        var mockClients = new Mock<IHubClients>();
        mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);
        _mockHubContext.Setup(h => h.Clients).Returns(mockClients.Object);

        var result = await _controller.UpdateWeightBookingDetail(request);
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Contains("updated successfully", ok.Value.ToString());
    }

    public static IEnumerable<object[]> UpdateWeightFailsCases => new List<object[]>
{
    new object[] { 1001, 3.2m },
    new object[] { 1002, 4.5m },
    new object[] { 1003, 0m },
    new object[] { 1004, 7m },
    new object[] { 1005, 1.1m }
};


    [Theory]
    [MemberData(nameof(UpdateWeightFailsCases))]
    public async Task UpdateWeightBookingDetail_UpdateFails_ReturnsNotFound(int id, decimal? weight)
    {
        _mockBookingHistory.Setup(x => x.UpdateWeightBookingDetailAsync(id, weight)).ReturnsAsync(false);
        var request = new UpdateBookingDetailWeight { Id = id, Weight = weight };
        var result = await _controller.UpdateWeightBookingDetail(request);
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("update failed", notFound.Value.ToString());
    }

    public static IEnumerable<object[]> GetWeightUpdateExceptionCases => new List<object[]>
    {
        new object[] { 2001, 1.5m },
        new object[] { 2002, 2.0m },
        new object[] { 2003, 3.0m },
        new object[] { 2004, 4.4m },
        new object[] { 2005, 5.5m }
    };

    [Theory]
    [MemberData(nameof(GetWeightUpdateExceptionCases))]
    public async Task UpdateWeightBookingDetail_ThrowsException_Returns500(int id, decimal? weight)
    {
        _mockBookingHistory.Setup(x => x.UpdateWeightBookingDetailAsync(id, weight))
            .ThrowsAsync(new Exception("Simulated weight error"));

        var request = new UpdateBookingDetailWeight { Id = id, Weight = weight };
        var result = await _controller.UpdateWeightBookingDetail(request);

        var error = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, error.StatusCode);
    }
    #endregion

    #region UpdateShippingFeeBooking

    public static IEnumerable<object[]> InvalidShippingFeeCases => new List<object[]>
{
    new object[] { 0, 100m },
    new object[] { -1, 200m },
    new object[] { 1, null },
    new object[] { 0, null },
    new object[] { 5, null }
};


    [Theory]
    [MemberData(nameof(InvalidShippingFeeCases))]
    public async Task UpdateShippingFeeBooking_InvalidInput_ReturnsBadRequest(int id, decimal? fee)
    {
        _mockBookingHistory.Setup(x => x.UpdateShippingFeeBookingAsync(id, fee)).ReturnsAsync(false);
        _mockBookingRepo.Setup(x => x.GetBookingIdByBookingDetailIdAsync(id)).ReturnsAsync((int?)null);

        var request = new UpdateShippingFee { Id = id, ShippingFee = fee };
        var result = await _controller.UpdateShippingFeeBooking(request);

        if (id <= 0)
        {
            Assert.IsType<BadRequestObjectResult>(result);
        }
        else
        {
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }

    [Fact]
    public async Task UpdateShippingFeeBooking_Success()
    {
        var request = new UpdateShippingFee { Id = 1, ShippingFee = 50 };
        _mockBookingHistory.Setup(x => x.UpdateShippingFeeBookingAsync(request.Id, request.ShippingFee)).ReturnsAsync(true);
        _mockBookingRepo.Setup(x => x.GetBookingIdByBookingDetailIdAsync(request.Id)).ReturnsAsync(1);
        _mockBookingHistory.Setup(x => x.CalculateTotalAmountAsync(1)).ReturnsAsync(200);
        _mockBookingRepo.Setup(x => x.GetBookingByIdAsync(1)).ReturnsAsync(new BookingDTOforSupport { BookingId = 1, ShippingFee = 50 });

        _mockBookingHistory.Setup(x => x.UpdateBookingAsync(It.IsAny<BookingDTOforSupport>())).Returns(Task.CompletedTask);

        var result = await _controller.UpdateShippingFeeBooking(request);
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Contains("updated successfully", ok.Value.ToString());
    }

    public static IEnumerable<object[]> GetShippingFeeFails => new List<object[]>
{
    new object[] { 1001, 10m },
    new object[] { 1002, 0m },
    new object[] { 1003, 5m },
    new object[] { 1004, 15m },
    new object[] { 1005, 8m }
};


    [Theory]
    [MemberData(nameof(GetShippingFeeFails))]

    public async Task UpdateShippingFeeBooking_UpdateFails_ReturnsNotFound(int id, decimal? fee)
    {
        _mockBookingHistory.Setup(x => x.UpdateShippingFeeBookingAsync(id, fee)).ReturnsAsync(false);
        var request = new UpdateShippingFee { Id = id, ShippingFee = fee };
        var result = await _controller.UpdateShippingFeeBooking(request);
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains("update failed", notFound.Value.ToString());
    }

    public static IEnumerable<object[]> GetShippingFeeExceptionCases => new List<object[]>
    {
        new object[] { 2001, 11m },
        new object[] { 2002, 22m },
        new object[] { 2003, 33m },
        new object[] { 2004, 44m },
        new object[] { 2005, 55m }
    };

    [Theory]
    [MemberData(nameof(GetShippingFeeExceptionCases))]
    public async Task UpdateShippingFeeBooking_ThrowsException_Returns500(int id, decimal? fee)
    {
        _mockBookingHistory.Setup(x => x.UpdateShippingFeeBookingAsync(id, fee))
            .ThrowsAsync(new Exception("Simulated shipping fee error"));

        var request = new UpdateShippingFee { Id = id, ShippingFee = fee };
        var result = await _controller.UpdateShippingFeeBooking(request);

        var error = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, error.StatusCode);
    }
    #endregion


}
