using AutoMapper;
using BusinessObjects.DTO.WorkScheduleDTO;
using BusinessObjects.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;

namespace APIs.Controllers
{
    [Route("api/work-schedules")]
    [ApiController]
    public class WorkScheduleController : ControllerBase
    {
        private readonly IWorkScheduleRepository _repository;
        private readonly IMapper _mapper;

        public WorkScheduleController(IWorkScheduleRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // Lấy danh sách tất cả ca làm việc
        [HttpGet("all")]

        public async Task<IActionResult> GetAllSchedules()
        {
            var schedules = await _repository.GetAllSchedulesAsync();
            var scheduleDtos = _mapper.Map<IEnumerable<WorkScheduleDTO>>(schedules);
            return Ok(scheduleDtos);
        }

        // Lấy ca làm việc theo ID
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetScheduleById(int id)
        {
            var schedule = await _repository.GetScheduleByIdAsync(id);
            if (schedule == null)
            {
                return NotFound($"Work schedule with ID {id} not found.");
            }
            var scheduleDto = _mapper.Map<WorkScheduleDTO>(schedule);
            return Ok(scheduleDto);
        }

        // Thêm ca làm việc mới
        [HttpPost("add")]
        public async Task<IActionResult> AddWorkSchedule([FromBody] AddWorkScheduleDTO scheduleDto)
        {
            if (scheduleDto == null) return BadRequest();

            var schedule = new WorkSchedule
            {
                ShiftName = scheduleDto.ShiftName,
                ShiftStart = TimeOnly.Parse(scheduleDto.ShiftStart),
                ShiftEnd = TimeOnly.Parse(scheduleDto.ShiftEnd),
                Status = scheduleDto.Status
            };

            await _repository.AddScheduleAsync(schedule);
            return CreatedAtAction(nameof(GetScheduleById), new { id = schedule.Id }, scheduleDto);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateWorkScheduleDTO scheduleDto)
        {
            if (scheduleDto == null)
            {
                return BadRequest("Invalid data.");
            }

            var existingSchedule = await _repository.GetScheduleByIdAsync(id);
            if (existingSchedule == null)
            {
                return NotFound($"Work schedule with ID {id} not found.");
            }

            // Cập nhật thông tin từ DTO vào entity
            existingSchedule.ShiftName = scheduleDto.ShiftName;
            existingSchedule.ShiftStart = TimeOnly.Parse(scheduleDto.ShiftStart);

            existingSchedule.ShiftEnd = TimeOnly.Parse(scheduleDto.ShiftEnd);
            existingSchedule.Status = scheduleDto.Status;

            await _repository.UpdateScheduleAsync(existingSchedule);
            return Ok("Work schedule updated successfully.");
        }


        // Xóa ca làm việc
        [HttpDelete("delete/{id}")]
        //[Authorize(Roles = "Admin")] 

        public async Task<IActionResult> DeleteSchedule(int id)
        {
         
            var existingSchedule = await _repository.GetScheduleByIdAsync(id);
            if (existingSchedule == null)
            {
                return NotFound($"Work schedule with ID {id} not found.");
            }

            await _repository.DeleteScheduleAsync(id);
            return Ok(id);
        }
    }
}
