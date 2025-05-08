using BusinessObjects.DTO.EmployeeRoleDTO;
using BusinessObjects.DTO.ServiceDTO;
using BusinessObjects.Models;
using DataAccess.Dao;
using Microsoft.AspNetCore.Mvc;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repository
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly AttendanceDao _attendanceDao;

        public AttendanceRepository(AttendanceDao attendanceDao)
        {
            _attendanceDao = attendanceDao;
        }
        public async Task<List<Attendance>> CreateAttendanceRecordsAsync(List<Employee> employees, int workScheduleId, DateOnly startDate, DateOnly endDate)
        {
            // Gọi phương thức bất đồng bộ từ AttendanceDao và đợi kết quả
            return await _attendanceDao.CreateAttendanceRecordsAsync(employees, workScheduleId, startDate, endDate);
        }

        public async Task<List<Attendance>> GetAttendancesByEmployeeIdAsync(int employeeId, DateOnly startDate, DateOnly endDate)
        {
            return await _attendanceDao.GetAttendancesByEmployeeIdAsync(employeeId, startDate, endDate);
        }

        public async Task<List<Attendance>> GetAttendancesInMonthAsync( int year, int month)
        {
            return await _attendanceDao.GetAttendancesInMonthAsync( year, month);
        }

        public async Task<List<Employee>> GetEmployeesByIdsAsync(List<int> employeeIDs)
        {
            return await _attendanceDao.GetEmployeesByIdsAsync(employeeIDs);
        }

        public async Task<IActionResult> UpdateAttendanceWorkTime(int id)
        {
            return await _attendanceDao.UpdateAttendanceWorkTime(id);
        }

        public async Task<Attendance> GetAttendanceById(int id)
        {
            return await _attendanceDao.GetAttendanceByIdAsync(id);
        }
        public async Task UpdateAttendance(Attendance attendance)
        {
             await _attendanceDao.UpdateAttendance(attendance);
        }



        public async Task<IActionResult> CheckInAsync(int id)
        {
            await _attendanceDao.CheckInAsync(id);
            return new OkObjectResult("Check-in successful"); // Return success response
        }

        public async Task<IActionResult> CheckOutAsync(int id)
        {
            await _attendanceDao.CheckOutAsync(id);
            return new OkObjectResult("Check-out successful"); // Return success response
        }

        public async Task<List<Attendance>> GetAttendanceByEmployeeToday(int id)
        {
            return await _attendanceDao.GetAttendanceByEmployeeToday(id);
        }

        public async Task<List<Attendance>> GetAttendanceByBranchId(int id)
        {
            return await _attendanceDao.GetAttendanceByBranch(id);
        }

        public async Task<int?> GetBranchIdByEmployeeId(int employeeId)
        {
            return await _attendanceDao.GetBranchIdByEmployeeId(employeeId);
        }

        public async Task<Attendance> GetAttendanceByEmployeeTodayByTime(int id)
        {
            return await _attendanceDao.GetAttendanceByEmployeeTodayByTime(id);
        }

        public async Task<List<Attendance>> GetAllAttendanceByAccountID(int id)
        {
            return await _attendanceDao.GetAllAttendanceByAccountID(id);
        }

        public async Task<List<Attendance>> GetAttendancesByEmployeeIdInMonthAsync(int employeeId, int year, int month)
        {
            return await _attendanceDao.GetAttendancesByEmployeeIdInMonthAsync(employeeId, year, month);
        }
    }
}
