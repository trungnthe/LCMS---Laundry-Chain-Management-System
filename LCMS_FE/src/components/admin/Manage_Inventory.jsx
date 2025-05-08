import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_inventory.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEllipsisH,
  FaWarehouse,
  FaBan,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaExclamationTriangle,
  FaImage,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;
const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  // Get day, month, and year
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
const StatusBadge = ({ status }) => {
  const isActive =
    status === "Active" ||
    status === "Hoạt động (Active)" ||
    status === "Hoạt động" ||
    status === true;

  return (
    <div className={`status-badge ${isActive ? "active" : "inactive"}`}>
      {isActive ? "ACTIVE" : "INACTIVE"}
    </div>
  );
};

const DeleteStatusBadge = ({ statusDelete }) => {
  const isDisabled = statusDelete === false;

  return (
    <div
      className={`manage-inventory-delete-status ${
        isDisabled ? "disabled" : "enabled"
      }`}
    >
      {isDisabled ? (
        <>
          <FaTimesCircle className="manage-inventory-status-icon" /> Vô hiệu
        </>
      ) : (
        <>
          <FaCheckCircle className="manage-inventory-status-icon" /> Kích hoạt
        </>
      )}
    </div>
  );
};

// Modal for Add/Edit Inventory
const InventoryModal = ({ type, data, branches, onSave, onClose }) => {
  const [inventoryData, setInventoryData] = useState(data || {});
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    data && data.image ? data.image : null
  );

  useEffect(() => {
    if (type === "add" && !inventoryData.status) {
      setInventoryData((prev) => ({
        ...prev,
        status: "Hoạt động (Active)",
      }));
    }

    if (type === "edit" && data) {
      setOriginalData(data);
      setImagePreview(data.image || null);
    }
  }, [type, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInventoryData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleBranchChange = (e) => {
    setInventoryData((prev) => ({
      ...prev,
      branchId: parseInt(e.target.value, 10),
    }));
    setError("");
  };

  const validateFileType = (file) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/webp",
    ];
    return allowedTypes.includes(file.type);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (validateFileType(file)) {
        setInventoryData((prev) => ({
          ...prev,
          image: file,
        }));
        setFileError("");

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFileError(
          "Chỉ chấp nhận file ảnh có định dạng: JPG, JPEG, PNG, GIF, SVG, WEBP"
        );
        e.target.value = null;
      }
    }
  };
  const checkIfChanged = () => {
    if (type !== "edit" || !originalData) {
      return true;
    }

    const nameChanged =
      inventoryData.inventoryName !== originalData.inventoryName;
    const branchChanged = inventoryData.branchId !== originalData.branchId;
    const statusChanged = inventoryData.status !== originalData.status;

    const imageChanged = inventoryData.image instanceof File;

    return nameChanged || branchChanged || statusChanged || imageChanged;
  };

  const handleSubmit = () => {
    if (
      !inventoryData.inventoryName ||
      !inventoryData.branchId ||
      !inventoryData.status
    ) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (type === "edit" && !checkIfChanged()) {
      setError(
        "Không có thông tin nào được thay đổi. Vui lòng sửa đổi thông tin trước khi cập nhật."
      );
      return;
    }

    onSave(inventoryData);
  };

  return (
    <div className="manage-inventory-modal show">
      <div className="manage-inventory-modal-content">
        <div className="manage-inventory-modal-header">
          <h3>{type === "add" ? "Thêm Lô Hàng Mới" : "Chỉnh Sửa Lô Hàng"}</h3>
          <button
            className="manage-inventory-close-modal-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-inventory-modal-body">
          <div className="manage-inventory-form-group">
            <label>
              Tên Lô Hàng:<span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="inventoryName"
              className="manage-inventory-input"
              placeholder="Tên lô hàng"
              value={inventoryData.inventoryName || ""}
              onChange={handleChange}
            />
          </div>

          <div className="manage-inventory-form-group">
            <label>
              Chi Nhánh:<span className="required-star">*</span>
            </label>
            <select
              name="branchId"
              className="manage-inventory-input"
              value={inventoryData.branchId || ""}
              onChange={handleBranchChange}
            >
              <option value="">Chọn Chi Nhánh</option>
              {branches
                .filter((branch) => branch.statusDelete !== false) // Only show active branches
                .map((branch) => (
                  <option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </option>
                ))}
            </select>
          </div>

          <div className="manage-inventory-form-group">
            <label>
              Trạng Thái:<span className="required-star">*</span>
            </label>
            <select
              name="status"
              className="manage-inventory-input"
              value={inventoryData.status || ""}
              onChange={handleChange}
            >
              <option value="">Chọn trạng thái</option>
              <option value="Hoạt động (Active)">Hoạt động (Active)</option>
              <option value="Tạm ngưng (Inactive)">Tạm ngưng (Inactive)</option>
            </select>
          </div>

          <div className="manage-inventory-form-group">
            <label>Ảnh Lô Hàng:</label>
            <div className="manage-inventory-file-input-container">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
                className="manage-inventory-input"
                onChange={handleFileChange}
              />
            </div>
            {fileError && (
              <div className="manage-inventory-file-error">
                <FaExclamationTriangle /> {fileError}
              </div>
            )}

            {/* Add image preview */}
            {imagePreview && (
              <div className="manage-inventory-image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    marginTop: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="manage-inventory-error">
              <FaExclamationTriangle /> {error}
            </div>
          )}
        </div>
        <div className="manage-inventory-modal-actions">
          <button
            className="manage-inventory-modal-save-btn"
            onClick={handleSubmit}
          >
            {type === "add" ? "Thêm" : "Lưu"}
          </button>
          <button
            className="manage-inventory-modal-close-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteInventoryModal = ({ item, onDelete, onClose }) => {
  return (
    <div className="manage-inventory-modal show">
      <div className="manage-inventory-modal-content">
        <div className="manage-inventory-modal-header">
          <h3>Xác nhận xóa</h3>
          <button
            className="manage-inventory-close-modal-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-inventory-modal-body">
          <p>Bạn có chắc chắn muốn xóa lô hàng "{item.inventoryName}" không?</p>
          <p className="manage-inventory-warning">
            <FaExclamationTriangle /> Lưu ý: Lô hàng đã xóa không thể khôi phục
            lại.
          </p>
        </div>
        <div className="manage-inventory-modal-actions">
          <button
            className="manage-inventory-modal-disable-btn"
            onClick={() => onDelete(item.inventoryId)}
          >
            Xóa
          </button>
          <button
            className="manage-inventory-modal-close-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("createdDate");
  const [jumpToPage, setJumpToPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

  const isInventoryEditable = (createdDate) => {
    if (!createdDate) return true;

    const created = new Date(createdDate);
    const now = new Date();

    const diffMs = now - created;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours < 1;
  };
  const getToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      return null;
    }

    const decodedToken = jwtDecode(token);

    return token;
  };

  const fetchInventoryData = async (setInventory, token) => {
    try {
      const response = await fetch(`${apiUrl}/api/Inventory/get-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setInventory(data);

      return data;
    } catch (error) {
      setOperationError("Đã có lỗi xảy ra khi tải dữ liệu lô hàng.");
      return [];
    }
  };

  const fetchBranchesData = async (setBranches, token) => {
    try {
      const response = await fetch(`${apiUrl}/api/Branch/get-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setBranches(data);
      return data;
    } catch (error) {
      setOperationError("Đã có lỗi xảy ra khi tải dữ liệu chi nhánh.");
      return [];
    }
  };

  const validateImageFile = (file) => {
    if (!file || typeof file === "string") return true;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/webp",
    ];

    return allowedTypes.includes(file.type);
  };

  const addInventoryData = async (item, token) => {
    try {
      if (item.image && !validateImageFile(item.image)) {
        setOperationError(
          "Định dạng file ảnh không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, GIF, SVG, WEBP."
        );
        return { success: false, message: "Định dạng file ảnh không hợp lệ." };
      }

      const formData = new FormData();
      formData.append("inventoryName", item.inventoryName);
      formData.append("branchId", item.branchId);

      let status = "Inactive";
      if (item.status === "Hoạt động (Active)") {
        status = "Active";
      }

      formData.append("status", status);

      if (item.image instanceof File) {
        formData.append("ImageFile", item.image);
      }

      const response = await fetch(`${apiUrl}/api/Inventory/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const textResponse = await response.text();
        let responseData;

        try {
          if (textResponse && textResponse.trim() !== "") {
            responseData = JSON.parse(textResponse);
          } else {
            responseData = {};
          }
        } catch (parseError) {
          responseData = { message: textResponse };
        }

        await fetchInventory();

        setOperation({
          status: "success",
          message: "Thêm lô hàng thành công!",
        });

        return { success: true, data: responseData };
      } else {
        const errorText = await response.text();
        let errorMessage;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || "Thêm lô hàng thất bại.";
        } catch (parseError) {
          errorMessage =
            errorText || `Lỗi ${response.status}: ${response.statusText}`;
        }

        setOperationError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      setOperationError("Đã có lỗi xảy ra khi thêm lô hàng.");
      return { success: false, message: "Đã có lỗi xảy ra" };
    }
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

  const updateInventoryData = async (id, item, token) => {
    try {
      if (item.image && !validateImageFile(item.image)) {
        setOperationError(
          "Định dạng file ảnh không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG, GIF, SVG, WEBP."
        );
        return { success: false, message: "Định dạng file ảnh không hợp lệ." };
      }

      const formData = new FormData();
      formData.append("inventoryName", item.inventoryName);
      formData.append("branchId", item.branchId);

      let status = "Inactive";
      if (item.status === "Hoạt động (Active)") {
        status = "Active";
      }

      formData.append("status", status);

      if (item.image instanceof File) {
        formData.append("image", item.image);
      }

      const response = await fetch(
        `${apiUrl}/api/Inventory/update-inventory/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const textResponse = await response.text();

      if (response.ok) {
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          data = { message: textResponse };
        }

        await fetchInventory();
        setOperation({
          status: "success",
          message: "Cập nhật lô hàng thành công!",
        });
        return { success: true, data };
      } else {
        let errorData;
        try {
          errorData = JSON.parse(textResponse);
        } catch (parseError) {
          errorData = { message: textResponse };
        }

        setOperationError(errorData.message || "Cập nhật lô hàng thất bại.");
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      setOperationError("Đã có lỗi xảy ra khi cập nhật lô hàng.");
      return { success: false, message: error.message };
    }
  };

  const deleteInventoryData = async (id, token) => {
    try {
      const response = await fetch(`${apiUrl}/api/Inventory/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchInventory();
        setOperation({
          status: "success",
          message: "Lô hàng đã được xóa thành công.",
        });
        return { success: true };
      } else {
        const errorData = await response.json();
        setOperationError(errorData.message || "Xóa lô hàng thất bại.");
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      setOperationError("Đã có lỗi xảy ra khi xóa lô hàng.");
      return { success: false, message: error.message };
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchBranches();
  }, []);

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

  const fetchInventory = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      const data = await fetchInventoryData(setInventory, token);
      setTotalItems(data.length);
      setLoading(false);
    } catch (error) {
      setErrorMessage("Không thể tải dữ liệu lô hàng. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    const token = getToken();
    if (!token) return;

    try {
      await fetchBranchesData(setBranches, token);
    } catch (error) {
      setOperationError("Không thể tải dữ liệu chi nhánh.");
    }
  };

  const handleAddItem = (newItem) => {
    const token = getToken();
    if (!token) return;

    addInventoryData(newItem, token)
      .then((response) => {
        if (response.success) {
          setOperation({
            status: "success",
            message: "Thêm lô hàng thành công!",
          });
          setShowModal(false);
        } else {
          setOperationError(response.message || "Thêm lô hàng thất bại.");
        }
      })
      .catch((error) => {
        setOperationError("Thêm lô hàng thất bại!");
      });
  };

  const handleEditItem = (updatedItem) => {
    const token = getToken();
    if (!token) return;

    updateInventoryData(updatedItem.inventoryId, updatedItem, token)
      .then((response) => {
        if (response.success) {
          setOperation({
            status: "success",
            message: "Cập nhật lô hàng thành công!",
          });
          setShowModal(false);
        } else {
          setOperationError(response.message || "Cập nhật lô hàng thất bại.");
        }
      })
      .catch((error) => {
        setOperationError("Cập nhật lô hàng thất bại!");
      });
  };

  const handleDeleteItem = (itemId) => {
    const token = getToken();
    if (!token) return;

    deleteInventoryData(itemId, token)
      .then((response) => {
        if (response.success) {
          setOperation({
            status: "success",
            message: "Xóa lô hàng thành công!",
          });
          setShowDeleteModal(false);
        } else {
          setOperationError(response.message || "Xóa lô hàng thất bại.");
        }
      })
      .catch((error) => {
        setOperationError("Xóa lô hàng thất bại!");
      });
  };

  const handleSaveItem = (itemData) => {
    if (modalType === "add") {
      handleAddItem(itemData);
    } else {
      handleEditItem(itemData);
    }
  };

  const handleAddItemClick = () => {
    setModalType("add");
    setCurrentItem(null);
    setShowModal(true);
  };

  const handleEditItemClick = (item) => {
    const uiItem = { ...item };
    if (uiItem.status === "Active" || uiItem.status === true) {
      uiItem.status = "Hoạt động (Active)";
    } else {
      uiItem.status = "Tạm ngưng (Inactive)";
    }

    setModalType("edit");
    setCurrentItem(uiItem);
    setShowModal(true);
  };

  const handleDeleteItemClick = (item) => {
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

  const filteredData = inventory.filter((item) => {
    return (
      item.inventoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "inventoryName") {
      return sortOrder === "asc"
        ? a.inventoryName.localeCompare(b.inventoryName)
        : b.inventoryName.localeCompare(a.inventoryName);
    } else if (sortField === "branchName") {
      return sortOrder === "asc"
        ? a.branchName.localeCompare(b.branchName)
        : b.branchName.localeCompare(a.branchName);
    } else if (sortField === "status") {
      return sortOrder === "asc"
        ? a.status.toString().localeCompare(b.status.toString())
        : b.status.toString().localeCompare(a.status.toString());
    } else if (sortField === "createdDate") {
      const dateA = new Date(a.createdDate || 0);
      const dateB = new Date(b.createdDate || 0);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });
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
    <div className="manage-inventory-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-inventory">
          <h2>Quản Lý Lô Hàng</h2>

          {operation.status === "success" && (
            <div className="manage-inventory-success-message">
              {operation.message}
            </div>
          )}

          {operationError && (
            <div className="manage-inventory-error-message">
              {operationError}
            </div>
          )}

          <div className="manage-inventory-header">
            <div className="manage-inventory-search">
              <div className="manage-inventory-search-input-container">
                <FaSearch className="manage-inventory-search-icon" />
                <input
                  type="text"
                  className="manage-inventory-search-input"
                  placeholder="Tìm kiếm theo tên lô hàng, chi nhánh, trạng thái..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <FaTimes
                    className="manage-inventory-clear-search-icon"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
            </div>

            <button
              className="manage-inventory-add-btn"
              onClick={handleAddItemClick}
            >
              <FaPlus /> Thêm Lô Hàng
            </button>
          </div>

          <div className="manage-inventory-controls">
            <div className="manage-inventory-total">
              <FaWarehouse /> Tổng số lô hàng: {totalItems}
            </div>
            <div className="manage-inventory-sort-controls">
              <button
                className={`manage-inventory-sort-btn ${
                  sortField === "createdDate" ? "active" : ""
                }`}
                onClick={() => handleSort("createdDate")}
              >
                Sắp xếp theo ngày tạo{" "}
                {sortField === "createdDate" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-inventory-sort-btn ${
                  sortField === "inventoryName" ? "active" : ""
                }`}
                onClick={() => handleSort("inventoryName")}
              >
                Sắp xếp theo tên{" "}
                {sortField === "inventoryName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-inventory-sort-btn ${
                  sortField === "branchName" ? "active" : ""
                }`}
                onClick={() => handleSort("branchName")}
              >
                Sắp xếp theo chi nhánh{" "}
                {sortField === "branchName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-inventory-sort-btn ${
                  sortField === "status" ? "active" : ""
                }`}
                onClick={() => handleSort("status")}
              >
                Sắp xếp theo trạng thái{" "}
                {sortField === "status" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="manage-inventory-loading">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : errorMessage ? (
            <div className="manage-inventory-error-container">
              <p>{errorMessage}</p>
              <button
                className="manage-inventory-retry-btn"
                onClick={fetchInventory}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="manage-inventory-table-container">
                <table className="manage-inventory-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Ảnh</th>
                      <th>Tên Lô Hàng</th>
                      <th>Chi Nhánh</th>
                      <th>Ngày Tạo</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="manage-inventory-no-records">
                          Không tìm thấy lô hàng nào
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((item, index) => {
                        // Check if inventory is editable (less than 1 hour old)
                        const canEditDelete = isInventoryEditable(
                          item.createdDate
                        );

                        return (
                          <tr key={item.inventoryId}>
                            <td>{indexOfFirstRecord + index + 1}</td>
                            <td>
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.inventoryName}
                                  className="manage-inventory-image"
                                />
                              ) : (
                                <div className="manage-inventory-no-image">
                                  Không có ảnh
                                </div>
                              )}
                            </td>
                            <td className="manage-inventory-name-cell">
                              {item.inventoryName}
                            </td>
                            <td>{item.branchName}</td>
                            <td>{formatDate(item.createdDate)}</td>
                            <td>
                              <StatusBadge status={item.status} />
                            </td>
                            <td>
                              {canEditDelete ? (
                                <div className="manage-inventory-actions">
                                  <button
                                    className="manage-inventory-edit-btn"
                                    onClick={() => handleEditItemClick(item)}
                                    title="Chỉnh sửa"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    className="manage-inventory-delete-btn"
                                    onClick={() => handleDeleteItemClick(item)}
                                    title="Xóa"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className="manage-inventory-disabled-actions"
                                  title="Đã quá thời gian 1 giờ, không thể chỉnh sửa hoặc xóa"
                                >
                                  <FaLock />
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination section - No changes needed */}
              <div className="manage-inventory-pagination">
                <div className="manage-inventory-pagination-controls">
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="manage-inventory-pagination-btn"
                  >
                    <FaAngleDoubleLeft />
                  </button>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="manage-inventory-pagination-btn"
                  >
                    <FaArrowLeft />
                  </button>

                  {startPage > 1 && (
                    <span className="manage-inventory-ellipsis">...</span>
                  )}

                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`manage-inventory-pagination-btn ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  {endPage < totalPages && (
                    <span className="manage-inventory-ellipsis">...</span>
                  )}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="manage-inventory-pagination-btn"
                  >
                    <FaArrowRight />
                  </button>
                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className="manage-inventory-pagination-btn"
                  >
                    <FaAngleDoubleRight />
                  </button>
                </div>

                <div className="manage-inventory-jump-to-page">
                  <input
                    type="number"
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    placeholder="Trang"
                    className="manage-inventory-jump-input"
                  />
                  <button
                    onClick={handleJumpToPage}
                    className="manage-inventory-jump-btn"
                  >
                    Đi đến
                  </button>
                </div>

                <div className="manage-inventory-records-per-page">
                  <label htmlFor="recordsPerPage">Hiển thị:</label>
                  <select
                    id="recordsPerPage"
                    value={recordsPerPage}
                    onChange={handleRecordsPerPageChange}
                    className="manage-inventory-select"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>lô hàng mỗi trang</span>
                </div>
              </div>
            </>
          )}
          <Footer_Admin />
        </div>
      </div>

      {showModal && (
        <InventoryModal
          type={modalType}
          data={currentItem}
          branches={branches}
          onSave={handleSaveItem}
          onClose={() => setShowModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteInventoryModal
          item={currentItem}
          onDelete={handleDeleteItem}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default Manage_Inventory;
