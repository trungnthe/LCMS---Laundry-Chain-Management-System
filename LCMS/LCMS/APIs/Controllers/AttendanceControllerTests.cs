using APIs.Controllers;
using AutoMapper;
using BusinessObjects.DTO.AttendanceDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;

namespace Tests.APIs.Controllers
{
    public class AttendanceControllerTests
    {
        private readonly Mock<IAttendanceRepository> _attendanceRepo;
        private readonly Mock<IWorkScheduleRepository> _workScheduleRepo;
        private readonly Mock<IEmployeeRepository> _employeeRepo;
        private readonly Mock<ISalaryStructureRepository> _salaryRepo;
        private readonly Mock<IMapper> _mapper;
        private readonly AttendanceController _controller;

        public AttendanceControllerTests()
        {
            _attendanceRepo = new Mock<IAttendanceRepository>();
            _workScheduleRepo = new Mock<IWorkScheduleRepository>();
            _employeeRepo = new Mock<IEmployeeRepository>();
            _salaryRepo = new Mock<ISalaryStructureRepository>();
            _mapper = new Mock<IMapper>();
            _controller = new AttendanceController(_attendanceRepo.Object, _workScheduleRepo.Object, _mapper.Object, _employeeRepo.Object, _salaryRepo.Object);
        }

        [Fact]
        public async Task GetAttendanceById_ShouldReturnOk_WhenFound()
        {
            var attendance = new Attendance { Id = 1 };
            var dto = new AttendanceDto();

            _attendanceRepo.Setup(r => r.GetAttendanceById(1)).ReturnsAsync(attendance);
            _mapper.Setup(m => m.Map<AttendanceDto>(attendance)).Returns(dto);

            var result = await _controller.GetAttendanceById(1);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().Be(dto);
        }

        [Fact]
        public async Task GetAttendanceById_ShouldReturnNotFound_WhenNotFound()
        {
            _attendanceRepo.Setup(r => r.GetAttendanceById(1)).ReturnsAsync((Attendance)null);

            var result = await _controller.GetAttendanceById(1);

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task GetAttendanceById_ShouldReturnBadRequest_WhenExceptionThrown()
        {
            _attendanceRepo.Setup(r => r.GetAttendanceById(1)).ThrowsAsync(new Exception("Error"));

            var result = await _controller.GetAttendanceById(1);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task GetAttendanceByEmployeeToday_ShouldReturnBadRequest_WhenNoClaim()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await _controller.GetAttendanceByEmployeeToday();

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task GetAttendanceByEmployeeToday_ShouldReturnNotFound_WhenNoData()
        {
            SetupUserWithClaim("AccountId", "1");
            _attendanceRepo.Setup(r => r.GetAttendanceByEmployeeToday(1)).ReturnsAsync((List<Attendance>)null);

            var result = await _controller.GetAttendanceByEmployeeToday();

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task GetAttendanceByEmployeeToday_ShouldReturnOk_WhenDataExists()
        {
            var attendances = new List<Attendance> { new Attendance() };
            var dtos = new List<AttendanceTodayDto> { new AttendanceTodayDto() };

            SetupUserWithClaim("AccountId", "1");
            _attendanceRepo.Setup(r => r.GetAttendanceByEmployeeToday(1)).ReturnsAsync(attendances);
            _mapper.Setup(m => m.Map<List<AttendanceTodayDto>>(attendances)).Returns(dtos);

            var result = await _controller.GetAttendanceByEmployeeToday();

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().Be(dtos);
        }

        [Fact]
        public async Task UpdateService_ShouldReturnBadRequest_WhenDTOIsNull()
        {
            var result = await _controller.UpdateService(1, null);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task UpdateService_ShouldReturnNotFound_WhenAttendanceNotFound()
        {
            _attendanceRepo.Setup(r => r.GetAttendanceById(1)).ReturnsAsync((Attendance)null);

            var dto = new UpdateAttendanceDto();
            var result = await _controller.UpdateService(1, dto);

            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task UpdateService_ShouldReturnOk_WhenUpdatedSuccessfully()
        {
            var attendance = new Attendance { Id = 1 };
            var dto = new UpdateAttendanceDto
            {
                CheckIn = "08:00",
                CheckOut = "17:00",
                Status = "Present",
                ShiftDate = DateOnly.FromDateTime(DateTime.Today),
                EmployeeId = 5,
                Note = "Good",
                WorkScheduleId = 1
            };

            _attendanceRepo.Setup(r => r.GetAttendanceById(1)).ReturnsAsync(attendance);
            _attendanceRepo.Setup(r => r.UpdateAttendance(attendance)).Returns(Task.CompletedTask);
            _attendanceRepo.Setup(r => r.UpdateAttendanceWorkTime(attendance.Id)).ReturnsAsync(new OkResult() as IActionResult);

            // ✅ Không dùng callback nếu method trả về Task



            var result = await _controller.UpdateService(1, dto);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().Be(dto);
        }

        private void SetupUserWithClaim(string type, string value)
        {
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new List<Claim>
            {
                new Claim(type, value)
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claims }
            };
        }
    }
}
