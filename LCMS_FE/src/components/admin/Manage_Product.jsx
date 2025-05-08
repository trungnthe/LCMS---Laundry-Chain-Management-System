import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_product.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaPlus,
  FaEdit,
  FaTrash,
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
  FaCheck,
  FaPowerOff,
  FaToggleOn,
  FaToggleOff,
  FaLock,
  FaExclamationTriangle,
  FaRegTimesCircle,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_API_URL;

export const fetchProducts = () => {
  return fetch(`${apiUrl}/api/Product/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      throw new Error("Không thể tải sản phẩm.");
    });
};

export const fetchServiceTypes = () => {
  return fetch(`${apiUrl}/api/Service/get-all`)
    .then((response) => response.json())
    .then((data) => {
      // Filter only active services (statusDelete !== false)
      return data.filter((service) => service.statusDelete !== false);
    })
    .catch((error) => {
      console.error("Lỗi khi tải danh sách dịch vụ:", error);
      throw new Error("Không thể tải dịch vụ.");
    });
};

export const fetchCategories = () => {
  return fetch(`${apiUrl}/api/ProductCategory/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Lỗi khi tải danh mục sản phẩm:", error);
      throw new Error("Không thể tải danh mục.");
    });
};

export const addProduct = (productData) => {
  const formData = new FormData();
  formData.append("productName", productData.productName);
  formData.append("price", productData.price);
  formData.append("productCategoryId", productData.productCategoryId);

  if (productData.serviceList) {
    formData.append("serviceList", productData.serviceList);
  }

  if (productData.image) {
    formData.append("image", productData.image);
  }

  return fetch(`${apiUrl}/api/Product/create`, {
    method: "POST",
    body: formData,
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Không thể thêm sản phẩm.");
    }
    return response.json();
  });
};

// Edit product with image and service list
export const editProduct = (updatedProductData) => {
  const formData = new FormData();
  formData.append("productName", updatedProductData.productName);
  formData.append("price", updatedProductData.price);
  formData.append("productCategoryId", updatedProductData.productCategoryId);

  if (updatedProductData.serviceList) {
    formData.append("serviceList", updatedProductData.serviceList);
  }

  if (updatedProductData.image) {
    formData.append("image", updatedProductData.image);
  } else if (updatedProductData.existingImageUrl) {
    formData.append("keepExistingImage", "true");
    formData.append("existingImageUrl", updatedProductData.existingImageUrl);
  }

  return fetch(`${apiUrl}/api/Product/update/${updatedProductData.productId}`, {
    method: "PUT",
    body: formData,
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Không thể cập nhật sản phẩm.");
    }
    return response;
  });
};

// Deactivate product (using delete API)
export const deactivateProduct = (productId) => {
  return fetch(`${apiUrl}/api/Product/delete/${productId}`, {
    method: "DELETE",
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Không thể vô hiệu hóa sản phẩm.");
    }
    return response;
  });
};

