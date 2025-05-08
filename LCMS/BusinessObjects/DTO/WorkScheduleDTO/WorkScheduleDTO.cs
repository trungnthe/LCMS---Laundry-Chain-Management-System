using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DTO.WorkScheduleDTO
{
    public class WorkScheduleDTO
    {
        public int Id { get; set; } // ID của ca làm việc
        public string ShiftName { get; set; } // Tên ca làm việc
        public TimeOnly ShiftStart { get; set; } // Thời gian bắt đầu
        public TimeOnly ShiftEnd { get; set; } // Thời gian kết thúc
        public string Status { get; set; } // Trạng thái ca làm việc
        public DateTime CreatedAt { get; set; } // Thời gian tạo
        public DateTime UpdatedAt { get; set; } // Thời gian cập nhật
    }
    public class AddWorkScheduleDTO
    {
        public string ShiftName { get; set; } // Tên ca làm việc
        public string ShiftStart { get; set; } // Thời gian bắt đầu
        public string ShiftEnd { get; set; } // Thời gian kết thúc
        public string Status { get; set; } // Trạng thái ca làm việc
    }

    public class UpdateWorkScheduleDTO
    {
        public string ShiftName { get; set; } // Tên ca làm việc
        public string ShiftStart { get; set; } // Thời gian bắt đầu
        public string ShiftEnd { get; set; } // Thời gian kết thúc
        public string Status { get; set; } // Trạng thái ca làm việc
    }
}
