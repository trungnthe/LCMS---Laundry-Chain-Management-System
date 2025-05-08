import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_product_category.css";
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
  FaStore,
  FaFilter,
  FaImage,
  FaUpload,
  FaToggleOn,
  FaToggleOff,
  FaCheck,
  FaBan,
  FaLock,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  fetchProductCategories,
  addProductCategory,
  editProductCategory,
  deleteProductCategory,
} from "../../admin/manage_product_category";

// Modal for Add/Edit ProductCategory
const ProductCategoryModal = ({ type, data, categories, onSave, onClose }) => {
  const [productCategoryData, setProductCategoryData] = useState(
    data || {
      productCategoryName: "",
      image: null,
    }
  );
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(data?.image || null);
  const [fileError, setFileError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductCategoryData((prev) => ({ ...prev, [name]: value }));
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
      setProductCategoryData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const { productCategoryName } = productCategoryData;

    if (!productCategoryName.trim()) {
      setError("Tên loại sản phẩm không được để trống.");
      return;
    }

    const isDuplicate = categories.some(
      (category) =>
        category.productCategoryName.trim().toLowerCase() ===
          productCategoryName.trim().toLowerCase() &&
        category.productCategoryId !== productCategoryData.productCategoryId
    );

    if (isDuplicate) {
      setError("Tên loại sản phẩm này đã tồn tại, vui lòng nhập tên khác!");
      return;
    }
    if (data && data.productCategoryId) {
      const isNameChanged =
        productCategoryData.productCategoryName !== data.productCategoryName;
      const isImageChanged = productCategoryData.image instanceof File;

      if (!isNameChanged && !isImageChanged) {
        setError("Chưa có sự thay đổi nào!");
        return;
      }
    }

    onSave(productCategoryData);
  };

  return (
    <div className="manage-product-category-modal show">
      <div className="manage-product-category-modal-content">
        <div className="manage-product-category-modal-header">
          <h3>{data ? "Cập Nhật Loại Sản Phẩm" : "Thêm Loại Sản Phẩm Mới"}</h3>
          <button
            className="manage-product-category-close-modal-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-product-category-modal-body">
          <div className="manage-product-category-form-group">
            <label>Tên Loại Sản Phẩm:</label>
            <input
              type="text"
              name="productCategoryName"
              className="manage-product-category-input"
              placeholder="Tên Loại Sản Phẩm"
              value={productCategoryData.productCategoryName || ""}
              onChange={handleChange}
            />
          </div>

          <div className="manage-product-category-form-group">
            <label>Hình Ảnh:</label>
            <input
              type="file"
              className="manage-product-category-input"
              accept=".jpg,.jpeg,.png,.gif,.svg,.webp"
              onChange={handleImageChange}
            />
            {fileError && (
              <div className="manage-product-category-file-error">
                <FaExclamationTriangle /> {fileError}
              </div>
            )}
            {imagePreview && (
              <div className="manage-product-category-image-preview">
                <img src={imagePreview} alt="Xem trước" />
              </div>
            )}
          </div>

          {error && (
            <div className="manage-product-category-error">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="manage-product-category-modal-actions">
          <button
            className="manage-product-category-modal-save-btn"
            onClick={handleSubmit}
          >
            {data ? "Cập Nhật" : "Thêm Mới"}
          </button>
          <button
            className="manage-product-category-modal-close-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleStatusModal = ({ productCategory, onToggle, onClose }) => {
  const isActive = productCategory.statusDelete !== false;

  return (
    <div className="manage-product-category-modal show">
      <div className="manage-product-category-modal-content">
        <div className="manage-product-category-modal-header">
          <h3>Xác Nhận {isActive ? "Vô Hiệu Hóa" : "Kích Hoạt"}</h3>
          <button
            className="manage-product-category-close-modal-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-product-category-modal-body">
          <p>
            Bạn có chắc chắn muốn {isActive ? "vô hiệu hóa" : "kích hoạt"} loại
            sản phẩm <strong>{productCategory.productCategoryName}</strong>{" "}
            không?
          </p>
          {isActive && (
            <p>
              Loại sản phẩm này sẽ không hiển thị cho người dùng sau khi vô hiệu
              hóa.
            </p>
          )}
        </div>
        <div className="manage-product-category-modal-actions">
          <button
            className={`manage-product-category-modal-${
              isActive ? "disable" : "enable"
            }-btn`}
            onClick={() =>
              onToggle(productCategory.productCategoryId, !isActive)
            }
          >
            {isActive ? "Vô Hiệu Hóa" : "Kích Hoạt"}
          </button>
          <button
            className="manage-product-category-modal-close-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Product_Category = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [currentProductCategory, setCurrentProductCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("status");
  const [jumpToPage, setJumpToPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalCategories, setTotalCategories] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'disabled'

  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

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
        const categoriesData = await fetchProductCategories();

        setProductCategories(categoriesData);
        setTotalCategories(categoriesData.length);
        setLoading(false);
      } catch (error) {
        setErrorMessage("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleAddProductCategory = (newProductCategory) => {
    addProductCategory(
      newProductCategory,
      productCategories,
      setProductCategories
    )
      .then(() => {
        fetchProductCategories()
          .then((data) => {
            setProductCategories(data);
            setTotalCategories(data.length);
          })
          .catch((error) => console.error("Error fetching categories:", error));
        setShowModal(false);
        setOperation({
          status: "success",
          message: "Thêm loại sản phẩm thành công!",
        });
      })
      .catch(() => setOperationError("Thêm loại sản phẩm thất bại!"));
  };

  const handleEditProductCategory = (updatedProductCategory) => {
    if (currentProductCategory.statusDelete === false) {
      setOperationError("Không thể chỉnh sửa loại sản phẩm đã bị vô hiệu hóa!");
      return;
    }

    editProductCategory(
      updatedProductCategory,
      productCategories,
      setProductCategories,
      fetchProductCategories
    )
      .then(() => {
        fetchProductCategories()
          .then((data) => {
            setProductCategories(data);
            setTotalCategories(data.length);
          })
          .catch((error) =>
            console.error("Lỗi khi lấy lại loại sản phẩm:", error)
          );
        setShowModal(false);
        setOperation({
          status: "success",
          message: "Cập nhật loại sản phẩm thành công!",
        });
      })
      .catch(() => setOperationError("Cập nhật loại sản phẩm thất bại!"));
  };

  // Toggle Product Category Status
  const handleToggleProductCategoryStatus = (id, newStatus) => {
    deleteProductCategory(id, productCategories, setProductCategories)
      .then(() => {
        fetchProductCategories()
          .then((data) => {
            setProductCategories(data);
            setTotalCategories(data.length);
          })
          .catch((error) => console.error("Error fetching categories:", error));
        setShowToggleModal(false);
        setOperation({
          status: "success",
          message: newStatus
            ? "Kích hoạt loại sản phẩm thành công!"
            : "Vô hiệu hóa loại sản phẩm thành công!",
        });
      })
      .catch(() =>
        setOperationError(
          newStatus
            ? "Kích hoạt loại sản phẩm thất bại!"
            : "Vô hiệu hóa loại sản phẩm thất bại!"
        )
      );
  };

  const handleAddProductCategoryClick = () => {
    setCurrentProductCategory(null);
    setShowModal(true);
  };

  const handleEditProductCategoryClick = (productCategory) => {
    if (productCategory.statusDelete === false) {
      setOperationError("Không thể chỉnh sửa loại sản phẩm đã bị vô hiệu hóa!");
      return;
    }

    setCurrentProductCategory(productCategory);
    setShowModal(true);
  };

  const handleSaveProductCategory = (productCategoryData) => {
    if (productCategoryData.productCategoryId) {
      handleEditProductCategory(productCategoryData);
    } else {
      handleAddProductCategory(productCategoryData);
    }
  };

  const filteredData = productCategories.filter((category) => {
    const matchesSearch = category.productCategoryName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (filterStatus === "all") {
      return matchesSearch;
    } else if (filterStatus === "active") {
      return matchesSearch && category.statusDelete !== false;
    } else if (filterStatus === "disabled") {
      return matchesSearch && category.statusDelete === false;
    }

    return matchesSearch;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "productCategoryName") {
      return sortOrder === "asc"
        ? a.productCategoryName.localeCompare(b.productCategoryName)
        : b.productCategoryName.localeCompare(a.productCategoryName);
    } else if (sortField === "createdAt") {
      return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortField === "updatedAt") {
      return sortOrder === "asc"
        ? new Date(a.updatedAt) - new Date(b.updatedAt)
        : new Date(b.updatedAt) - new Date(a.updatedAt);
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

  const renderStatusBadge = (status) => {
    const isActive = status !== false;
    return (
      <span
        className={`manage-product-category-status-badge ${
          isActive ? "active" : "disabled"
        }`}
      >
        {isActive ? (
          <>
            <FaCheck className="manage-product-category-status-icon" /> Kích
            hoạt
          </>
        ) : (
          <>
            <FaBan className="manage-product-category-status-icon" /> Vô hiệu
          </>
        )}
      </span>
    );
  };

  return (
    <div className="manage-product-category-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-product-category">
          <h2>Quản Lý Loại Sản Phẩm</h2>

          {/* Success and Error Messages */}
          {operation.status === "success" && (
            <div className="manage-product-category-success-message">
              {operation.message}
            </div>
          )}

          {operationError && (
            <div className="manage-product-category-error-message">
              {operationError}
            </div>
          )}

          <div className="manage-product-category-header">
            <div className="manage-product-category-search">
              <FaSearch className="manage-product-category-search-icon" />
              <input
                type="text"
                className="manage-product-category-search-input"
                placeholder="Tìm kiếm theo tên loại sản phẩm..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <FaTimes
                  className="manage-product-category-clear-search-icon"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            {/* Status filter */}
            <div className="manage-product-category-status-filter">
              <label>Trạng Thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterStatusChange(e.target.value)}
                className="manage-product-category-select"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang kích hoạt</option>
                <option value="disabled">Đã vô hiệu</option>
              </select>
            </div>
          </div>

          <div className="manage-product-category-controls">
            <div className="manage-product-category-total-products">
              <FaStore /> Tổng số loại sản phẩm: {totalCategories}
            </div>

            <div className="manage-product-category-sort-controls">
              <button
                className={`manage-product-category-sort-btn ${
                  sortField === "productCategoryName" ? "active" : ""
                }`}
                onClick={() => handleSort("productCategoryName")}
              >
                Sắp xếp theo tên{" "}
                {sortField === "productCategoryName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-product-category-sort-btn ${
                  sortField === "status" ? "active" : ""
                }`}
                onClick={() => handleSort("status")}
              >
                Sắp xếp theo trạng thái{" "}
                {sortField === "status" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-product-category-sort-btn ${
                  sortField === "createdAt" ? "active" : ""
                }`}
                onClick={() => handleSort("createdAt")}
              >
                Sắp xếp theo ngày tạo{" "}
                {sortField === "createdAt" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-product-category-sort-btn ${
                  sortField === "updatedAt" ? "active" : ""
                }`}
                onClick={() => handleSort("updatedAt")}
              >
                Sắp xếp theo ngày cập nhật{" "}
                {sortField === "updatedAt" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
            </div>

            <button
              className="manage-product-category-add-btn"
              onClick={handleAddProductCategoryClick}
            >
              <FaPlus /> Thêm Loại Sản Phẩm
            </button>
          </div>

          {loading ? (
            <div className="manage-product-category-loading-container">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : errorMessage ? (
            <div className="manage-product-category-error-container">
              <p>{errorMessage}</p>
              <button
                className="manage-product-category-reload-btn"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="manage-product-category-table-container">
                <table className="manage-product-category-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên Loại Sản Phẩm</th>
                      <th>Hình Ảnh</th>
                      <th>Trạng Thái</th>
                      <th>Ngày Tạo</th>
                      <th>Ngày Cập Nhật</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="manage-product-category-no-data"
                        >
                          {searchTerm
                            ? "Không tìm thấy loại sản phẩm nào phù hợp với tìm kiếm"
                            : "Không có loại sản phẩm nào."}
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((category, index) => (
                        <tr
                          key={category.productCategoryId}
                          className={
                            category.statusDelete === false
                              ? "manage-product-category-disabled-row"
                              : ""
                          }
                        >
                          <td>{indexOfFirstRecord + index + 1}</td>
                          <td>{category.productCategoryName}</td>
                          <td>
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.productCategoryName}
                                className="manage-product-category-thumbnail"
                              />
                            ) : (
                              <div className="manage-product-category-no-image">
                                <FaImage /> Không có ảnh
                              </div>
                            )}
                          </td>
                          <td>{renderStatusBadge(category.statusDelete)}</td>
                          <td>
                            {new Date(category.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            {new Date(category.updatedAt).toLocaleDateString()}
                          </td>
                          <td>
                            <td>
                              <div className="manage-product-category-actions">
                                {category.statusDelete === false ? (
                                  <span className="manage-product-category-no-actions">
                                    <FaLock />
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      className="manage-product-category-edit-btn"
                                      onClick={() =>
                                        handleEditProductCategoryClick(category)
                                      }
                                      title="Chỉnh sửa"
                                    >
                                      <FaEdit /> Sửa
                                    </button>
                                    <button
                                      className="manage-product-category-disable-btn"
                                      onClick={() => {
                                        setCurrentProductCategory(category);
                                        setShowToggleModal(true);
                                      }}
                                      title="Vô hiệu hóa"
                                    >
                                      <FaToggleOff /> Vô hiệu
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredData.length > 0 && (
                <div className="manage-product-category-pagination-controls">
                  <div className="manage-product-category-pagination-info">
                    <span>
                      Hiển thị {indexOfFirstRecord + 1} -{" "}
                      {Math.min(indexOfLastRecord, filteredData.length)} của{" "}
                      {filteredData.length} loại sản phẩm
                    </span>
                    <div className="manage-product-category-records-per-page">
                      <label htmlFor="recordsPerPage">Hiển thị:</label>
                      <select
                        id="recordsPerPage"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                        className="manage-product-category-select"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                      </select>
                    </div>
                  </div>

                  <div className="manage-product-category-pagination">
                    <button
                      className="manage-product-category-pagination-btn"
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                      title="Trang đầu"
                    >
                      <FaAngleDoubleLeft />
                    </button>
                    <button
                      className="manage-product-category-pagination-btn"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      <FaArrowLeft />
                    </button>

                    <div className="manage-product-category-pagination-numbers">
                      {startPage > 1 && (
                        <>
                          <button
                            onClick={() => paginate(1)}
                            className="manage-product-category-pagination-number"
                          >
                            1
                          </button>
                          {startPage > 2 && (
                            <span className="manage-product-category-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                        </>
                      )}

                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`manage-product-category-pagination-number ${
                            currentPage === number ? "active" : ""
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && (
                            <span className="manage-product-category-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                          <button
                            onClick={() => paginate(totalPages)}
                            className="manage-product-category-pagination-number"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      className="manage-product-category-pagination-btn"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      title="Trang sau"
                    >
                      <FaArrowRight />
                    </button>
                    <button
                      className="manage-product-category-pagination-btn"
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Trang cuối"
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>

                  <div className="manage-product-category-jump-to-page">
                    <span>Đến trang:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={jumpToPage}
                      onChange={(e) => setJumpToPage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleJumpToPage()
                      }
                      className="manage-product-category-jump-input"
                    />
                    <button
                      onClick={handleJumpToPage}
                      className="manage-product-category-jump-btn"
                    >
                      Đi
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          <Footer_Admin />
        </div>

        {showModal && (
          <ProductCategoryModal
            type={currentProductCategory ? "edit" : "add"}
            data={currentProductCategory}
            categories={productCategories}
            onSave={handleSaveProductCategory}
            onClose={() => setShowModal(false)}
          />
        )}

        {showToggleModal && (
          <ToggleStatusModal
            productCategory={currentProductCategory}
            onToggle={handleToggleProductCategoryStatus}
            onClose={() => setShowToggleModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Manage_Product_Category;
