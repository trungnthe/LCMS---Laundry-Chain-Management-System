using BusinessObjects.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.AttendanceDTO
{
    public class CreateAttendanceDto
    {
        public List<int> EmployeeIDs { get; set; }  // Mảng EmployeeIDs
        public int WorkScheduleId { get; set; }      // ID ca làm việc
        public DateOnly StartDate { get; set; }      // Ngày bắt đầu
        public DateOnly EndDate { get; set; }        // Ngày kết thúc
    }

    public class AttendanceDto
    {

        public int Id { get; set; }

        public int WorkScheduleId { get; set; }

        public decimal? HoursWorked { get; set; }

        public decimal? OvertimeHours { get; set; }

        public int? LateMinutes { get; set; }

        public int? EarlyLeaveMinutes { get; set; }

        public DateTime? CreatedAt { get; set; }

        public int? EmployeeId { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateOnly? ShiftDate { get; set; }

        public TimeOnly? CheckIn { get; set; }

        public TimeOnly? CheckOut { get; set; }

        public string? Status { get; set; }
        public string? EmployeeName { get; set; }
        public string? ShiftName { get; set; }
        public string? ShiftStart { get; set; }
        public string? ShiftEnd { get; set; }
        public string? Note { get; set; }
    }

    public class UpdateAttendanceDto
    {
        public int WorkScheduleId { get; set; }
        public int? EmployeeId { get; set; }
        public DateOnly? ShiftDate { get; set; }
        public string? CheckIn { get; set; } // Thay đổi thành string
        public string? CheckOut { get; set; } // Thay đổi thành string
        public string? Status { get; set; }
        public string? Note { get; set; }
    }
    public class AttendanceTodayDto
    {

        public int WorkScheduleId { get; set; }
        public int? EmployeeId { get; set; }
        public DateOnly? ShiftDate { get; set; }
        public TimeOnly? CheckIn { get; set; }
        public TimeOnly? CheckOut { get; set; }
        public string? Status { get; set; }
        public string? ShiftName { get; set; }
        public string? ShiftStart { get; set; }
        public string? ShiftEnd { get; set; }
        public string? Note { get; set; }
        public decimal? HoursWorked { get; set; }

        public decimal? OvertimeHours { get; set; }

        public int? LateMinutes { get; set; }

        public int? EarlyLeaveMinutes { get; set; }
    }
}

    
