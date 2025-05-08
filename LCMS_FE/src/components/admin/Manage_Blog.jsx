import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "../../assets/css/admin/manage_blog.css";
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
  FaImage,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextEditor from "../reuse/TextEditor";

const apiUrl = import.meta.env.VITE_API_URL;

const BlogModal = ({ type, data, onSave, onClose }) => {
  const [blogData, setBlogData] = useState(data || { status: true });
  const [imagePreview, setImagePreview] = useState(data?.imageBlog || null);
  const [contentError, setContentError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [imageError, setImageError] = useState(""); // New state for image errors
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (data) {
      setBlogData(data);
      setImagePreview(data.imageBlog);
      setOriginalData(JSON.parse(JSON.stringify(data)));
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (!file) return;

      const validExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".svg",
        ".webp",
      ];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        setImageError(
          "Định dạng file không hợp lệ. Chỉ chấp nhận: JPG, JPEG, PNG, GIF, SVG, WEBP"
        );
        e.target.value = null; // Clear the input
        return;
      }

      setImageError("");

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setBlogData((prev) => ({ ...prev, imageFile: file }));
    } else if (type === "checkbox") {
      setBlogData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setBlogData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditorChange = (content) => {
    setBlogData((prev) => ({ ...prev, content }));
    if (content) {
      setContentError("");
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!blogData.blogName?.trim()) {
      setOperationError("Vui lòng nhập tên blog!");
      isValid = false;
    }

    if (!blogData.content?.trim()) {
      setContentError("Vui lòng nhập nội dung blog!");
      isValid = false;
    } else {
      setContentError("");
    }

    if (type === "add" && !blogData.imageFile) {
      setOperationError("Vui lòng chọn hình ảnh cho blog!");
      isValid = false;
    }

    if (imageError) {
      isValid = false;
    }

    if (type === "edit" && originalData) {
      const imageChanged = blogData.imageFile instanceof File;
      const nameChanged = blogData.blogName !== originalData.blogName;
      const contentChanged = blogData.content !== originalData.content;
      const statusChanged = blogData.status !== originalData.status;

      if (!imageChanged && !nameChanged && !contentChanged && !statusChanged) {
        setOperationError("Không có thay đổi nào được thực hiện!");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    let dataToSave = { ...blogData };

    // Kiểm tra xem có ảnh mới được chọn không và nếu không thì giữ ảnh hiện tại
    if (type === "edit") {
      if (!blogData.imageFile && originalData?.imageBlog) {
        dataToSave.imageBlog = originalData.imageBlog; // Giữ ảnh cũ
      } else if (blogData.imageFile) {
      }
    }

    // Gửi dữ liệu đã chỉnh sửa (bao gồm ảnh cũ nếu không có ảnh mới)
    onSave(dataToSave);
  };

  return (
    <div className="manage-blog-modal show">
      <div className="manage-blog-modal-content">
        <div className="manage-blog-modal-header">
          <h3>{type === "add" ? "Thêm Blog Mới" : "Chỉnh Sửa Blog"}</h3>
          <button className="manage-blog-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        {operationError && (
          <div className="manage-blog-error-message">{operationError}</div>
        )}
        <div className="manage-blog-modal-inputs">
          <div className="manage-blog-form-group">
            <label htmlFor="blogName">
              Tên Blog <span className="manage-blog-required">*</span>
            </label>
            <input
              type="text"
              id="blogName"
              name="blogName"
              placeholder="Tên blog"
              value={blogData.blogName || ""}
              onChange={handleChange}
            />
          </div>

          <div className="manage-blog-form-group">
            <label htmlFor="content">
              Nội Dung <span className="manage-blog-required">*</span>
            </label>
            <TextEditor
              value={blogData.content || ""}
              funct={handleEditorChange}
            />
            {contentError && (
              <div className="manage-blog-error-text">{contentError}</div>
            )}
          </div>

          <div className="manage-blog-form-group">
            <label htmlFor="imageBlog">
              Hình Ảnh{" "}
              {type === "add" && (
                <span className="manage-blog-required">*</span>
              )}
            </label>
            <div className="manage-blog-file-input-container">
              <input
                type="file"
                id="imageBlog"
                name="imageBlog"
                onChange={handleChange}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
                className="manage-blog-file-input"
              />
              <label htmlFor="imageBlog" className="manage-blog-file-label">
                <FaImage />{" "}
                {type === "edit" ? "Thay đổi hình ảnh" : "Chọn hình ảnh"}
              </label>
            </div>
            {imageError && (
              <div className="manage-blog-error-text">{imageError}</div>
            )}
            {imagePreview && (
              <div className="manage-blog-image-preview">
                <img src={imagePreview} alt="Blog preview" />
                {type === "edit" && !blogData.imageFile && (
                  <p className="manage-blog-image-note">
                    (Sử dụng hình ảnh hiện tại)
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="manage-blog-form-group manage-blog-checkbox-group">
            <label htmlFor="status" className="manage-blog-checkbox-label">
              Trạng Thái Hoạt Động
            </label>
            <div className="manage-blog-toggle-container">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={blogData.status || false}
                onChange={handleChange}
                className="manage-blog-toggle-input"
              />
              <label htmlFor="status" className="manage-blog-toggle-label">
                {blogData.status ? <FaToggleOn /> : <FaToggleOff />}
                {blogData.status ? " Đang hoạt động" : " Không hoạt động"}
              </label>
            </div>
          </div>
        </div>
        <div className="manage-blog-modal-actions">
          <button className="manage-blog-modal-save-btn" onClick={handleSubmit}>
            {type === "add" ? "Thêm Blog" : "Lưu Thay Đổi"}
          </button>
          <button className="manage-blog-modal-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal for Viewing Blog Details
const ViewBlogModal = ({ blog, onClose }) => {
  if (!blog) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="manage-blog-modal show">
      <div className="manage-blog-modal-content manage-blog-view-modal">
        <div className="manage-blog-modal-header">
          <h3>Chi Tiết Blog</h3>
          <button className="manage-blog-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-blog-view-content">
          <div className="manage-blog-view-image">
            {blog.imageBlog && <img src={blog.imageBlog} alt={blog.blogName} />}
          </div>

          <div className="manage-blog-view-details">
            <h2 className="manage-blog-view-title">{blog.blogName}</h2>

            <div className="manage-blog-view-info">
              <p>
                <strong>Tác giả:</strong> {blog.accountName}
              </p>
              <p>
                <strong>Ngày tạo:</strong> {formatDate(blog.createdDate)}
              </p>
              {blog.lastModified && (
                <p>
                  <strong>Chỉnh sửa lần cuối:</strong>{" "}
                  {formatDate(blog.lastModified)}
                </p>
              )}
              <p>
                <strong>Trạng thái:</strong>
                <span
                  className={`manage-blog-status-badge ${
                    blog.status ? "active" : "inactive"
                  }`}
                >
                  {blog.status ? "Hoạt động" : "Không hoạt động"}
                </span>
              </p>
            </div>

            <div className="manage-blog-view-content-text">
              <h3>Nội dung:</h3>
              <div
                className="manage-blog-content-container"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </div>
        </div>
        <div className="manage-blog-modal-actions">
          <button className="manage-blog-modal-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirm Delete Modal
const ConfirmDeleteModal = ({ blog, onConfirm, onClose }) => {
  return (
    <div className="manage-blog-modal show">
      <div className="manage-blog-modal-content manage-blog-confirm-modal">
        <div className="manage-blog-modal-header">
          <h3>Xác Nhận Xóa</h3>
          <button className="manage-blog-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-blog-confirm-content">
          <p>
            Bạn có chắc chắn muốn xóa blog <strong>"{blog.blogName}"</strong>?
          </p>
          <p className="manage-blog-warning">
            Hành động này không thể hoàn tác!
          </p>
        </div>
        <div className="manage-blog-modal-actions">
          <button
            className="manage-blog-delete-confirm-btn"
            onClick={() => onConfirm(blog.blogId)}
          >
            Xóa
          </button>
          <button className="manage-blog-modal-close-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentBlog, setCurrentBlog] = useState(null);
  const [viewBlog, setViewBlog] = useState(null);
  const [deleteBlog, setDeleteBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationSuccess, setOperationSuccess] = useState("");
  const [operationError, setOperationError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [sortOrder, setSortOrder] = useState("desc"); // Default newest first
  const [sortField, setSortField] = useState("createdDate");
  const [searchTerm, setSearchTerm] = useState("");
  const [jumpToPage, setJumpToPage] = useState("");
  const [totalBlogs, setTotalBlogs] = useState(0);

  useEffect(() => {
    let timer;
    if (operationSuccess || operationError) {
      timer = setTimeout(() => {
        setOperationSuccess("");
        setOperationError("");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [operationSuccess, operationError]);

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

  // Fetch blogs
  const fetchBlogs = async () => {
    const token = verifyToken();
    if (!token) {
      setLoading(false);
      setError("Token không hợp lệ hoặc hết hạn");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/blogs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const data = await response.json();
      setBlogs(data);
      setTotalBlogs(data.length);
      setLoading(false);
    } catch (error) {
      setOperationError("Không thể tải danh sách blog");
      setError("Không thể tải danh sách blog");
      setLoading(false);
    }
  };

  const fetchBlogDetails = async (blogId) => {
    const token = verifyToken();
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/api/blogs/${blogId}`, {
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
      setOperationError("Không thể tải thông tin chi tiết blog");
      return null;
    }
  };

  // Load blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Open modal for add/edit/view/delete
  const openModal = (type, blog = null) => {
    if (type === "view" && blog) {
      viewBlogDetails(blog.blogId);
    } else if (type === "edit" && blog) {
      editBlog(blog.blogId);
    } else if (type === "delete" && blog) {
      setDeleteBlog(blog);
    } else {
      setModalType(type);
      setCurrentBlog(blog);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setViewBlog(null);
    setDeleteBlog(null);
    setCurrentBlog(null);
  };

  const viewBlogDetails = async (blogId) => {
    const blogDetails = await fetchBlogDetails(blogId);
    if (blogDetails) {
      setViewBlog(blogDetails);
    }
  };

  // Edit blog
  const editBlog = async (blogId) => {
    const blogDetails = await fetchBlogDetails(blogId);
    if (blogDetails) {
      if (!blogDetails.accountId) {
        const token = verifyToken();
        if (token) {
          const decodedToken = jwtDecode(token);
          blogDetails.accountId =
            decodedToken.id || decodedToken.nameid || decodedToken.AccountId;
        }
      }
      setModalType("edit");
      setCurrentBlog(blogDetails);
      setShowModal(true);
    }
  };

  const saveBlog = async (blogData) => {
    const token = verifyToken();
    if (!token) return;

    const formData = new FormData();
    formData.append("BlogName", blogData.blogName);
    formData.append("Content", blogData.content);
    formData.append("Status", blogData.status);

    // Nếu đang thêm blog mới, lấy accountId từ token
    if (modalType === "add") {
      const decodedToken = jwtDecode(token);
      const accountId =
        decodedToken.id || decodedToken.nameid || decodedToken.AccountId;
      if (!accountId) {
        setOperationError(
          "Không thể xác định ID người dùng. Vui lòng đăng nhập lại."
        );
        return;
      }
      formData.append("AccountId", accountId);
    } else if (modalType === "edit") {
      formData.append("AccountId", blogData.accountId || currentBlog.accountId);
      formData.append("BlogId", blogData.blogId);
    }

    // Nếu có ảnh mới, thêm vào FormData
    if (blogData.imageFile instanceof File) {
      formData.append("ImageBlog", blogData.imageFile);
    } else if (modalType === "edit" && blogData.imageBlog) {
      formData.append("keepExistingImage", "true");
      formData.append("existingImageUrl", blogData.imageBlog);
    }

    try {
      let url = `${apiUrl}/api/blogs`;
      let method = "POST";

      if (modalType === "edit") {
        url = `${apiUrl}/api/blogs/${blogData.blogId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi HTTP: ${response.status} - ${errorText}`);
      }

      closeModal();
      setOperationSuccess(
        modalType === "add"
          ? "Thêm blog thành công!"
          : "Cập nhật blog thành công!"
      );
      fetchBlogs();
    } catch (error) {
      setOperationError(
        modalType === "add"
          ? "Không thể thêm blog. Vui lòng thử lại."
          : "Không thể cập nhật blog. Vui lòng thử lại."
      );
    }
  };

  // Delete blog
  const confirmDeleteBlog = async (blogId) => {
    const token = verifyToken();
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/api/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      closeModal();
      setOperationSuccess("Xóa blog thành công!");
      fetchBlogs();
    } catch (error) {
      setOperationError("Không thể xóa blog. Vui lòng thử lại.");
    }
  };

  // Toggle blog status
  const toggleBlogStatus = async (blog) => {
    const token = verifyToken();
    if (!token) return;

    const updatedBlog = { ...blog, status: !blog.status };

    try {
      const formData = new FormData();
      formData.append("BlogName", updatedBlog.blogName);
      formData.append("AccountId", updatedBlog.accountId);
      formData.append("Content", updatedBlog.content);
      formData.append("Status", updatedBlog.status);

      const response = await fetch(`${apiUrl}/api/blogs/${blog.blogId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      setOperationSuccess(
        `Blog đã ${updatedBlog.status ? "được kích hoạt" : "bị vô hiệu hóa"}!`
      );
      fetchBlogs();
    } catch (error) {
      setOperationError(
        "Không thể thay đổi trạng thái blog. Vui lòng thử lại."
      );
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const filteredBlogs = blogs
    .filter(
      (blog) =>
        blog.blogName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!a[sortField]) return 1;
      if (!b[sortField]) return -1;

      if (sortField === "createdDate" || sortField === "lastModified") {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (typeof a[sortField] === "string") {
        return sortOrder === "asc"
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }

      if (typeof a[sortField] === "boolean") {
        return sortOrder === "asc"
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      }

      return 0;
    });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBlogs.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredBlogs.length / recordsPerPage);

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

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="manage-blog-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-blog">
          <h2>Quản Lý Blog</h2>

          {operationSuccess && (
            <div className="manage-blog-success-message">
              {operationSuccess}
            </div>
          )}
          {operationError && (
            <div className="manage-blog-error-message">{operationError}</div>
          )}

          <div className="manage-blog-header">
            <button
              className="manage-blog-add-btn"
              onClick={() => openModal("add")}
            >
              <FaPlus /> Thêm Blog Mới
            </button>

            <div className="manage-blog-search">
              <FaSearch className="manage-blog-search-icon" />
              <input
                type="text"
                className="manage-blog-search-input"
                placeholder="Tìm kiếm theo tên blog, tác giả, nội dung..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <FaTimes
                  className="manage-blog-clear-search-icon"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </div>

          <div className="manage-blog-controls">
            <div className="manage-blog-total">
              Tổng số blog: {filteredBlogs.length}
            </div>

            <div className="manage-blog-sort-options">
              <button
                className={`manage-blog-sort-btn ${
                  sortField === "createdDate" ? "active" : ""
                }`}
                onClick={() => handleSort("createdDate")}
              >
                {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />}
                Sắp xếp theo ngày tạo
              </button>
              <button
                className={`manage-blog-sort-btn ${
                  sortField === "blogName" ? "active" : ""
                }`}
                onClick={() => handleSort("blogName")}
              >
                {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />}
                Sắp xếp theo tên
              </button>
            </div>
          </div>
          {loading ? (
            <div className="manage-blog-loading-container">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="manage-blog-error-container">
              <p>{error}</p>
              <button
                className="manage-blog-reload-btn"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetchBlogs();
                }}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="manage-blog-table-container">
                <table className="manage-blog-table">
                  <thead>
                    <tr>
                      <th>Hình Ảnh</th>
                      <th>Tên Blog</th>
                      <th>Tác Giả</th>
                      <th>Nội Dung</th>
                      <th>Ngày Tạo</th>
                      <th>Chỉnh Sửa Lần Cuối</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="manage-blog-no-data">
                          {searchTerm
                            ? "Không tìm thấy blog nào phù hợp với tìm kiếm"
                            : "Không có blog nào."}
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((blog) => (
                        <tr key={blog.blogId}>
                          <td className="manage-blog-image-cell">
                            {blog.imageBlog && (
                              <img
                                src={blog.imageBlog}
                                alt={blog.blogName}
                                className="manage-blog-thumbnail"
                              />
                            )}
                          </td>
                          <td>{truncateText(blog.blogName, 30)}</td>
                          <td>{blog.accountName}</td>
                          <td className="manage-blog-content-cell">
                            {truncateText(blog.content, 50)}
                          </td>
                          <td>{formatDate(blog.createdDate)}</td>
                          <td>
                            {blog.lastModified
                              ? formatDate(blog.lastModified)
                              : "Chưa chỉnh sửa"}
                          </td>
                          <td>
                            <span
                              className={`manage-blog-status-badge ${
                                blog.status ? "active" : "inactive"
                              }`}
                            >
                              {blog.status ? "Hoạt động" : "Không hoạt động"}
                            </span>
                          </td>
                          <td>
                            <div className="manage-blog-actions">
                              <button
                                className="manage-blog-view-btn"
                                onClick={() => openModal("view", blog)}
                                title="Xem chi tiết"
                              >
                                <FaEye />
                              </button>
                              <button
                                className="manage-blog-edit-btn"
                                onClick={() => openModal("edit", blog)}
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </button>

                              <button
                                className="manage-blog-delete-btn"
                                onClick={() => openModal("delete", blog)}
                                title="Xóa blog"
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
                <div className="manage-blog-pagination">
                  <div className="manage-blog-pagination-controls">
                    <button
                      className="manage-blog-pagination-btn"
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                    >
                      <FaAngleDoubleLeft />
                    </button>
                    <button
                      className="manage-blog-pagination-btn"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <FaArrowLeft />
                    </button>

                    {startPage > 1 && (
                      <>
                        <button
                          className="manage-blog-pagination-btn"
                          onClick={() => paginate(1)}
                        >
                          1
                        </button>
                        {startPage > 2 && (
                          <span className="manage-blog-pagination-ellipsis">
                            <FaEllipsisH />
                          </span>
                        )}
                      </>
                    )}

                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        className={`manage-blog-pagination-btn ${
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
                          <span className="manage-blog-pagination-ellipsis">
                            <FaEllipsisH />
                          </span>
                        )}
                        <button
                          className="manage-blog-pagination-btn"
                          onClick={() => paginate(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      className="manage-blog-pagination-btn"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <FaArrowRight />
                    </button>
                    <button
                      className="manage-blog-pagination-btn"
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>

                  <div className="manage-blog-pagination-options">
                    <div className="manage-blog-records-per-page">
                      <label>Hiển thị:</label>
                      <select
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span>mục/trang</span>
                    </div>

                    <div className="manage-blog-jump-to-page">
                      <label>Đến trang:</label>
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
                      <button
                        className="manage-blog-go-btn"
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

          {/* Modals */}
          {showModal && (
            <BlogModal
              type={modalType}
              data={currentBlog}
              onSave={saveBlog}
              onClose={closeModal}
            />
          )}

          {viewBlog && <ViewBlogModal blog={viewBlog} onClose={closeModal} />}

          {deleteBlog && (
            <ConfirmDeleteModal
              blog={deleteBlog}
              onConfirm={confirmDeleteBlog}
              onClose={closeModal}
            />
          )}

          <ToastContainer position="top-right" autoClose={3000} />
          <Footer_Admin />
        </div>
      </div>
    </div>
  );
};

export default Manage_Blog;
