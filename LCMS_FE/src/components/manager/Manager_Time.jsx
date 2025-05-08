import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaEdit,
  FaSearch,
  FaUserPlus,
  FaClock,
  FaFilter,
  FaSort,
  FaAngleDown,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Header_Manager from "../reuse/Header_Manager";
import Sidebar_Manager from "../reuse/Sidebar_Manager";
import Footer_Manager from "../reuse/Footer_Manager";

import "../../assets/css/manager/manager_time.css";
import { jwtDecode } from "jwt-decode";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Manager_Time = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [activeView, setActiveView] = useState("workSchedules"); // workSchedules or attendance
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("Tuần này");
  const [shiftFilter, setShiftFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Ngày ↑");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);
  const [employees, setEmployees] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [hoursWorkedStats, setHoursWorkedStats] = useState([]);

  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
  const [showViewAttendanceModal, setShowViewAttendanceModal] = useState(false);

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedWorkSchedule, setSelectedWorkSchedule] = useState("");
  const [schedulePeriod, setSchedulePeriod] = useState({
    startDate: "",
    endDate: "",
  });
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [viewAttendance, setViewAttendance] = useState(null);
  const [attendanceFormData, setAttendanceFormData] = useState({
    checkIn: "",
    checkOut: "",
    status: "",
    note: "",
  });
  const [isDateRangeDropdownOpen, setIsDateRangeDropdownOpen] = useState(false);

  const [currentStatsPage, setCurrentStatsPage] = useState(1);
  const [recordsPerStatsPage] = useState(5);
  const indexOfLastStat = currentStatsPage * recordsPerStatsPage;
  const indexOfFirstStat = indexOfLastStat - recordsPerStatsPage;
  const currentStats = hoursWorkedStats.slice(
    indexOfFirstStat,
    indexOfLastStat
  );
  const totalStatsPages = Math.ceil(
    hoursWorkedStats.length / recordsPerStatsPage
  );
  const paginateStats = (pageNumber) => setCurrentStatsPage(pageNumber);

  const calculateStatus = (attendance, workSchedule) => {
    const currentDate = new Date();
    const shiftDate = new Date(attendance.shiftDate);

    if (!workSchedule) return "N/A";

    const shiftStartTime = workSchedule.shiftStart.split(":");
    const shiftEndTime = workSchedule.shiftEnd.split(":");

    const shiftStartDate = new Date(shiftDate);
    shiftStartDate.setHours(
      parseInt(shiftStartTime[0]),
      parseInt(shiftStartTime[1]),
      0
    );

    const shiftEndDate = new Date(shiftDate);
    shiftEndDate.setHours(
      parseInt(shiftEndTime[0]),
      parseInt(shiftEndTime[1]),
      0
    );

    if (currentDate < shiftStartDate) {
      return "Future";
    }
    const isShiftInPast = currentDate > shiftEndDate;

    if (attendance.checkIn && attendance.checkOut) {
      return isShiftInPast ? "Completed" : "Ongoing";
    }

    if (attendance.checkIn && !attendance.checkOut) {
      return isShiftInPast ? "N/A" : "Ongoing";
    }
    if (!attendance.checkIn && !attendance.checkOut) {
      if (currentDate >= shiftStartDate && currentDate <= shiftEndDate) {
        return "Ongoing";
      }
      return isShiftInPast ? "Absent" : "Future";
    }

    return "N/A";
  };

  const [statusStats, setStatusStats] = useState({
    total: 0,
    future: 0,
    completed: 0,
    ongoing: 0,
    absent: 0,
  });
  const canEditAttendance = (attendance) => {
    const workSchedule = workSchedules.find(
      (ws) => ws.id === attendance.workScheduleId
    );
    if (!workSchedule) return false;

    const shiftStartParts = workSchedule.shiftStart.split(":");
    const shiftDate = new Date(attendance.shiftDate);
    shiftDate.setHours(
      parseInt(shiftStartParts[0]),
      parseInt(shiftStartParts[1]),
      0,
      0
    );

    return new Date() >= shiftDate; // Chỉ cho phép chỉnh sửa nếu hiện tại >= thời gian bắt đầu ca
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Future":
        return "Sắp diễn ra";
      case "Completed":
        return "Hoàn thành";
      case "Ongoing":
        return "Đang diễn ra";
      case "Absent":
        return "Nghỉ";
      case "N/A":
        return "Không xác định";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Future":
        return "future";
      case "Completed":
        return "completed";
      case "Ongoing":
        return "ongoing";
      case "Absent":
        return "absent";
      case "N/A":
        return "na";
      default:
        return "";
    }
  };
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });
  useEffect(() => {
    if (showAddScheduleModal) {
      const token = localStorage.getItem("token");
      if (token) {
        fetchEmployees(token);
      }
    }
  }, [showAddScheduleModal]);

  useEffect(() => {
    if (operation.status === "success") {
      const timer = setTimeout(() => {
        setOperation({ status: "", message: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [operation.status]);

  useEffect(() => {
    if (operationError) {
      const timer = setTimeout(() => {
        setOperationError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [operationError]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      setBranchId(decodedToken.BranchId);
      fetchWorkSchedules(token);
      fetchEmployees(token);
      if (activeView === "attendance") {
        fetchAttendances(token);
        fetchTotalHoursStats(token, selectedYear, selectedMonth);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error decoding token:", error);
      setOperationError("Lỗi xác thực. Vui lòng đăng nhập lại.");
      setLoading(false);
    }
  }, [activeView, selectedYear, selectedMonth]);

  useEffect(() => {
    if (activeView === "attendance") {
      const token = localStorage.getItem("token");
      if (token) {
        fetchAttendances(token);
        const intervalId = setInterval(() => {
          fetchAttendances(token);
        }, 60000);

        return () => clearInterval(intervalId);
      }
    }
  }, [activeView]);

  const handleDateRangeSelect = (range) => {
    setDateRangeFilter(range);
    setIsDateRangeDropdownOpen(false);
    setCurrentPage(1);
  };

  const toggleDateRangeDropdown = () => {
    setIsDateRangeDropdownOpen(!isDateRangeDropdownOpen);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleShiftFilterChange = (e) => {
    setShiftFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
    setCurrentPage(1);
  };

  const switchToWorkSchedules = () => {
    setActiveView("workSchedules");
    setCurrentPage(1);
  };

  const switchToAttendance = () => {
    setActiveView("attendance");
    setCurrentPage(1);
    const token = localStorage.getItem("token");
    if (token) {
      fetchAttendances(token);
      fetchTotalHoursStats(token, selectedYear, selectedMonth);
    }
  };

  const fetchWorkSchedules = async (token) => {
    try {
      const response = await fetch(`${apiUrl}/api/work-schedules/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch work schedules");
      }
      const data = await response.json();
      setWorkSchedules(data);
    } catch (error) {
      console.error("Error fetching work schedules:", error);
      setOperationError(
        "Không thể tải danh sách ca làm việc. Vui lòng thử lại sau."
      );
    }
  };

  const fetchEmployees = async (token) => {
    try {
      const response = await fetch(`${apiUrl}/api/Employee/get-all-employee`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      const filteredEmployees = data.filter(
        (employee) =>
          employee.branchId === parseInt(branchId) &&
          employee.employeeRoleId !== 0
      );
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setOperationError(
        "Không thể tải danh sách nhân viên. Vui lòng thử lại sau."
      );
    }
  };

  const fetchAttendances = async (token) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/Attendance/get-attendance-by-branch`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch attendances");
      }

      const data = await response.json();
      const currentDate = new Date();

      const updatedData = data.map((attendance) => {
        const workSchedule = workSchedules.find(
          (ws) => ws.id === attendance.workScheduleId
        );

        const status = calculateStatus(attendance, workSchedule);

        return { ...attendance, status };
      });

      setAttendances(updatedData);

      const total = updatedData.length;
      const future = updatedData.filter(
        (attendance) => attendance.status === "Future"
      ).length;
      const completed = updatedData.filter(
        (attendance) => attendance.status === "Completed"
      ).length;
      const ongoing = updatedData.filter(
        (attendance) => attendance.status === "Ongoing"
      ).length;
      const absent = updatedData.filter(
        (attendance) => attendance.status === "Absent"
      ).length;
      const na = updatedData.filter(
        (attendance) => attendance.status === "N/A"
      ).length;

      setStatusStats({
        total,
        future,
        completed,
        ongoing,
        absent,
        na: na || 0,
      });
    } catch (error) {}
  };

  const fetchTotalHoursStats = async (token, year, month) => {
    try {
      const url = `${apiUrl}/api/Attendance/manager/get-total-hours-worked/${year}/${month}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hours stats");
      }

      const data = await response.json();
      setHoursWorkedStats(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error fetching hours stats:", error);
      setHoursWorkedStats([]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearMonthChange = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchTotalHoursStats(token, selectedYear, selectedMonth);
    }
  };

  const openAddScheduleModal = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      if (employees.length === 0) {
        await fetchEmployees(token);
      }
      setShowAddScheduleModal(true);
    }
  };
  const openEditAttendanceModal = (id) => {
    const attendance = attendances.find((a) => a.id === id);
    if (attendance && canEditAttendance(attendance)) {
      setCurrentAttendance(attendance);
      setAttendanceFormData({
        checkIn: attendance.checkIn ? attendance.checkIn.substring(0, 5) : "",
        checkOut: attendance.checkOut
          ? attendance.checkOut.substring(0, 5)
          : "",
        status: attendance.status,
        note: attendance.note || "",
      });
      setShowEditAttendanceModal(true);
    } else {
      setOperationError("Không thể chỉnh sửa vì ca làm việc chưa diễn ra.");
    }
  };

  const openViewAttendanceModal = (id) => {
    const attendance = attendances.find((a) => a.id === id);
    if (attendance) {
      setViewAttendance(attendance);
      setShowViewAttendanceModal(true);
    }
  };
  const handleEmployeeSelect = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(parseInt(options[i].value));
      }
    }
    setSelectedEmployees(selectedValues);
  };
  const handleSchedulePeriodChange = (e) => {
    const { name, value } = e.target;
    setSchedulePeriod((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Kiểm tra ngày trong quá khứ
    if (name === "startDate") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);

      if (selectedDate < today) {
        setOperationError(
          "Không thể thêm lịch làm việc cho ngày trong quá khứ."
        );
        return;
      }
    }
    if (name === "endDate" && schedulePeriod.startDate) {
      if (new Date(value) < new Date(schedulePeriod.startDate)) {
        setOperationError("Ngày kết thúc không thể trước ngày bắt đầu.");
        return;
      }
    }
    setOperationError("");
  };
  const handleWorkScheduleChange = (e) => {
    const scheduleId = e.target.value;
    setSelectedWorkSchedule(scheduleId);

    if (
      !scheduleId ||
      selectedEmployees.length === 0 ||
      !schedulePeriod.startDate ||
      !schedulePeriod.endDate
    ) {
      return;
    }
    checkScheduleConflicts(scheduleId);
  };

  const checkScheduleConflicts = (scheduleId) => {
    const conflictEmployees = [];
    const dateRange = [];
    const currentDate = new Date(schedulePeriod.startDate);
    const endDate = new Date(schedulePeriod.endDate);

    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const employeeId of selectedEmployees) {
      const employeeName = getEmployeeName(employeeId);

      for (const date of dateRange) {
        const date = new Date();
        const formattedDate =
          (date.getDate() < 10 ? "0" : "") +
          date.getDate() +
          "/" +
          (date.getMonth() + 1 < 10 ? "0" : "") +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear();
        const existingSchedules = attendances.filter(
          (att) =>
            att.employeeId === employeeId &&
            new Date(att.shiftDate).toISOString().split("T")[0] ===
              formattedDate
        );

        for (const schedule of existingSchedules) {
          const existingShift = workSchedules.find(
            (ws) => ws.id === schedule.workScheduleId
          );

          if (existingShift && existingShift.id === parseInt(scheduleId)) {
            conflictEmployees.push({
              employeeName,
              date: formattedDate,
              shiftName: existingShift.shiftName,
            });
            break;
          }
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAttendanceFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddScheduleForPeriod = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setOperationError("Vui lòng đăng nhập lại.");
      return;
    }

    if (selectedEmployees.length === 0) {
      setOperationError("Vui lòng chọn ít nhất một nhân viên.");
      return;
    }

    if (!selectedWorkSchedule) {
      setOperationError("Vui lòng chọn ca làm việc.");
      return;
    }

    if (!schedulePeriod.startDate || !schedulePeriod.endDate) {
      setOperationError("Vui lòng chọn ngày bắt đầu và kết thúc.");
      return;
    }

    if (new Date(schedulePeriod.startDate) > new Date(schedulePeriod.endDate)) {
      setOperationError("Ngày bắt đầu không thể sau ngày kết thúc.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(schedulePeriod.startDate);
    if (startDate < today) {
      setOperationError("Không thể thêm lịch làm việc cho ngày trong quá khứ.");
      return;
    }

    const selectedShift = workSchedules.find(
      (ws) => ws.id === parseInt(selectedWorkSchedule)
    );
    if (!selectedShift) {
      setOperationError("Ca làm việc không hợp lệ.");
      return;
    }

    const conflictEmployees = [];

    const dateRange = [];
    const currentDate = new Date(schedulePeriod.startDate);
    const endDate = new Date(schedulePeriod.endDate);

    while (currentDate <= endDate) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const employeeId of selectedEmployees) {
      const employeeName = getEmployeeName(employeeId);

      for (const date of dateRange) {
        const date = new Date();
        const formattedDate =
          (date.getDate() < 10 ? "0" : "") +
          date.getDate() +
          "/" +
          (date.getMonth() + 1 < 10 ? "0" : "") +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear();

        const existingSchedules = attendances.filter(
          (att) =>
            att.employeeId === employeeId &&
            new Date(att.shiftDate).toISOString().split("T")[0] ===
              formattedDate
        );

        for (const schedule of existingSchedules) {
          const existingShift = workSchedules.find(
            (ws) => ws.id === schedule.workScheduleId
          );

          if (
            existingShift &&
            existingShift.id === parseInt(selectedWorkSchedule)
          ) {
            conflictEmployees.push({
              employeeName,
              date: formattedDate,
              shiftName: existingShift.shiftName,
            });
            break;
          }
        }
      }
    }

    if (conflictEmployees.length > 0) {
      const conflictDetails = conflictEmployees
        .map(
          (conflict) =>
            `${conflict.employeeName} đã có lịch làm việc  ${conflict.shiftName} vào ngày ${conflict.date}`
        )
        .join(", ");

      setOperationError(
        `Không thể thêm lịch làm việc do trùng lịch: ${conflictDetails}`
      );
      return;
    }

    try {
      const payload = {
        employeeIDs: selectedEmployees,
        workScheduleId: parseInt(selectedWorkSchedule),
        startDate: schedulePeriod.startDate,
        endDate: schedulePeriod.endDate,
      };

      const response = await fetch(
        `${apiUrl}/api/Attendance/AddScheduleForPeriod`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add schedule");
      }

      setOperation({
        status: "success",
        message: "Thêm lịch làm việc thành công!",
      });
      setShowAddScheduleModal(false);
      setSelectedEmployees([]);
      setSelectedWorkSchedule("");
      setSchedulePeriod({
        startDate: "",
        endDate: "",
      });
      fetchAttendances(token);
    } catch (error) {
      console.error("Error adding schedule:", error);
      setOperationError(`Trùng lịch ! Không thể thêm lịch làm việc.`);
    }
  };

  const handleUpdateAttendance = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token || !currentAttendance) {
      setOperationError("Vui lòng đăng nhập lại hoặc chọn bản ghi hợp lệ.");
      return;
    }

    if (attendanceFormData.checkIn && attendanceFormData.checkOut) {
      const [inHour, inMinute] = attendanceFormData.checkIn.split(":");
      const [outHour, outMinute] = attendanceFormData.checkOut.split(":");

      const checkInMinutes = parseInt(inHour) * 60 + parseInt(inMinute);
      const checkOutMinutes = parseInt(outHour) * 60 + parseInt(outMinute);

      if (checkOutMinutes <= checkInMinutes) {
        setOperationError("Giờ check-out phải sau giờ check-in (cùng ngày).");
        return;
      }
    }

    try {
      const payload = {
        workScheduleId: currentAttendance.workScheduleId,
        employeeId: currentAttendance.employeeId,
        shiftDate: currentAttendance.shiftDate,
        checkIn: attendanceFormData.checkIn,
        checkOut: attendanceFormData.checkOut,
        status: attendanceFormData.status,
        note: attendanceFormData.note,
      };

      const response = await fetch(
        `${apiUrl}/api/Attendance/update-attendance/${currentAttendance.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update attendance");
        } else {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to update attendance");
        }
      }

      await response.json();
      setOperation({
        status: "success",
        message: "Cập nhật điểm danh thành công!",
      });
      setShowEditAttendanceModal(false);
      fetchAttendances(token);
    } catch (error) {
      console.error("Error updating attendance:", error);
      setOperationError(`Lỗi khi cập nhật điểm danh: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    if (timeString.length <= 5) return timeString;
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }
    return timeString.substring(0, 5);
  };

  const getEmployeeName = (id) => {
    const employee = employees.find((emp) => emp.accountId === id);
    return employee ? employee.employeeName : "N/A";
  };

  const getWorkScheduleName = (id) => {
    const schedule = workSchedules.find((sch) => sch.id === id);
    return schedule ? schedule.shiftName : "N/A";
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter work schedules
  const filteredWorkSchedules = workSchedules.filter((schedule) =>
    schedule.shiftName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastWorkSchedule = currentPage * recordsPerPage;
  const indexOfFirstWorkSchedule = indexOfLastWorkSchedule - recordsPerPage;
  const currentWorkSchedules = filteredWorkSchedules.slice(
    indexOfFirstWorkSchedule,
    indexOfLastWorkSchedule
  );
  const totalWorkSchedulePages = Math.ceil(
    filteredWorkSchedules.length / recordsPerPage
  );

  const filterAttendancesByDateRange = (attendances, dateRange) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(today);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (dateRange) {
      case "Tuần này":
        return attendances.filter((att) => {
          const shiftDate = new Date(att.shiftDate);
          return shiftDate >= startOfWeek && shiftDate <= endOfWeek;
        });
      case "Tuần trước":
        return attendances.filter((att) => {
          const shiftDate = new Date(att.shiftDate);
          return shiftDate >= startOfLastWeek && shiftDate <= endOfLastWeek;
        });
      case "7 ngày trước":
        return attendances.filter((att) => {
          const shiftDate = new Date(att.shiftDate);
          return shiftDate >= sevenDaysAgo && shiftDate <= today;
        });
      case "30 ngày trước":
        return attendances.filter((att) => {
          const shiftDate = new Date(att.shiftDate);
          return shiftDate >= thirtyDaysAgo && shiftDate <= today;
        });
      case "Tháng này":
        return attendances.filter((att) => {
          const shiftDate = new Date(att.shiftDate);
          return shiftDate >= startOfMonth && shiftDate <= endOfMonth;
        });
      default:
        return attendances;
    }
  };

  // Apply all filters
  const filteredAttendances = filterAttendancesByDateRange(
    attendances,
    dateRangeFilter
  ).filter((attendance) => {
    const employeeName = getEmployeeName(attendance.employeeId).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter
      ? attendance.status === statusFilter
      : true;
    const matchesShift =
      shiftFilter === "All"
        ? true
        : getWorkScheduleName(attendance.workScheduleId) === shiftFilter;

    const matchesTime =
      timeFilter === "All"
        ? true
        : timeFilter === "Morning"
        ? attendance.checkIn && attendance.checkIn.startsWith("0")
        : attendance.checkIn && !attendance.checkIn.startsWith("0");

    return matchesSearch && matchesStatus && matchesShift && matchesTime;
  });

  const sortedAttendances = [...filteredAttendances].sort((a, b) => {
    if (sortOrder === "Ngày ↑") {
      return new Date(a.shiftDate) - new Date(b.shiftDate);
    } else if (sortOrder === "Ngày ↓") {
      return new Date(b.shiftDate) - new Date(a.shiftDate);
    } else if (sortOrder === "Nhân viên A-Z") {
      return getEmployeeName(a.employeeId).localeCompare(
        getEmployeeName(b.employeeId)
      );
    } else if (sortOrder === "Nhân viên Z-A") {
      return getEmployeeName(b.employeeId).localeCompare(
        getEmployeeName(a.employeeId)
      );
    }
    return 0;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedAttendances.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(sortedAttendances.length / recordsPerPage);

  return (
    <div className="dashboard-manager-container">
      <Sidebar_Manager />
      <div className="dashboard-manager-main-content">
        <Header_Manager />
        <div className="manager-time-content">
          <div className="manager-time-header">
            <h1>Quản lý Thời Gian Làm Việc</h1>
            <div className="manager-time-tabs">
              <button
                className={`manager-time-tab ${
                  activeView === "workSchedules" ? "active" : ""
                }`}
                onClick={switchToWorkSchedules}
              >
                Danh Sách Ca Làm Việc
              </button>
              <button
                className={`manager-time-tab ${
                  activeView === "attendance" ? "active" : ""
                }`}
                onClick={switchToAttendance}
              >
                Quản Lý Điểm Danh
              </button>
            </div>
            {activeView === "workSchedules" && (
              <button
                className="manager-time-add-btn"
                onClick={openAddScheduleModal}
              >
                <FaUserPlus /> Thêm Lịch Làm Việc
              </button>
            )}
          </div>

          {activeView === "workSchedules" ? (
            <>
              <div className="manager-time-search-filter-container">
                <div className="manager-time-search">
                  <div className="manager-time-search-input">
                    <FaSearch />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên ca làm việc"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
              </div>
              <div className="manager-time-table-container">
                <h2>Danh Sách Ca Làm Việc</h2>
                {operation.status === "success" && (
                  <div className="manager-time-success-message">
                    {operation.message}
                  </div>
                )}
                {/* {operationError && (
                    <div className="manager-time-error-message">
                      {operationError}
                    </div>
                  )} */}

                {currentWorkSchedules.length > 0 ? (
                  <>
                    <table className="manager-time-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên Ca</th>
                          <th>Thời Gian Bắt Đầu</th>
                          <th>Thời Gian Kết Thúc</th>
                          <th>Trạng Thái</th>
                          <th>Ngày Tạo</th>
                          <th>Cập Nhật Lần Cuối</th>
                          <th>Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentWorkSchedules.map((schedule) => (
                          <tr key={schedule.id}>
                            <td>{schedule.id}</td>
                            <td>{schedule.shiftName}</td>
                            <td>{formatTime(schedule.shiftStart)}</td>
                            <td>{formatTime(schedule.shiftEnd)}</td>
                            <td>
                              <span
                                className={`manager-time-status ${
                                  schedule.status === "Active"
                                    ? "completed"
                                    : "absent"
                                }`}
                              >
                                {schedule.status === "Active"
                                  ? "Hoạt động"
                                  : "Không hoạt động"}
                              </span>
                            </td>
                            <td>{formatDate(schedule.createdAt)}</td>
                            <td>{formatDate(schedule.updatedAt)}</td>
                            <td className="manager-time-actions">
                              <button
                                className="manager-time-add-employee-btn"
                                onClick={() => {
                                  setSelectedWorkSchedule(
                                    schedule.id.toString()
                                  );
                                  openAddScheduleModal();
                                }}
                                title="Thêm nhân viên"
                              >
                                <FaUserPlus />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {totalWorkSchedulePages > 1 && (
                      <div className="manager-time-pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="manager-time-pagination-btn"
                        >
                          Trang trước
                        </button>
                        <div className="manager-time-pagination-numbers">
                          {Array.from({ length: totalWorkSchedulePages }).map(
                            (_, index) => (
                              <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`manager-time-page-number ${
                                  currentPage === index + 1 ? "active" : ""
                                }`}
                              >
                                {index + 1}
                              </button>
                            )
                          )}
                        </div>
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalWorkSchedulePages}
                          className="manager-time-pagination-btn"
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="manager-time-no-records">
                    <p>Không tìm thấy ca làm việc nào.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="manager-time-stats-container">
                <div className="manager-time-stat-card">
                  <div className="manager-time-stat-icon total">
                    <FaCalendarAlt />
                  </div>
                  <div className="manager-time-stat-info">
                    <h3>Tổng số lịch làm việc</h3>
                    <p>{statusStats.total}</p>
                  </div>
                </div>

                <div className="manager-time-stat-card">
                  <div className="manager-time-stat-icon future">
                    <FaClock />
                  </div>
                  <div className="manager-time-stat-info">
                    <h3>Sắp diễn ra</h3>
                    <p>{statusStats.future}</p>
                  </div>
                </div>

                <div className="manager-time-stat-card">
                  <div className="manager-time-stat-icon completed">
                    <FaCheck />
                  </div>
                  <div className="manager-time-stat-info">
                    <h3>Đã hoàn thành</h3>
                    <p>{statusStats.completed}</p>
                  </div>
                </div>

                <div className="manager-time-stat-card">
                  <div className="manager-time-stat-icon ongoing">
                    <FaClock />
                  </div>
                  <div className="manager-time-stat-info">
                    <h3>Đang diễn ra</h3>
                    <p>{statusStats.ongoing}</p>
                  </div>
                </div>

                <div className="manager-time-stat-card">
                  <div className="manager-time-stat-icon absent">
                    <FaTimes />
                  </div>
                  <div className="manager-time-stat-info">
                    <h3>Vắng mặt</h3>
                    <p>{statusStats.absent}</p>
                  </div>
                </div>
              </div>
              <div className="manager-time-date-selector">
                <div className="manager-time-year-month-selector">
                  <select value={selectedYear} onChange={handleYearChange}>
                    {Array.from(
                      { length: 5 },
                      (_, i) => new Date().getFullYear() - 2 + i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select value={selectedMonth} onChange={handleMonthChange}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month}>
                          {new Date(0, month - 1).toLocaleString("vi-VN", {
                            month: "long",
                          })}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              <div className="manager-time-stats-details">
                <h2>
                  Thống kê giờ làm việc - {selectedMonth}/{selectedYear}
                </h2>
                {hoursWorkedStats.length > 0 ? (
                  <div className="manager-time-hours-table-container">
                    <table className="manager-time-table">
                      <thead>
                        <tr>
                          <th>Nhân viên</th>
                          <th>Tổng giờ làm việc</th>
                          {/* <th>Tổng giờ làm thêm</th> */}
                          <th>Lương cơ bản</th>
                          <th>Phụ cấp</th>
                          <th>Lương ước tính</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentStats.map((stat, index) => (
                          <tr key={index}>
                            <td>{stat.fullName}</td>
                            <td>{stat.totalHoursWorked || 0} giờ</td>
                            {/* <td>{stat.totalOvertimeHours || 0} giờ</td> */}
                            <td>{stat.baseSalary?.toLocaleString() || 0}</td>
                            <td>{stat.allowance?.toLocaleString() || 0}</td>
                            <td>
                              {(stat.estimatedSalary || 0).toLocaleString(
                                "vi-VN",
                                {
                                  maximumFractionDigits: 0,
                                }
                              )}{" "}
                              VNĐ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {totalStatsPages > 1 && (
                      <div className="manager-time-pagination">
                        <button
                          onClick={() => paginateStats(currentStatsPage - 1)}
                          disabled={currentStatsPage === 1}
                          className="manager-time-pagination-btn"
                        >
                          Trang trước
                        </button>
                        <div className="manager-time-pagination-numbers">
                          {Array.from({ length: totalStatsPages }).map(
                            (_, index) => (
                              <button
                                key={index}
                                onClick={() => paginateStats(index + 1)}
                                className={`manager-time-page-number ${
                                  currentStatsPage === index + 1 ? "active" : ""
                                }`}
                              >
                                {index + 1}
                              </button>
                            )
                          )}
                        </div>
                        <button
                          onClick={() => paginateStats(currentStatsPage + 1)}
                          disabled={currentStatsPage === totalStatsPages}
                          className="manager-time-pagination-btn"
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="manager-time-no-records">
                    <p>Không có dữ liệu thống kê cho thời gian đã chọn.</p>
                  </div>
                )}
              </div>

              <div className="manager-time-filter-container">
                <div className="manager-time-search-box">
                  <FaSearch className="manager-time-search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên nhân viên..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="manager-time-search-input"
                  />
                </div>

                <div className="manager-time-filters">
                  <div className="manager-time-filter-group">
                    <label className="manager-time-filter-label">
                      <FaFilter className="manager-time-filter-icon" />
                      Trạng thái:
                    </label>
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilter}
                      className="manager-time-filter-select"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="Future">Sắp diễn ra</option>
                      <option value="Ongoing">Đang diễn ra</option>
                      <option value="Completed">Hoàn thành</option>
                      <option value="Absent">Nghỉ</option>
                      <option value="N/A">Không xác định</option>
                    </select>
                  </div>

                  <div className="manager-time-filter-group">
                    <label className="manager-time-filter-label">
                      <FaCalendarAlt className="manager-time-filter-icon" />
                      Thời gian:
                    </label>
                    <div className="manager-time-dropdown-container">
                      <button
                        className="manager-time-dropdown-button"
                        onClick={toggleDateRangeDropdown}
                      >
                        {dateRangeFilter}{" "}
                        <FaAngleDown className="manager-time-dropdown-icon" />
                      </button>
                      {isDateRangeDropdownOpen && (
                        <div className="manager-time-dropdown-menu">
                          <div
                            className="manager-time-dropdown-item"
                            onClick={() => handleDateRangeSelect("Tuần này")}
                          >
                            Tuần này
                          </div>
                          <div
                            className="manager-time-dropdown-item"
                            onClick={() => handleDateRangeSelect("Tuần trước")}
                          >
                            Tuần trước
                          </div>
                          <div
                            className="manager-time-dropdown-item"
                            onClick={() =>
                              handleDateRangeSelect("7 ngày trước")
                            }
                          >
                            7 ngày trước
                          </div>
                          <div
                            className="manager-time-dropdown-item"
                            onClick={() =>
                              handleDateRangeSelect("30 ngày trước")
                            }
                          >
                            30 ngày trước
                          </div>
                          <div
                            className="manager-time-dropdown-item"
                            onClick={() => handleDateRangeSelect("Tháng này")}
                          >
                            Tháng này
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="manager-time-filter-group">
                    <label className="manager-time-filter-label">
                      <FaClock className="manager-time-filter-icon" />
                      Ca làm:
                    </label>
                    <select
                      value={shiftFilter}
                      onChange={handleShiftFilterChange}
                      className="manager-time-filter-select"
                    >
                      <option value="All">Tất cả ca</option>
                      {workSchedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.shiftName}>
                          {schedule.shiftName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="manager-time-filter-group">
                    <label className="manager-time-filter-label">
                      <FaSort className="manager-time-filter-icon" />
                      Sắp xếp:
                    </label>
                    <select
                      value={sortOrder}
                      onChange={handleSortOrderChange}
                      className="manager-time-filter-select"
                    >
                      <option value="Ngày ↑">Ngày ↑</option>
                      <option value="Ngày ↓">Ngày ↓</option>
                      <option value="Nhân viên A-Z">Nhân viên A-Z</option>
                      <option value="Nhân viên Z-A">Nhân viên Z-A</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="manager-time-table-container">
                <h2>Danh Sách Điểm Danh</h2>
                {currentRecords.length > 0 ? (
                  <>
                    <table className="manager-time-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nhân viên</th>
                          <th>Ca làm việc</th>
                          <th>Ngày</th>
                          <th>Giờ check-in</th>
                          <th>Giờ check-out</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords
                          .filter((x) => {
                            const matchedSchedule = workSchedules?.find(
                              (y) => y.id === x.workScheduleId
                            );
                            return (
                              (matchedSchedule &&
                                matchedSchedule.status === "Active") ||
                              (matchedSchedule &&
                                matchedSchedule.status !== "Active" &&
                                x.status !== "Future")
                            );
                          })
                          .map((attendance) => (
                            <tr key={attendance.id}>
                              <td>{attendance.id}</td>
                              <td>{getEmployeeName(attendance.employeeId)}</td>
                              <td>
                                {getWorkScheduleName(attendance.workScheduleId)}
                              </td>
                              <td>{formatDate(attendance.shiftDate)}</td>
                              <td>
                                {formatTime(attendance.checkIn) ||
                                  "Chưa check-in"}
                              </td>
                              <td>
                                {formatTime(attendance.checkOut) ||
                                  "Chưa check-out"}
                              </td>
                              <td>
                                <span
                                  className={`manager-time-status ${getStatusClass(
                                    attendance.status
                                  )}`}
                                >
                                  {getStatusText(attendance.status)}
                                </span>
                              </td>
                              <td className="manager-time-actions">
                                <button
                                  className="manager-time-view-btn"
                                  onClick={() =>
                                    openViewAttendanceModal(attendance.id)
                                  }
                                  title="Xem chi tiết"
                                >
                                  <FaSearch />
                                </button>
                                {canEditAttendance(attendance) && (
                                  <button
                                    className="manager-time-edit-btn"
                                    onClick={() =>
                                      openEditAttendanceModal(attendance.id)
                                    }
                                    title="Chỉnh sửa"
                                  >
                                    <FaEdit />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {totalPages > 1 && (
                      <div className="manager-time-pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="manager-time-pagination-btn"
                        >
                          Trang trước
                        </button>
                        <div className="manager-time-pagination-numbers">
                          {Array.from({ length: totalPages }).map(
                            (_, index) => (
                              <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`manager-time-page-number ${
                                  currentPage === index + 1 ? "active" : ""
                                }`}
                              >
                                {index + 1}
                              </button>
                            )
                          )}
                        </div>
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="manager-time-pagination-btn"
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="manager-time-no-records">
                    <p>Không tìm thấy bản ghi điểm danh nào.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Footer_Manager />
      </div>
      {showAddScheduleModal && (
        <div className="manager-time-modal">
          <div className="manager-time-modal-content">
            <div className="manager-time-modal-header">
              <h2>Thêm Lịch Làm Việc</h2>
              <button
                className="manager-time-modal-close"
                onClick={() => setShowAddScheduleModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="manager-time-modal-body">
              {operationError && (
                <div className="manager-time-error-message">
                  {operationError}
                </div>
              )}
              <form onSubmit={handleAddScheduleForPeriod}>
                <div className="manager-time-form-group">
                  <label>Chọn nhân viên:</label>
                  <select
                    multiple
                    className="manager-time-select-multiple"
                    onChange={handleEmployeeSelect}
                    value={selectedEmployees}
                  >
                    {employees.map((employee) => (
                      <option
                        key={employee.accountId}
                        value={employee.accountId}
                      >
                        {employee.employeeName}
                      </option>
                    ))}
                  </select>
                  <small>Giữ Ctrl để chọn nhiều nhân viên</small>
                </div>
                <div className="manager-time-form-group">
                  <label>Chọn ca làm việc:</label>
                  <select
                    value={selectedWorkSchedule}
                    onChange={handleWorkScheduleChange}
                    required
                  >
                    <option value="">-- Chọn ca làm việc --</option>
                    {workSchedules
                      .filter((schedule) => schedule.status === "Active")
                      .map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.shiftName} (
                          {formatTime(schedule.shiftStart)} -{" "}
                          {formatTime(schedule.shiftEnd)})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="manager-time-form-row">
                  <div className="manager-time-form-group">
                    <label>Từ ngày:</label>
                    <input
                      type="date"
                      name="startDate"
                      value={schedulePeriod.startDate}
                      onChange={handleSchedulePeriodChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="manager-time-form-group">
                    <label>Đến ngày:</label>
                    <input
                      type="date"
                      name="endDate"
                      value={schedulePeriod.endDate}
                      onChange={handleSchedulePeriodChange}
                      min={
                        schedulePeriod.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      required
                    />
                  </div>
                </div>
                <div className="manager-time-form-actions">
                  <button type="submit" className="manager-time-btn-save">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="manager-time-btn-cancel"
                    onClick={() => setShowAddScheduleModal(false)}
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditAttendanceModal && currentAttendance && (
        <div className="manager-time-modal">
          <div className="manager-time-modal-content">
            <div className="manager-time-modal-header">
              <h2>Chỉnh Sửa Điểm Danh</h2>
              <button
                className="manager-time-modal-close"
                onClick={() => setShowEditAttendanceModal(false)}
              >
                &times;
              </button>
            </div>
            {operationError && (
              <div className="manager-time-error-message">{operationError}</div>
            )}

            <div className="manager-time-modal-body">
              <form onSubmit={handleUpdateAttendance}>
                <div className="manager-time-form-group">
                  <label>Nhân viên:</label>
                  <input
                    type="text"
                    value={getEmployeeName(currentAttendance.employeeId)}
                    disabled
                  />
                </div>
                <div className="manager-time-form-group">
                  <label>Ca làm việc:</label>
                  <input
                    type="text"
                    value={getWorkScheduleName(
                      currentAttendance.workScheduleId
                    )}
                    disabled
                  />
                </div>
                <div className="manager-time-form-group">
                  <label>Ngày:</label>
                  <input
                    type="text"
                    value={formatDate(currentAttendance.shiftDate)}
                    disabled
                  />
                </div>
                <div className="manager-time-form-row">
                  <div className="manager-time-form-group">
                    <label>Giờ check-in:</label>
                    <input
                      type="time"
                      name="checkIn"
                      value={attendanceFormData.checkIn}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="manager-time-form-group">
                    <label>Giờ check-out:</label>
                    <input
                      type="time"
                      name="checkOut"
                      value={attendanceFormData.checkOut}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="manager-time-form-group">
                  <label>Trạng thái:</label>
                  <select
                    name="status"
                    value={attendanceFormData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Future">Sắp diễn ra</option>
                    <option value="Ongoing">Đang diễn ra</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Absent">Vắng mặt</option>
                  </select>
                </div>
                <div className="manager-time-form-group">
                  <label>Ghi chú:</label>
                  <textarea
                    name="note"
                    value={attendanceFormData.note}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>
                <div className="manager-time-form-actions">
                  <button type="submit" className="manager-time-btn-save">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="manager-time-btn-cancel"
                    onClick={() => setShowEditAttendanceModal(false)}
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showViewAttendanceModal && viewAttendance && (
        <div className="manager-time-modal">
          <div className="manager-time-modal-content">
            <div className="manager-time-modal-header">
              <h2>Chi Tiết Điểm Danh</h2>
              <button
                className="manager-time-modal-close"
                onClick={() => setShowViewAttendanceModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="manager-time-modal-body">
              <div className="manager-time-detail-item">
                <strong>Nhân viên:</strong>
                <span>{getEmployeeName(viewAttendance.employeeId)}</span>
              </div>
              <div className="manager-time-detail-item">
                <strong>Ca làm việc:</strong>
                <span>
                  {getWorkScheduleName(viewAttendance.workScheduleId)}
                </span>
              </div>
              <div className="manager-time-detail-item">
                <strong>Ngày:</strong>
                <span>{formatDate(viewAttendance.shiftDate)}</span>
              </div>
              <div className="manager-time-detail-item">
                <strong>Giờ check-in:</strong>
                <span>
                  {formatTime(viewAttendance.checkIn) || "Chưa check-in"}
                </span>
              </div>
              <div className="manager-time-detail-item">
                <strong>Giờ check-out:</strong>
                <span>
                  {formatTime(viewAttendance.checkOut) || "Chưa check-out"}
                </span>
              </div>
              <div className="manager-time-detail-item">
                <strong>Trạng thái:</strong>
                <span
                  className={`manager-time-status-detail ${getStatusClass(
                    viewAttendance.status
                  )}`}
                >
                  {getStatusText(viewAttendance.status)}
                </span>
              </div>
              <div className="manager-time-detail-item">
                <strong>Ghi chú:</strong>
                <span>{viewAttendance.note || "Không có ghi chú"}</span>
              </div>
              <div className="manager-time-form-actions">
                <button
                  type="button"
                  className="manager-time-btn-edit"
                  onClick={() => {
                    setShowViewAttendanceModal(false);
                    openEditAttendanceModal(viewAttendance.id);
                  }}
                >
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  className="manager-time-btn-close"
                  onClick={() => setShowViewAttendanceModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manager_Time;
