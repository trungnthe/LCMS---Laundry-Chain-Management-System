import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_role_salary.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaEdit,
  FaPlus,
  FaSearch,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEllipsisH,
  FaUserTie,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaBan,
  FaCheck,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
const apiUrl = import.meta.env.VITE_API_URL;

const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);

    if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
      localStorage.removeItem("token");
      return null;
    }

    return token;
  } catch (error) {
    console.error("Token decode error:", error);
    localStorage.removeItem("token");
    return null;
  }
};

// Modal for Add/Edit Role
const RoleModal = ({ type, data, onSave, onClose, existingRoles }) => {
  const [roleData, setRoleData] = useState(data || {});
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoleData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const checkDuplicateRoleName = (roleName) => {
    const rolesToCheck =
      type === "edit"
        ? existingRoles.filter(
            (r) => r.employeeRoleId !== roleData.employeeRoleId
          )
        : existingRoles;

    return rolesToCheck.some(
      (role) => role.employeeRoleName?.toLowerCase() === roleName.toLowerCase()
    );
  };

  const handleSubmit = () => {
    if (!roleData.employeeRoleName || !roleData.description) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Check if role name already exists
    if (checkDuplicateRoleName(roleData.employeeRoleName)) {
      setError("Tên vai trò đã tồn tại. Vui lòng chọn tên khác!");
      return;
    }

    // Compare current roleData with initial data to check for changes
    if (
      data &&
      data.employeeRoleName === roleData.employeeRoleName &&
      data.description === roleData.description
    ) {
      setError("Không có thay đổi nào được thực hiện.");
      return;
    }

    onSave(roleData);
  };

  const handleClose = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
    setError("");
    onClose();
  };

  return (
    <div className="manage-role-salary-modal show">
      <div
        className="manage-role-salary-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="manage-role-salary-modal-header">
          <h3>{type === "add" ? "Thêm Vai Trò Mới" : "Chỉnh Sửa Vai Trò"}</h3>
          <button
            className="manage-role-salary-close-modal-btn"
            onClick={handleClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-role-salary-modal-body">
          <div className="manage-role-salary-form-group">
            <label>Tên Vai Trò:</label>
            <input
              type="text"
              name="employeeRoleName"
              className="manage-role-salary-input"
              placeholder="Tên vai trò"
              value={roleData.employeeRoleName || ""}
              onChange={handleChange}
            />
          </div>
          <div className="manage-role-salary-form-group">
            <label>Mô Tả Vai Trò:</label>
            <textarea
              name="description"
              className="manage-role-salary-input"
              placeholder="Mô tả vai trò"
              value={roleData.description || ""}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="manage-role-salary-error">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="manage-role-salary-modal-actions">
          <button
            className="manage-role-salary-modal-save-btn"
            onClick={handleSubmit}
          >
            Lưu
          </button>
          <button
            className="manage-role-salary-modal-close-btn"
            onClick={handleClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// For Disable Role Modal
const DisableRoleModal = ({ role, onDisable, onClose }) => {
  return (
    <div className="manage-role-salary-modal show">
      <div className="manage-role-salary-modal-content">
        <div className="manage-role-salary-modal-header">
          <h3>Xác nhận vô hiệu hóa</h3>
          <button
            className="manage-role-salary-close-modal-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-role-salary-modal-body">
          <p>
            Bạn có chắc chắn muốn vô hiệu hóa vai trò "{role.employeeRoleName}"
            không?
          </p>
          <p className="manage-role-salary-warning">
            Lưu ý: Vai trò bị vô hiệu hóa sẽ không thể sử dụng trong hệ thống.
          </p>
        </div>
        <div className="manage-role-salary-modal-actions">
          <button
            className="manage-role-salary-modal-disable-btn"
            onClick={() => onDisable(role.employeeRoleId)}
          >
            Vô hiệu hóa
          </button>
          <button
            className="manage-role-salary-modal-close-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Edit Salary Structure
const SalaryStructureModal = ({ data, onSave, onClose }) => {
  const [salaryData, setSalaryData] = useState({
    baseSalary: data.baseSalary || 0,
    allowance: data.allowance || 0,
    overtimeRate: data.overtimeRate || 0,
    standardHoursPerMonth: data.standardHoursPerMonth || 0,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSalaryData((prev) => ({ ...prev, [name]: value }));

    setError("");

    if (value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setError(`${name} phải là số dương`);
      }
    }
  };

  const handleSubmit = () => {
    let hasError = false;
    const processedData = {};

    for (const [key, value] of Object.entries(salaryData)) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        setError(`${key} phải là số dương`);
        hasError = true;
        break;
      }
      processedData[key] = numValue;
    }

    if (!hasError) {
      const hasChanges =
        parseFloat(processedData.baseSalary) !== parseFloat(data.baseSalary) ||
        parseFloat(processedData.allowance) !== parseFloat(data.allowance) ||
        parseFloat(processedData.overtimeRate) !==
          parseFloat(data.overtimeRate) ||
        parseFloat(processedData.standardHoursPerMonth) !==
          parseFloat(data.standardHoursPerMonth);

      if (!hasChanges) {
        setError("Không có thay đổi nào được thực hiện.");
        return;
      }

      onSave(data.employeeRoleId, processedData);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setError("");
    onClose();
  };

  return (
    <div className="manage-role-salary-modal show">
      <div
        className="manage-role-salary-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="manage-role-salary-modal-header">
          <h3>Cập Nhật Cấu Trúc Lương - {data.employeeRoleName}</h3>
          <button
            className="manage-role-salary-close-modal-btn"
            onClick={handleClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-role-salary-modal-body">
          <div className="manage-role-salary-form-group">
            <label>Lương Cơ Bản:</label>
            <input
              type="number"
              name="baseSalary"
              className="manage-role-salary-input"
              placeholder="Lương cơ bản"
              value={salaryData.baseSalary}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="manage-role-salary-form-group">
            <label>Phụ Cấp:</label>
            <input
              type="number"
              name="allowance"
              className="manage-role-salary-input"
              placeholder="Phụ cấp"
              value={salaryData.allowance}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="manage-role-salary-form-group">
            <label>Tỷ Lệ Làm Thêm Giờ:</label>
            <input
              type="number"
              name="overtimeRate"
              className="manage-role-salary-input"
              placeholder="Tỷ lệ làm thêm giờ"
              value={salaryData.overtimeRate}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="manage-role-salary-form-group">
            <label>Số Giờ Tiêu Chuẩn/Tháng:</label>
            <input
              type="number"
              name="standardHoursPerMonth"
              className="manage-role-salary-input"
              placeholder="Số giờ tiêu chuẩn/tháng"
              value={salaryData.standardHoursPerMonth}
              onChange={handleChange}
              min="0"
            />
          </div>

          {error && (
            <div className="manage-role-salary-error">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="manage-role-salary-modal-actions">
          <button
            className="manage-role-salary-modal-save-btn"
            onClick={handleSubmit}
          >
            Cập Nhật
          </button>
          <button
            className="manage-role-salary-modal-close-btn"
            onClick={handleClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Role_Salary = () => {
  const [roles, setRoles] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentRole, setCurrentRole] = useState(null);
  const [currentSalaryStructure, setCurrentSalaryStructure] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("status");
  const [jumpToPage, setJumpToPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalRoles, setTotalRoles] = useState(0);
  const [activeTab, setActiveTab] = useState("roles"); // 'roles' or 'salaries'

  // Replace toast with custom state notifications
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

  // Tự động xóa thông báo sau 3 giây
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
    fetchRoles();
    fetchSalaryStructures();
  }, []);

  const fetchRoles = async () => {
    const token = getToken();

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/EmployeeRole/get-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data = await response.json();
      setRoles(data);
      setTotalRoles(data.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setErrorMessage("Không thể tải dữ liệu vai trò. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const fetchSalaryStructures = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/SalaryStructure/get-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch salary structures");
      }

      const data = await response.json();
      setSalaryStructures(data);
    } catch (error) {
      console.error("Error fetching salary structures:", error);
      setErrorMessage(
        "Không thể tải dữ liệu cấu trúc lương. Vui lòng thử lại sau."
      );
    }
  };

  const handleAddRole = (newRole) => {
    const token = getToken();

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      return;
    }

    fetch(`${apiUrl}/api/EmployeeRole/add-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newRole),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add role");
        }
        return response.text().then((text) => {
          return text ? JSON.parse(text) : {};
        });
      })
      .then((data) => {
        // Após adicionar o cargo com sucesso, criar automaticamente a estrutura salarial
        // com os valores padrão
        const roleId = data.employeeRoleId;
        const defaultSalaryStructure = {
          baseSalary: 0, // Deixe como 0 ou defina um valor padrão se necessário
          allowance: 0, // Deixe como 0 ou defina um valor padrão se necessário
          overtimeRate: 1.5, // Taxa de hora extra padrão: 1.5
          standardHoursPerMonth: 160, // Horas padrão por mês: 160
        };

        return fetch(`${apiUrl}/api/SalaryStructure/update-salary/${roleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(defaultSalaryStructure),
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create default salary structure");
        }
        return response.text().then((text) => {
          return text ? JSON.parse(text) : {};
        });
      })
      .then(() => {
        fetchRoles();
        fetchSalaryStructures();
        setOperation({
          status: "success",
          message: "Thêm vai trò thành công!",
        });
        setShowRoleModal(false);
      })
      .catch((error) => {
        setOperationError("Thêm vai trò thất bại!");
        console.error("Add failed:", error);
      });
  };

  const handleEditRole = (updatedRole) => {
    const token = getToken();

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      return;
    }

    fetch(
      `${apiUrl}/api/EmployeeRole/update-role/${updatedRole.employeeRoleId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRole),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update role");
        }
        return response.text().then((text) => {
          return text ? JSON.parse(text) : {};
        });
      })
      .then(() => {
        fetchRoles();
        fetchSalaryStructures();
        setOperation({
          status: "success",
          message: "Cập nhật vai trò thành công!",
        });
        setShowRoleModal(false);
      })
      .catch((error) => {
        setOperationError("Cập nhật vai trò thất bại!");
        console.error("Update failed:", error);
      });
  };

  const handleUpdateSalaryStructure = (roleId, salaryData) => {
    const token = getToken();

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      return;
    }

    fetch(`${apiUrl}/api/SalaryStructure/update-salary/${roleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(salaryData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update salary structure");
        }
        return response.text().then((text) => {
          return text ? JSON.parse(text) : {};
        });
      })
      .then(() => {
        fetchSalaryStructures();
        setOperation({
          status: "success",
          message: "Cập nhật cấu trúc lương thành công!",
        });
        setShowSalaryModal(false);
      })
      .catch((error) => {
        setOperationError("Cập nhật cấu trúc lương thất bại!");
        console.error("Update salary failed:", error);
      });
  };

  // Changed from handleDeleteRole to handleDisableRole
  const handleDisableRole = (roleId) => {
    const token = getToken();

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      return;
    }

    // Still using the same delete API endpoint, but logically it will now set statusDelete to false
    fetch(`${apiUrl}/api/EmployeeRole/delete-role/${roleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to disable role");
        }
        return response.text().then((text) => {
          return text ? JSON.parse(text) : {};
        });
      })
      .then(() => {
        fetchRoles();
        fetchSalaryStructures();
        setOperation({
          status: "success",
          message: "Vô hiệu hóa vai trò thành công!",
        });
        setShowDisableModal(false);
      })
      .catch((error) => {
        setOperationError("Vô hiệu hóa vai trò thất bại!");
        console.error("Disable failed:", error);
      });
  };

  const handleSaveRole = (roleData) => {
    if (modalType === "add") {
      handleAddRole(roleData);
    } else {
      handleEditRole(roleData);
    }
  };

  const handleAddRoleClick = () => {
    setModalType("add");
    setCurrentRole(null);
    setShowRoleModal(true);
  };

  const handleEditRoleClick = (role) => {
    setModalType("edit");
    setCurrentRole(role);
    setShowRoleModal(true);
  };

  const handleDisableRoleClick = (role) => {
    setCurrentRole(role);
    setShowDisableModal(true);
  };

  const handleEditSalaryClick = (salaryStructure) => {
    setCurrentSalaryStructure(salaryStructure);
    setShowSalaryModal(true);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field) => {
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  // Handle jump to page
  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPage);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      paginate(pageNumber);
      setJumpToPage("");
    } else {
      setOperationError(`Vui lòng nhập số trang từ 1 đến ${totalPages}`);
    }
  };

  // Filter data by search term
  const filteredRoles = roles.filter((role) => {
    return (
      role.employeeRoleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredSalaryStructures = salaryStructures.filter((salary) => {
    return (
      salary.employeeRoleName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      salary.employeeRoleDescription
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // Sort data
  const sortedRoles = [...filteredRoles].sort((a, b) => {
    // First sort by status (active roles first)
    if (
      (a.statusDelete === true && b.statusDelete === false) ||
      (a.statusDelete === undefined && b.statusDelete === false)
    ) {
      return -1; // a comes before b
    }
    if (
      (a.statusDelete === false && b.statusDelete === true) ||
      (a.statusDelete === false && b.statusDelete === undefined)
    ) {
      return 1; // b comes before a
    }

    // If statuses are the same, sort by the selected field
    if (sortField === "employeeRoleName") {
      return sortOrder === "asc"
        ? a.employeeRoleName?.localeCompare(b.employeeRoleName || "")
        : b.employeeRoleName?.localeCompare(a.employeeRoleName || "");
    } else if (sortField === "description") {
      return sortOrder === "asc"
        ? a.description?.localeCompare(b.description || "")
        : b.description?.localeCompare(a.description || "");
    } else if (sortField === "status") {
      const statusA = a.statusDelete === false ? 0 : 1;
      const statusB = b.statusDelete === false ? 0 : 1;
      return sortOrder === "desc" ? statusA - statusB : statusB - statusA;
    }
    return 0;
  });

  const sortedSalaryStructures = [...filteredSalaryStructures].sort((a, b) => {
    if (a.statusDelete !== b.statusDelete) {
      return b.statusDelete === true ? 1 : -1;
    }

    if (sortField === "employeeRoleName") {
      return sortOrder === "asc"
        ? a.employeeRoleName?.localeCompare(b.employeeRoleName || "")
        : b.employeeRoleName?.localeCompare(a.employeeRoleName || "");
    } else if (sortField === "baseSalary") {
      return sortOrder === "asc"
        ? a.baseSalary - b.baseSalary
        : b.baseSalary - a.baseSalary;
    }
    return 0;
  });

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRoleRecords = sortedRoles.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const currentSalaryRecords = sortedSalaryStructures.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalRolePages = Math.ceil(sortedRoles.length / recordsPerPage);
  const totalSalaryPages = Math.ceil(
    sortedSalaryStructures.length / recordsPerPage
  );
  const totalPages = activeTab === "roles" ? totalRolePages : totalSalaryPages;

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

  return (
    <div className="manage-role-salary-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-role-salary">
          <h2>Quản Lý Vai Trò & Cấu Trúc Lương</h2>

          {operation.status === "success" && (
            <div className="manage-role-salary-success-message">
              {operation.message}
            </div>
          )}

          {operationError && (
            <div className="manage-role-salary-error-message">
              {operationError}
            </div>
          )}

          <div className="manage-role-salary-tabs">
            <button
              className={`manage-role-salary-tab-btn ${
                activeTab === "roles" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("roles");
                setCurrentPage(1);
              }}
            >
              <FaUserTie /> Quản Lý Vai Trò
            </button>
            <button
              className={`manage-role-salary-tab-btn ${
                activeTab === "salaries" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("salaries");
                setCurrentPage(1);
              }}
            >
              <FaMoneyBillWave /> Quản Lý Cấu Trúc Lương
            </button>
          </div>

          <div className="manage-role-salary-tools">
            <div className="manage-role-salary-search">
              <input
                type="text"
                placeholder="Tìm kiếm vai trò..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <FaSearch className="manage-role-salary-search-icon" />
            </div>
            {activeTab === "roles" && (
              <button
                className="manage-role-salary-add-btn"
                onClick={handleAddRoleClick}
              >
                <FaPlus /> Thêm Vai Trò
              </button>
            )}
          </div>

          {loading ? (
            <div className="manage-role-salary-loading">Đang tải...</div>
          ) : errorMessage ? (
            <div className="manage-role-salary-error-message">
              {errorMessage}
            </div>
          ) : (
            <>
              {activeTab === "roles" ? (
                <div className="manage-role-salary-table-container">
                  <table className="manage-role-salary-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th onClick={() => handleSort("employeeRoleName")}>
                          Tên Vai Trò{" "}
                          {sortField === "employeeRoleName" &&
                            (sortOrder === "asc" ? (
                              <FaArrowUp />
                            ) : (
                              <FaArrowDown />
                            ))}
                        </th>
                        <th onClick={() => handleSort("description")}>
                          Mô Tả{" "}
                          {sortField === "description" &&
                            (sortOrder === "asc" ? (
                              <FaArrowUp />
                            ) : (
                              <FaArrowDown />
                            ))}
                        </th>
                        <th onClick={() => handleSort("status")}>
                          Trạng Thái{" "}
                          {sortField === "status" &&
                            (sortOrder === "asc" ? (
                              <FaArrowUp />
                            ) : (
                              <FaArrowDown />
                            ))}
                        </th>
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRoleRecords.length > 0 ? (
                        currentRoleRecords.map((role, index) => (
                          <tr key={role.employeeRoleId}>
                            <td>{indexOfFirstRecord + index + 1}</td>
                            <td>{role.employeeRoleName}</td>
                            <td>{role.description}</td>
                            <td>
                              {role.statusDelete === false ? (
                                <span className="manage-role-salary-inactive">
                                  <FaBan /> Vô hiệu
                                </span>
                              ) : (
                                <span className="manage-role-salary-active">
                                  <FaCheck /> Hoạt động
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="manage-role-salary-actions">
                                <button
                                  className="manage-role-salary-edit-btn"
                                  onClick={() => handleEditRoleClick(role)}
                                  disabled={role.statusDelete === false}
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="manage-role-salary-disable-btn"
                                  onClick={() => handleDisableRoleClick(role)}
                                  disabled={role.statusDelete === false}
                                >
                                  <FaBan />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="manage-role-salary-no-data"
                          >
                            Không có dữ liệu vai trò
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="manage-role-salary-table-container">
                  <table className="manage-role-salary-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th onClick={() => handleSort("employeeRoleName")}>
                          Vai Trò{" "}
                          {sortField === "employeeRoleName" &&
                            (sortOrder === "asc" ? (
                              <FaArrowUp />
                            ) : (
                              <FaArrowDown />
                            ))}
                        </th>
                        <th onClick={() => handleSort("baseSalary")}>
                          Lương Cơ Bản{" "}
                          {sortField === "baseSalary" &&
                            (sortOrder === "asc" ? (
                              <FaArrowUp />
                            ) : (
                              <FaArrowDown />
                            ))}
                        </th>
                        <th>Phụ Cấp</th>
                        <th>Tỷ Lệ OT</th>
                        <th>Giờ Chuẩn/Tháng</th>
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSalaryRecords.length > 0 ? (
                        currentSalaryRecords.map((salary, index) => (
                          <tr key={salary.salaryStructureId}>
                            <td>{indexOfFirstRecord + index + 1}</td>
                            <td>{salary.employeeRoleName}</td>
                            <td>{salary.baseSalary.toLocaleString()} VND</td>
                            <td>{salary.allowance.toLocaleString()} VND</td>
                            <td>{salary.overtimeRate}x</td>
                            <td>{salary.standardHoursPerMonth} giờ</td>
                            <td>
                              <div className="manage-role-salary-actions">
                                <button
                                  className="manage-role-salary-edit-btn"
                                  onClick={() => handleEditSalaryClick(salary)}
                                  disabled={salary.statusDelete === false}
                                >
                                  <FaExchangeAlt />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="manage-role-salary-no-data"
                          >
                            Không có dữ liệu cấu trúc lương
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="manage-role-salary-pagination">
                <div className="manage-role-salary-pagination-controls">
                  <button
                    className="manage-role-salary-pagination-btn"
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    title="Trang đầu"
                  >
                    <FaAngleDoubleLeft />
                  </button>
                  <button
                    className="manage-role-salary-pagination-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Trang trước"
                  >
                    <FaArrowLeft />
                  </button>

                  {startPage > 1 && (
                    <button
                      className="manage-role-salary-pagination-btn manage-role-salary-pagination-ellipsis"
                      onClick={() => paginate(1)}
                      title="Trang 1"
                    >
                      1
                    </button>
                  )}

                  {startPage > 2 && (
                    <span className="manage-role-salary-pagination-ellipsis">
                      <FaEllipsisH />
                    </span>
                  )}

                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      className={`manage-role-salary-pagination-btn ${
                        currentPage === number ? "active" : ""
                      }`}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  ))}

                  {endPage < totalPages - 1 && (
                    <span className="manage-role-salary-pagination-ellipsis">
                      <FaEllipsisH />
                    </span>
                  )}

                  {endPage < totalPages && (
                    <button
                      className="manage-role-salary-pagination-btn manage-role-salary-pagination-ellipsis"
                      onClick={() => paginate(totalPages)}
                      title={`Trang ${totalPages}`}
                    >
                      {totalPages}
                    </button>
                  )}

                  <button
                    className="manage-role-salary-pagination-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Trang sau"
                  >
                    <FaArrowRight />
                  </button>
                  <button
                    className="manage-role-salary-pagination-btn"
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Trang cuối"
                  >
                    <FaAngleDoubleRight />
                  </button>
                </div>

                <div className="manage-role-salary-pagination-info">
                  <div className="manage-role-salary-pagination-jump">
                    <span>Đi đến trang:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
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
                  <div className="manage-role-salary-pagination-per-page">
                    <span>Hiển thị:</span>
                    <select
                      value={recordsPerPage}
                      onChange={handleRecordsPerPageChange}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                    </select>
                    <span>mục / trang</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <Footer_Admin />
      </div>

      {/* Modals */}
      {showRoleModal && (
        <RoleModal
          type={modalType}
          data={currentRole}
          onSave={handleSaveRole}
          onClose={() => setShowRoleModal(false)}
          existingRoles={roles}
        />
      )}

      {showDisableModal && (
        <DisableRoleModal
          role={currentRole}
          onDisable={handleDisableRole}
          onClose={() => setShowDisableModal(false)}
        />
      )}

      {showSalaryModal && (
        <SalaryStructureModal
          data={currentSalaryStructure}
          onSave={handleUpdateSalaryStructure}
          onClose={() => setShowSalaryModal(false)}
        />
      )}
    </div>
  );
};

export default Manage_Role_Salary;
