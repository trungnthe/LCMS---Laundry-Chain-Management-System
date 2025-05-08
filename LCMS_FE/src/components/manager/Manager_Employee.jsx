import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaUserTie,
  FaPlus,
  FaSearch,
  FaUserLock,
  FaUserCheck,
} from "react-icons/fa";
import { Bar, Doughnut, Line } from "react-chartjs-2";
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
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/manager/manager_employee.css";
import { jwtDecode } from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;

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

const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setOperationError(
      "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
    );
    return null;
  }

  const decodedToken = jwtDecode(token);

  if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
    localStorage.removeItem("token");
    setOperationError("Token hết hạn. Vui lòng đăng nhập lại.");
    return null;
  }

  return token;
};

const ChangeStatusModal = ({ employee, onStatusChange, onClose }) => {
  const [newStatus, setNewStatus] = useState(employee.status || "Active");
  return (
    <div className="manage-employee-modal show">
      <div className="manage-employee-modal-content">
        <div className="manage-employee-modal-header">
          <h3>Thay Đổi Trạng Thái Tài Khoản</h3>
          <button className="manage-employee-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-employee-modal-body">
          <p>
            Nhân viên: <strong>{employee.employeeName}</strong>
          </p>
          <p>
            Trạng thái hiện tại: <strong>{employee.status || "Active"}</strong>
          </p>
          <div className="manage-employee-form-group">
            <label>Trạng thái mới:</label>
            <select
              className="manage-employee-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Active">Hoạt động</option>
              <option value="Blocked">Khóa</option>
              <option value="InActive">Chưa kích hoạt</option>
            </select>
          </div>
        </div>
        <div className="manage-employee-modal-actions">
          <button
            className="manage-employee-modal-save-btn"
            onClick={() => onStatusChange(employee.accountId, newStatus)}
          >
            Cập Nhật
          </button>
          <button className="manage-employee-modal-close-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manager_Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [managerBranchId, setManagerBranchId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [isRolesLoading, setIsRolesLoading] = useState(true);
  const [isEmployeeRolesLoading, setIsEmployeeRolesLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    employeeRoleId: "",
    branchId: "",
    avatar: null,
  });

  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });
  const [fileError, setFileError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateFile = (file) => {
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      return "Định dạng file không hợp lệ. Chỉ chấp nhận: JPG, JPEG, PNG, GIF, SVG, WEBP";
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "Kích thước file quá lớn. Tối đa 5MB.";
    }

    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email không hợp lệ. Vui lòng nhập đúng định dạng email.";
    }
    return "";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$|^(0[1|2|4|6])[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số).";
    }
    return "";
  };

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

  const [currentPage, setCurrentPage] = useState(1);
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
  });
  const recordsPerPage = 5;

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Fetch roles
    fetch(`${apiUrl}/api/Account/get-all-role`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const filteredRoles = data.filter(
          (role) =>
            role &&
            role.name &&
            (role.name.toLowerCase().includes("staff") || role.name === "Staff")
        );

        setRoles(filteredRoles);
        setIsRolesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
        setOperationError("Error fetching roles!");
        setIsRolesLoading(false);
      });

    // Fetch employee roles
    fetch(`${apiUrl}/api/EmployeeRole/get-all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEmployeeRoles(data);
        } else {
          setEmployeeRoles([]);
        }
        setIsEmployeeRolesLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching employee roles:", error);
        setOperationError("Error fetching employee roles!");
        setIsEmployeeRolesLoading(false);
      });
  }, []);

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
      if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        setOperationError("Token hết hạn. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const branchId = decodedToken.BranchId;
      setManagerBranchId(branchId);

      setFormData((prevData) => ({
        ...prevData,
        branchId: branchId,
      }));

      fetchEmployees(token, branchId);
    } catch (error) {
      console.error("Error decoding token:", error);
      setOperationError("Lỗi xác thực. Vui lòng đăng nhập lại.");
      setLoading(false);
    }
  }, []);

  const fetchEmployees = async (token, branchId) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/Employee/get-all-employee`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();

      const filteredData = data.filter(
        (employee) =>
          employee.branchId == branchId && employee.employeeRoleId !== 0
      );

      setEmployees(filteredData);

      const total = filteredData.length;
      const active = filteredData.filter(
        (employee) => employee.status === "Active"
      ).length;
      const blocked = filteredData.filter(
        (employee) => employee.status === "Blocked"
      ).length;

      setEmployeeStats({
        total,
        active,
        blocked,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setOperationError("Đã xảy ra lỗi khi tải dữ liệu nhân viên.");
      setLoading(false);
    }
  };

  const handleStatusChangeClick = (employee) => {
    setCurrentEmployee(employee);
    setShowStatusModal(true);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const token = getToken();

    if (!token) return;

    const emailValidationResult = validateEmail(formData.email);
    const phoneValidationResult = validatePhone(formData.phone);

    setEmailError(emailValidationResult);
    setPhoneError(phoneValidationResult);

    if (emailValidationResult || phoneValidationResult || fileError) {
      setError("Vui lòng sửa các lỗi trước khi gửi.");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.roleId ||
      !formData.branchId ||
      (formData.roleId === "3" && !formData.employeeRoleId)
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("Name", formData.name);
    formDataToSend.append("Email", formData.email);
    formDataToSend.append("Phone", formData.phone);
    formDataToSend.append("Password", formData.password);
    formDataToSend.append("RoleId", formData.roleId);
    formDataToSend.append("BranchId", formData.branchId);

    if (formData.roleId === "3" && formData.employeeRoleId) {
      formDataToSend.append("EmployeeRoleId", formData.employeeRoleId);
    }

    if (selectedFile) {
      formDataToSend.append("avatar", selectedFile);
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/Employee/create-employee-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Tạo tài khoản nhân viên thất bại! Email hoặc số điện thoại đã tồn tại."
        );
      }

      setOperation({
        status: "success",
        message: "Thêm nhân viên thành công!",
      });
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        roleId: "",
        employeeRoleId: "",
        branchId: managerBranchId,
        avatar: null,
      });
      setSelectedFile(null);
      setError("");
      setEmailError("");
      setPhoneError("");
      setFileError("");
      fetchEmployees(token, managerBranchId);
    } catch (error) {
      console.error("Error adding employee:", error);
      setError(error.message || "Đã xảy ra lỗi khi thêm nhân viên.");
      setOperationError(error.message || "Đã xảy ra lỗi khi thêm nhân viên.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);

      if (error) {
        setFileError(error);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setFileError("");
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const [previewUrl, setPreviewUrl] = useState(null);

  const changeEmployeeStatus = async (accountId, newStatus) => {
    const token = getToken();

    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/api/Customer/update-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: accountId,
          newStatus: newStatus,
        }),
      });

      if (response.ok) {
        // Cập nhật mảng employees
        const updatedEmployees = employees.map((employee) =>
          employee.accountId === accountId
            ? { ...employee, status: newStatus }
            : employee
        );
        setEmployees(updatedEmployees);

        // Cập nhật lại employeeStats từ mảng employees đã cập nhật
        const total = updatedEmployees.length;
        const active = updatedEmployees.filter(
          (employee) => employee.status === "Active"
        ).length;
        const blocked = updatedEmployees.filter(
          (employee) => employee.status === "Blocked"
        ).length;

        setEmployeeStats({
          total,
          active,
          blocked,
        });

        setOperation({
          status: "success",
          message: `Trạng thái đã được cập nhật thành công`,
        });
        setShowStatusModal(false);
      } else {
        const data = await response.json();
        setOperationError(
          data.message || "Lỗi khi thay đổi trạng thái tài khoản"
        );
      }
    } catch (error) {
      console.error("Error updating employee status:", error);
      setOperationError("Lỗi khi cập nhật trạng thái tài khoản");
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      roleId: "",
      employeeRoleId: "",
      branchId: managerBranchId,
      avatar: null,
    });
    setSelectedFile(null);
    setPreviewUrl(null); // RESET ảnh preview
    setError("");
    setEmailError("");
    setPhoneError("");
    setFileError("");
    setShowAddModal(true);
  };

  const openStatusModal = (employee) => {
    setCurrentEmployee(employee);
    setShowStatusModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear specific error when user starts typing in the field
    if (name === "email") setEmailError("");
    if (name === "phone") setPhoneError("");
    if (error) setError("");

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Cập nhật xử lý tìm kiếm chỉ dựa trên tên nhân viên
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Helper function to get status color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Blocked":
        return "status-blocked";
      case "InActive":
        return "status-inactive";
      default:
        return "status-active";
    }
  };

  // Cập nhật cách lọc nhân viên để kết hợp cả tìm kiếm và lọc theo trạng thái
  const filteredEmployees = employees.filter((employee) => {
    // Lọc theo trạng thái
    const statusMatch = statusFilter === "" || employee.status === statusFilter;

    // Lọc theo tên (không phân biệt chữ hoa/thường)
    const nameMatch =
      searchTerm === "" ||
      (employee.employeeName &&
        employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Trả về true nếu nhân viên thỏa mãn cả hai điều kiện
    return statusMatch && nameMatch;
  });

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEmployees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Chart data for employee status
  const statusChartData = {
    labels: ["Hoạt động", "Bị khóa"],
    datasets: [
      {
        label: "Trạng thái nhân viên",
        data: [employeeStats.active, employeeStats.blocked],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="dashboard-manager-container">
      <Sidebar_Manager />
      <div className="dashboard-manager-main-content">
        <Header_Manager />

        <div className="manager-employee-content">
          <div className="manager-employee-header">
            <h1>Quản lý Nhân Viên Chi Nhánh</h1>
            <button className="manager-employee-add-btn" onClick={openAddModal}>
              <FaPlus /> Thêm Nhân Viên
            </button>
          </div>
          {operation.status === "success" && (
            <div className="manager-employee-success-message">
              {operation.message}
            </div>
          )}
          {/* {operationError && (
            <div className="manager-employee-error-message">
              {operationError}
            </div>
          )} */}

          {/* Summary Cards */}
          <div className="manager-employee-stats-container">
            <div className="manager-employee-stat-card">
              <div className="manager-employee-stat-icon total">
                <FaUserTie />
              </div>
              <div className="manager-employee-stat-info">
                <h3>Tổng số nhân viên</h3>
                <p>{employeeStats.total}</p>
              </div>
            </div>

            <div className="manager-employee-stat-card">
              <div className="manager-employee-stat-icon active">
                <FaUserCheck />
              </div>
              <div className="manager-employee-stat-info">
                <h3>Nhân viên hoạt động</h3>
                <p>{employeeStats.active}</p>
              </div>
            </div>

            <div className="manager-employee-stat-card">
              <div className="manager-employee-stat-icon blocked">
                <FaUserLock />
              </div>
              <div className="manager-employee-stat-info">
                <h3>Nhân viên bị khóa</h3>
                <p>{employeeStats.blocked}</p>
              </div>
            </div>
          </div>

          {/* Chart and Filter Section */}
          <div className="manager-employee-chart-filter-container">
            <div className="manager-employee-chart-card">
              <h2>Trạng Thái Nhân Viên</h2>
              <div className="manager-employee-chart">
                <Doughnut
                  data={statusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                  height={200}
                />
              </div>
            </div>

            <div className="manager-employee-filter-card">
              <h2>Tìm Kiếm & Lọc</h2>
              <div className="manager-employee-search">
                <div className="manager-employee-search-input">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên nhân viên"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                  />
                </div>
              </div>
              <div className="manager-employee-filter">
                <label>Lọc theo trạng thái:</label>
                <select value={statusFilter} onChange={handleStatusFilter}>
                  <option value="">Tất cả</option>
                  <option value="Active">Hoạt động</option>
                  <option value="Blocked">Bị khóa</option>
                  <option value="InActive">Chưa kích hoạt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="manager-employee-table-container">
            <h2>Danh Sách Nhân Viên</h2>
            {currentRecords.length > 0 ? (
              <>
                <table className="manager-employee-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Ảnh đại diện</th>
                      <th>Tên nhân viên</th>
                      <th>Chi nhánh</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Ngày thuê</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((employee, index) => (
                      <tr key={employee.accountId}>
                        <td>{indexOfFirstRecord + index + 1}</td>
                        <td>
                          <div className="employee-avatar">
                            {employee.avatarUrl ? (
                              <img
                                src={`http://localhost:5000/${employee.avatarUrl}`}
                                alt={`${employee.employeeName}'s avatar`}
                                className="employee-avatar-img"
                              />
                            ) : (
                              <div className="employee-avatar-placeholder">
                                {employee.employeeName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{employee.employeeName}</td>
                        <td>{employee.branchName}</td>
                        <td>{employee.employeeRoleName}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusColorClass(
                              employee.status || "Active"
                            )}`}
                          >
                            {employee.status === "Active" && "Hoạt động"}
                            {employee.status === "Blocked" && "Khóa"}
                            {employee.status === "InActive" && "Chưa kích hoạt"}
                            {!employee.status && "Hoạt động"}
                          </span>
                        </td>
                        <td>{formatDate(employee.hireDate)}</td>
                        <td className="manager-employee-actions">
                          <button
                            className="manage-employee-status-btn"
                            onClick={() => handleStatusChangeClick(employee)}
                            title="Thay đổi trạng thái tài khoản"
                          >
                            <FaUserLock /> Trạng thái
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="manager-employee-pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="manager-employee-pagination-btn"
                    >
                      Trang trước
                    </button>
                    <div className="manager-employee-pagination-numbers">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`manager-employee-page-number ${
                            currentPage === index + 1 ? "active" : ""
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="manager-employee-pagination-btn"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="manager-employee-no-records">
                <p>Không tìm thấy nhân viên nào.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="manager-employee-modal-overlay">
            <div className="manager-employee-modal">
              <div className="manager-employee-modal-header">
                <h2>Thêm Nhân Viên Mới</h2>
                <button
                  className="manager-employee-modal-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setError("");
                    setEmailError("");
                    setPhoneError("");
                    setFileError("");
                    setPreviewUrl(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleAddEmployee}>
                <div className="manager-employee-modal-body">
                  {error && (
                    <div className="manage-employee-error-message">{error}</div>
                  )}

                  <div className="manager-employee-input-group">
                    <label>
                      Tên: <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập tên nhân viên"
                    />
                  </div>

                  <div className="manager-employee-input-group">
                    <label>
                      Email: <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập email"
                      className={emailError ? "input-error" : ""}
                    />
                    {emailError && (
                      <div className="field-error-message">{emailError}</div>
                    )}
                  </div>

                  <div className="manager-employee-input-group">
                    <label>
                      Số điện thoại: <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập số điện thoại"
                      className={phoneError ? "input-error" : ""}
                    />
                    {phoneError && (
                      <div className="field-error-message">{phoneError}</div>
                    )}
                  </div>

                  <div className="manager-employee-input-group">
                    <label>
                      Mật khẩu: <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập mật khẩu"
                    />
                  </div>

                  <div className="manager-employee-input-group">
                    <label>
                      Vai trò: <span className="required">*</span>
                    </label>
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn vai trò</option>
                      {!isRolesLoading && roles.length > 0 ? (
                        roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))
                      ) : (
                        <option value="3">Staff</option>
                      )}
                    </select>
                    {isRolesLoading && <p>Đang tải vai trò...</p>}
                  </div>

                  {formData.roleId === "3" && (
                    <div className="manager-employee-input-group">
                      <label>
                        Chức vụ: <span className="required">*</span>
                      </label>
                      <select
                        name="employeeRoleId"
                        value={formData.employeeRoleId || ""}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Chọn chức vụ</option>
                        {!isEmployeeRolesLoading &&
                          employeeRoles.map((role) => (
                            <option
                              key={role.employeeRoleId}
                              value={role.employeeRoleId}
                            >
                              {role.employeeRoleName}
                            </option>
                          ))}
                      </select>
                      {isEmployeeRolesLoading && <p>Đang tải chức vụ...</p>}
                    </div>
                  )}

                  <div className="manager-employee-input-group">
                    <label>Ảnh đại diện:</label>
                    <input
                      type="file"
                      name="avatar"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                      className={fileError ? "input-error" : ""}
                    />
                    {selectedFile && !fileError && (
                      <p className="file-selected">
                        Đã chọn: {selectedFile.name}
                      </p>
                    )}
                    {fileError && (
                      <div className="field-error-message">{fileError}</div>
                    )}

                    {/* Image preview section */}
                    {previewUrl && !fileError && (
                      <div className="image-preview">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="image-preview-img"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="manager-employee-modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setError("");
                      setEmailError("");
                      setPhoneError("");
                      setFileError("");
                    }}
                    className="manager-employee-cancel-btn"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="manager-employee-submit-btn">
                    Thêm Nhân Viên
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Employee Details Modal */}
        {showDetailsModal && currentEmployee && (
          <div className="manager-employee-modal-overlay">
            <div className="manager-employee-modal">
              <div className="manager-employee-modal-header">
                <h2>Thông Tin Chi Tiết Nhân Viên</h2>
                <button
                  className="manager-employee-modal-close"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="manager-employee-modal-body">
                <div className="manager-employee-detail-item">
                  <span className="manager-employee-detail-label">ID:</span>
                  <span className="manager-employee-detail-value">
                    {currentEmployee.accountId}
                  </span>
                </div>

                <div className="manager-employee-detail-item">
                  <span className="manager-employee-detail-label">
                    Họ và tên:
                  </span>
                  <span className="manager-employee-detail-value">
                    {currentEmployee.employeeName}
                  </span>
                </div>

                <div className="manager-employee-detail-item">
                  <span className="manager-employee-detail-label">
                    Ngày sinh:
                  </span>
                  <span className="manager-employee-detail-value">
                    {formatDate(currentEmployee.dob)}
                  </span>
                </div>

                <div className="manager-employee-detail-item">
                  <span className="manager-employee-detail-label">
                    Vai trò:
                  </span>
                  <span className="manager-employee-detail-value">
                    {currentEmployee.employeeRoleName}
                  </span>
                </div>

                <div className="manager-employee-detail-item">
                  <span className="manager-employee-detail-label">
                    Trạng thái:
                  </span>
                  <span
                    className={`manager-employee-detail-value ${
                      currentEmployee.status === "Active"
                        ? "text-active"
                        : currentEmployee.status === "Blocked"
                        ? "text-blocked"
                        : "text-inactive"
                    }`}
                  >
                    {currentEmployee.status === "Active"
                      ? "Hoạt động"
                      : currentEmployee.status === "Blocked"
                      ? "Bị khóa"
                      : "Chưa kích hoạt"}
                  </span>
                </div>

                <div className="manager-employee-detail-item">
                  <span className="manager-employee-detail-label">
                    Ngày tham gia:
                  </span>
                  <span className="manager-employee-detail-value">
                    {formatDate(currentEmployee.hireDate)}
                  </span>
                </div>
              </div>
              <div className="manager-employee-modal-footer">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="manager-employee-close-btn"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {showStatusModal && currentEmployee && (
          <ChangeStatusModal
            employee={currentEmployee}
            onStatusChange={changeEmployeeStatus}
            onClose={() => setShowStatusModal(false)}
          />
        )}

        <Footer_Manager />
      </div>
    </div>
  );
};

export default Manager_Employee;