// Modal for Add/Edit Product with ServiceList support
const ProductModal = ({
  type,
  data,
  categories,
  services,
  products,
  onSave,
  onClose,
}) => {
  const [productData, setProductData] = useState(
    data || {
      productName: "",
      price: "",
      productCategoryId: "",
      image: null,
      imageUrl: "", // Add this to store the existing image URL
      serviceList: "",
    }
  );
  const [error, setError] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(""); // For image preview
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    if (data) {
      if (data.image) {
        setPreviewImage(data.image);
      }

      if (data.serviceList) {
        setSelectedServices(
          data.serviceList.split(",").map((id) => parseInt(id))
        );
      }
    } else {
      setSelectedServices([]);
      setPreviewImage("");
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file extension
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setFileError(
        "Định dạng file không hợp lệ. Chỉ chấp nhận: JPG, JPEG, PNG, GIF, SVG, WEBP"
      );
      e.target.value = null; // Clear the input
      return;
    }

    setFileError(""); // Clear any previous errors

    setProductData((prev) => ({
      ...prev,
      image: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) => {
      const serviceIndex = prev.indexOf(serviceId);
      let newSelectedServices;

      if (serviceIndex === -1) {
        newSelectedServices = [...prev, serviceId];
      } else {
        newSelectedServices = prev.filter((id) => id !== serviceId);
      }

      const serviceListString = newSelectedServices
        .sort((a, b) => a - b)
        .join(",");

      setProductData((prev) => ({
        ...prev,
        serviceList: serviceListString,
      }));

      return newSelectedServices;
    });
  };

  const handleSubmit = () => {
    const { productName, productCategoryId, price } = productData;
    if (!productCategoryId) {
      setError("Vui lòng chọn danh mục sản phẩm.");
      return;
    }

    if (!productName.trim()) {
      setError("Tên sản phẩm không được để trống.");
      return;
    }

    if (!price) {
      setError("Giá sản phẩm không được để trống.");
      return;
    }
    if (!productData.serviceList || productData.serviceList.trim() === "") {
      setError("Vui lòng chọn ít nhất một dịch vụ.");
      return;
    }
    if (fileError) {
      setError("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }
    const isDuplicate = products.some(
      (product) =>
        product.productName.trim().toLowerCase() ===
          productName.trim().toLowerCase() &&
        String(product.productCategoryId) === String(productCategoryId) &&
        product.productId !== productData.productId
    );

    if (isDuplicate) {
      setError(
        "Tên sản phẩm này đã tồn tại trong danh mục, vui lòng nhập tên khác!"
      );
      return;
    }

    // For editing, check if any data has changed
    if (data && data.productId) {
      const selectedCategory = categories.find(
        (category) =>
          String(category.productCategoryId) === String(productCategoryId)
      );

      if (selectedCategory) {
        productData.productCategoryName = selectedCategory.productCategoryName;
      }

      const dataToSave = { ...productData };
      if (data && data.image && !productData.image) {
        dataToSave.existingImageUrl = data.image;
      }

      onSave(dataToSave);
    } else {
      const selectedCategory = categories.find(
        (category) =>
          String(category.productCategoryId) === String(productCategoryId)
      );

      if (selectedCategory) {
        productData.productCategoryName = selectedCategory.productCategoryName;
      }

      onSave(productData);
    }
  };

  const renderServiceGrid = () => {
    if (!services || services.length === 0) {
      return <p>Không có dịch vụ nào.</p>;
    }

    const filteredServices = services.filter(
      (service) => service.serviceTypeId === 2
    );

    if (filteredServices.length === 0) {
      return <p>Không có dịch vụ thỏa mãn điều kiện.</p>;
    }

    const rows = [];
    const servicesArray = [...filteredServices];

    while (servicesArray.length > 0) {
      rows.push(servicesArray.splice(0, 3));
    }

    return (
      <div className="manage-product-service-grid">
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="manage-product-service-row">
            {row.map((service) => (
              <div
                key={service.serviceId}
                className={`manage-product-service-item ${
                  selectedServices.includes(service.serviceId) ? "selected" : ""
                }`}
                onClick={() => handleServiceToggle(service.serviceId)}
              >
                <div className="manage-product-service-checkbox">
                  {selectedServices.includes(service.serviceId) && <FaCheck />}
                </div>
                <span>{service.serviceName}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="manage-product-modal show">
      <div className="manage-product-modal-content">
        <div className="manage-product-modal-header">
          <h3>{data ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm Mới"}</h3>
          <button className="manage-product-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-product-modal-body">
          <div className="manage-product-form-group">
            <label>Loại Sản Phẩm:</label>
            <select
              name="productCategoryId"
              className="manage-product-input"
              value={productData.productCategoryId || ""}
              onChange={handleChange}
            >
              <option value="">Chọn Loại Sản Phẩm</option>
              {categories.map((category) => (
                <option
                  key={category.productCategoryId}
                  value={category.productCategoryId}
                >
                  {category.productCategoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="manage-product-form-group">
            <label>Tên Sản Phẩm:</label>
            <input
              type="text"
              name="productName"
              className="manage-product-input"
              placeholder="Tên Sản Phẩm"
              value={productData.productName || ""}
              onChange={handleChange}
            />
          </div>

          <div className="manage-product-form-group">
            <label>Giá:</label>
            <input
              type="number"
              name="price"
              className="manage-product-input"
              placeholder="Giá"
              value={productData.price || ""}
              onChange={handleChange}
            />
          </div>

          <div className="manage-product-form-group">
            <label>Hình Ảnh:</label>
            <input
              type="file"
              className="manage-product-input"
              accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
              onChange={handleFileChange}
            />
            {fileError && (
              <div className="manage-product-file-error">
                <FaExclamationTriangle /> {fileError}
              </div>
            )}

            {/* Display current image preview */}
            {previewImage && (
              <div className="manage-product-image-preview">
                <img
                  src={previewImage}
                  alt="Xem trước hình ảnh"
                  style={{ maxWidth: "100px", marginTop: "10px" }}
                />
                <p className="manage-product-image-note">
                  {data?.image ? "Hình ảnh hiện tại" : "Hình ảnh mới"}
                </p>
              </div>
            )}
          </div>

          <div className="manage-product-form-group">
            <label>Chọn dịch vụ:</label>
            {isLoading ? <p>Đang tải dịch vụ...</p> : renderServiceGrid()}
          </div>

          {error && (
            <div className="manage-product-error">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="manage-product-modal-actions">
          <button
            className="manage-product-modal-save-btn"
            onClick={handleSubmit}
          >
            {data ? "Cập Nhật" : "Thêm Mới"}
          </button>
          <button className="manage-product-modal-close-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Deactivate Product (formerly Delete Product)
const DeactivateProductModal = ({ product, onDeactivate, onClose }) => {
  return (
    <div className="manage-product-modal show">
      <div className="manage-product-modal-content">
        <div className="manage-product-modal-header">
          <h3>Xác Nhận Vô Hiệu Hóa</h3>
          <button className="manage-product-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-product-modal-body">
          <p>
            Bạn có chắc chắn muốn vô hiệu hóa sản phẩm{" "}
            <strong>{product.productName}</strong> không?
          </p>
          <p>Sản phẩm sẽ bị ẩn khỏi danh sách sản phẩm hiển thị.</p>
        </div>
        <div className="manage-product-modal-actions">
          <button
            className="manage-product-modal-delete-btn"
            onClick={() => onDeactivate(product.productId)}
          >
            Vô Hiệu Hóa
          </button>
          <button className="manage-product-modal-close-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("status");
  const [jumpToPage, setJumpToPage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

  // Effect for success notifications
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, servicesData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchServiceTypes(),
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
        setServices(servicesData);
        setTotalProducts(productsData.length);
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

  // Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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

  // Add Product
  const handleAddProduct = (newProduct) => {
    addProduct(newProduct)
      .then(() => {
        fetchProducts()
          .then((data) => {
            setProducts(data);
            setTotalProducts(data.length);
          })
          .catch((error) => console.error("Error fetching products:", error));
        setOperation({
          status: "success",
          message: "Sản phẩm đã được thêm thành công!",
        });
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        setOperationError("Không thể thêm sản phẩm. Vui lòng thử lại.");
      })
      .finally(() => setShowModal(false));
  };

  const handleEditProduct = (updatedProduct) => {
    const originalProduct = products.find(
      (p) => p.productId === updatedProduct.productId
    );

    if (!originalProduct) {
      setOperationError("Không tìm thấy sản phẩm gốc!");
      setShowModal(false);
      return;
    }

    const normalizedOriginal = {
      productName: (originalProduct.productName || "").trim(),
      price: parseFloat(originalProduct.price),
      productCategoryId: String(originalProduct.productCategoryId || ""),
      serviceList:
        originalProduct.serviceList || ""
          ? String(originalProduct.serviceList).split(",").sort().join(",")
          : "",
    };

    const normalizedUpdated = {
      productName: (updatedProduct.productName || "").trim(),
      price: parseFloat(updatedProduct.price),
      productCategoryId: String(updatedProduct.productCategoryId || ""),
      serviceList:
        updatedProduct.serviceList || ""
          ? String(updatedProduct.serviceList).split(",").sort().join(",")
          : "",
    };

    const imageChanged = updatedProduct.image instanceof File;

    const nameChanged =
      normalizedOriginal.productName !== normalizedUpdated.productName;
    const priceChanged = normalizedOriginal.price !== normalizedUpdated.price;
    const categoryChanged =
      normalizedOriginal.productCategoryId !==
      normalizedUpdated.productCategoryId;
    const servicesChanged =
      normalizedOriginal.serviceList !== normalizedUpdated.serviceList;

    const hasChanged =
      nameChanged ||
      priceChanged ||
      categoryChanged ||
      servicesChanged ||
      imageChanged;

    if (!hasChanged) {
      setOperationError("Không có thay đổi nào được thực hiện!");
      setShowModal(false);
      return;
    }

    editProduct(updatedProduct)
      .then(() => {
        fetchProducts()
          .then((data) => {
            setProducts(data);
          })
          .catch((error) => console.error("Error fetching products:", error));
        setOperation({
          status: "success",
          message: "Sản phẩm đã được cập nhật thành công!",
        });
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        setOperationError("Không thể cập nhật sản phẩm. Vui lòng thử lại.");
      })
      .finally(() => setShowModal(false));
  };

  const handleDeactivateProduct = (id) => {
    deactivateProduct(id)
      .then(() => {
        fetchProducts()
          .then((data) => {
            setProducts(data);
            setTotalProducts(data.length);
          })
          .catch((error) => console.error("Error fetching products:", error));
        setOperation({
          status: "success",
          message: "Sản phẩm đã được vô hiệu hóa thành công!",
        });
        setShowDeactivateModal(false);
      })
      .catch(() => {
        setOperationError("Vô hiệu hóa sản phẩm thất bại!");
      });
  };

  const handleAddProductClick = () => {
    setCurrentProduct(null);
    setShowModal(true);
  };

  const handleEditProductClick = (product) => {
    if (product.statusDelete === false) {
      setOperationError("Không thể chỉnh sửa sản phẩm đã vô hiệu hóa!");
      return;
    }

    setCurrentProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = (productData) => {
    if (productData.productId) {
      handleEditProduct(productData);
    } else {
      handleAddProduct(productData);
    }
  };

  // Helper function to get product status display
  const getProductStatus = (product) => {
    if (product.statusDelete === false) {
      return "Vô hiệu";
    } else {
      return "Kích hoạt";
    }
  };

  // Filter data by search term, category, and status
  const filteredData = products.filter((product) => {
    const matchesSearch =
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productCategoryName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      product.productCategoryId?.toString() === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        (product.statusDelete === true || product.statusDelete === null)) ||
      (statusFilter === "inactive" && product.statusDelete === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "productName") {
      return sortOrder === "asc"
        ? a.productName.localeCompare(b.productName)
        : b.productName.localeCompare(a.productName);
    } else if (sortField === "price") {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    } else if (sortField === "productCategoryName") {
      return sortOrder === "asc"
        ? a.productCategoryName.localeCompare(b.productCategoryName)
        : b.productCategoryName.localeCompare(a.productCategoryName);
    } else if (sortField === "status") {
      // Sort by status
      const statusA = a.statusDelete === false ? "inactive" : "active";
      const statusB = b.statusDelete === false ? "inactive" : "active";
      return sortOrder === "asc"
        ? statusA.localeCompare(statusB)
        : statusB.localeCompare(statusA);
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

  // Format service names for display
  const getServiceNames = (product) => {
    if (!product.serviceNames || product.serviceNames.length === 0) {
      return "Không có dịch vụ";
    }
    return product.serviceNames.join(", ");
  };

  return (
    <div className="manage-product-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-product">
          <h2>Quản Lý Sản Phẩm</h2>

          {/* Display custom notifications */}
          {operation.status === "success" && (
            <div className="manage-product-success-message">
              {operation.message}
            </div>
          )}
          {operationError && (
            <div className="manage-product-error-message">{operationError}</div>
          )}

          <div className="manage-product-header">
            <div className="manage-product-search">
              <FaSearch className="manage-product-search-icon" />
              <input
                type="text"
                className="manage-product-search-input"
                placeholder="Tìm kiếm theo tên sản phẩm hoặc loại sản phẩm..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <FaTimes
                  className="manage-product-clear-search-icon"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            <div className="manage-product-filter">
              <FaFilter className="manage-product-filter-icon" />
              <select
                className="manage-product-filter-select"
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
              >
                <option value="all">Tất cả loại sản phẩm</option>
                {categories.map((category) => (
                  <option
                    key={category.productCategoryId}
                    value={category.productCategoryId}
                  >
                    {category.productCategoryName}
                  </option>
                ))}
              </select>
              <select
                className="manage-product-filter-select"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang kích hoạt</option>
                <option value="inactive">Đã vô hiệu hóa</option>
              </select>
            </div>

            <button
              className="manage-product-add-btn"
              onClick={handleAddProductClick}
            >
              <FaPlus className="manage-product-action-icon" /> Thêm Sản Phẩm
            </button>
          </div>

          <div className="manage-product-table-container">
            {loading ? (
              <div className="manage-product-loading">Đang tải dữ liệu...</div>
            ) : errorMessage ? (
              <div className="manage-product-error">{errorMessage}</div>
            ) : sortedData.length === 0 ? (
              <div className="manage-product-empty">
                Không tìm thấy sản phẩm nào.
              </div>
            ) : (
              <table className="manage-product-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Hình Ảnh</th>
                    <th onClick={() => handleSort("productCategoryName")}>
                      Loại Sản Phẩm
                      {sortField === "productCategoryName" && (
                        <span className="manage-product-sort-icon">
                          {sortOrder === "asc" ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                        </span>
                      )}
                    </th>
                    <th onClick={() => handleSort("productName")}>
                      Tên Sản Phẩm
                      {sortField === "productName" && (
                        <span className="manage-product-sort-icon">
                          {sortOrder === "asc" ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                        </span>
                      )}
                    </th>
                    <th onClick={() => handleSort("price")}>
                      Giá
                      {sortField === "price" && (
                        <span className="manage-product-sort-icon">
                          {sortOrder === "asc" ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                        </span>
                      )}
                    </th>
                    <th>Dịch Vụ</th>
                    <th onClick={() => handleSort("status")}>
                      Trạng Thái
                      {sortField === "status" && (
                        <span className="manage-product-sort-icon">
                          {sortOrder === "asc" ? (
                            <FaArrowUp />
                          ) : (
                            <FaArrowDown />
                          )}
                        </span>
                      )}
                    </th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((product, index) => (
                    <tr key={product.productId}>
                      <td>{indexOfFirstRecord + index + 1}</td>
                      <td>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="manage-product-thumbnail"
                          />
                        ) : (
                          <span className="manage-product-no-image">
                            Không có hình
                          </span>
                        )}
                      </td>
                      <td>{product.productCategoryName}</td>
                      <td>{product.productName}</td>
                      <td>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.price)}
                      </td>
                      <td className="manage-product-services">
                        {getServiceNames(product)}
                      </td>
                      <td>
                        <span
                          className={`manage-product-status ${
                            product.statusDelete === false
                              ? "inactive"
                              : "active"
                          }`}
                        >
                          {product.statusDelete === false ? (
                            <FaToggleOff className="manage-product-status-icon" />
                          ) : (
                            <FaToggleOn className="manage-product-status-icon" />
                          )}
                          {getProductStatus(product)}
                        </span>
                      </td>
                      <td>
                        <div className="manage-product-actions">
                          {product.statusDelete === false ? (
                            <></>
                          ) : (
                            <button
                              className="manage-product-edit-btn"
                              onClick={() => handleEditProductClick(product)}
                              title="Sửa"
                            >
                              <FaEdit className="manage-product-action-icon" />
                            </button>
                          )}
                          {product.statusDelete !== false && (
                            <button
                              className="manage-product-delete-btn"
                              onClick={() => {
                                setCurrentProduct(product);
                                setShowDeactivateModal(true);
                              }}
                              title="Vô hiệu hóa"
                            >
                              <FaRegTimesCircle className="manage-product-action-icon" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && !errorMessage && sortedData.length > 0 && (
            <div className="manage-product-pagination-controls">
              <div className="manage-product-pagination-info">
                <span>
                  Hiển thị {indexOfFirstRecord + 1} -{" "}
                  {Math.min(indexOfLastRecord, filteredData.length)} của{" "}
                  {filteredData.length} sản phẩm
                </span>
                <div className="manage-product-records-per-page">
                  <label htmlFor="recordsPerPage">Hiển thị:</label>
                  <select
                    id="recordsPerPage"
                    value={recordsPerPage}
                    onChange={handleRecordsPerPageChange}
                    className="manage-product-select"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>

              <div className="manage-product-pagination">
                <button
                  className="manage-product-pagination-btn"
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  title="Trang đầu"
                >
                  <FaAngleDoubleLeft />
                </button>
                <button
                  className="manage-product-pagination-btn"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Trang trước"
                >
                  <FaArrowLeft />
                </button>

                <div className="manage-product-pagination-numbers">
                  {startPage > 1 && (
                    <>
                      <button
                        onClick={() => paginate(1)}
                        className="manage-product-pagination-number"
                      >
                        1
                      </button>
                      {startPage > 2 && (
                        <span className="manage-product-pagination-ellipsis">
                          <FaEllipsisH />
                        </span>
                      )}
                    </>
                  )}

                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`manage-product-pagination-number ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && (
                        <span className="manage-product-pagination-ellipsis">
                          <FaEllipsisH />
                        </span>
                      )}
                      <button
                        onClick={() => paginate(totalPages)}
                        className="manage-product-pagination-number"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  className="manage-product-pagination-btn"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Trang sau"
                >
                  <FaArrowRight />
                </button>
                <button
                  className="manage-product-pagination-btn"
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Trang cuối"
                >
                  <FaAngleDoubleRight />
                </button>
              </div>

              <div className="manage-product-jump-to-page">
                <span>Đến trang:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpToPage}
                  onChange={(e) => setJumpToPage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleJumpToPage()}
                  className="manage-product-jump-input"
                />
                <button
                  onClick={handleJumpToPage}
                  className="manage-product-jump-btn"
                >
                  Đi
                </button>
              </div>
            </div>
          )}

          {/* Product Modal */}
          {showModal && (
            <ProductModal
              type={currentProduct ? "edit" : "add"}
              data={currentProduct}
              categories={categories}
              services={services}
              products={products}
              onSave={handleSaveProduct}
              onClose={() => setShowModal(false)}
            />
          )}

          {/* Deactivate Modal */}
          {showDeactivateModal && (
            <DeactivateProductModal
              product={currentProduct}
              onDeactivate={handleDeactivateProduct}
              onClose={() => setShowDeactivateModal(false)}
            />
          )}
        </div>

        <Footer_Admin />
      </div>
    </div>
  );
};

export default Manage_Product;
