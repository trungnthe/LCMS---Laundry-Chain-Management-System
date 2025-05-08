import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_timekeeping.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
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
  FaMoneyBillWave,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
const apiUrl = import.meta.env.VITE_API_URL;

// Hàm lấy token từ localStorage
const getToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error(
      "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
    );
    return null;
  }

  const decodedToken = jwtDecode(token);

  return token;
};

const formatCurrency = (number) => {
  return number.toLocaleString("vi-VN");
};

const SalaryModal = ({ type, data, onSave, onClose }) => {
  const [salaryData, setSalaryData] = useState(data || {});
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSalaryData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = () => {
    if (
      !salaryData.baseSalary ||
      !salaryData.allowance ||
      !salaryData.overtimeRate ||
      !salaryData.standardHoursPerMonth
    ) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const salaryDataToSave = {
      ...salaryData,
      employeeRoleId: data.employeeRoleId,
    };
    onSave(salaryDataToSave);
  };

  return (
    <div className="manage-time-keeping-modal show">
      <div className="manage-time-keeping-modal-content">
        <div className="manage-time-keeping-modal-header">
          <h3>Chỉnh Sửa Bảng Lương</h3>
          <button
            className="manage-time-keeping-close-modal-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className="manage-time-keeping-modal-body">
          <div className="manage-time-keeping-form-group">
            <label>Lương Cơ Bản:</label>
            <input
              type="number"
              name="baseSalary"
              className="manage-time-keeping-input"
              placeholder="Lương cơ bản"
              value={salaryData.baseSalary || ""}
              onChange={handleChange}
            />
          </div>
          <div className="manage-time-keeping-form-group">
            <label>Tiền Thưởng:</label>
            <input
              type="number"
              name="allowance"
              className="manage-time-keeping-input"
              placeholder="Tiền thưởng"
              value={salaryData.allowance || ""}
              onChange={handleChange}
            />
          </div>
          <div className="manage-time-keeping-form-group">
            <label>Tỷ Lệ Làm Thêm Giờ:</label>
            <input
              type="number"
              name="overtimeRate"
              className="manage-time-keeping-input"
              placeholder="Tỷ lệ làm thêm giờ"
              value={salaryData.overtimeRate || ""}
              onChange={handleChange}
            />
          </div>
          <div className="manage-time-keeping-form-group">
            <label>Giờ Làm Tiêu Chuẩn Trong Tháng:</label>
            <input
              type="number"
              name="standardHoursPerMonth"
              className="manage-time-keeping-input"
              placeholder="Giờ làm tiêu chuẩn trong tháng"
              value={salaryData.standardHoursPerMonth || ""}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="manage-time-keeping-error">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="manage-time-keeping-modal-actions">
          <button
            className="manage-time-keeping-modal-save-btn"
            onClick={handleSubmit}
          >
            Lưu
          </button>
          <button
            className="manage-time-keeping-modal-close-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Timekeeping = () => {
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentSalary, setCurrentSalary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("employeeRoleName");
  const [jumpToPage, setJumpToPage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalSalaryStructures, setTotalSalaryStructures] = useState(0);

  useEffect(() => {
    fetchSalaryStructures();
  }, []);

  const fetchSalaryStructures = async () => {
    const token = getToken();

    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/SalaryStructure/get-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const salaryStructuresWithEmployeeRoleId = data.map((structure) => ({
        ...structure,
        employeeRoleId: structure.employeeRoleId,
      }));
      setSalaryStructures(salaryStructuresWithEmployeeRoleId);
      setTotalSalaryStructures(salaryStructuresWithEmployeeRoleId.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching salary structures:", error);
      setErrorMessage(
        "Không thể tải dữ liệu bảng lương. Vui lòng thử lại sau."
      );
      setLoading(false);
    }
  };

  const handleEditSalary = (updatedSalary) => {
    if (!updatedSalary.employeeRoleId) {
      toast.error("Không tìm thấy ID bảng lương.");
      return;
    }

    const token = getToken();

    if (!token) return;

    fetch(
      `${apiUrl}/api/SalaryStructure/update-salary/${updatedSalary.employeeRoleId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedSalary),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update salary");
        }
        return response.text().then((text) => {
          return text ? JSON.parse(text) : {};
        });
      })
      .then(() => {
        fetchSalaryStructures();
        toast.success("Cập nhật bảng lương thành công!");
        setShowModal(false);
      })
      .catch((error) => {
        toast.error("Cập nhật bảng lương thất bại!");
        console.error("Update failed:", error);
      });
  };

  const handleSaveSalary = (salaryData) => {
    handleEditSalary(salaryData);
  };

  const handleEditSalaryClick = (salary) => {
    setModalType("edit");
    setCurrentSalary(salary);
    setShowModal(true);
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
      toast.error(`Vui lòng nhập số trang từ 1 đến ${totalPages}`);
    }
  };

  const filteredData = salaryStructures.filter((salary) => {
    return salary.employeeRoleName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "employeeRoleName") {
      return sortOrder === "asc"
        ? a.employeeRoleName.localeCompare(b.employeeRoleName)
        : b.employeeRoleName.localeCompare(a.employeeRoleName);
    } else if (sortField === "baseSalary") {
      return sortOrder === "asc"
        ? a.baseSalary - b.baseSalary
        : b.baseSalary - a.baseSalary;
    } else if (sortField === "allowance") {
      return sortOrder === "asc"
        ? a.allowance - b.allowance
        : b.allowance - a.allowance;
    } else if (sortField === "overtimeRate") {
      return sortOrder === "asc"
        ? a.overtimeRate - b.overtimeRate
        : b.overtimeRate - a.overtimeRate;
    } else if (sortField === "standardHoursPerMonth") {
      return sortOrder === "asc"
        ? a.standardHoursPerMonth - b.standardHoursPerMonth
        : b.standardHoursPerMonth - a.standardHoursPerMonth;
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
    <div className="manage-time-keeping-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-time-keeping">
          <h2>Quản Lý Bảng Lương</h2>

          <div className="manage-time-keeping-header">
            <div className="manage-time-keeping-search">
              <div className="manage-time-keeping-search-input-container">
                <FaSearch className="manage-time-keeping-search-icon" />
                <input
                  type="text"
                  className="manage-time-keeping-search-input"
                  placeholder="Tìm kiếm theo tên chức vụ..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm && (
                  <FaTimes
                    className="manage-time-keeping-clear-search-icon"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="manage-time-keeping-controls">
            <div className="manage-time-keeping-total">
              <FaMoneyBillWave /> Tổng số bảng lương: {totalSalaryStructures}
            </div>

            <div className="manage-time-keeping-sort-controls">
              <button
                className={`manage-time-keeping-sort-btn ${
                  sortField === "employeeRoleName" ? "active" : ""
                }`}
                onClick={() => handleSort("employeeRoleName")}
              >
                Sắp xếp theo tên{" "}
                {sortField === "employeeRoleName" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-time-keeping-sort-btn ${
                  sortField === "baseSalary" ? "active" : ""
                }`}
                onClick={() => handleSort("baseSalary")}
              >
                Sắp xếp theo lương cơ bản{" "}
                {sortField === "baseSalary" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-time-keeping-sort-btn ${
                  sortField === "allowance" ? "active" : ""
                }`}
                onClick={() => handleSort("allowance")}
              >
                Sắp xếp theo tiền thưởng{" "}
                {sortField === "allowance" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="manage-time-keeping-loading-container">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : errorMessage ? (
            <div className="manage-time-keeping-error-container">
              <p>{errorMessage}</p>
              <button
                className="manage-time-keeping-reload-btn"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="manage-time-keeping-table-container">
                <table className="manage-time-keeping-table">
                  <thead>
                    <tr>
                      <th>Tên Chức Vụ</th>
                      <th>Lương Cơ Bản</th>
                      <th>Tiền Thưởng</th>
                      <th>Tỷ Lệ Làm Thêm Giờ</th>
                      <th>Giờ Làm Tiêu Chuẩn</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="manage-time-keeping-no-data">
                          {searchTerm
                            ? "Không tìm thấy bảng lương nào phù hợp với tìm kiếm"
                            : "Không có bảng lương nào."}
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((salary) => (
                        <tr key={salary.employeeRoleId}>
                          <td>{salary.employeeRoleName}</td>
                          <td>{formatCurrency(salary.baseSalary)} VND</td>
                          <td>{formatCurrency(salary.allowance)} VND</td>
                          <td>{salary.overtimeRate}</td>
                          <td>{salary.standardHoursPerMonth} giờ</td>
                          <td>
                            <div className="manage-time-keeping-actions">
                              <button
                                className="manage-time-keeping-edit-btn"
                                onClick={() => handleEditSalaryClick(salary)}
                                title="Chỉnh sửa bảng lương"
                              >
                                <FaEdit /> Sửa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filteredData.length > 0 && (
                <div className="manage-time-keeping-pagination-controls">
                  <div className="manage-time-keeping-pagination-info">
                    <span>
                      Hiển thị {indexOfFirstRecord + 1} -{" "}
                      {Math.min(indexOfLastRecord, filteredData.length)} của{" "}
                      {filteredData.length} bảng lương
                    </span>
                    <div className="manage-time-keeping-records-per-page">
                      <label htmlFor="recordsPerPage">Hiển thị:</label>
                      <select
                        id="recordsPerPage"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                        className="manage-time-keeping-select"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                      </select>
                    </div>
                  </div>

                  <div className="manage-time-keeping-pagination">
                    <button
                      className="manage-time-keeping-pagination-btn"
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                      title="Trang đầu"
                    >
                      <FaAngleDoubleLeft />
                    </button>
                    <button
                      className="manage-time-keeping-pagination-btn"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      <FaArrowLeft />
                    </button>

                    <div className="manage-time-keeping-pagination-numbers">
                      {startPage > 1 && (
                        <>
                          <button
                            onClick={() => paginate(1)}
                            className="manage-time-keeping-pagination-number"
                          >
                            1
                          </button>
                          {startPage > 2 && (
                            <span className="manage-time-keeping-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                        </>
                      )}

                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`manage-time-keeping-pagination-number ${
                            currentPage === number ? "active" : ""
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && (
                            <span className="manage-time-keeping-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                          <button
                            onClick={() => paginate(totalPages)}
                            className="manage-time-keeping-pagination-number"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      className="manage-time-keeping-pagination-btn"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      title="Trang sau"
                    >
                      <FaArrowRight />
                    </button>
                    <button
                      className="manage-time-keeping-pagination-btn"
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Trang cuối"
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>

                  <div className="manage-time-keeping-jump-to-page">
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
                      className="manage-time-keeping-jump-input"
                    />
                    <button
                      onClick={handleJumpToPage}
                      className="manage-time-keeping-jump-btn"
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
          <SalaryModal
            type={modalType}
            data={currentSalary}
            onSave={handleSaveSalary}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Manage_Timekeeping;
