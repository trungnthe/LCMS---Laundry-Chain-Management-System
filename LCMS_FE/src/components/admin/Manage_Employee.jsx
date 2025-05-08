import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_employee.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaPlus,
  FaUserLock,
  FaEdit,
  FaSearch,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEllipsisH,
  FaUsers,
  FaStore,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

// Define API URL from environment variable
const apiUrl = import.meta.env.VITE_API_URL;

// Hàm lấy token từ localStorage
const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  const decodedToken = jwtDecode(token);

  if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
    localStorage.removeItem("token");
    return null;
  }

  return token;
};

// Modal for Create Employee Account
// Modal for Create Employee Account
const CreateEmployeeModal = ({ onSave, onClose }) => {
  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    employeeRoleId: null,
    branchId: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

  const [roles, setRoles] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isRolesLoading, setIsRolesLoading] = useState(true);
  const [isEmployeeRolesLoading, setIsEmployeeRolesLoading] = useState(true);
  const [isBranchesLoading, setIsBranchesLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (operation.status !== "") {
      const timer = setTimeout(() => {
        setOperation({ status: "", message: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [operation.status]);

  useEffect(() => {
    if (operationError !== "") {
      const timer = setTimeout(() => {
        setOperationError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [operationError]);

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
          (role) => role.roleName === "Manager" || role.roleName === "Staff"
        );
        setRoles(filteredRoles);
        setIsRolesLoading(false);
      })
      .catch((error) => {
        setOperationError("Lỗi khi lấy vai trò!");
      });

    // Fetch employee roles (chỉ cần cho Staff)
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
        setOperationError("Lỗi khi lấy vai trò nhân viên!");
        setIsEmployeeRolesLoading(false);
      });

    // Fetch branches
    fetch(`${apiUrl}/api/Branch/get-all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setBranches(data);
        setIsBranchesLoading(false);
      })
      .catch((error) => {
        setOperationError("Lỗi khi lấy chi nhánh!");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "roleId") {
      if (value === "2") {
        setSelectedRole("Manager");
        setEmployeeData((prev) => ({
          ...prev,
          [name]: value,
          employeeRoleId: null,
          branchId: "",
        }));
      } else if (value === "3") {
        setSelectedRole("Staff");
        setEmployeeData((prev) => ({
          ...prev,
          [name]: value,
          employeeRoleId: "",
        }));
      } else {
        setSelectedRole(null);
        setEmployeeData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setEmployeeData((prev) => ({ ...prev, [name]: value }));
    }

    setError("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }

    setError("");
  };

  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    const fileInput = document.getElementById("employee-avatar-input");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = () => {
    if (
      !employeeData.name ||
      !employeeData.email ||
      !employeeData.phone ||
      !employeeData.password ||
      !employeeData.roleId ||
      !employeeData.branchId ||
      (employeeData.roleId === "3" && !employeeData.employeeRoleId)
    ) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Không tìm thấy token xác thực!");
      return;
    }

    const formData = new FormData();
    formData.append("Name", employeeData.name);
    formData.append("Email", employeeData.email);
    formData.append("Phone", employeeData.phone);
    formData.append("Password", employeeData.password);
    formData.append("RoleId", employeeData.roleId);
    formData.append("BranchId", employeeData.branchId);

    if (employeeData.employeeRoleId) {
      formData.append("EmployeeRoleId", employeeData.employeeRoleId);
    }

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    fetch(`${apiUrl}/api/Employee/create-employee-account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Tạo tài khoản nhân viên thất bại!"
          );
        }
        return data;
      })
      .then((data) => {
        onSave(employeeData, "Tạo tài khoản nhân viên thành công!");
        onClose();
      })
      .catch((error) => {
        if (error.message.includes("already has a Manager")) {
          setError("Chi nhánh này đã có Manager.");
        } else if (
          error.message.toLowerCase().includes("email") &&
          error.message.toLowerCase().includes("exist")
        ) {
          setError("Email đã tồn tại.");
        } else {
          setError(error.message || "Tạo tài khoản nhân viên thất bại!");
          setTimeout(() => setError(""), 5000);
        }
      });
  };

  return (
    <div className="manage-employee-modal show">
      <div
        className="manage-employee-modal-content"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="manage-employee-modal-header">
          <h3>Thêm Nhân Viên Mới</h3>
          <button className="manage-employee-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-employee-modal-body">
          <div className="manage-employee-form-group">
            <label>Tên Nhân Viên:</label>
            <input
              type="text"
              name="name"
              className="manage-employee-input"
              placeholder="Tên Nhân Viên"
              value={employeeData.name}
              onChange={handleChange}
            />
          </div>
          <div className="manage-employee-form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              className="manage-employee-input"
              placeholder="Email"
              value={employeeData.email}
              onChange={handleChange}
            />
          </div>
          <div className="manage-employee-form-group">
            <label>Số Điện Thoại:</label>
            <input
              type="text"
              name="phone"
              className="manage-employee-input"
              placeholder="Số Điện Thoại"
              value={employeeData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="manage-employee-form-group">
            <label>Mật Khẩu:</label>
            <input
              type="password"
              name="password"
              className="manage-employee-input"
              placeholder="Mật Khẩu"
              value={employeeData.password}
              onChange={handleChange}
            />
          </div>
          <div className="manage-employee-form-group">
            <label>Vai Trò:</label>
            <select
              name="roleId"
              className="manage-employee-select"
              value={employeeData.roleId}
              onChange={handleChange}
              disabled={isRolesLoading}
            >
              <option value="">Chọn Vai Trò</option>
              {!isRolesLoading &&
                roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
            </select>
          </div>

          {/* Chỉ hiển thị mục chọn chức vụ khi roleId = 3 (Staff) */}
          {selectedRole === "Staff" && (
            <div className="manage-employee-form-group">
              <label>Chức Vụ:</label>
              <select
                name="employeeRoleId"
                className="manage-employee-select"
                value={employeeData.employeeRoleId || ""}
                onChange={handleChange}
                disabled={isEmployeeRolesLoading}
              >
                <option value="">Chọn Chức Vụ</option>
                {!isEmployeeRolesLoading && employeeRoles.length > 0 ? (
                  employeeRoles.map((role) => (
                    <option
                      key={role.employeeRoleId}
                      value={role.employeeRoleId}
                    >
                      {role.employeeRoleName}
                    </option>
                  ))
                ) : (
                  <option disabled>Không có chức vụ nào</option>
                )}
              </select>
            </div>
          )}

          <div className="manage-employee-form-group">
            <label>Chi Nhánh:</label>
            <select
              name="branchId"
              className="manage-employee-select"
              value={employeeData.branchId}
              onChange={handleChange}
              disabled={isBranchesLoading}
            >
              <option value="">Chọn Chi Nhánh</option>
              {!isBranchesLoading &&
                branches.map((branch) => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </option>
                ))}
            </select>
          </div>

          {/* Thêm trường upload ảnh */}
          <div className="manage-employee-form-group">
            <label>Hình Ảnh:</label>
            <div className="manage-employee-avatar-upload">
              <input
                type="file"
                id="employee-avatar-input"
                accept="image/*"
                onChange={handleAvatarChange}
                className="manage-employee-file-input"
              />
              <div className="manage-employee-avatar-preview-container">
                {avatarPreview && (
                  <div className="manage-employee-avatar-preview">
                    <img src={avatarPreview} alt="Preview" />
                    <button
                      className="manage-employee-avatar-remove-btn"
                      onClick={clearAvatarSelection}
                      title="Xóa ảnh"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="manage-employee-error">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="manage-employee-modal-actions">
          <button
            className="manage-employee-modal-save-btn"
            onClick={handleSubmit}
          >
            Thêm Mới
          </button>
          <button className="manage-employee-modal-close-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Change Employee Status
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

const Manage_Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("employeeName");
  const [jumpToPage, setJumpToPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

  useEffect(() => {
    if (operation.status !== "") {
      const timer = setTimeout(() => {
        setOperation({ status: "", message: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [operation.status]);

  useEffect(() => {
    if (operationError !== "") {
      const timer = setTimeout(() => {
        setOperationError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [operationError]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${apiUrl}/api/Employee/get-all-employee`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setEmployees(data);
        setTotalEmployees(data.length);
        setLoading(false);
      } catch (error) {
        setErrorMessage(
          "Không thể tải dữ liệu nhân viên. Vui lòng thử lại sau."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle branch search
  const handleBranchSearch = (e) => {
    setBranchSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
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

  const searchEmployees = () => {
    const token = getToken();

    if (!token) return;

    setLoading(true);

    let queryString = "";
    if (searchTerm) queryString += `?name=${searchTerm}`;
    if (branchSearchTerm) {
      if (queryString) queryString += `&branchName=${branchSearchTerm}`;
      else queryString += `?branchName=${branchSearchTerm}`;
    }

    fetch(`${apiUrl}/api/Employee/search-employees${queryString}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEmployees(data);
          setTotalEmployees(data.length);
        } else {
          setEmployees([]);
          setTotalEmployees(0);
          setOperation({
            status: "info",
            message: "Không có nhân viên nào phù hợp với tìm kiếm!",
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        setOperationError("Có lỗi xảy ra khi tìm kiếm!");
        setLoading(false);
      });
  };

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
        setEmployees(
          employees.map((employee) =>
            employee.accountId === accountId
              ? { ...employee, status: newStatus }
              : employee
          )
        );
        setOperation({
          status: "success",
          message: `Trạng thái đã được cập nhật thành ${newStatus}`,
        });
        setShowStatusModal(false);
      } else {
        const data = await response.json();
        setOperationError(
          data.message || "Lỗi khi thay đổi trạng thái tài khoản"
        );
      }
    } catch (error) {
      setOperationError("Lỗi khi cập nhật trạng thái tài khoản");
    }
  };

  const createEmployeeAccount = (newEmployee, successMessage) => {
    setOperation({
      status: "success",
      message: successMessage || "Tạo tài khoản nhân viên thành công!",
    });
    const token = getToken();

    if (!token) return;

    fetch(`${apiUrl}/api/Employee/get-all-employee`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setEmployees(data);
        setTotalEmployees(data.length);
      })
      .catch((error) => {
        setOperationError("Error fetching employees!");
      });
  };

  // Filter data by search term
  const filteredData = employees.filter((employee) => {
    const nameMatch = employee.employeeName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const branchMatch = employee.branchName
      ?.toLowerCase()
      .includes(branchSearchTerm.toLowerCase());

    if (searchTerm && branchSearchTerm) {
      return nameMatch && branchMatch;
    } else if (searchTerm) {
      return nameMatch;
    } else if (branchSearchTerm) {
      return branchMatch;
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "employeeName") {
      return sortOrder === "asc"
        ? a.employeeName.localeCompare(b.employeeName)
        : b.employeeName.localeCompare(a.employeeName);
    } else if (sortField === "employeeRoleName") {
      return sortOrder === "asc"
        ? a.employeeRoleName.localeCompare(b.employeeRoleName)
        : b.employeeRoleName.localeCompare(a.employeeRoleName);
    } else if (sortField === "branchName") {
      return sortOrder === "asc"
        ? a.branchName.localeCompare(b.branchName)
        : b.branchName.localeCompare(a.branchName);
    } else if (sortField === "hireDate") {
      return sortOrder === "asc"
        ? new Date(a.hireDate) - new Date(b.hireDate)
        : new Date(b.hireDate) - new Date(a.hireDate);
    }
    return 0;
  });

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(sortedData.length / recordsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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

  const handleStatusChangeClick = (employee) => {
    setCurrentEmployee(employee);
    setShowStatusModal(true);
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "Active":
        return "status-active";
      case "Blocked":
        return "status-blocked";
      case "InActive":
        return "status-inactive";
      default:
        return "";
    }
  };

  return (
    <div className="manage-employee-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-employee">
          <h2>Quản Lý Nhân Viên</h2>

          {operation.status === "success" && (
            <div className="manage-employee-success-message">
              {operation.message}
            </div>
          )}

          {operationError && (
            <div className="manage-employee-error-message">
              {operationError}
            </div>
          )}

          <div className="manage-employee-header">
            <div className="manage-employee-search">
              <div className="manage-employee-search-input-container">
                <FaSearch className="manage-employee-search-icon" />
                <input
                  type="text"
                  className="manage-employee-search-input"
                  placeholder="Tìm kiếm theo tên nhân viên..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <FaTimes
                    className="manage-employee-clear-search-icon"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
              <div className="manage-employee-search-input-container">
                <FaStore className="manage-employee-search-icon" />
                <input
                  type="text"
                  className="manage-employee-search-input"
                  placeholder="Tìm kiếm theo chi nhánh..."
                  value={branchSearchTerm}
                  onChange={handleBranchSearch}
                />
                {branchSearchTerm && (
                  <FaTimes
                    className="manage-employee-clear-search-icon"
                    onClick={() => setBranchSearchTerm("")}
                  />
                )}
              </div>
              <button
                className="manage-employee-search-btn"
                onClick={searchEmployees}
              >
                <FaSearch /> Tìm Kiếm
              </button>
            </div>
          </div>

          <div className="manage-employee-controls">
            <div className="manage-employee-total-employees">
              <FaUsers /> Tổng số nhân viên: {totalEmployees}
            </div>

            <div className="manage-employee-sort-controls">
              <button
                className={`manage-employee-sort-btn ${
                  sortField === "employeeName" ? "active" : ""
                }`}
                onClick={() => handleSort("employeeName")}
              >
                Sắp xếp theo tên{" "}
                {sortField === "employeeName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-employee-sort-btn ${
                  sortField === "employeeRoleName" ? "active" : ""
                }`}
                onClick={() => handleSort("employeeRoleName")}
              >
                Sắp xếp theo chức vụ{" "}
                {sortField === "employeeRoleName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-employee-sort-btn ${
                  sortField === "branchName" ? "active" : ""
                }`}
                onClick={() => handleSort("branchName")}
              >
                Sắp xếp theo chi nhánh{" "}
                {sortField === "branchName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-employee-sort-btn ${
                  sortField === "hireDate" ? "active" : ""
                }`}
                onClick={() => handleSort("hireDate")}
              >
                Sắp xếp theo ngày vào{" "}
                {sortField === "hireDate" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
            </div>

            <button
              className="manage-employee-add-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Thêm Nhân Viên
            </button>
          </div>

          {loading ? (
            <div className="manage-employee-loading-container">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : errorMessage ? (
            <div className="manage-employee-error-container">
              <p>{errorMessage}</p>
              <button
                className="manage-employee-reload-btn"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="manage-employee-table-container">
                <table className="manage-employee-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên Nhân Viên</th>
                      <th>Chức vụ</th>
                      <th>Chi Nhánh</th>
                      <th>Ngày Vào</th>
                      <th>Trạng Thái</th>
                      <th>Hình Ảnh</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="manage-employee-no-data">
                          {searchTerm || branchSearchTerm
                            ? "Không tìm thấy nhân viên nào phù hợp với tìm kiếm"
                            : "Không có nhân viên nào."}
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((employee, index) => (
                        <tr key={employee.accountId}>
                          <td>{indexOfFirstRecord + index + 1}</td>
                          <td>{employee.employeeName}</td>
                          <td>{employee.employeeRoleName}</td>
                          <td>{employee.branchName}</td>

                          <td>
                            {employee.hireDate
                              ? new Date(employee.hireDate).toLocaleDateString(
                                  "vi-VN"
                                )
                              : ""}
                          </td>

                          <td>
                            <span
                              className={`status-badge ${getStatusColorClass(
                                employee.status || "Active"
                              )}`}
                            >
                              {employee.status === "Active" && "Hoạt động"}
                              {employee.status === "Blocked" && "Khóa"}
                              {employee.status === "InActive" &&
                                "Chưa kích hoạt"}
                              {!employee.status && "Hoạt động"}
                            </span>
                          </td>
                          <td>
                            {employee.avatarUrl ? (
                              <img
                                src={`http://localhost:5000/${employee.avatarUrl}`}
                                alt={employee.employeeName}
                                className="manage-employee-avatar"
                              />
                            ) : (
                              <div className="manage-avatar-placeholder">
                                {employee.employeeName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="manage-employee-actions">
                              <button
                                className="manage-employee-status-btn"
                                onClick={() =>
                                  handleStatusChangeClick(employee)
                                }
                                title="Thay đổi trạng thái tài khoản"
                              >
                                <FaUserLock /> Trạng thái
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="manage-employee-pagination">
                <div className="manage-employee-pagination-info">
                  <div className="manage-employee-pagination-records">
                    <span>Hiển thị:</span>
                    <select
                      value={recordsPerPage}
                      onChange={handleRecordsPerPageChange}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>hàng mỗi trang</span>
                  </div>
                  <div className="manage-employee-pagination-stats">
                    <p>
                      Hiển thị {indexOfFirstRecord + 1}-
                      {Math.min(indexOfLastRecord, filteredData.length)} của{" "}
                      {filteredData.length} nhân viên
                    </p>
                  </div>
                </div>
                <div className="manage-employee-pagination-controls">
                  <button
                    className="manage-employee-pagination-btn"
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                  >
                    <FaAngleDoubleLeft />
                  </button>
                  <button
                    className="manage-employee-pagination-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaArrowLeft />
                  </button>

                  {startPage > 1 && (
                    <>
                      <button
                        className="manage-employee-pagination-btn"
                        onClick={() => paginate(1)}
                      >
                        1
                      </button>
                      {startPage > 2 && (
                        <span className="manage-employee-pagination-ellipsis">
                          <FaEllipsisH />
                        </span>
                      )}
                    </>
                  )}

                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      className={`manage-employee-pagination-btn ${
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
                        <span className="manage-employee-pagination-ellipsis">
                          <FaEllipsisH />
                        </span>
                      )}
                      <button
                        className="manage-employee-pagination-btn"
                        onClick={() => paginate(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    className="manage-employee-pagination-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <FaArrowRight />
                  </button>
                  <button
                    className="manage-employee-pagination-btn"
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <FaAngleDoubleRight />
                  </button>
                </div>
                <div className="manage-employee-pagination-jump">
                  <span>Đi đến trang:</span>
                  <input
                    type="text"
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleJumpToPage();
                      }
                    }}
                  />
                  <button onClick={handleJumpToPage}>Đi</button>
                </div>
              </div>
            </>
          )}
          <Footer_Admin />
        </div>
      </div>

      {showCreateModal && (
        <CreateEmployeeModal
          onSave={createEmployeeAccount}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showStatusModal && currentEmployee && (
        <ChangeStatusModal
          employee={currentEmployee}
          onStatusChange={changeEmployeeStatus}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
};

export default Manage_Employee;
