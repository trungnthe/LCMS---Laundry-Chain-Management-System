import React, { useState, useEffect, useRef } from "react";
import "../../assets/css/admin/manage_service.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaPlus,
  FaEdit,
  FaSearch,
  FaTimes,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEllipsisH,
  FaStore,
  FaLock,
  FaLockOpen,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
} from "react-icons/fa";
import TextEditor from "../reuse/TextEditor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// API URL from environment variable
const apiUrl = import.meta.env.VITE_API_URL;

// ========================================

// Fetch Service Types
const fetchServiceTypes = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/ServiceType/get-all`);
    if (!response.ok) throw new Error("Không thể lấy loại dịch vụ!");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching service types:", error);
    throw error;
  }
};

const checkServiceNameExists = async (
  serviceName,
  serviceTypeId,
  serviceId = null
) => {
  try {
    const services = await fetchServices();
    return services.some(
      (service) =>
        service.serviceName.toLowerCase() === serviceName.toLowerCase() &&
        service.serviceTypeId.toString() === serviceTypeId.toString() &&
        (!serviceId || service.serviceId !== serviceId)
    );
  } catch (error) {
    console.error("Lỗi khi kiểm tra tên dịch vụ:", error);
    throw error;
  }
};

// Fetch service by ID
const fetchServiceById = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/Service/getbyId/${id}`);
    if (!response.ok) throw new Error("Không thể tải thông tin dịch vụ.");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi tải dịch vụ: " + error.message);
    throw error;
  }
};

const fetchServiceTypeById = async (id) => {
  try {
    const response = await fetch(
      `${apiUrl}/api/ServiceType/getServiceById/${id}`
    );
    if (!response.ok) throw new Error("Không thể tải thông tin dịch vụ.");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching service type:", error);
    throw error;
  }
};

const fetchServicesByServiceType = async (serviceTypeId) => {
  try {
    const response = await fetch(
      `${apiUrl}/api/Service/byServiceType/${serviceTypeId}`
    );

    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Không thể tải danh sách dịch vụ.");

    return await response.json();
  } catch (error) {
    console.error("Error fetching services by type:", error);
    return null;
  }
};

