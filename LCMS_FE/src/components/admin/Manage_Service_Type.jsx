import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_service_type.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaPlus,
  FaEdit,
  FaBan,
  FaSearch,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEllipsisH,
  FaFolder,
  FaCheck,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const apiUrl = import.meta.env.VITE_API_URL;
import TextEditor from "../reuse/TextEditor";

export const fetchServiceTypes = () => {
  return fetch(`${apiUrl}/api/ServiceType/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching service types:", error);
      throw new Error("Failed to fetch service types.");
    });
};

export const addServiceType = async (newServiceType) => {
  const allServiceTypes = await fetchServiceTypes();
  const isServiceTypeNameExist = allServiceTypes.some(
    (serviceType) =>
      serviceType.serviceTypeName.toLowerCase() ===
      newServiceType.serviceTypeName.toLowerCase()
  );

  if (isServiceTypeNameExist) {
    throw new Error("Tên loại dịch vụ đã tồn tại. Vui lòng chọn tên khác!");
  }

  const formData = new FormData();
  formData.append("ServiceTypeName", newServiceType.serviceTypeName);
  formData.append("Description", newServiceType.description);
  if (newServiceType.imageFile) {
    formData.append("Image", newServiceType.imageFile);
  }

  const response = await fetch(`${apiUrl}/api/ServiceType/Create`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Lỗi khi thêm loại dịch vụ");
  }

  return await fetchServiceTypes();
};

export const editServiceType = async (
  updatedServiceType,
  originalServiceType
) => {
  if (
    updatedServiceType.serviceTypeName !== originalServiceType.serviceTypeName
  ) {
    const allServiceTypes = await fetchServiceTypes();
    const nameExists = allServiceTypes.some(
      (serviceType) =>
        serviceType.serviceTypeName.toLowerCase() ===
          updatedServiceType.serviceTypeName.toLowerCase() &&
        serviceType.serviceTypeId !== updatedServiceType.serviceTypeId
    );

    if (nameExists) {
      throw new Error("Tên loại dịch vụ đã tồn tại. Vui lòng chọn tên khác!");
    }
  }

  const hasChanges =
    updatedServiceType.serviceTypeName !==
      originalServiceType.serviceTypeName ||
    updatedServiceType.description !== originalServiceType.description ||
    updatedServiceType.imageFile !== null;

  if (!hasChanges) {
    throw new Error("Không có thay đổi nào được thực hiện!");
  }

  const formData = new FormData();
  formData.append("ServiceTypeName", updatedServiceType.serviceTypeName);
  formData.append("Description", updatedServiceType.description);
  if (updatedServiceType.imageFile) {
    formData.append("Image", updatedServiceType.imageFile);
  }

  const response = await fetch(
    `${apiUrl}/api/ServiceType/update/${updatedServiceType.serviceTypeId}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Lỗi khi cập nhật loại dịch vụ");
  }

  return await fetchServiceTypes();
};

