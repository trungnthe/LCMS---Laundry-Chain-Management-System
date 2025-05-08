using APIs.Controllers;
using BusinessObjects.DTO.AdminBookingDTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Moq;
using Repositories.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using BusinessObjects;

namespace Tests.APIs.Controllers
{
    public class AdminBookingControllerTests
    {
        private readonly Mock<IAdminBookingRepository> _mockRepo;
        private readonly Mock<IHubContext<SignalHub>> _mockHub;
        private readonly AdminBookingController _controller;

        public AdminBookingControllerTests()
        {
            _mockRepo = new Mock<IAdminBookingRepository>();
            _mockHub = new Mock<IHubContext<SignalHub>>();
            _controller = new AdminBookingController(_mockRepo.Object, _mockHub.Object);
        }

        public static IEnumerable<object[]> BookingDTOListCases => new List<object[]>
        {
            new object[] { new List<BookingDTO> { new BookingDTO { BookingId = 1 }, new BookingDTO { BookingId = 2 } } },
            new object[] { new List<BookingDTO>() },
            new object[] { new List<BookingDTO> { new BookingDTO { Status = "Pending" } } },
            new object[] { new List<BookingDTO> { new BookingDTO { BranchId = 5, CustomerName = "John" } } },
            new object[] { new List<BookingDTO> { new BookingDTO { StaffId = 3, Status = "Confirmed" } } },
            new object[] { new List<BookingDTO> { new BookingDTO { PaymentType = "Cash" } } },
            new object[] { new List<BookingDTO> { new BookingDTO { TotalAmount = 100000 } } },
            new object[] { new List<BookingDTO> { new BookingDTO { MembershipLevel = "Gold" } } },
            new object[] { new List<BookingDTO> { new BookingDTO { Note = "Test Note" } } },
            new object[] { new List<BookingDTO> { new BookingDTO { BookingId = 99, Status = null } } },
        };

        public static IEnumerable<object[]> StatusValues => new List<object[]>
        {
            new object[] { "pending" },
            new object[] { "confirmed" },
            new object[] { "cancelled" },
            new object[] { null },
            new object[] { "" },
            new object[] { "in-progress" },
            new object[] { "done" },
            new object[] { "" },
            new object[] { "scheduled" },
            new object[] { "delayed" }
        };

        [Theory]
        [MemberData(nameof(BookingDTOListCases))]
        public async Task GetAllBookings_ShouldReturnOk_WithVariousLists(List<BookingDTO> bookings)
        {
            _mockRepo.Setup(r => r.GetAllBookingsAsync()).ReturnsAsync(bookings);
            var result = await _controller.GetAllBookings();
            result.Should().BeOfType<OkObjectResult>().Which.Value.Should().BeEquivalentTo(bookings);
        }

        [Theory]
        [InlineData(1, true)]
        [InlineData(2, true)]
        [InlineData(3, false)]
        [InlineData(4, true)]
        [InlineData(5, false)]
        [InlineData(6, true)]
        [InlineData(7, false)]
        [InlineData(8, true)]
        [InlineData(9, false)]
        [InlineData(10, true)]
        public async Task GetBookingByBookingId_ShouldReturnExpected(int id, bool found)
        {
            var booking = found ? new BookingDTO { BookingId = id } : null;
            _mockRepo.Setup(r => r.GetBookingByBookingIdAsync(id)).ReturnsAsync(booking);

            var result = await _controller.GetBookingByBookingId(id);

            if (booking == null)
                result.Should().BeOfType<NotFoundObjectResult>();
            else
                result.Should().BeOfType<OkObjectResult>().Which.Value.Should().BeEquivalentTo(booking);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(2)]
        [InlineData(3)]
        [InlineData(4)]
        [InlineData(5)]
        [InlineData(6)]
        [InlineData(7)]
        [InlineData(8)]
        [InlineData(9)]
        [InlineData(10)]
        public async Task GetBookingsByEmployeeId_ShouldReturnOk(int id)
        {
            var list = new List<BookingDTO> { new BookingDTO { StaffId = id } };
            _mockRepo.Setup(r => r.GetBookingsByEmployeeIdAsync(id)).ReturnsAsync(list);

            var result = await _controller.GetBookingsByEmployeeId(id);
            result.Should().BeOfType<OkObjectResult>().Which.Value.Should().BeEquivalentTo(list);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(2)]
        [InlineData(3)]
        [InlineData(4)]
        [InlineData(5)]
        [InlineData(6)]
        [InlineData(7)]
        [InlineData(8)]
        [InlineData(9)]
        [InlineData(10)]
        public async Task GetBookingsByStaffId_ShouldReturnOk(int id)
        {
            var list = new List<BookingDTO> { new BookingDTO { StaffId = id } };
            _mockRepo.Setup(r => r.GetBookingsByStaffIdAsync(id)).ReturnsAsync(list);

            var result = await _controller.GetBookingsByStaffId(id);
            result.Should().BeOfType<OkObjectResult>().Which.Value.Should().BeEquivalentTo(list);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(2)]
        [InlineData(3)]
        [InlineData(4)]
        [InlineData(5)]
        [InlineData(6)]
        [InlineData(7)]
        [InlineData(8)]
        [InlineData(9)]
        [InlineData(10)]
        public async Task GetBookingsByBranchId_ShouldReturnOk(int id)
        {
            var list = new List<BookingDTO> { new BookingDTO { BranchId = id } };
            _mockRepo.Setup(r => r.GetBookingsByBranchIdAsync(id)).ReturnsAsync(list);

            var result = await _controller.GetBookingsByBranchId(id);
            result.Should().BeOfType<OkObjectResult>().Which.Value.Should().BeEquivalentTo(list);
        }

