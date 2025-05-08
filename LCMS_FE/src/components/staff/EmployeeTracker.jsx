import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../assets/css/staff/employee_tracker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../reuse/Header_Staff";
import { getCurrentDate, getCurrentTime } from "../../services/time.js";
import {
  getAttendanceToday,
  getAttendanceTodayByTime,
  GetAttendanceByAccount,
} from "../../services/fetchApiStaff.js";
import { jwtDecode } from "jwt-decode";
const apiUrl = import.meta.env.VITE_API_URL;

const EmployeeTracker = () => {
  // State for current user and view

  // Current date and time
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Clock in/out state
  const [clockedIn, setClockedIn] = useState(null);

  const [workDuration, setWorkDuration] = useState("0h 0m");

  // Camera and image capture states
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedImageBlob, setCapturedImageBlob] = useState(null);
  const [isCaptureSuccess, setIsCaptureSuccess] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [staffInfo, setStaffInfo] = useState(null);
  const [workSchedule, setWorkSchedules] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Schedule and attendance history
  const [activeTab, setActiveTab] = useState("history");

  // Sample schedules and attendance history

  // Calculate the week dates

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(
        "Không thể truy cập máy ảnh. Vui lòng kiểm tra quyền truy cập."
      );
      toast.error("Không thể truy cập máy ảnh");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
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

  useEffect(() => {
    if (showCamera) {
      // Only start the camera if we don't already have a captured image
      if (!capturedImage) {
        startCamera();
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [showCamera, capturedImage]);

  // Handle clock in/out
  const handleClockInOut = () => {
    // Check if it's within the allowed time range for clocking in/out
    const now = new Date();
    const hour = now.getHours();

    // if (!clockedIn) {
    //   // Clock in check: Only allow between 7:30 AM and 9:30 AM
    //   if (
    //     hour < 7 ||
    //     (hour === 7 && now.getMinutes() < 30) ||
    //     hour > 9 ||
    //     (hour === 9 && now.getMinutes() > 30)
    //   ) {
    //     toast.warning("Ngoài giờ check-in cho phép (7:30 - 9:30)");
    //     return;
    //   }
    // } else {
    //   // Clock out check: Only allow after at least 7 hours of work or after 4:00 PM
    //   const startTime = clockInTime.split(":");
    //   const startHour = parseInt(startTime[0], 10);
    //   const startMin = parseInt(startTime[1], 10);

    //   const startDate = new Date();
    //   startDate.setHours(startHour, startMin, 0);

    //   const hoursWorked = (now - startDate) / (1000 * 60 * 60);

    //   if (hoursWorked < 7 && hour < 16) {
    //     toast.warning(
    //       "Bạn cần làm việc ít nhất 7 giờ hoặc sau 16:00 để có thể check-out"
    //     );
    //     return;
    //   }
    // }

    setShowCamera(true);
  };

  // Hàm chuyển đổi dataURL thành Blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  };

  const takePicture = () => {
    if (!videoRef.current) return;

    try {
      setProcessingImage(true);
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Lưu ảnh dưới dạng dataURL
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData); // Cập nhật ảnh đã chụp

      // Chuyển đổi sang Blob để gửi lên server
      const blob = dataURLtoBlob(imageData);
      setCapturedImageBlob(blob);

      // Gửi ảnh lên server để xác minh (thực hiện verifyFaceWithAPI hoặc tương tự)
      verifyFaceWithAPI(blob);
    } catch (err) {
      console.error("Error capturing image:", err);
      toast.error("Không thể chụp ảnh");
      setProcessingImage(false);
    }
  };

  const getUserReferenceImage = async () => {
    try {
      // Đảm bảo fullUrl là đường dẫn chính xác đến API GET
      const fullUrl = `${apiUrl}/api/Upload/get-image?relativePath=${staffInfo.avatarUrl}`;

      // Tạo đối tượng Image
      const image = new Image();

      // Đảm bảo ảnh có thể tải từ nguồn khác
      image.crossOrigin = "anonymous"; // Cần thiết để tránh tainted canvas khi sử dụng canvas

      // Gán nguồn của ảnh
      image.src = fullUrl;

      // Đợi ảnh tải thành công
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      // Tạo canvas để chuyển ảnh thành Blob
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // Chuyển đổi canvas thành Blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg");
      });

      console.log("Ảnh đã được chuyển đổi thành Blob");

      return blob; // Trả về Blob để gửi đi
    } catch (error) {
      console.error("Lỗi khi lấy ảnh tham chiếu:", error);
      throw new Error("Không thể lấy ảnh tham chiếu: " + error.message);
    }
  };

  // Hàm xác minh khuôn mặt bằng API
  const verifyFaceWithAPI = async (capturedImageBlob) => {
    try {
      // Thiết lập trạng thái ban đầu
      setVerificationStatus(""); // Reset trạng thái xác minh
      setVerificationMessage("Đang xác minh khuôn mặt..."); // Hiện thị thông báo đang xác minh

      // 1. Lấy ảnh tham chiếu từ database
      const referenceImage = await getUserReferenceImage();
      console.log("Reference Image:", referenceImage); // Kiểm tra ảnh tham chiếu

      // Kiểm tra xem ảnh tham chiếu có hợp lệ không
      if (!referenceImage) {
        throw new Error("Không tìm thấy ảnh tham chiếu."); // Thông báo lỗi nếu không có ảnh
      }

      // 2. Tạo form data để gửi lên API
      const formData = new FormData();
      formData.append("image1", referenceImage); // Ảnh tham chiếu từ DB
      formData.append("image2", capturedImageBlob); // Ảnh vừa chụp
      console.log("Form Data:", Array.from(formData.entries())); // Kiểm tra các entry trong formData

      // 3. Gọi API so sánh khuôn mặt
      const response = await fetch(
        "https://face.giatlanhanh.id.vn/compare_faces",
        {
          method: "POST",
          body: formData, // Gửi formData như body
        }
      );

      // 4. Xử lý kết quả
      if (!response.ok) {
        // Kiểm tra mã trạng thái của phản hồi
        const errorData = await response.json(); // Lấy chi tiết lỗi
        throw new Error(
          errorData.error || "Có lỗi xảy ra trong quá trình xác minh."
        ); // Thông báo lỗi cụ thể
      }

      const result = await response.json(); // Phân tích phản hồi hợp lệ
      console.log("API Response:", result); // Log phản hồi từ API

      // 5. Kiểm tra kết quả xác minh
      if (result.face_match) {
        // Nếu khuôn mặt khớp
        setVerificationStatus("success");
        toast.success("Khuôn mặt khớp với hồ sơ!");

        // Hoàn thành quá trình check in/out sau 1.5 giây
        setTimeout(() => {
          completeClockInOut(); // Gọi hàm check-in/out
        }, 1500);
      } else {
        // Nếu khuôn mặt không khớp
        setVerificationStatus("failed");
        toast.error("Khuôn mặt không khớp với hồ sơ"); // Hiển thị thông báo lỗi

        // Reset trạng thái sau 2 giây
        setTimeout(() => {
          setCapturedImage(null);
          setVerificationStatus(""); // Reset trạng thái
          setProcessingImage(false); // Cập nhật trạng thái xử lý
        }, 2000);
      }
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Face verification error:", error); // Log lỗi để gỡ lỗi
      setVerificationStatus("failed");

      // Hiển thị thông báo lỗi từ API (nếu có)
      if (error.message) {
        setVerificationMessage(error.message);
        toast.error(error.message || "Lỗi xác minh khuôn mặt");
      } else {
        setVerificationMessage("Lỗi xác minh khuôn mặt");
        toast.error("Lỗi xác minh khuôn mặt");
      }

      // Reset trạng thái sau 2 giây
      setTimeout(() => {
        setCapturedImage(null);
        setVerificationStatus(""); // Reset trạng thái
        setProcessingImage(false); // Cập nhật trạng thái xử lý
      }, 2000);
    }
  };

  const completeClockInOut = async () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Get the token from local storage (or wherever it is stored)
    const token = localStorage.getItem("token"); // Adjust this based on where you store the token (localStorage, sessionStorage, etc.)

    if (!token) {
      toast.error("Token không hợp lệ!");
      return;
    }

    if (clockedIn?.toLowerCase() !== "ongoing") {
      try {
        const response = await fetch(
          `${apiUrl}/api/Attendance/staff/checkIn-employeeID`, // Replace with actual API endpoint
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Add the token to the Authorization header
            },
            body: JSON.stringify({}),
          }
        );

        if (response.ok) {
          const data = await response.json();
          toast.success("Check-in thành công!");
          // Set isDataUpdated to true to refresh the data
          setIsDataUpdated((prev) => !prev);
        } else {
          throw new Error("Check-in failed");
        }
      } catch (error) {
        toast.error("Lỗi khi chấm công");
        console.error("Error during check-in:", error);
      }
      // Check if late
      const hour = now.getHours();
      const minute = now.getMinutes();
      if (hour > 9 || (hour === 9 && minute > 15)) {
        toast.warning("Bạn đã đến muộn hơn quy định!");
      }
    } else {
      setClockedIn(false);
      // Make API request for check-out with Authorization header
      try {
        const response = await fetch(
          `${apiUrl}/api/Attendance/staff/checkOut-employeeID`, // Replace with actual API endpoint
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Add the token to the Authorization header
            },
            body: JSON.stringify({}),
          }
        );

        if (response.ok) {
          const data = await response.json();
          toast.success("Check-out thành công!");
          await fetchData();
        } else {
          throw new Error("Check-out failed");
        }
      } catch (error) {
        toast.error("Lỗi khi kết thúc ca làm việc");
        console.error("Error during check-out:", error);
      }
    }

    setShowCamera(false);
    setIsCaptureSuccess(false);
    setCapturedImage(null);
    setProcessingImage(false);
    setVerificationStatus("");
  };

  const cancelCapture = () => {
    setShowCamera(false);
    setIsCaptureSuccess(false);
    setCapturedImage(null);
    setProcessingImage(false);
    setVerificationStatus("");
  };

  // Find today's schedule
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [todaySchedulesByTime, setTodaySchedulesByTime] = useState([]);

  const [isDataUpdated, setIsDataUpdated] = useState(false); // Track if data should be refreshed
  const [filterDate, setFilterDate] = useState("Tuần này");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterShift, setFilterShift] = useState("All");
  const [filterLate, setFilterLate] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");

  // State cho custom date range nếu người dùng chọn "Custom Range"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State để lưu dữ liệu gốc và dữ liệu đã được lọc
  const [allSchedules, setAllSchedules] = useState([]);

  // Thêm useEffect để gọi fetchData khi component mount
  const fetchData = async () => {
    try {
      const [schedules, schedulesByTime] = await Promise.all([
        getAttendanceToday(),
        getAttendanceTodayByTime(),
      ]);
      const sortedSchedules = schedules.sort(
        (a, b) => a.workScheduleId - b.workScheduleId
      );

      setTodaySchedules(sortedSchedules);
      setTodaySchedulesByTime(schedulesByTime);

      // Cập nhật trạng thái từ API
      if (schedulesByTime?.status) {
        setClockedIn(schedulesByTime.status);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      // Xử lý lỗi ở đây - có thể set state để hiển thị thông báo lỗi
    }
  };

  const [filteredSchedules, setFilteredSchedules] = useState([]);

  const fetchDataSchedule = async () => {
    try {
      const schedules = await GetAttendanceByAccount();
      setAllSchedules(schedules || []);

      // Set initial dates for "Tuần này" filter
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(
        today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      ); // Monday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      endOfWeek.setHours(23, 59, 59, 999);

      // Apply initial filter
      const initialFiltered = (schedules || []).filter((record) => {
        const recordDate = new Date(record.shiftDate);
        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      });

      setFilteredSchedules(initialFiltered);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  // Call this function whenever filter criteria change
  const applyFilters = useCallback(() => {
    let filtered = [...allSchedules];

    // Apply date filter
    if (filterDate === "Tuần này") {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(
        today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      ); // Monday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      endOfWeek.setHours(23, 59, 59, 999);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.shiftDate);
        return recordDate >= startOfWeek && recordDate <= endOfWeek;
      });
    } else if (filterDate === "Tuần trước") {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(
        today.getDate() - dayOfWeek - 6 + (dayOfWeek === 0 ? -6 : 1)
      );
      startOfLastWeek.setHours(0, 0, 0, 0);

      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.shiftDate);
        return recordDate >= startOfLastWeek && recordDate <= endOfLastWeek;
      });
    } else if (filterDate === "7 ngày trước") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.shiftDate);
        return recordDate >= sevenDaysAgo;
      });
    } else if (filterDate === "30 ngày trước") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.shiftDate);
        return recordDate >= thirtyDaysAgo;
      });
    } else if (filterDate === "Tháng này") {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.shiftDate);
        return recordDate >= firstDayOfMonth && recordDate <= lastDayOfMonth;
      });
    } else if (filterDate === "Tháng trước") {
      const now = new Date();
      const firstDayOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      lastDayOfLastMonth.setHours(23, 59, 59, 999);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.shiftDate);
        return (
          recordDate >= firstDayOfLastMonth && recordDate <= lastDayOfLastMonth
        );
      });
    } else if (filterDate === "Chọn ngày" && startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end day

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.shiftDate);
        return recordDate >= start && recordDate <= end;
      });
    }

    // Apply status filter
    if (filterStatus !== "All") {
      filtered = filtered.filter((record) => record.status === filterStatus);
    }

    // Apply shift filter
    if (filterShift !== "All") {
      filtered = filtered.filter((record) => record.shiftName === filterShift);
    }

    // Apply late filter
    if (filterLate === "Đúng giờ") {
      filtered = filtered.filter(
        (record) => record.lateMinutes === 0 || record.lateMinutes === null
      );
    } else if (filterLate === "Đi muộn") {
      filtered = filtered.filter((record) => record.lateMinutes > 0);
    } else if (filterLate === "Muộn hơn 15 phút") {
      filtered = filtered.filter((record) => record.lateMinutes > 15);
    } else if (filterLate === "Muộn hơn 30 phút") {
      filtered = filtered.filter((record) => record.lateMinutes > 30);
    }

    // Apply sorting
    if (sortBy === "date-asc") {
      filtered.sort((a, b) => new Date(a.shiftDate) - new Date(b.shiftDate));
    } else if (sortBy === "date-desc") {
      filtered.sort((a, b) => new Date(b.shiftDate) - new Date(a.shiftDate));
    } else if (sortBy === "hours-asc") {
      filtered.sort(
        (a, b) =>
          parseFloat(a.hoursWorked || 0) - parseFloat(b.hoursWorked || 0)
      );
    } else if (sortBy === "hours-desc") {
      filtered.sort(
        (a, b) =>
          parseFloat(b.hoursWorked || 0) - parseFloat(a.hoursWorked || 0)
      );
    } else if (sortBy === "late-asc") {
      filtered.sort((a, b) => (a.lateMinutes || 0) - (b.lateMinutes || 0));
    } else if (sortBy === "late-desc") {
      filtered.sort((a, b) => (b.lateMinutes || 0) - (a.lateMinutes || 0));
    }

    setFilteredSchedules(filtered);
  }, [
    allSchedules,
    filterDate,
    filterStatus,
    filterShift,
    filterLate,
    sortBy,
    startDate,
    endDate,
  ]);

  // Call applyFilters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [
    filterDate,
    filterStatus,
    filterShift,
    filterLate,
    sortBy,
    startDate,
    endDate,
    applyFilters,
  ]);

  // Initialize data
  useEffect(() => {
    fetchDataSchedule();
    fetchWorkSchedules();
  }, []);
  useEffect(() => {
    fetchData();
  }, [isDataUpdated]);

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
      default:
        return "";
    }
  };
  useEffect(() => {
    const fetchStaffInfoBranch = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Không tìm thấy token");

        const decodedToken = jwtDecode(token);
        const accountId = decodedToken.AccountId;

        const response = await fetch(
          `${apiUrl}/api/Employee/get-employee-by-id?id=${accountId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        setStaffInfo(data); // Đảm bảo setState là một hàm
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchStaffInfoBranch();
  }, []);

  // Hàm chuyển đổi định dạng ngày từ "DD/MM/YYYY" sang đối tượng Date

  // Hàm xuất dữ liệu
  useEffect(() => {
    // Tạo interval để cập nhật thời gian mỗi giây
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(interval);
  }, []); // Mảng phụ thuộc rỗng để useEffect chỉ chạy một lần khi mount

  return (
    <>
      <Header />
      <div className="employee-tracker">
        <div className="main-content">
          {/* Sidebar Navigation */}

          {/* Content Area */}
          <div className="content">
            {/* Clock In/Out Section */}
            <section className="clock-section">
              <div className="clock-card">
                <div className="clock-header">
                  <h2>
                    Theo dõi thời gian làm việc:{" "}
                    {todaySchedulesByTime.shiftName}
                  </h2>
                  <div className="current-date">
                    {currentDate} {currentTime}
                  </div>
                </div>

                <div className="clock-content">
                  <div className="digital-clock">
                    <div className="time">{currentTime}</div>
                    <div className="clock-status">
                      <span
                        className={`shift-status ${getStatusClass(
                          todaySchedulesByTime.status
                        )}`}
                      >
                        {getStatusText(todaySchedulesByTime.status) || "--:--"}
                      </span>
                    </div>
                  </div>

                  <div className="clock-actions">
                    {todaySchedulesByTime.status === "Ongoing" ? (
                      <button
                        className="clock-button check-out"
                        onClick={handleClockInOut}
                      >
                        Kết thúc ca
                      </button>
                    ) : todaySchedulesByTime.status === "Future" ? (
                      <button
                        className="clock-button check-in"
                        onClick={handleClockInOut}
                      >
                        Chấm công
                      </button>
                    ) : (
                      <button className="clock-button">Giờ nghỉ</button>
                    )}
                  </div>

                  <div className="clock-details">
                    <div className="detail-item">
                      <span className="detail-label">Thời gian vào làm</span>
                      <span className="detail-value">
                        {todaySchedulesByTime.checkIn
                          ? todaySchedulesByTime.checkIn.split(".")[0] // Cắt bỏ phần mili giây
                          : "--:--"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Thời gian về</span>
                      <span className="detail-value">
                        {todaySchedulesByTime.checkOut
                          ? todaySchedulesByTime.checkOut.split(".")[0] // Cắt bỏ phần mili giây
                          : "--:--"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Thời gian làm:</span>
                      <span className="detail-value">
                        {" "}
                        {todaySchedulesByTime.hoursWorked
                          ? `${Math.floor(
                              todaySchedulesByTime.hoursWorked
                            )}:${Math.round(
                              (todaySchedulesByTime.hoursWorked % 1) * 60
                            )
                              .toString()
                              .padStart(2, "0")}`
                          : "--:--"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Thời gian làm thêm</span>
                      <span className="detail-value">
                        {" "}
                        {todaySchedulesByTime.overtimeHours
                          ? `${Math.floor(
                              todaySchedulesByTime.overtimeHours
                            )}:${Math.round(
                              (todaySchedulesByTime.overtimeHours % 1) * 60
                            )
                              .toString()
                              .padStart(2, "0")}`
                          : "--:--"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Đi muộn(phút)</span>
                      <span className="detail-value">
                        {todaySchedulesByTime.lateMinutes || "--:--"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Về sớm (phút)</span>
                      <span className="detail-value">
                        {todaySchedulesByTime.earlyLeaveMinutes || "--:--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="schedule-card">
                <div className="schedule-header">
                  <h2>Lịch làm việc hôm nay</h2>
                </div>

                <div className="schedule-content">
                  {todaySchedules.map((schedule, index) => (
                    <div key={index} className="today-schedule">
                      <h3 className="shift-title">
                        <span className="shift-name">{schedule.shiftName}</span>
                        <span
                          className={`shift-status ${getStatusClass(
                            schedule.status
                          )}`}
                        >
                          {getStatusText(schedule.status)}
                        </span>
                      </h3>

                      <div className="schedule-time">
                        <div className="time-item">
                          <span className="time-label">Bắt đầu:</span>
                          <span className="time-value">
                            {schedule.shiftStart}
                          </span>
                        </div>
                        <div className="time-divider"></div>
                        <div className="time-item">
                          <span className="time-label">Kết thúc:</span>
                          <span className="time-value">
                            {schedule.shiftEnd}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Camera Modal */}
              {showCamera && (
                <div className="employee-att-camera-modal">
                  <div className="employee-att-camera-container">
                    <div className="employee-att-camera-header">
                      <h3>
                        {todaySchedulesByTime.status === "Ongoing"
                          ? "Check Out"
                          : "Check In"}{" "}
                        - Xác minh khuôn mặt
                      </h3>
                      <button
                        className="employee-att-close-button"
                        onClick={cancelCapture}
                      >
                        &times;
                      </button>
                    </div>

                    <div className="employee-att-camera-content">
                      {cameraError ? (
                        <div className="employee-att-camera-error">
                          <p>{cameraError}</p>
                        </div>
                      ) : capturedImage ? (
                        <div className="employee-att-capture-preview">
                          <img src={capturedImage} alt="Captured" />

                          {processingImage && (
                            <div className="employee-att-verification-overlay">
                              <div className="employee-att-verification-status">
                                {verificationStatus === "" && (
                                  <>
                                    <div className="employee-att-verification-spinner"></div>
                                    <p>{verificationMessage}</p>
                                  </>
                                )}

                                {verificationStatus === "success" && (
                                  <>
                                    <div className="employee-att-verification-success">
                                      ✓
                                    </div>
                                    <p>{verificationMessage}</p>
                                  </>
                                )}

                                {verificationStatus === "failed" && (
                                  <>
                                    <div className="employee-att-verification-failed">
                                      ✗
                                    </div>
                                    <p>{verificationMessage}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="employee-att-video-container">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="employee-att-camera-video"
                            />
                            <div className="employee-att-face-guide">
                              <div className="employee-att-face-outline"></div>
                              <div className="employee-att-guidelines">
                                <ul className="employee-att-guidelines-list">
                                  <li>Đặt khuôn mặt trong khung tròn</li>
                                  <li>Đảm bảo đủ ánh sáng</li>
                                  <li>Nhìn thẳng vào camera</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="employee-att-camera-controls">
                            <button
                              className="employee-att-capture-button"
                              onClick={takePicture}
                            >
                              Chụp ảnh
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Tabs Section - Schedule/Attendance */}
            <section className="tabs-section">
              <div className="tabs-header">
                <div className="tab-buttons">
                  <button
                    className={`tab-button ${
                      activeTab === "history" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("history")}
                  >
                    Lịch làm việc
                  </button>
                </div>
              </div>

              <div className="tabs-content">
                {/* Today's Activity Tab */}

                {/* Weekly Schedule Tab */}

                {/* Attendance History Tab */}
                {activeTab === "history" && (
                  <div className="history-content">
                    <div className="attendance-filters">
                      <div className="filter-group">
                        <label>Phạm vi ngày:</label>
                        <select
                          className="filter-select"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                        >
                          <option>Tuần này</option>
                          <option>Tuần trước</option>
                          <option>7 ngày trước</option>
                          <option>30 ngày trước</option>
                          <option>Tháng này</option>
                          <option>Tháng trước</option>
                          <option>Chọn ngày</option>
                        </select>

                        {filterDate === "Chọn ngày" && (
                          <div className="custom-date-range">
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              placeholder="Từ ngày"
                            />
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              placeholder="Đến ngày"
                            />
                          </div>
                        )}
                      </div>

                      <div className="filter-group">
                        <label>Status:</label>
                        <select
                          className="filter-select"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option>All</option>
                          <option>On Time</option>
                          <option>Late</option>
                          <option>Absent</option>
                          <option>Future</option>
                          <option>Ongoing</option>
                          <option>Completed</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Ca làm việc:</label>
                        <select
                          className="filter-select"
                          value={filterShift}
                          onChange={(e) => setFilterShift(e.target.value)}
                        >
                          <option>All</option>
                          <option>Ca Sáng</option>
                          <option>Ca Chiều</option>
                          <option>Ca Tối</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Thời gian:</label>
                        <select
                          className="filter-select"
                          value={filterLate}
                          onChange={(e) => setFilterLate(e.target.value)}
                        >
                          <option>All</option>
                          <option>Đúng giờ</option>
                          <option>Đi muộn</option>
                          <option>Muộn hơn 15 phút</option>
                          <option>Muộn hơn 30 phút</option>
                        </select>
                      </div>

                      <div className="filter-group">
                        <label>Sắp xếp:</label>
                        <select
                          className="filter-select"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <option value="date-desc">Ngày ↓</option>
                          <option value="date-asc">Ngày ↑</option>
                          <option value="hours-desc">Giờ làm ↓</option>
                          <option value="hours-asc">Giờ làm ↑</option>
                          <option value="late-desc">Muộn nhất</option>
                          <option value="late-asc">Đúng giờ nhất</option>
                        </select>
                      </div>
                    </div>
                    <div className="attendance-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Ngày</th>
                            <th>Lịch</th>
                            <th>Thời gian vào</th>
                            <th>Thời gian về</th>
                            <th>Thời gian làm</th>
                            <th>Đến muộn</th>
                            <th>Về sớm</th>
                            <th>Ghi chú</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSchedules
                            .filter((x) => {
                              const matchedSchedule = workSchedule?.find(
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
                            .map((record, index) => (
                              <tr
                                key={index}
                                className={
                                  record.status === "Late" ? "late-record" : ""
                                }
                              >
                                <td>
                                  {new Date(
                                    record.shiftDate
                                  ).toLocaleDateString("vi-VN", {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </td>
                                <td>{record.shiftName}</td>
                                <td>{record.checkIn || "—"}</td>
                                <td>{record.checkOut || "—"}</td>
                                <td>{record.hoursWorked}</td>
                                <td>{record.lateMinutes} phút</td>
                                <td>{record.earlyLeaveMinutes} phút</td>

                                <td>{record?.note || "--"}</td>
                                <td>
                                  <span
                                    className={`status-badge ${record.status
                                      .toLowerCase()
                                      .replace(" ", "-")}`}
                                  >
                                    {getStatusText(record.status) || "--:--"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="attendance-summary">
                      <div className="summary-item">
                        <span className="summary-label">Đi muộn:</span>
                        <span className="summary-count">
                          {
                            filteredSchedules.filter(
                              (r) => r.status === "On Time"
                            ).length
                          }
                        </span>
                      </div>

                      <div className="summary-item">
                        <span className="summary-label">Nghỉ:</span>
                        <span className="summary-count">
                          {
                            filteredSchedules.filter(
                              (r) => r.status === "Absent"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Hoàn thành:</span>
                        <span className="summary-count">
                          {
                            filteredSchedules.filter(
                              (r) => r.status === "Completed"
                            ).length
                          }
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Tổng giờ làm :</span>
                        <span className="summary-count">
                          {filteredSchedules
                            .reduce((total, record) => {
                              const hours = parseFloat(record.hoursWorked) || 0;
                              return total + hours;
                            }, 0)
                            .toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <ToastContainer />;
    </>
  );
};

export default EmployeeTracker;