export const disableServiceType = async (id) => {
  const response = await fetch(`${apiUrl}/api/ServiceType/delete/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Lỗi khi vô hiệu hóa loại dịch vụ");
  }

  return await fetchServiceTypes();
};

const ServiceTypeModal = ({ type, data, onSave, onClose }) => {
  const [serviceTypeData, setServiceTypeData] = useState(data || {});
  const [originalData, setOriginalData] = useState(data || {});
  const [imagePreview, setImagePreview] = useState(data?.image || null);
  const [imageFile, setImageFile] = useState(null);
  const [nameError, setNameError] = useState("");
  const [formError, setFormError] = useState("");
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (data) {
      setOriginalData({
        serviceTypeId: data.serviceTypeId,
        serviceTypeName: data.serviceTypeName,
        description: data.description,
        image: data.image,
      });
    }
  }, [data]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setServiceTypeData((prev) => ({ ...prev, [name]: value }));

    if (name === "serviceTypeName") {
      if (value.trim() === "") {
        setNameError("");
      } else {
        try {
          const allServiceTypes = await fetchServiceTypes();
          const isDuplicate = allServiceTypes.some(
            (serviceType) =>
              serviceType.serviceTypeName.toLowerCase() ===
                value.toLowerCase() &&
              (!data || serviceType.serviceTypeId !== data.serviceTypeId)
          );

          if (isDuplicate) {
            setNameError(
              "Tên loại dịch vụ đã tồn tại. Vui lòng chọn tên khác!"
            );
          } else {
            setNameError("");
          }
        } catch (error) {
          console.error("Error checking name:", error);
        }
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setImageError(
        "Định dạng file không hợp lệ. Chỉ chấp nhận: JPG, JPEG, PNG, GIF, SVG, WEBP"
      );
      e.target.value = null;
      return;
    }

    setImageError("");

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!serviceTypeData.serviceTypeName || !serviceTypeData.description) {
      setFormError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (nameError || imageError) {
      return;
    }

    if (type === "edit") {
      const hasChanges =
        serviceTypeData.serviceTypeName !== originalData.serviceTypeName ||
        serviceTypeData.description !== originalData.description ||
        imageFile !== null;

      if (!hasChanges) {
        setFormError("Không có thay đổi nào được thực hiện!");
        return;
      }
    }

    onSave({ ...serviceTypeData, imageFile });
  };

  return (
    <div className="manage-service-type-modal show">
      <div className="manage-service-type-modal-content">
        <div className="manage-service-type-modal-header">
          <h3>{data ? "Cập Nhật Loại Dịch Vụ" : "Thêm Loại Dịch Vụ Mới"}</h3>
          <button
            className="manage-service-type-close-modal-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-service-type-modal-body">
          <div className="manage-service-type-form-group">
            <label>Tên Loại Dịch Vụ:</label>
            <input
              type="text"
              name="serviceTypeName"
              className="manage-service-type-input"
              placeholder="Tên Loại Dịch Vụ"
              value={serviceTypeData.serviceTypeName || ""}
              onChange={handleChange}
            />
            {nameError && (
              <div
                className="manage-service-type-error-message"
                style={{ color: "red" }}
              >
                {nameError}
              </div>
            )}
          </div>

          <div className="manage-service-type-form-group">
            <label>Mô Tả:</label>
            <TextEditor
              name="description"
              value={serviceTypeData.description || ""}
              funct={(value) =>
                setServiceTypeData((prev) => ({ ...prev, description: value }))
              }
            />
          </div>

          <div className="manage-service-type-form-group">
            <label>Hình Ảnh:</label>
            <input
              type="file"
              className="manage-service-type-input"
              accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
              onChange={handleImageChange}
            />
            {imageError && (
              <div
                className="manage-service-type-error-message"
                style={{
                  background: "#f8d7da",
                  color: "#721c24",
                  padding: "10px",
                  borderRadius: "4px",
                  marginTop: "5px",
                  marginBottom: "5px",
                  border: "1px solid #f5c6cb",
                }}
              >
                {imageError}
              </div>
            )}
            {imagePreview && (
              <div className="manage-service-type-image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
        </div>
        {formError && (
          <div
            className="manage-service-type-error-message"
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              border: "1px solid #f5c6cb",
            }}
          >
            {formError}
          </div>
        )}
        <div className="manage-service-type-modal-actions">
          <button
            className="manage-service-type-modal-save-btn"
            onClick={handleSubmit}
          >
            {data ? "Cập Nhật" : "Thêm Mới"}
          </button>
          <button
            className="manage-service-type-modal-close-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Disable ServiceType
const DisableServiceTypeModal = ({ serviceType, onDisable, onClose }) => {
  return (
    <div className="manage-service-type-modal show">
      <div className="manage-service-type-modal-content">
        <div className="manage-service-type-modal-header">
          <h3>Xác Nhận Vô Hiệu Hóa</h3>
          <button
            className="manage-service-type-close-modal-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-service-type-modal-body">
          <p>
            Bạn có chắc chắn muốn vô hiệu hóa loại dịch vụ{" "}
            <strong>{serviceType.serviceTypeName}</strong> không?
          </p>
          <p>Điều này sẽ ẩn loại dịch vụ khỏi hệ thống.</p>
        </div>
        <div className="manage-service-type-modal-actions">
          <button
            className="manage-service-type-modal-disable-btn"
            onClick={() => onDisable(serviceType.serviceTypeId)}
          >
            Vô Hiệu Hóa
          </button>
          <button
            className="manage-service-type-modal-close-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Service_Type = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentServiceType, setCurrentServiceType] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("status");
  const [jumpToPage, setJumpToPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalServiceTypes, setTotalServiceTypes] = useState(0);
  const [operationSuccess, setOperationSuccess] = useState("");
  const [operationError, setOperationError] = useState("");
  const [nameError, setNameError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "disabled"

  // Hàm cắt ngắn mô tả để hiển thị trên bảng
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    // Remove HTML tags for display
    const plainText = text.replace(/<[^>]*>/g, "");
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };
  useEffect(() => {
    if (operationSuccess || operationError) {
      const timer = setTimeout(() => {
        setOperationSuccess(null);
        setOperationError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operationSuccess, operationError]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const typesData = await fetchServiceTypes();
        setServiceTypes(typesData);
        setTotalServiceTypes(typesData.length);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Không thể tải dữ liệu. Vui lòng thử lại sau.");
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

  const checkDuplicateName = async (name) => {
    try {
      const allServiceTypes = await fetchServiceTypes();
      return allServiceTypes.some(
        (serviceType) =>
          serviceType.serviceTypeName.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error("Error checking duplicate name:", error);
      return false;
    }
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

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
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

  const handleAddServiceTypeClick = () => {
    setModalType("add");
    setCurrentServiceType(null);
    setShowModal(true);
  };

  const handleEditServiceTypeClick = (serviceType) => {
    setModalType("edit");
    setCurrentServiceType(serviceType);
    setShowModal(true);
  };

  const handleSaveServiceType = async (serviceTypeData) => {
    try {
      if (modalType === "add") {
        const updatedData = await addServiceType(serviceTypeData);
        setServiceTypes(updatedData);
        setTotalServiceTypes(updatedData.length);
        setOperationSuccess("Loại dịch vụ đã được thêm thành công!");
      } else {
        // Truyền dữ liệu gốc để so sánh
        const updatedData = await editServiceType(
          serviceTypeData,
          currentServiceType
        );
        setServiceTypes(updatedData);
        setTotalServiceTypes(updatedData.length);
        setOperationSuccess("Loại dịch vụ đã được cập nhật thành công!");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving service type:", error);
      setOperationError(error.message || "Có lỗi xảy ra!");
    }
  };

  const handleDisableServiceType = async (id) => {
    try {
      const updatedData = await disableServiceType(id);
      setServiceTypes(updatedData);
      setTotalServiceTypes(updatedData.length);
      setOperationSuccess("Loại dịch vụ đã được vô hiệu hóa thành công!");
      setShowDisableModal(false);
    } catch (error) {
      setOperationError(error.message || "Có lỗi xảy ra!");
    }
  };

  // Filter data by search term and status
  const filteredData = serviceTypes.filter((serviceType) => {
    // Filter by search term
    const matchesSearch =
      serviceType.serviceTypeName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      serviceType.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status
    if (statusFilter === "all") {
      return matchesSearch;
    } else if (statusFilter === "active") {
      return matchesSearch && serviceType.statusDelete !== false;
    } else if (statusFilter === "disabled") {
      return matchesSearch && serviceType.statusDelete === false;
    }

    return matchesSearch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "serviceTypeName") {
      return sortOrder === "asc"
        ? a.serviceTypeName.localeCompare(b.serviceTypeName)
        : b.serviceTypeName.localeCompare(a.serviceTypeName);
    } else if (sortField === "description") {
      return sortOrder === "asc"
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description);
    } else if (sortField === "status") {
      const statusA = a.statusDelete === false ? 0 : 1;
      const statusB = b.statusDelete === false ? 0 : 1;
      return sortOrder === "desc" ? statusA - statusB : statusB - statusA;
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
    <div className="manage-service-type-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-service-type">
          <h2>Quản Lý Loại Dịch Vụ</h2>
          {operationSuccess && (
            <div
              className="manage-service-alert success"
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
              className="manage-service-alert error"
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

          <div className="manage-service-type-header">
            <div className="manage-service-type-search">
              <FaSearch className="manage-service-type-search-icon" />
              <input
                type="text"
                className="manage-service-type-search-input"
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <FaTimes
                  className="manage-service-type-clear-search-icon"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </div>

          <div className="manage-service-type-controls">
            <div className="manage-service-type-total">
              <FaFolder /> Tổng số loại dịch vụ: {totalServiceTypes}
            </div>

            <div className="manage-service-type-filter-controls">
              <button
                className={`manage-service-type-filter-btn ${
                  statusFilter === "all" ? "active" : ""
                }`}
                onClick={() => handleStatusFilter("all")}
              >
                Tất cả
              </button>
              <button
                className={`manage-service-type-filter-btn ${
                  statusFilter === "active" ? "active" : ""
                }`}
                onClick={() => handleStatusFilter("active")}
              >
                <FaToggleOn /> Hoạt động
              </button>
              <button
                className={`manage-service-type-filter-btn ${
                  statusFilter === "disabled" ? "active" : ""
                }`}
                onClick={() => handleStatusFilter("disabled")}
              >
                <FaToggleOff /> Vô hiệu
              </button>
            </div>

            <div className="manage-service-type-sort-controls">
              <button
                className={`manage-service-type-sort-btn ${
                  sortField === "serviceTypeName" ? "active" : ""
                }`}
                onClick={() => handleSort("serviceTypeName")}
              >
                Sắp xếp theo tên{" "}
                {sortField === "serviceTypeName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-service-type-sort-btn ${
                  sortField === "description" ? "active" : ""
                }`}
                onClick={() => handleSort("description")}
              >
                Sắp xếp theo mô tả{" "}
                {sortField === "description" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-service-type-sort-btn ${
                  sortField === "status" ? "active" : ""
                }`}
                onClick={() => handleSort("status")}
              >
                Sắp xếp theo trạng thái{" "}
                {sortField === "status" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
            </div>

            <button
              className="manage-service-type-add-btn"
              onClick={handleAddServiceTypeClick}
            >
              <FaPlus /> Thêm Loại Dịch Vụ
            </button>
          </div>

          {loading ? (
            <div className="manage-service-type-loading-container">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : errorMessage ? (
            <div className="manage-service-type-error-container">
              <p>{errorMessage}</p>
              <button
                className="manage-service-type-reload-btn"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="manage-service-type-table-container">
                <table className="manage-service-type-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Loại Dịch Vụ</th>
                      <th>Mô Tả</th>
                      <th>Hình Ảnh</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="manage-service-type-no-data">
                          {searchTerm
                            ? "Không tìm thấy loại dịch vụ nào phù hợp với tìm kiếm"
                            : "Không có loại dịch vụ nào."}
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((serviceType, index) => (
                        <tr
                          key={serviceType.serviceTypeId}
                          className={
                            serviceType.statusDelete === false
                              ? "manage-service-type-disabled-row"
                              : ""
                          }
                        >
                          <td>{indexOfFirstRecord + index + 1}</td>
                          <td>{serviceType.serviceTypeName}</td>
                          <td
                            title={
                              serviceType.description
                                ? serviceType.description.replace(
                                    /<[^>]*>/g,
                                    ""
                                  )
                                : ""
                            }
                          >
                            {truncateText(
                              serviceType.description.replace(/<[^>]*>/g, "")
                            )}
                          </td>

                          <td>
                            {serviceType.image ? (
                              <img
                                src={serviceType.image}
                                alt={serviceType.serviceTypeName}
                                className="manage-service-type-thumbnail"
                              />
                            ) : (
                              "Không có ảnh"
                            )}
                          </td>
                          <td>
                            <span
                              className={`manage-service-type-status ${
                                serviceType.statusDelete === false
                                  ? "disabled"
                                  : "active"
                              }`}
                            >
                              {serviceType.statusDelete === false ? (
                                <>
                                  <FaBan className="manage-service-type-status-icon" />{" "}
                                  Vô hiệu
                                </>
                              ) : (
                                <>
                                  <FaCheck className="manage-service-type-status-icon" />{" "}
                                  Hoạt động
                                </>
                              )}
                            </span>
                          </td>
                          <td>
                            <div className="manage-service-type-actions">
                              {serviceType.statusDelete !== false ? (
                                <>
                                  <button
                                    className="manage-service-type-edit-btn"
                                    onClick={() =>
                                      handleEditServiceTypeClick(serviceType)
                                    }
                                    title="Chỉnh sửa"
                                  >
                                    <FaEdit /> Sửa
                                  </button>
                                  <button
                                    className="manage-service-type-disable-btn"
                                    onClick={() => {
                                      setCurrentServiceType(serviceType);
                                      setShowDisableModal(true);
                                    }}
                                    title="Vô hiệu hóa"
                                  >
                                    <FaBan /> Vô hiệu
                                  </button>
                                </>
                              ) : (
                                <span className="manage-service-type-disabled-action">
                                  Đã vô hiệu hóa
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredData.length > 0 && (
                <div className="manage-service-type-pagination-controls">
                  <div className="manage-service-type-pagination-info">
                    <span>
                      Hiển thị {indexOfFirstRecord + 1} -{" "}
                      {Math.min(indexOfLastRecord, filteredData.length)} của{" "}
                      {filteredData.length} loại dịch vụ
                    </span>
                    <div className="manage-service-type-records-per-page">
                      <label htmlFor="recordsPerPage">Hiển thị:</label>
                      <select
                        id="recordsPerPage"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                        className="manage-service-type-select"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                      </select>
                    </div>
                  </div>

                  <div className="manage-service-type-pagination">
                    <button
                      className="manage-service-type-pagination-btn"
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                      title="Trang đầu"
                    >
                      <FaAngleDoubleLeft />
                    </button>
                    <button
                      className="manage-service-type-pagination-btn"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      <FaArrowLeft />
                    </button>

                    <div className="manage-service-type-pagination-numbers">
                      {startPage > 1 && (
                        <>
                          <button
                            onClick={() => paginate(1)}
                            className="manage-service-type-pagination-number"
                          >
                            1
                          </button>
                          {startPage > 2 && (
                            <span className="manage-service-type-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                        </>
                      )}

                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`manage-service-type-pagination-number ${
                            currentPage === number ? "active" : ""
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && (
                            <span className="manage-service-type-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                          <button
                            onClick={() => paginate(totalPages)}
                            className="manage-service-type-pagination-number"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      className="manage-service-type-pagination-btn"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      title="Trang sau"
                    >
                      <FaArrowRight />
                    </button>
                    <button
                      className="manage-service-type-pagination-btn"
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Trang cuối"
                    >
                      <FaAngleDoubleRight />
                    </button>

                    <div className="manage-service-type-jump-to-page">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={jumpToPage}
                        onChange={(e) => setJumpToPage(e.target.value)}
                        className="manage-service-type-jump-input"
                        placeholder="Trang"
                      />
                      <button
                        onClick={handleJumpToPage}
                        className="manage-service-type-jump-btn"
                        disabled={!jumpToPage}
                      >
                        Đi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <Footer_Admin />
      </div>

      {showModal && (
        <ServiceTypeModal
          type={modalType}
          data={currentServiceType}
          onSave={handleSaveServiceType}
          onClose={() => setShowModal(false)}
        />
      )}

      {showDisableModal && (
        <DisableServiceTypeModal
          serviceType={currentServiceType}
          onDisable={handleDisableServiceType}
          onClose={() => setShowDisableModal(false)}
        />
      )}
    </div>
  );
};

export default Manage_Service_Type;
