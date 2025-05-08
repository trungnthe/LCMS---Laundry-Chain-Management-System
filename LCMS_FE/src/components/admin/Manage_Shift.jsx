import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "../../assets/css/admin/manage_shift.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaTimes,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEllipsisH,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const apiUrl = import.meta.env.VITE_API_URL;
// Modal for Add Shift
const AddShiftModal = ({
  onSave,
  onClose,
  formData,
  setFormData,
  duplicateError,
  checkDuplicate,
}) => {
  const [timeError, setTimeError] = useState("");

  const validateTime = (start, end) => {
    // Convert times to minutes for easier comparison
    const convertToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = convertToMinutes(start);
    const endMinutes = convertToMinutes(end);
    const minTime = convertToMinutes("07:00");
    const maxTime = convertToMinutes("22:30");

    // Validate time constraints
    if (startMinutes < minTime) {
      return "Giờ bắt đầu không thể trước 7:00";
    }
    if (endMinutes > maxTime) {
      return "Giờ kết thúc không thể sau 22:30";
    }
    if (startMinutes >= endMinutes) {
      return "Giờ bắt đầu không thể sau giờ kết thúc";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    if (name === "shiftName") {
      checkDuplicate(value);
    }

    // Validate time whenever either time field changes
    if (name === "shiftStart" || name === "shiftEnd") {
      if (updatedFormData.shiftStart && updatedFormData.shiftEnd) {
        const error = validateTime(
          updatedFormData.shiftStart,
          updatedFormData.shiftEnd
        );
        setTimeError(error);
      }
    }
  };

  return (
    <div className="manage-shift-modal show">
      <div className="manage-shift-modal-content">
        <div className="manage-shift-modal-header">
          <h3>Thêm Ca Làm Việc Mới</h3>
          <button className="manage-shift-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSave}>
          <div className="manage-shift-modal-inputs">
            <div className="manage-shift-form-group">
              <label htmlFor="shiftName">
                Tên Ca Làm <span className="manage-shift-required">*</span>
              </label>
              <input
                type="text"
                id="shiftName"
                name="shiftName"
                placeholder="Tên ca làm việc"
                value={formData.shiftName}
                onChange={handleChange}
                required
              />
              {duplicateError && (
                <div
                  style={{ color: "red", fontSize: "12px", marginTop: "5px" }}
                >
                  {duplicateError}
                </div>
              )}
            </div>

            <div className="manage-shift-form-group">
              <label htmlFor="shiftStart">
                Giờ Bắt Đầu <span className="manage-shift-required">*</span>
              </label>
              <input
                type="time"
                id="shiftStart"
                name="shiftStart"
                min="07:00"
                max="22:30"
                value={formData.shiftStart}
                onChange={handleChange}
                required
              />
              <small style={{ display: "block", marginTop: "5px" }}>
                Thời gian từ 07:00 đến 22:30
              </small>
            </div>

            <div className="manage-shift-form-group">
              <label htmlFor="shiftEnd">
                Giờ Kết Thúc <span className="manage-shift-required">*</span>
              </label>
              <input
                type="time"
                id="shiftEnd"
                name="shiftEnd"
                min="07:00"
                max="22:30"
                value={formData.shiftEnd}
                onChange={handleChange}
                required
              />
              <small style={{ display: "block", marginTop: "5px" }}>
                Thời gian từ 07:00 đến 22:30
              </small>
            </div>

            {timeError && (
              <div className="manage-shift-form-group">
                <div
                  style={{ color: "red", fontSize: "12px", marginTop: "5px" }}
                >
                  {timeError}
                </div>
              </div>
            )}

            <div className="manage-shift-form-group">
              <label htmlFor="status">Trạng Thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
          <div className="manage-shift-modal-actions">
            <button
              type="submit"
              className="manage-shift-modal-save-btn"
              disabled={duplicateError !== "" || timeError !== ""}
            >
              Thêm Ca Làm Việc
            </button>
            <button
              type="button"
              className="manage-shift-modal-close-btn"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for Edit Shift
const EditShiftModal = ({
  onSave,
  onClose,
  formData,
  setFormData,
  duplicateError,
  checkDuplicate,
  currentId,
}) => {
  const [timeError, setTimeError] = useState("");

  const validateTime = (start, end) => {
    // Convert times to minutes for easier comparison
    const convertToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = convertToMinutes(start);
    const endMinutes = convertToMinutes(end);
    const minTime = convertToMinutes("07:00");
    const maxTime = convertToMinutes("22:30");

    // Validate time constraints
    if (startMinutes < minTime) {
      return "Giờ bắt đầu không thể trước 7:00";
    }
    if (endMinutes > maxTime) {
      return "Giờ kết thúc không thể sau 22:30";
    }
    if (startMinutes >= endMinutes) {
      return "Giờ bắt đầu không thể sau giờ kết thúc";
    }

    return "";
  };

  // Check time validation on component mount
  useEffect(() => {
    if (formData.shiftStart && formData.shiftEnd) {
      const error = validateTime(formData.shiftStart, formData.shiftEnd);
      setTimeError(error);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    if (name === "shiftName") {
      checkDuplicate(value, currentId);
    }

    // Validate time whenever either time field changes
    if (name === "shiftStart" || name === "shiftEnd") {
      if (updatedFormData.shiftStart && updatedFormData.shiftEnd) {
        const error = validateTime(
          updatedFormData.shiftStart,
          updatedFormData.shiftEnd
        );
        setTimeError(error);
      }
    }
  };

  return (
    <div className="manage-shift-modal show">
      <div className="manage-shift-modal-content">
        <div className="manage-shift-modal-header">
          <h3>Chỉnh Sửa Ca Làm Việc</h3>
          <button className="manage-shift-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={onSave}>
          <div className="manage-shift-modal-inputs">
            <div className="manage-shift-form-group">
              <label htmlFor="shiftName">
                Tên Ca Làm <span className="manage-shift-required">*</span>
              </label>
              <input
                type="text"
                id="shiftName"
                name="shiftName"
                placeholder="Tên ca làm việc"
                value={formData.shiftName}
                onChange={handleChange}
                required
              />
              {duplicateError && (
                <div
                  style={{ color: "red", fontSize: "12px", marginTop: "5px" }}
                >
                  {duplicateError}
                </div>
              )}
            </div>

            <div className="manage-shift-form-group">
              <label htmlFor="shiftStart">
                Giờ Bắt Đầu <span className="manage-shift-required">*</span>
              </label>
              <input
                type="time"
                id="shiftStart"
                name="shiftStart"
                min="07:00"
                max="22:30"
                value={formData.shiftStart}
                onChange={handleChange}
                required
              />
              <small style={{ display: "block", marginTop: "5px" }}>
                Thời gian từ 07:00 đến 22:30
              </small>
            </div>

            <div className="manage-shift-form-group">
              <label htmlFor="shiftEnd">
                Giờ Kết Thúc <span className="manage-shift-required">*</span>
              </label>
              <input
                type="time"
                id="shiftEnd"
                name="shiftEnd"
                min="07:00"
                max="22:30"
                value={formData.shiftEnd}
                onChange={handleChange}
                required
              />
              <small style={{ display: "block", marginTop: "5px" }}>
                Thời gian từ 07:00 đến 22:30
              </small>
            </div>

            {timeError && (
              <div className="manage-shift-form-group">
                <div
                  style={{ color: "red", fontSize: "12px", marginTop: "5px" }}
                >
                  {timeError}
                </div>
              </div>
            )}

            <div className="manage-shift-form-group">
              <label htmlFor="status">Trạng Thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
          <div className="manage-shift-modal-actions">
            <button
              type="submit"
              className="manage-shift-modal-save-btn"
              disabled={duplicateError !== "" || timeError !== ""}
            >
              Lưu Thay Đổi
            </button>
            <button
              type="button"
              className="manage-shift-modal-close-btn"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for View Shift Details
const ViewShiftModal = ({ schedule, onClose }) => {
  if (!schedule) return null;

  // Format time to 24-hour format for display
  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <div className="manage-shift-modal show">
      <div className="manage-shift-modal-content manage-shift-view-modal">
        <div className="manage-shift-modal-header">
          <h3>Chi Tiết Ca Làm Việc</h3>
          <button className="manage-shift-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-shift-view-content">
          <div className="manage-shift-view-details">
            <h2 className="manage-shift-view-title">{schedule.shiftName}</h2>

            <div className="manage-shift-view-info">
              <p>
                <strong>Giờ bắt đầu:</strong> {formatTime(schedule.shiftStart)}
              </p>
              <p>
                <strong>Giờ kết thúc:</strong> {formatTime(schedule.shiftEnd)}
              </p>
              <p>
                <strong>Trạng thái:</strong>
                <span
                  className={`manage-shift-status-badge ${
                    schedule.status === "Active" ? "active" : "inactive"
                  }`}
                >
                  {schedule.status === "Active"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="manage-shift-modal-actions">
          <button className="manage-shift-modal-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirm Delete Modal
const ConfirmDeleteModal = ({ schedule, onConfirm, onClose }) => {
  return (
    <div className="manage-shift-modal show">
      <div className="manage-shift-modal-content manage-shift-confirm-modal">
        <div className="manage-shift-modal-header">
          <h3>Xác Nhận Xóa</h3>
          <button className="manage-shift-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-shift-confirm-content">
          <p>
            Bạn có chắc chắn muốn xóa ca làm việc{" "}
            <strong>"{schedule.shiftName}"</strong>?
          </p>
          <p className="manage-shift-warning">
            Hành động này không thể hoàn tác!
          </p>
        </div>
        <div className="manage-shift-modal-actions">
          <button
            className="manage-shift-delete-confirm-btn"
            onClick={onConfirm}
          >
            Xóa
          </button>
          <button className="manage-shift-modal-close-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Shift = () => {
  const [workSchedules, setWorkSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    shiftName: "",
    shiftStart: "",
    shiftEnd: "",
    status: "Active",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [scheduleStats, setScheduleStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [sortField, setSortField] = useState("shiftName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [jumpToPage, setJumpToPage] = useState("");
  const [operationSuccess, setOperationSuccess] = useState("");
  const [operationError, setOperationError] = useState("");
  const [duplicateError, setDuplicateError] = useState("");

  const checkDuplicateShiftName = (shiftName, currentId = null) => {
    const existingShift = workSchedules.find(
      (schedule) =>
        schedule.shiftName.toLowerCase() === shiftName.toLowerCase() &&
        schedule.id !== currentId
    );

    if (existingShift) {
      setDuplicateError(`Tên ca làm việc "${shiftName}" đã tồn tại`);
      return true;
    }

    setDuplicateError("");
    return false;
  };
  useEffect(() => {
    if (operationSuccess) {
      const timer = setTimeout(() => {
        setOperationSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operationSuccess]);

  useEffect(() => {
    if (operationError) {
      const timer = setTimeout(() => {
        setOperationError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operationError]);

  // Verify token function
  const verifyToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      return null;
    }

    try {
      const decodedToken = jwtDecode(token);

      return token;
    } catch (error) {
      setOperationError("Token không hợp lệ. Vui lòng đăng nhập lại.");
      return null;
    }
  };

  useEffect(() => {
    const token = verifyToken();
    if (!token) {
      setLoading(false);
      setError("Token không hợp lệ hoặc hết hạn");
      return;
    }

    fetchWorkSchedules(token);
  }, []);

  const fetchWorkSchedules = async (token) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/work-schedules/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const data = await response.json();
      setWorkSchedules(data);

      // Calculate statistics
      const total = data.length;
      const active = data.filter(
        (schedule) => schedule.status === "Active"
      ).length;
      const inactive = data.filter(
        (schedule) => schedule.status === "Inactive"
      ).length;

      setScheduleStats({
        total,
        active,
        inactive,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching work schedules:", error);
      setOperationError("Đã xảy ra lỗi khi tải dữ liệu ca làm việc.");
      setError("Không thể tải danh sách ca làm việc");
      setLoading(false);
    }
  };

  const fetchScheduleById = async (id) => {
    const token = verifyToken();
    if (!token) return null;

    try {
      const response = await fetch(`${apiUrl}/api/work-schedules/get/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      setOperationError("Đã xảy ra lỗi khi tải thông tin ca làm việc.");
      return null;
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    const token = verifyToken();
    if (!token) return;

    if (checkDuplicateShiftName(formData.shiftName)) {
      return;
    }
    const validateTime = (start, end) => {
      const convertToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const startMinutes = convertToMinutes(start);
      const endMinutes = convertToMinutes(end);
      const minTime = convertToMinutes("07:00");
      const maxTime = convertToMinutes("22:30");

      if (
        startMinutes < minTime ||
        endMinutes > maxTime ||
        startMinutes >= endMinutes
      ) {
        return false;
      }

      return true;
    };

    // Validate time before submitting
    if (!validateTime(formData.shiftStart, formData.shiftEnd)) {
      setOperationError("Lỗi về thời gian ca làm việc. Vui lòng kiểm tra lại.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/work-schedules/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      setOperationSuccess("Thêm ca làm việc thành công!");
      setShowAddModal(false);
      setFormData({
        shiftName: "",
        shiftStart: "",
        shiftEnd: "",
        status: "Active",
      });
      fetchWorkSchedules(token);
    } catch (error) {
      console.error("Error adding work schedule:", error);
      setOperationError("Đã xảy ra lỗi khi thêm ca làm việc.");
    }
  };

  const handleEditSchedule = async (e) => {
    e.preventDefault();
    const token = verifyToken();
    if (!token) return;

    if (checkDuplicateShiftName(formData.shiftName, currentSchedule.id)) {
      return;
    }

    const validateTime = (start, end) => {
      const convertToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const startMinutes = convertToMinutes(start);
      const endMinutes = convertToMinutes(end);
      const minTime = convertToMinutes("07:00");
      const maxTime = convertToMinutes("22:30");

      if (
        startMinutes < minTime ||
        endMinutes > maxTime ||
        startMinutes >= endMinutes
      ) {
        return false;
      }

      return true;
    };

    // Validate time before submitting
    if (!validateTime(formData.shiftStart, formData.shiftEnd)) {
      setOperationError("Lỗi về thời gian ca làm việc. Vui lòng kiểm tra lại.");
      return;
    }

    // Kiểm tra xem dữ liệu có thay đổi hay không
    const hasChanges =
      formData.shiftName !== currentSchedule.shiftName ||
      formData.shiftStart !== currentSchedule.shiftStart ||
      formData.shiftEnd !== currentSchedule.shiftEnd ||
      formData.status !== currentSchedule.status;

    // Nếu không có thay đổi, hiển thị thông báo và đóng modal
    if (!hasChanges) {
      setOperationError("Không có thông tin nào được thay đổi!");
      setShowEditModal(false);
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/work-schedules/update/${currentSchedule.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      setOperationSuccess("Cập nhật ca làm việc thành công!");
      setShowEditModal(false);
      fetchWorkSchedules(token);
    } catch (error) {
      console.error("Error updating work schedule:", error);
      setOperationError("Đã xảy ra lỗi khi cập nhật ca làm việc.");
    }
  };

  const handleDeleteSchedule = async () => {
    const token = verifyToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/work-schedules/delete/${currentSchedule.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      setOperationSuccess("Xóa ca làm việc thành công!");
      setShowDeleteModal(false);
      fetchWorkSchedules(token);
    } catch (error) {
      console.error("Error deleting work schedule:", error);
      setOperationError("Đã xảy ra lỗi khi xóa ca làm việc.");
    }
  };

  const toggleShiftStatus = async (schedule) => {
    const token = verifyToken();
    if (!token) return;

    const updatedSchedule = {
      ...schedule,
      status: schedule.status === "Active" ? "Inactive" : "Active",
    };

    try {
      const response = await fetch(
        `${apiUrl}/api/work-schedules/update/${schedule.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSchedule),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      setOperationSuccess(
        `Ca làm việc đã ${
          updatedSchedule.status === "Active"
            ? "được kích hoạt"
            : "bị vô hiệu hóa"
        }!`
      );
      fetchWorkSchedules(token);
    } catch (error) {
      console.error("Error toggling shift status:", error);
      setOperationError(
        "Không thể thay đổi trạng thái ca làm việc. Vui lòng thử lại."
      );
    }
  };

  const openAddModal = () => {
    setFormData({
      shiftName: "",
      shiftStart: "",
      shiftEnd: "",
      status: "Active",
    });
    setDuplicateError("");
    setShowAddModal(true);
  };

  const openEditModal = async (id) => {
    const schedule = await fetchScheduleById(id);
    if (schedule) {
      setCurrentSchedule(schedule);
      setFormData({
        shiftName: schedule.shiftName,
        shiftStart: schedule.shiftStart,
        shiftEnd: schedule.shiftEnd,
        status: schedule.status,
      });
      setDuplicateError("");
      setShowEditModal(true);
    }
  };

  const openViewModal = async (id) => {
    const schedule = await fetchScheduleById(id);
    if (schedule) {
      setCurrentSchedule(schedule);
      setShowViewModal(true);
    }
  };

  const openDeleteModal = (schedule) => {
    setCurrentSchedule(schedule);
    setShowDeleteModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPage);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      paginate(pageNumber);
      setJumpToPage("");
    } else {
      setOperationError(`Vui lòng nhập số trang từ 1 đến ${totalPages}`);
    }
  };

  const filteredSchedules = workSchedules
    .filter((schedule) => {
      const matchesSearch = schedule.shiftName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "" || schedule.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!a[sortField]) return 1;
      if (!b[sortField]) return -1;

      if (typeof a[sortField] === "string") {
        return sortOrder === "asc"
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }

      return 0;
    });

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSchedules.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredSchedules.length / recordsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return { pageNumbers, startPage, endPage };
  };

  const { pageNumbers, startPage, endPage } = getPageNumbers();

  return (
    <div className="manage-shift-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-shift">
          <h2>Quản Lý Ca Làm Việc</h2>
          {operationSuccess && (
            <div
              className="manage-shift-alert success"
              style={{
                background: "#d4edda",
                color: "#155724",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
                border: "1px solid #c3e6cb",
              }}
            >
              {operationSuccess}
            </div>
          )}

          {operationError && (
            <div
              className="manage-shift-alert error"
              style={{
                background: "#f8d7da",
                color: "#721c24",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
                border: "1px solid #f5c6cb",
              }}
            >
              {operationError}
            </div>
          )}

          <div className="manage-shift-header">
            <button className="manage-shift-add-btn" onClick={openAddModal}>
              <FaPlus /> Thêm Ca Làm Việc Mới
            </button>

            <div className="manage-shift-search">
              <FaSearch className="manage-shift-search-icon" />
              <input
                type="text"
                className="manage-shift-search-input"
                placeholder="Tìm kiếm theo tên ca làm việc..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <FaTimes
                  className="manage-shift-clear-search-icon"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </div>

          <div className="manage-shift-controls">
            <div className="manage-shift-stats">
              <div className="manage-shift-stat-item">
                <span className="manage-shift-stat-label">Tổng số:</span>
                <span className="manage-shift-stat-value">
                  {scheduleStats.total}
                </span>
              </div>
              <div className="manage-shift-stat-item">
                <span className="manage-shift-stat-label">Đang hoạt động:</span>
                <span className="manage-shift-stat-value manage-shift-active">
                  {scheduleStats.active}
                </span>
              </div>
              <div className="manage-shift-stat-item">
                <span className="manage-shift-stat-label">
                  Không hoạt động:
                </span>
                <span className="manage-shift-stat-value manage-shift-inactive">
                  {scheduleStats.inactive}
                </span>
              </div>
            </div>

            <div className="manage-shift-filters">
              <div className="manage-shift-filter-item">
                <label htmlFor="statusFilter">Lọc theo trạng thái:</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={handleStatusFilter}
                >
                  <option value="">Tất cả</option>
                  <option value="Active">Đang hoạt động</option>
                  <option value="Inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="manage-shift-loading-container">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="manage-shift-error-container">
              <p>{error}</p>
              <button
                className="manage-shift-reload-btn"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  const token = verifyToken();
                  if (token) fetchWorkSchedules(token);
                }}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="manage-shift-table-container">
                <table className="manage-shift-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>
                        <button
                          className="manage-shift-sort-btn"
                          onClick={() => handleSort("shiftName")}
                        >
                          Tên Ca Làm
                          {sortField === "shiftName" && (
                            <span>
                              {sortOrder === "asc" ? (
                                <FaArrowUp />
                              ) : (
                                <FaArrowDown />
                              )}
                            </span>
                          )}
                        </button>
                      </th>
                      <th>Giờ Bắt Đầu</th>
                      <th>Giờ Kết Thúc</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="manage-shift-no-data">
                          {searchTerm || statusFilter
                            ? "Không tìm thấy ca làm việc nào phù hợp với tìm kiếm"
                            : "Không có ca làm việc nào."}
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((schedule, index) => (
                        <tr key={schedule.id}>
                          <td>{indexOfFirstRecord + index + 1}</td>
                          <td>{schedule.shiftName}</td>
                          <td>{schedule.shiftStart}</td>
                          <td>{schedule.shiftEnd}</td>
                          <td>
                            <span
                              className={`manage-shift-status-badge ${
                                schedule.status === "Active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              {schedule.status === "Active"
                                ? "Hoạt động"
                                : "Không hoạt động"}
                            </span>
                          </td>
                          <td>
                            <div className="manage-shift-actions">
                              <button
                                className="manage-shift-view-btn"
                                onClick={() => openViewModal(schedule.id)}
                                title="Xem chi tiết"
                              >
                                <FaEye />
                              </button>
                              <button
                                className="manage-shift-edit-btn"
                                onClick={() => openEditModal(schedule.id)}
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="manage-shift-toggle-btn"
                                onClick={() => toggleShiftStatus(schedule)}
                                title={
                                  schedule.status === "Active"
                                    ? "Vô hiệu hóa"
                                    : "Kích hoạt"
                                }
                              >
                                {schedule.status === "Active" ? (
                                  <FaToggleOn />
                                ) : (
                                  <FaToggleOff />
                                )}
                              </button>
                              <button
                                className="manage-shift-delete-btn"
                                onClick={() => openDeleteModal(schedule)}
                                title="Xóa ca làm việc"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="manage-shift-pagination">
                  <div className="manage-shift-pagination-controls">
                    <button
                      className="manage-shift-pagination-btn"
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                    >
                      <FaAngleDoubleLeft />
                    </button>
                    <button
                      className="manage-shift-pagination-btn"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <FaArrowLeft />
                    </button>

                    {startPage > 1 && (
                      <>
                        <button
                          className="manage-shift-pagination-btn"
                          onClick={() => paginate(1)}
                        >
                          1
                        </button>
                        {startPage > 2 && (
                          <span className="manage-shift-pagination-ellipsis">
                            <FaEllipsisH />
                          </span>
                        )}
                      </>
                    )}

                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        className={`manage-shift-pagination-btn ${
                          currentPage === number ? "active" : ""
                        }`}
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    ))}

                    {endPage < totalPages && (
                      <>
                        {endPage < totalPages - 1 && (
                          <span className="manage-shift-pagination-ellipsis">
                            <FaEllipsisH />
                          </span>
                        )}
                        <button
                          className="manage-shift-pagination-btn"
                          onClick={() => paginate(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      className="manage-shift-pagination-btn"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <FaArrowRight />
                    </button>
                    <button
                      className="manage-shift-pagination-btn"
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>

                  <div className="manage-shift-pagination-info">
                    <div className="manage-shift-records-per-page">
                      <label htmlFor="recordsPerPage">Hiển thị:</label>
                      <select
                        id="recordsPerPage"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                      <span>bản ghi mỗi trang</span>
                    </div>

                    <div className="manage-shift-page-info">
                      <span>
                        Trang {currentPage} / {totalPages} | Hiển thị{" "}
                        {indexOfFirstRecord + 1} -{" "}
                        {indexOfLastRecord > filteredSchedules.length
                          ? filteredSchedules.length
                          : indexOfLastRecord}{" "}
                        của {filteredSchedules.length} bản ghi
                      </span>
                    </div>

                    <div className="manage-shift-jump-to-page">
                      <label htmlFor="jumpToPage">Đến trang:</label>
                      <input
                        id="jumpToPage"
                        type="number"
                        min="1"
                        max={totalPages}
                        value={jumpToPage}
                        onChange={(e) => setJumpToPage(e.target.value)}
                      />
                      <button
                        className="manage-shift-jump-btn"
                        onClick={handleJumpToPage}
                      >
                        Đi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <Footer_Admin />
        </div>
      </div>

      {showAddModal && (
        <AddShiftModal
          onSave={handleAddSchedule}
          onClose={() => {
            setShowAddModal(false);
            setDuplicateError(""); // Reset lỗi khi đóng modal
          }}
          formData={formData}
          setFormData={setFormData}
          duplicateError={duplicateError}
          checkDuplicate={(name) => checkDuplicateShiftName(name)}
        />
      )}

      {showEditModal && currentSchedule && (
        <EditShiftModal
          onSave={handleEditSchedule}
          onClose={() => {
            setShowEditModal(false);
            setDuplicateError(""); // Reset lỗi khi đóng modal
          }}
          formData={formData}
          setFormData={setFormData}
          duplicateError={duplicateError}
          checkDuplicate={(name, id) => checkDuplicateShiftName(name, id)}
          currentId={currentSchedule.id}
        />
      )}

      {showViewModal && currentSchedule && (
        <ViewShiftModal
          schedule={currentSchedule}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {showDeleteModal && currentSchedule && (
        <ConfirmDeleteModal
          schedule={currentSchedule}
          onConfirm={handleDeleteSchedule}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Manage_Shift;
