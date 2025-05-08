import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_branches.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaPlus,
  FaEdit,
  FaBan,
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaTimes,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEllipsisH,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const Manage_Branches = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // State
  const [branches, setBranches] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBranch, setCurrentBranch] = useState({});
  const [modalAction, setModalAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [disableBranchId, setDisableBranchId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [duplicateError, setDuplicateError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [operationSuccess, setOperationSuccess] = useState("");
  const [operationError, setOperationError] = useState("");
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState(null); // New state for image preview
  const [modalError, setModalError] = useState("");

  // API Functions
  const fetchBranches = () => {
    return fetch(`${apiUrl}/api/Branch/get-all`)
      .then((response) => response.json())
      .then((data) => {
        return data.sort((a, b) => {
          if (a.statusDelete !== b.statusDelete) {
            return a.statusDelete === false ? 1 : -1;
          }
          return a.branchName.localeCompare(b.branchName);
        });
      })
      .catch((error) => {
        setOperationError("Đã có lỗi xảy ra khi tải dữ liệu chi nhánh.");
        throw new Error("Failed to fetch branches.");
      });
  };

  const fetchStatusList = () => {
    return fetch(`${apiUrl}/api/Branch/List-all-status`)
      .then((response) => response.json())
      .catch((error) => {
        setOperationError("Đã có lỗi xảy ra khi tải danh sách trạng thái.");
        throw new Error("Failed to fetch status list.");
      });
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

  const fetchBranchById = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/Branch/getById/${id}`);
      if (!response.ok) throw new Error("Không thể tải thông tin chi nhánh.");
      const data = await response.json();
      return data;
    } catch (error) {
      setOperationError("Lỗi khi tải chi nhánh: " + error.message);
      throw error;
    }
  };

  const addBranch = (formData) => {
    formData.append("status", "Mở Cửa");
    fetch(`${apiUrl}/api/Branch/get-all`)
      .then((response) => response.json())
      .then((existingBranches) => {
        const existingBranch = existingBranches.find(
          (branch) => branch.address === formData.get("address")
        );

        if (existingBranch) {
          setOperationError(
            "Địa chỉ này đã tồn tại. Vui lòng chọn địa chỉ khác."
          );
          return;
        }

        fetch(`${apiUrl}/api/Branch/create`, {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              return response.text().then((text) => {
                throw new Error(text || "Failed to add branch");
              });
            }
            return response.json();
          })
          .then(() => {
            fetch(`${apiUrl}/api/Branch/get-all`)
              .then((response) => response.json())
              .then((updatedBranches) => {
                setBranches(updatedBranches);
                setOperationSuccess("Chi nhánh đã được thêm thành công!");
              })
              .catch((error) => {
                setOperationError("Lỗi khi tải lại danh sách chi nhánh!");
              });
          })
          .catch((error) => {
            setOperationError("Thêm chi nhánh thất bại: " + error.message);
          });
      })
      .catch((error) => {
        setOperationError("Đã có lỗi xảy ra khi tải danh sách chi nhánh.");
      });
  };

  const updateBranch = (branchId, formData) => {
    return fetch(`${apiUrl}/api/Branch/update/${branchId}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "Error updating branch");
          });
        }
        if (response.status === 204) {
          setOperationSuccess("Chi nhánh đã được cập nhật thành công!");
          return;
        }
        return response.json();
      })
      .then(() => {
        return fetch(`${apiUrl}/api/Branch/get-all`)
          .then((response) => response.json())
          .then((updatedBranches) => {
            setBranches(updatedBranches);
          })
          .catch((error) => {
            setOperationError("Lỗi khi tải lại danh sách chi nhánh!");
          });
      })
      .catch((error) => {
        setOperationError("Cập nhật chi nhánh thất bại: " + error.message);
      });
  };

  // Function to disable a branch
  const disableBranch = (branchId) => {
    return fetch(`${apiUrl}/api/Branch/delete/${branchId}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage =
            "Vô hiệu hóa chi nhánh thất bại,vẫn còn đơn hàng chưa hoàn tất.";

          if (
            errorText.includes(
              "Không thể vô hiệu hóa chi nhánh khi còn đơn hàng chưa hoàn tất."
            )
          ) {
            errorMessage =
              "Không thể vô hiệu hóa chi nhánh khi còn đơn hàng chưa hoàn tất.";
          }

          throw new Error(errorMessage);
        }

        return fetch(`${apiUrl}/api/Branch/get-all`);
      })
      .then((response) => response.json())
      .then((updatedBranches) => {
        setBranches(updatedBranches);
        setOperationSuccess("Chi nhánh đã được vô hiệu hóa thành công!");
      })
      .catch((error) => {
        setOperationError(error.message);
      });
  };

  // Fetch branches on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [branchesData, statusData] = await Promise.all([
          fetchBranches(),
          fetchStatusList(),
        ]);
        setBranches(branchesData);
        setStatusList(statusData);
        setError(null);
      } catch (error) {
        setError("Đã có lỗi xảy ra khi tải dữ liệu.");
        setOperationError("Đã có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const checkDuplicateBranchName = (branchName, currentId = null) => {
    // Nếu đang edit, bỏ qua chính bản ghi đang được edit
    const existingBranch = branches.find(
      (branch) =>
        branch.branchName.toLowerCase() === branchName.toLowerCase() &&
        branch.branchId !== currentId
    );

    if (existingBranch) {
      setDuplicateError(`Tên chi nhánh "${branchName}" đã tồn tại`);
      return true;
    }

    setDuplicateError("");
    return false;
  };

  // Search functionality
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredBranches = branches.filter(
    (branch) =>
      branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Modal handlers
  const openModal = (action, branch = null) => {
    setModalAction(action);
    setModalError("");

    const initialBranchData = branch || {
      branchName: "",
      address: "",
      phoneNumber: "",
      email: "",
      openingHours: "",
      status: "Mở Cửa", // Luôn đặt "Mở Cửa" khi thêm mới
      notes: "",
      image: null,
      existingImage: branch?.image || "",
    };

    setCurrentBranch(initialBranchData);
    setDuplicateError("");
    setPhoneError("");
    setEmailError("");
    setImageError(""); // Reset image error
    setImagePreview(branch?.image || null); // Set image preview with existing image if available
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentBranch({});
    setImagePreview(null);
    setModalError("");
  };

  const openDisableModal = (branchId) => {
    setDisableBranchId(branchId);
    setDisableModalVisible(true);
  };

  const closeDisableModal = () => {
    setDisableModalVisible(false);
    setDisableBranchId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
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
        e.target.value = null;
        return;
      }

      setImageError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setCurrentBranch({
        ...currentBranch,
        image: file,
      });
    } else {
      setCurrentBranch({
        ...currentBranch,
        [name]: value,
      });
      if (name === "branchName") {
        checkDuplicateBranchName(value, currentBranch.branchId || null);
      }
      if (name === "phoneNumber") {
        validatePhoneNumber(value);
      }
      if (name === "email") {
        validateEmail(value);
      }
    }
  };

  // Clear image preview and selected file
  const handleClearImage = () => {
    setImagePreview(null);
    setCurrentBranch({
      ...currentBranch,
      image: null,
      existingImage: null,
    });
    const fileInput = document.getElementById("image");
    if (fileInput) fileInput.value = "";
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
      setPhoneError("");
      return true;
    }

    if (!/^\d{10,11}$/.test(phoneNumber)) {
      setPhoneError("Số điện thoại phải có 10-11 chữ số");
      return false;
    }

    setPhoneError("");
    return true;
  };

  // Hàm kiểm tra email
  const validateEmail = (email) => {
    if (!email) {
      setEmailError("");
      return true;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email không hợp lệ");
      return false;
    }

    setEmailError("");
    return true;
  };

  const validateForm = () => {
    if (!currentBranch.branchName) {
      setOperationError("Tên chi nhánh và trạng thái là bắt buộc.");
      return false;
    }

    if (
      checkDuplicateBranchName(currentBranch.branchName, currentBranch.branchId)
    ) {
      return false;
    }

    if (
      currentBranch.phoneNumber &&
      !validatePhoneNumber(currentBranch.phoneNumber)
    ) {
      return false;
    }

    if (currentBranch.email && !validateEmail(currentBranch.email)) {
      return false;
    }

    if (imageError) {
      return false;
    }

    if (!statusList.includes(currentBranch.status)) {
      setOperationError("Trạng thái không hợp lệ. Vui lòng chọn từ danh sách.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("branchName", currentBranch.branchName);
    formData.append("address", currentBranch.address || "");
    formData.append("phoneNumber", currentBranch.phoneNumber || "");
    formData.append("email", currentBranch.email || "");
    formData.append("openingHours", currentBranch.openingHours || "");
    formData.append("status", currentBranch.status);
    formData.append("notes", currentBranch.notes || "");

    if (currentBranch.image instanceof File) {
      formData.append("image", currentBranch.image);
    }

    try {
      if (modalAction === "add") {
        await addBranch(formData);
        setOperationSuccess("Thêm chi nhánh thành công!");
      } else if (modalAction === "edit" && currentBranch) {
        const originalBranch = branches.find(
          (b) => b.branchId === currentBranch.branchId
        );

        const isChanged =
          currentBranch.branchName !== originalBranch.branchName ||
          currentBranch.address !== originalBranch.address ||
          currentBranch.phoneNumber !== originalBranch.phoneNumber ||
          currentBranch.email !== originalBranch.email ||
          currentBranch.openingHours !== originalBranch.openingHours ||
          currentBranch.status !== originalBranch.status ||
          currentBranch.notes !== originalBranch.notes ||
          currentBranch.image instanceof File; // chỉ cần chọn ảnh mới đã là thay đổi

        if (!isChanged) {
          setModalError("Không có sự thay đổi nào để cập nhật.");
          return;
        }

        await updateBranch(currentBranch.branchId, formData);
        setOperationSuccess("Cập nhật chi nhánh thành công!");
      }

      closeModal();
    } catch (error) {
      setOperationError("Đã có lỗi xảy ra khi lưu chi nhánh.");
    }
  };

  const handleDisableBranch = async () => {
    try {
      await disableBranch(disableBranchId);
      closeDisableModal();
    } catch (error) {
      closeDisableModal(); // Đóng modal trong mọi trường hợp
    }
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBranches.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredBranches.length / recordsPerPage);

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

  // Jump to page handler
  const [jumpToPage, setJumpToPage] = useState("");

  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPage);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      paginate(pageNumber);
      setJumpToPage("");
    } else {
      setOperationError(`Vui lòng nhập số trang từ 1 đến ${totalPages}`);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "Mở Cửa":
        return "active";
      case "Không hoạt động":
        return "inactive";
      case "Quá tải":
        return "overloaded";
      default:
        return status.toLowerCase().replace(/\s+/g, "");
    }
  };

  // Render
  return (
    <div>
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />
        <div className="manage-branches-container">
          <h2>Quản Lý Chi Nhánh Giặt Là</h2>
          {operationSuccess && (
            <div className="manage-branches-success-message">
              {operationSuccess}
              <button onClick={() => setOperationSuccess("")}>
                <FaTimes />
              </button>
            </div>
          )}

          {operationError && (
            <div className="manage-branches-error-message">
              {operationError}
              <button onClick={() => setOperationError("")}>
                <FaTimes />
              </button>
            </div>
          )}

          <div className="manage-branches-header">
            <button
              className="manage-branches-add-btn"
              onClick={() => openModal("add")}
            >
              <FaPlus /> Thêm Chi Nhánh
            </button>

            <div className="manage-branches-search">
              <FaSearch className="manage-branches-search-icon" />
              <input
                type="text"
                className="manage-branches-search-input"
                placeholder="Tìm kiếm theo tên, địa chỉ, trạng thái..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {searchQuery && (
                <FaTimes
                  className="manage-branches-clear-search-icon"
                  onClick={() => setSearchQuery("")}
                />
              )}
            </div>
          </div>

          {loading ? (
            <div className="manage-branches-loading-container">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="manage-branches-error-container">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          ) : branches.length === 0 ? (
            <div className="manage-branches-empty-state">
              <p>Chưa có chi nhánh nào. Hãy thêm chi nhánh mới!</p>
            </div>
          ) : (
            <>
              <div className="manage-branches-table-container">
                <table className="manage-branches-table">
                  <thead>
                    <tr>
                      <th>Tên Chi Nhánh</th>
                      <th>Địa Chỉ</th>
                      <th>Số Điện Thoại</th>
                      <th>Email</th>
                      <th>Trạng Thái</th>
                      <th>Trạng Thái Vô Hiệu</th>
                      <th>Hình Ảnh</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length > 0 ? (
                      currentRecords.map((branch) => {
                        const uniqueKey = `${branch.branchId}-${branch.branchName}`;
                        return (
                          <tr key={uniqueKey}>
                            <td>{branch.branchName}</td>
                            <td>{branch.address || "--"}</td>
                            <td>{branch.phoneNumber || "--"}</td>
                            <td>{branch.email || "--"}</td>
                            <td>
                              <span
                                className={`manage-branches-status-badge ${getStatusColorClass(
                                  branch.status
                                )}`}
                              >
                                {branch.status}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`manage-branches-status-badge ${
                                  branch.statusDelete === false
                                    ? "disabled"
                                    : "active"
                                }`}
                              >
                                {branch.statusDelete === false
                                  ? "Vô hiệu"
                                  : "Hoạt động"}
                              </span>
                            </td>
                            <td>
                              {branch.image ? (
                                <img
                                  src={branch.image}
                                  alt={branch.branchName}
                                  className="manage-branches-branch-image"
                                />
                              ) : (
                                <span className="manage-branches-no-image">
                                  Không có ảnh
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="manage-branches-actions">
                                <button
                                  className="manage-branches-view-btn"
                                  onClick={() => openModal("edit", branch)}
                                  title="Sửa chi nhánh"
                                  disabled={branch.statusDelete === false}
                                >
                                  <FaEdit /> Sửa
                                </button>
                                <button
                                  className="manage-branches-disable-btn"
                                  onClick={() =>
                                    openDisableModal(branch.branchId)
                                  }
                                  title="Vô hiệu hóa chi nhánh"
                                  disabled={branch.statusDelete === false}
                                >
                                  <FaBan /> Vô hiệu
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="manage-branches-no-results">
                          Không tìm thấy chi nhánh nào phù hợp với tìm kiếm
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredBranches.length > 0 && (
                <div className="manage-branches-pagination-controls">
                  <div className="manage-branches-pagination-info">
                    <span>
                      Hiển thị {indexOfFirstRecord + 1} -{" "}
                      {Math.min(indexOfLastRecord, filteredBranches.length)} của{" "}
                      {filteredBranches.length} chi nhánh
                    </span>
                    <div className="manage-branches-records-per-page">
                      <label htmlFor="recordsPerPage">Hiển thị:</label>
                      <select
                        id="recordsPerPage"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                        className="manage-branches-select"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                      </select>
                    </div>
                  </div>

                  <div className="manage-branches-pagination">
                    <button
                      className="manage-branches-pagination-btn"
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                      title="Trang đầu"
                    >
                      <FaAngleDoubleLeft />
                    </button>
                    <button
                      className="manage-branches-pagination-btn"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      <FaArrowLeft />
                    </button>

                    <div className="manage-branches-pagination-numbers">
                      {startPage > 1 && (
                        <>
                          <button
                            onClick={() => paginate(1)}
                            className="manage-branches-pagination-number"
                          >
                            1
                          </button>
                          {startPage > 2 && (
                            <span className="manage-branches-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                        </>
                      )}

                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`manage-branches-pagination-number ${
                            currentPage === number ? "active" : ""
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && (
                            <span className="manage-branches-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                          <button
                            onClick={() => paginate(totalPages)}
                            className="manage-branches-pagination-number"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      className="manage-branches-pagination-btn"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      title="Trang sau"
                    >
                      <FaArrowRight />
                    </button>
                    <button
                      className="manage-branches-pagination-btn"
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Trang cuối"
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>

                  <div className="manage-branches-jump-to-page">
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
                      className="manage-branches-jump-input"
                    />
                    <button
                      onClick={handleJumpToPage}
                      className="manage-branches-jump-btn"
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

        {/* Modal for Add/Edit */}
        {modalVisible && (
          <div className="manage-branches-modal show">
            <div className="manage-branches-modal-content">
              <div className="manage-branches-modal-header">
                <h3>
                  {modalAction === "add"
                    ? "Thêm Chi Nhánh Mới"
                    : "Sửa Chi Nhánh"}
                </h3>
                <button
                  className="manage-branches-close-modal-btn"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="manage-branches-modal-inputs">
                {/* Keep the existing code for currentBranch.existingImage */}
                {currentBranch.existingImage && !imagePreview && (
                  <div className="manage-branches-current-image-container">
                    <h4>Ảnh hiện tại:</h4>
                    <img
                      src={currentBranch.existingImage}
                      alt="Current Branch"
                      className="manage-branches-current-branch-image"
                    />
                  </div>
                )}

                <div className="manage-branches-form-group">
                  <label htmlFor="branchName">
                    Tên Chi Nhánh{" "}
                    <span className="manage-branches-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="branchName"
                    name="branchName"
                    placeholder="Nhập tên chi nhánh"
                    value={currentBranch.branchName || ""}
                    onChange={handleInputChange}
                    required
                  />
                  {duplicateError && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "5px",
                      }}
                    >
                      {duplicateError}
                    </div>
                  )}
                </div>

                <div className="manage-branches-form-group">
                  <label htmlFor="address">Địa Chỉ</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Nhập địa chỉ chi nhánh"
                    value={currentBranch.address || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="manage-branches-form-group">
                  <label htmlFor="phoneNumber">Số Điện Thoại</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="Nhập số điện thoại"
                    value={currentBranch.phoneNumber || ""}
                    onChange={handleInputChange}
                  />
                  {phoneError && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "5px",
                      }}
                    >
                      {phoneError}
                    </div>
                  )}
                </div>

                <div className="manage-branches-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Nhập email"
                    value={currentBranch.email || ""}
                    onChange={handleInputChange}
                  />
                  {emailError && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "5px",
                      }}
                    >
                      {emailError}
                    </div>
                  )}
                </div>

                <div className="manage-branches-form-group">
                  <label htmlFor="openingHours">Giờ Mở Cửa</label>
                  <input
                    type="text"
                    id="openingHours"
                    name="openingHours"
                    placeholder="Ví dụ: 8:00 - 20:00"
                    value={currentBranch.openingHours || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="manage-branches-form-group">
                  <label htmlFor="status">
                    Trạng Thái{" "}
                    <span className="manage-branches-required">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={currentBranch.status || "Mở Cửa"}
                    onChange={handleInputChange}
                    required
                    disabled={modalAction === "add"} //
                  >
                    {modalAction === "add" ? (
                      <option value="Mở Cửa">Mở Cửa</option>
                    ) : (
                      statusList.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="manage-branches-form-group">
                  <label htmlFor="notes">Ghi Chú</label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Nhập ghi chú (nếu có)"
                    value={currentBranch.notes || ""}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="manage-branches-form-group">
                  <label htmlFor="image">Hình Ảnh Chi Nhánh</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  <small className="manage-branches-file-help">
                    Chọn hình ảnh đại diện cho chi nhánh (định dạng: JPG, PNG,
                    GIF, SVG, WEBP)
                  </small>
                  {imageError && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "5px",
                      }}
                    >
                      {imageError}
                    </div>
                  )}
                  {imagePreview && (
                    <div className="manage-branches-image-preview-container">
                      <div className="manage-branches-image-preview">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="manage-branches-preview-image"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {modalError && (
                  <div className="manage-branches-error-message">
                    {modalError}
                    <button onClick={() => setModalError("")}>
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>

              <div className="manage-branches-modal-footer">
                <button
                  className="manage-branches-cancel-btn"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  className="manage-branches-save-btn"
                  onClick={handleSave}
                  disabled={
                    !!duplicateError ||
                    !!phoneError ||
                    !!emailError ||
                    !!imageError
                  }
                >
                  {modalAction === "add" ? "Thêm Chi Nhánh" : "Cập Nhật"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Disable Confirmation */}
        {disableModalVisible && (
          <div className="manage-branches-modal show">
            <div className="manage-branches-modal-content manage-branches-confirm-modal">
              <div className="manage-branches-modal-header">
                <h3>Xác Nhận Vô Hiệu Hóa</h3>
                <button
                  className="manage-branches-close-modal-btn"
                  onClick={closeDisableModal}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="manage-branches-modal-body">
                <p>
                  Bạn có chắc chắn muốn vô hiệu hóa chi nhánh này không? Chi
                  nhánh sẽ không còn hiển thị cho người dùng sau khi vô hiệu
                  hóa.
                </p>
              </div>
              <div className="manage-branches-modal-footer">
                <button
                  className="manage-branches-cancel-btn"
                  onClick={closeDisableModal}
                >
                  Hủy
                </button>
                <button
                  className="manage-branches-confirm-btn"
                  onClick={handleDisableBranch}
                >
                  Vô Hiệu Hóa
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default Manage_Branches;