// Fetch Services
const fetchServices = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/Service/get-all`);
    if (!response.ok) throw new Error("Không thể lấy dịch vụ!");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

// Add Service
const addService = async (newService) => {
  try {
    const nameExists = await checkServiceNameExists(
      newService.serviceName,
      newService.serviceTypeId
    );

    if (nameExists) {
      return { success: false, duplicate: true };
    }

    const formData = new FormData();
    formData.append("serviceName", newService.serviceName);
    formData.append("description", newService.description);
    formData.append("price", newService.price);
    formData.append("serviceTypeId", newService.serviceTypeId);
    formData.append("estimatedTime", newService.estimatedTime);
    formData.append("image", newService.image);

    const response = await fetch(`${apiUrl}/api/Service/Create`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Lỗi khi thêm dịch vụ!");

    if (response.status === 204 || !response.bodyUsed) return { success: true };
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Edit Service
// Edit Service
const editService = async (updatedService) => {
  try {
    const nameExists = await checkServiceNameExists(
      updatedService.serviceName,
      updatedService.serviceTypeId,
      updatedService.serviceId
    );

    if (nameExists) {
      return { success: false, duplicate: true };
    }

    const formData = new FormData();
    formData.append("ServiceId", updatedService.serviceId);
    formData.append("ServiceName", updatedService.serviceName);
    formData.append("Price", updatedService.price);
    formData.append("Description", updatedService.description);
    formData.append("ServiceTypeId", updatedService.serviceTypeId);
    formData.append("EstimatedTime", updatedService.estimatedTime);

    if (updatedService.image instanceof File) {
      formData.append("Image", updatedService.image);
    }

    const response = await fetch(
      `${apiUrl}/api/Service/update/${updatedService.serviceId}`,
      { method: "PUT", body: formData }
    );

    if (!response.ok) throw new Error("Lỗi khi cập nhật dịch vụ!");

    if (response.status === 204 || !response.bodyUsed) return { success: true };
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Deactivate Service (using the same delete API endpoint)
const deactivateService = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/Service/delete/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Lỗi khi vô hiệu hóa dịch vụ!");
    return true;
  } catch (error) {
    throw error;
  }
};

// Modal Components
// ========================================

const ServiceModal = ({ type, data, onSave, onClose, serviceTypes }) => {
  const [serviceData, setServiceData] = useState(
    data ? { ...data, originalImage: data.image } : {}
  );
  const [nameError, setNameError] = useState("");
  const [showNameError, setShowNameError] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fileError, setFileError] = useState("");
  const [imagePreview, setImagePreview] = useState(data?.image || null);
  const [hasChanges, setHasChanges] = useState(false);
  const originalData = useRef(data ? { ...data } : null);

  useEffect(() => {
    if (data) {
      const hasDataChanged = () => {
        const fieldsToCompare = [
          "serviceName",
          "price",
          "serviceTypeId",
          "description",
          "estimatedTime",
        ];

        return (
          fieldsToCompare.some((field) => {
            return serviceData[field] !== originalData.current[field];
          }) || serviceData.image instanceof File
        );
      };

      setHasChanges(hasDataChanged());
    } else {
      setHasChanges(true);
    }
  }, [serviceData, data]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setServiceData((prev) => ({ ...prev, [name]: value }));
    if (name === "serviceName" && value.trim() && serviceData.serviceTypeId) {
      try {
        const exists = await checkServiceNameExists(
          value,
          serviceData.serviceTypeId,
          serviceData.serviceId || null
        );

        if (exists) {
          setNameError(
            "Tên dịch vụ đã tồn tại trong loại dịch vụ này. Vui lòng chọn tên khác!"
          );
          setShowNameError(true);
        } else {
          setNameError("");
          setShowNameError(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra tên dịch vụ:", error);
      }
    }
    if (
      name === "serviceTypeId" &&
      serviceData.serviceName &&
      serviceData.serviceName.trim()
    ) {
      try {
        const exists = await checkServiceNameExists(
          serviceData.serviceName,
          value,
          serviceData.serviceId || null
        );

        if (exists) {
          setNameError(
            "Tên dịch vụ đã tồn tại trong loại dịch vụ này. Vui lòng chọn tên khác!"
          );
          setShowNameError(true);
        } else {
          setNameError("");
          setShowNameError(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra tên dịch vụ:", error);
      }
    }
  };

  const handleEditorChange = (content) => {
    setServiceData((prev) => ({ ...prev, description: content }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validFileTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "image/webp",
      ];

      if (!validFileTypes.includes(file.type)) {
        setFileError(
          "Chỉ chấp nhận file ảnh có định dạng: JPG, JPEG, PNG, GIF, SVG, WEBP"
        );
        return;
      }

      setFileError("");
      setServiceData((prev) => ({
        ...prev,
        image: file,
      }));

      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    setFormError(null);
    if (data && !hasChanges) {
      setFormError("Chưa có sự thay đổi nào.");
      return;
    }
    if (!data) {
      if (
        !serviceData.serviceName ||
        !serviceData.price ||
        !serviceData.serviceTypeId ||
        !serviceData.description ||
        !serviceData.image ||
        !serviceData.estimatedTime
      ) {
        setFormError("Vui lòng điền đầy đủ thông tin!");
        return;
      }
    } else {
      if (
        !serviceData.serviceName ||
        !serviceData.price ||
        !serviceData.serviceTypeId ||
        !serviceData.description ||
        !serviceData.estimatedTime
      ) {
        setFormError("Vui lòng điền đầy đủ thông tin!");
        return;
      }
    }

    if (nameError) {
      setShowNameError(true);
      return;
    }

    if (fileError) {
      return;
    }
    const serviceDataToSave = { ...serviceData };
    if (data && !(serviceData.image instanceof File)) {
      serviceDataToSave.image = data.image; // Keep reference to original
    }

    onSave(serviceDataToSave);
  };

  return (
    <div className="manage-service-modal show">
      <div className="manage-service-modal-content">
        <div className="manage-service-modal-header">
          <h3>{data ? "Cập Nhật Dịch Vụ" : "Thêm Dịch Vụ Mới"}</h3>
          <button className="manage-service-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-service-modal-body">
          <div className="manage-service-form-group">
            <label>Loại Dịch Vụ:</label>
            <select
              name="serviceTypeId"
              className="manage-service-input"
              value={serviceData.serviceTypeId || ""}
              onChange={handleChange}
            >
              <option value="">Chọn Loại Dịch Vụ</option>
              {serviceTypes.map((serviceType) => (
                <option
                  key={serviceType.serviceTypeId}
                  value={serviceType.serviceTypeId}
                >
                  {serviceType.serviceTypeName}
                </option>
              ))}
            </select>
          </div>

          <div className="manage-service-form-group">
            <label>Tên Dịch Vụ:</label>
            <input
              type="text"
              name="serviceName"
              className="manage-service-input"
              placeholder="Tên Dịch Vụ"
              value={serviceData.serviceName || ""}
              onChange={handleChange}
            />
            {showNameError && (
              <div
                className="manage-service-error-message"
                style={{
                  background: "#f8d7da",
                  color: "#721c24",
                  padding: "10px",
                  borderRadius: "4px",
                  marginTop: "5px",
                  border: "1px solid #f5c6cb",
                }}
              >
                {nameError}
              </div>
            )}
          </div>

          <div className="manage-service-form-group">
            <label>Mô Tả:</label>
            <TextEditor
              value={serviceData.description || ""}
              funct={handleEditorChange}
            />
          </div>

          <div className="manage-service-form-group">
            <label>Giá:</label>
            <input
              type="number"
              name="price"
              className="manage-service-input"
              placeholder="Giá"
              value={serviceData.price || ""}
              onChange={handleChange}
            />
          </div>

          <div className="manage-service-form-group">
            <label>Hình Ảnh:</label>
            <input
              type="file"
              className="manage-service-input"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
              onChange={handleImageChange}
            />
            {fileError && (
              <div
                className="manage-service-file-error"
                style={{
                  background: "#f8d7da",
                  color: "#721c24",
                  padding: "10px",
                  borderRadius: "4px",
                  marginTop: "5px",
                  border: "1px solid #f5c6cb",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FaExclamationTriangle /> {fileError}
              </div>
            )}
            {/* Image Preview */}
            {imagePreview && (
              <div
                className="manage-service-image-preview"
                style={{
                  marginTop: "10px",
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "4px",
                  }}
                />
              </div>
            )}
            {data && (
              <div
                className="manage-service-image-note"
                style={{
                  marginTop: "5px",
                  fontSize: "0.85em",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                {data.image && !serviceData.image instanceof File
                  ? "Không tải lên ảnh mới sẽ giữ nguyên ảnh hiện tại."
                  : "Đã chọn ảnh mới để thay thế."}
              </div>
            )}
          </div>

          <div className="manage-service-form-group">
            <label>Thời Gian Ước Tính:</label>
            <input
              type="text"
              name="estimatedTime"
              className="manage-service-input"
              placeholder="Thời Gian Ước Tính"
              value={serviceData.estimatedTime || ""}
              onChange={handleChange}
            />
          </div>
          {formError && (
            <div
              className="manage-service-error-message"
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
        </div>
        <div className="manage-service-modal-actions">
          <button
            className="manage-service-modal-save-btn"
            onClick={handleSubmit}
          >
            {data ? "Cập Nhật" : "Thêm Mới"}
          </button>
          <button className="manage-service-modal-close-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Deactivate Service
const DeactivateServiceModal = ({ service, onDeactivate, onClose }) => {
  return (
    <div className="manage-service-modal show">
      <div className="manage-service-modal-content small">
        <div className="manage-service-modal-header">
          <h3>Xác Nhận Vô Hiệu Hóa</h3>
          <button className="manage-service-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-service-modal-body">
          <p>
            Bạn có chắc chắn muốn vô hiệu hóa dịch vụ{" "}
            <strong>{service.serviceName}</strong> không?
          </p>
          <p>Dịch vụ sẽ không còn được sử dụng nữa sau khi vô hiệu hóa.</p>
        </div>
        <div className="manage-service-modal-actions">
          <button
            className="manage-service-modal-delete-btn"
            onClick={() => onDeactivate(service.serviceId)}
          >
            Vô Hiệu Hóa
          </button>
          <button className="manage-service-modal-close-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
// ========================================

const Manage_Service = () => {
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("serviceName");
  const [jumpToPage, setJumpToPage] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalServices, setTotalServices] = useState(0);
  const [operationError, setOperationError] = useState(null);
  const [operationSuccess, setOperationSuccess] = useState(null);

  // Initialize data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const typesData = await fetchServiceTypes();
        const servicesData = await fetchServices();

        setServiceTypes(typesData);
        setServices(servicesData);
        setTotalServices(servicesData.length);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    setSortField("status");
    setSortOrder("asc");
  }, []);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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

  const handleAddService = async (newService) => {
    try {
      const result = await addService(newService);

      if (result.success) {
        setShowModal(false);

        setOperationSuccess("Dịch vụ đã được thêm thành công!");

        const data = await fetchServices();
        setServices(data);
        setTotalServices(data.length);
      } else if (result.duplicate) {
        setCurrentService({ ...newService });
        setOperationError(
          "Tên dịch vụ đã tồn tại trong loại dịch vụ này. Vui lòng chọn tên khác!"
        );
      } else {
        setOperationError(
          `Thêm dịch vụ thất bại: ${result.error || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      setOperationError(
        `Thêm dịch vụ thất bại: ${error.message || "Lỗi không xác định"}`
      );
    }
  };

  const handleEditService = async (updatedService) => {
    try {
      const result = await editService(updatedService);

      if (result.success) {
        setShowModal(false);
        setOperationSuccess("Dịch vụ đã được cập nhật thành công!");

        const data = await fetchServices();
        setServices(data);
        setTotalServices(data.length);
      } else if (result.duplicate) {
        setCurrentService({ ...updatedService });
        setOperationError(
          "Tên dịch vụ đã tồn tại trong loại dịch vụ này. Vui lòng chọn tên khác!"
        );
      } else {
        setOperationError(
          `Cập nhật dịch vụ thất bại: ${result.error || "Lỗi không xác định"}`
        );
      }
    } catch (error) {
      setOperationError(
        `Cập nhật dịch vụ thất bại: ${error.message || "Lỗi không xác định"}`
      );
    }
  };

  // Deactivate Service (Using the delete API)
  const handleDeactivateService = async (id) => {
    try {
      const success = await deactivateService(id);

      if (success) {
        setShowDeactivateModal(false);

        setOperationSuccess("Dịch vụ đã được vô hiệu hóa thành công!");

        const data = await fetchServices();
        setServices(data);
        setTotalServices(data.length);
      }
    } catch (error) {
      setOperationError(
        `Vô hiệu hóa dịch vụ thất bại: ${error.message || "Lỗi không xác định"}`
      );
    }
  };

  const handleAddServiceClick = () => {
    setCurrentService(null);
    setShowModal(true);
  };

  const handleEditServiceClick = (service) => {
    setCurrentService(service);
    setShowModal(true);
  };

  const handleSaveService = (serviceData) => {
    if (serviceData.serviceId) {
      handleEditService(serviceData);
    } else {
      handleAddService(serviceData);
    }
  };

  // SỬA Ở ĐÂY: Thay đổi logic kiểm tra trạng thái dịch vụ
  const getServiceStatus = (service) => {
    // Đối với bạn, false là vô hiệu hóa, true hoặc null là đang hoạt động
    return service.statusDelete !== false;
  };

  // Filter data by search term, type and status
  const filteredData = services.filter((service) => {
    const matchesSearch =
      service.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.serviceTypeName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "all" || service.serviceTypeId?.toString() === typeFilter;

    // SỬA Ở ĐÂY: Thay đổi logic lọc theo trạng thái
    const isActive = service.statusDelete !== false; // Trạng thái hoạt động

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && service.statusDelete === false);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (a.statusDelete === false && b.statusDelete !== false) return 1;
    if (a.statusDelete !== false && b.statusDelete === false) return -1;

    if (sortField === "serviceName") {
      return sortOrder === "asc"
        ? a.serviceName.localeCompare(b.serviceName)
        : b.serviceName.localeCompare(a.serviceName);
    } else if (sortField === "price") {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    } else if (sortField === "serviceTypeName") {
      return sortOrder === "asc"
        ? a.serviceTypeName.localeCompare(b.serviceTypeName)
        : b.serviceTypeName.localeCompare(a.serviceTypeName);
    } else if (sortField === "status") {
      // For explicit status sorting - use the normal logic
      const aStatus = a.statusDelete === false; // true if inactive
      const bStatus = b.statusDelete === false; // true if inactive
      return sortOrder === "asc" ? aStatus - bStatus : bStatus - aStatus;
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

  return (
    <div className="manage-service-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-service">
          <h2>Quản Lý Dịch Vụ</h2>

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

          <div className="manage-service-header">
            <div className="manage-service-search">
              <FaSearch className="manage-service-search-icon" />
              <input
                type="text"
                className="manage-service-search-input"
                placeholder="Tìm kiếm theo tên dịch vụ hoặc loại dịch vụ..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <FaTimes
                  className="manage-service-clear-search-icon"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            <div className="manage-service-filter">
              <FaFilter className="manage-service-filter-icon" />
              <select
                className="manage-service-filter-select"
                value={typeFilter}
                onChange={handleTypeFilterChange}
              >
                <option value="all">Tất cả loại dịch vụ</option>
                {serviceTypes.map((type) => (
                  <option key={type.serviceTypeId} value={type.serviceTypeId}>
                    {type.serviceTypeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="manage-service-filter">
              <FaToggleOn className="manage-service-filter-icon" />
              <select
                className="manage-service-filter-select"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã vô hiệu</option>
              </select>
            </div>
          </div>

          <div className="manage-service-controls">
            <div className="manage-service-total-services">
              <FaStore /> Tổng số dịch vụ: {totalServices}
            </div>

            <div className="manage-service-sort-controls">
              <button
                className={`manage-service-sort-btn ${
                  sortField === "serviceTypeName" ? "active" : ""
                }`}
                onClick={() => handleSort("serviceTypeName")}
              >
                Sắp xếp theo loại{" "}
                {sortField === "serviceTypeName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-service-sort-btn ${
                  sortField === "serviceName" ? "active" : ""
                }`}
                onClick={() => handleSort("serviceName")}
              >
                Sắp xếp theo tên{" "}
                {sortField === "serviceName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-service-sort-btn ${
                  sortField === "price" ? "active" : ""
                }`}
                onClick={() => handleSort("price")}
              >
                Sắp xếp theo giá{" "}
                {sortField === "price" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-service-sort-btn ${
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
              className="manage-service-add-btn"
              onClick={handleAddServiceClick}
            >
              <FaPlus /> Thêm Dịch Vụ
            </button>
          </div>

          {loading ? (
            <div className="manage-service-loading">Đang tải dữ liệu...</div>
          ) : errorMessage ? (
            <div className="manage-service-error">{errorMessage}</div>
          ) : (
            <>
              <div className="manage-service-table-container">
                <table className="manage-service-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Hình Ảnh</th>
                      <th>Tên Dịch Vụ</th>
                      <th>Loại Dịch Vụ</th>
                      <th>Giá</th>
                      <th>Thời Gian Ước Tính</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center" }}>
                          Không tìm thấy dịch vụ nào
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((service, index) => (
                        <tr key={service.serviceId}>
                          <td>{indexOfFirstRecord + index + 1}</td>
                          <td>
                            <img
                              src={service.image}
                              alt={service.serviceName}
                              className="manage-service-table-image"
                            />
                          </td>
                          <td>{service.serviceName}</td>
                          <td>{service.serviceTypeName}</td>
                          <td>
                            {service.price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </td>
                          <td>{service.estimatedTime}</td>
                          <td>
                            <span
                              className={`manage-service-status ${
                                getServiceStatus(service)
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              {getServiceStatus(service) ? (
                                <>
                                  <FaToggleOn /> Hoạt động
                                </>
                              ) : (
                                <>
                                  <FaToggleOff /> Vô hiệu
                                </>
                              )}
                            </span>
                          </td>
                          <td>
                            <div className="manage-service-actions">
                              <button
                                className="manage-service-edit-btn"
                                onClick={() => handleEditServiceClick(service)}
                                disabled={!getServiceStatus(service)}
                              >
                                <FaEdit />
                              </button>
                              {getServiceStatus(service) && (
                                <button
                                  className="manage-service-deactivate-btn"
                                  onClick={() => {
                                    setCurrentService(service);
                                    setShowDeactivateModal(true);
                                  }}
                                >
                                  <FaLock />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="manage-service-pagination-controls">
                <div className="manage-service-pagination-info">
                  <span>
                    Hiển thị {indexOfFirstRecord + 1} -{" "}
                    {Math.min(indexOfLastRecord, filteredData.length)} của{" "}
                    {filteredData.length} dịch vụ
                  </span>
                  <div className="manage-service-records-per-page">
                    <label htmlFor="recordsPerPage">Hiển thị:</label>
                    <select
                      id="recordsPerPage"
                      value={recordsPerPage}
                      onChange={handleRecordsPerPageChange}
                      className="manage-service-select"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                    </select>
                  </div>
                </div>

                <div className="manage-service-pagination">
                  <button
                    className="manage-service-pagination-btn"
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    title="Trang đầu"
                  >
                    <FaAngleDoubleLeft />
                  </button>
                  <button
                    className="manage-service-pagination-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Trang trước"
                  >
                    <FaArrowLeft />
                  </button>

                  <div className="manage-service-pagination-numbers">
                    {startPage > 1 && (
                      <>
                        <button
                          onClick={() => paginate(1)}
                          className="manage-service-pagination-number"
                        >
                          1
                        </button>
                        {startPage > 2 && (
                          <span className="manage-service-pagination-ellipsis">
                            <FaEllipsisH />
                          </span>
                        )}
                      </>
                    )}

                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`manage-service-pagination-number ${
                          currentPage === number ? "active" : ""
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    {endPage < totalPages && (
                      <>
                        {endPage < totalPages - 1 && (
                          <span className="manage-service-pagination-ellipsis">
                            <FaEllipsisH />
                          </span>
                        )}
                        <button
                          onClick={() => paginate(totalPages)}
                          className="manage-service-pagination-number"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    className="manage-service-pagination-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Trang sau"
                  >
                    <FaArrowRight />
                  </button>
                  <button
                    className="manage-service-pagination-btn"
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Trang cuối"
                  >
                    <FaAngleDoubleRight />
                  </button>
                </div>

                <div className="manage-service-jump-to-page">
                  <span>Đến trang:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleJumpToPage()}
                    className="manage-service-jump-input"
                  />
                  <button
                    onClick={handleJumpToPage}
                    className="manage-service-jump-btn"
                  >
                    Đi
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <Footer_Admin />
      </div>

      {showModal && (
        <ServiceModal
          type={currentService ? "edit" : "add"}
          data={currentService}
          onSave={handleSaveService}
          onClose={() => setShowModal(false)}
          serviceTypes={serviceTypes}
        />
      )}

      {showDeactivateModal && (
        <DeactivateServiceModal
          service={currentService}
          onDeactivate={handleDeactivateService}
          onClose={() => setShowDeactivateModal(false)}
        />
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default Manage_Service;