        [Theory]
        [MemberData(nameof(StatusValues))]
        public async Task GetBookingsByStatus_ShouldReturnOk(string status)
        {
            var list = new List<BookingDTO> { new BookingDTO { Status = status } };
            _mockRepo.Setup(r => r.GetBookingsByStatusAsync(status)).ReturnsAsync(list);

            var result = await _controller.GetBookingsByStatus(status);
            result.Should().BeOfType<OkObjectResult>().Which.Value.Should().BeEquivalentTo(list);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(2)]
        [InlineData(3)]
        [InlineData(4)]
        [InlineData(5)]
        [InlineData(6)]
        [InlineData(7)]
        [InlineData(8)]
        [InlineData(9)]
        [InlineData(10)]
        public async Task GetLatestBookingsByDays_ShouldReturnOk(int days)
        {
            var list = new List<BookingDTO> { new BookingDTO { BookingId = days } };
            _mockRepo.Setup(r => r.GetLatestBookingsByDaysAsync(days)).ReturnsAsync(list);

            var result = await _controller.GetLatestBookingsByDays(days);
            result.Should().BeOfType<OkObjectResult>().Which.Value.Should().BeEquivalentTo(list);
        }

        [Theory]
        [InlineData(123)]
        [InlineData(0)]
        [InlineData(999)]
        [InlineData(1)]
        [InlineData(50)]
        [InlineData(300)]
        [InlineData(12)]
        [InlineData(789)]
        [InlineData(5)]
        [InlineData(1000)]
        public async Task GetAllBookingsWithPermission_ShouldReturnVariousCounts(int count)
        {
            _mockRepo.Setup(r => r.GetTotalBookingsCountAsync()).ReturnsAsync(count);
            var result = await _controller.GetAllBookingsWithPermission();
            result.Should().BeOfType<OkObjectResult>().Which.Value.Should().Be(count);
        }

        [Fact]
        public async Task GetBookingCountByStatus_ShouldReturnVariousDictionaries()
        {
            var cases = new[] {
                new Dictionary<string, int> { { "Pending", 10 } },
                new Dictionary<string, int> { { "Confirmed", 5 }, { "Cancelled", 3 } },
                new Dictionary<string, int> { { "Done", 0 } },
                new Dictionary<string, int>(),
                new Dictionary<string, int> { { "Scheduled", 7 }, { "InProgress", 2 } },
                new Dictionary<string, int> { { "A", 1 }, { "B", 2 }, { "C", 3 } },
                new Dictionary<string, int> { { "X", 99 } },
                new Dictionary<string, int> { { "Z", 42 } },
                new Dictionary<string, int> { { "VIP", 10 } },
                new Dictionary<string, int> { { "Null", 0 } }
            };

            foreach (var dict in cases)
            {
                _mockRepo.Setup(r => r.GetBookingCountByStatusAsync()).ReturnsAsync(dict);
                var result = await _controller.GetBookingCountByStatus();
                result.Should().BeOfType<OkObjectResult>().Which.Value.Should().BeEquivalentTo(dict);
            }
        }
    }
}