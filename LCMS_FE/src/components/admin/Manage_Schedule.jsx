import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "../../assets/css/admin/manage_schedule.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaCalendarAlt,
  FaUser,
  FaStore,
  FaMoneyBillAlt,
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
  FaClock,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useScheduleData } from "../../admin/manage_schedule";

// Modal for Schedule Details
const ScheduleDetailModal = ({ schedule, onClose }) => {
  return (
    <div className="manage-schedule-modal show">
      <div className="manage-schedule-modal-content">
        <div className="manage-schedule-modal-header">
          <h3>Chi Tiết Đặt Lịch</h3>
          <button className="manage-schedule-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-schedule-modal-body">
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              <FaUser /> Khách Hàng:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.customerName}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              <FaStore /> Chi Nhánh:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.branchName}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              <FaCalendarAlt /> Ngày Đặt:
            </span>
            <span className="manage-schedule-detail-value">
              {new Date(schedule.bookingDate).toLocaleString()}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              <FaMoneyBillAlt /> Tổng Tiền:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.totalAmount.toLocaleString()} VND
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">Trạng Thái:</span>
            <span
              className={`manage-schedule-status-badge ${schedule.status.toLowerCase()}`}
            >
              {schedule.status}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">Nhân Viên:</span>
            <span className="manage-schedule-detail-value">
              {schedule.staffName}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              Cấp Độ Thành Viên:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.membershipLevel}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">Loại Giặt Ủi:</span>
            <span className="manage-schedule-detail-value">
              {schedule.laundryType}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              Loại Giao Hàng:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.deliveryType}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              Địa Chỉ Giao Hàng:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.deliveryAddress}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              Địa Chỉ Lấy Hàng:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.pickupAddress}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              Phí Vận Chuyển:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.shippingFee.toLocaleString()} VND
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">
              Thời Gian Hoàn Thành:
            </span>
            <span className="manage-schedule-detail-value">
              {schedule.finishTime
                ? new Date(schedule.finishTime).toLocaleString()
                : "Chưa hoàn thành"}
            </span>
          </div>
          <div className="manage-schedule-detail-row">
            <span className="manage-schedule-detail-label">Ghi Chú:</span>
            <span className="manage-schedule-detail-value">
              {schedule.note || "Không có ghi chú"}
            </span>
          </div>
        </div>
        <div className="manage-schedule-modal-actions">
          <button className="manage-schedule-modal-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_Schedule = () => {
  const {
    scheduleData: initialData,
    loading,
    errorMessage,
  } = useScheduleData();
  const [scheduleData, setScheduleData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("bookingDate");
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [jumpToPage, setJumpToPage] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalBookings, setTotalBookings] = useState(0);
  const [dateFilter, setDateFilter] = useState("all");

  // Replace toast with custom notification
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
    if (initialData && initialData.length > 0) {
      setScheduleData(initialData);
      setTotalBookings(initialData.length);
    }
  }, [initialData]);

  const openModal = (schedule) => {
    setSelectedSchedule(schedule);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSchedule(null);
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

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  // Utility function to get date range for filters
  const getDateRange = (filterType) => {
    const now = new Date();
    const currentDay = now.getDay() || 7; // Convert Sunday (0) to 7 for easier calculation
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (currentDay - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(now);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    switch (filterType) {
      case "thisWeek":
        return { start: startOfWeek, end: endOfWeek };
      case "lastWeek":
        return { start: startOfLastWeek, end: endOfLastWeek };
      case "thisMonth":
        return { start: startOfMonth, end: endOfMonth };
      case "lastMonth":
        return { start: startOfLastMonth, end: endOfLastMonth };
      default:
        return null;
    }
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

  // Filter data by search term, status, and date
  const filteredData = scheduleData.filter((schedule) => {
    const matchesSearch =
      schedule.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.staffName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      schedule.status?.toLowerCase() === statusFilter.toLowerCase();

    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== "all") {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const bookingDate = new Date(schedule.bookingDate);
        matchesDate =
          bookingDate >= dateRange.start && bookingDate <= dateRange.end;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "bookingDate") {
      const dateA = new Date(a.bookingDate);
      const dateB = new Date(b.bookingDate);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "customerName") {
      return sortOrder === "asc"
        ? a.customerName.localeCompare(b.customerName)
        : b.customerName.localeCompare(a.customerName);
    } else if (sortField === "totalAmount") {
      return sortOrder === "asc"
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount;
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
    <div className="manage-schedule-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-schedule">
          <h2>Quản Lý Đặt Lịch</h2>

          {/* Notification messages */}
          {operation.status === "success" && (
            <div className="manage-schedule-success-message">
              {operation.message}
            </div>
          )}

          {operationError && (
            <div className="manage-schedule-error-message">
              {operationError}
            </div>
          )}

          <div className="manage-schedule-header">
            <div className="manage-schedule-search">
              <FaSearch className="manage-schedule-search-icon" />
              <input
                type="text"
                className="manage-schedule-search-input"
                placeholder="Tìm kiếm theo tên khách hàng, chi nhánh, nhân viên..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <FaTimes
                  className="manage-schedule-clear-search-icon"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            <div className="manage-schedule-filters-group">
              <div className="manage-schedule-filter">
                <FaFilter className="manage-schedule-filter-icon" />
                <select
                  className="manage-schedule-filter-select"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="received">Đã nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="done">Xong</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div className="manage-schedule-date-filter">
                <FaClock className="manage-schedule-date-filter-icon" />
                <select
                  className="manage-schedule-date-filter-select"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="thisWeek">Tuần này</option>
                  <option value="lastWeek">Tuần trước</option>
                  <option value="thisMonth">Tháng này</option>
                  <option value="lastMonth">Tháng trước</option>
                </select>
              </div>
            </div>
          </div>

          <div className="manage-schedule-controls">
            <div className="manage-schedule-total-bookings">
              <FaCalendarAlt /> Tổng số lịch đặt: {totalBookings} (Hiển thị:{" "}
              {filteredData.length})
            </div>

            <div className="manage-schedule-sort-controls">
              <button
                className={`manage-schedule-sort-btn ${
                  sortField === "bookingDate" ? "active" : ""
                }`}
                onClick={() => handleSort("bookingDate")}
              >
                Sắp xếp theo ngày{" "}
                {sortField === "bookingDate" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
              <button
                className={`manage-schedule-sort-btn ${
                  sortField === "totalAmount" ? "active" : ""
                }`}
                onClick={() => handleSort("totalAmount")}
              >
                Sắp xếp theo giá{" "}
                {sortField === "totalAmount" &&
                  (sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="manage-schedule-loading-container">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : errorMessage ? (
            <div className="manage-schedule-error-container">
              <p>{errorMessage}</p>
              <button
                className="manage-schedule-reload-btn"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="manage-schedule-table-container">
                <table className="manage-schedule-table">
                  <thead>
                    <tr>
                      <th>Khách Hàng</th>
                      <th>Chi Nhánh</th>
                      <th>Trạng Thái</th>
                      <th>Tổng Tiền</th>
                      <th>Ngày Đặt</th>
                      <th>Giờ Đặt</th>
                      <th>Nhân Viên</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="manage-schedule-no-data">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          dateFilter !== "all"
                            ? "Không tìm thấy lịch đặt nào phù hợp với tìm kiếm"
                            : "Không có lịch đặt nào."}
                        </td>
                      </tr>
                    ) : (
                      currentRecords.map((schedule) => (
                        <tr key={schedule.bookingId}>
                          <td>
                            <FaUser className="manage-schedule-icon" />{" "}
                            {schedule.customerName}
                          </td>
                          <td>
                            <FaStore className="manage-schedule-icon" />{" "}
                            {schedule.branchName}
                          </td>
                          <td>
                            <span
                              className={`manage-schedule-status-badge ${schedule.status.toLowerCase()}`}
                            >
                              {schedule.status}
                            </span>
                          </td>
                          <td>
                            <FaMoneyBillAlt className="manage-schedule-icon" />{" "}
                            {schedule.totalAmount.toLocaleString()} VND
                          </td>
                          <td>
                            <FaCalendarAlt className="manage-schedule-icon" />{" "}
                            {new Date(
                              schedule.bookingDate
                            ).toLocaleDateString()}
                          </td>
                          <td>
                            {schedule.bookingDate
                              ? schedule.bookingDate
                                  .split("T")[1]
                                  .substring(0, 8)
                              : "00:00:00"}
                          </td>

                          <td>{schedule.staffName || "Chưa chỉ định"}</td>
                          <td>
                            <div className="manage-schedule-actions">
                              <button
                                className="manage-schedule-view-btn"
                                onClick={() => openModal(schedule)}
                                title="Xem chi tiết"
                              >
                                Chi tiết
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
                <div className="manage-schedule-pagination-controls">
                  <div className="manage-schedule-pagination-info">
                    <span>
                      Hiển thị {indexOfFirstRecord + 1} -{" "}
                      {Math.min(indexOfLastRecord, filteredData.length)} của{" "}
                      {filteredData.length} lịch đặt
                    </span>
                    <div className="manage-schedule-records-per-page">
                      <label htmlFor="recordsPerPage">Hiển thị:</label>
                      <select
                        id="recordsPerPage"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                        className="manage-schedule-select"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                      </select>
                    </div>
                  </div>

                  <div className="manage-schedule-pagination">
                    <button
                      className="manage-schedule-pagination-btn"
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                      title="Trang đầu"
                    >
                      <FaAngleDoubleLeft />
                    </button>
                    <button
                      className="manage-schedule-pagination-btn"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      title="Trang trước"
                    >
                      <FaArrowLeft />
                    </button>

                    <div className="manage-schedule-pagination-numbers">
                      {startPage > 1 && (
                        <>
                          <button
                            onClick={() => paginate(1)}
                            className="manage-schedule-pagination-number"
                          >
                            1
                          </button>
                          {startPage > 2 && (
                            <span className="manage-schedule-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                        </>
                      )}

                      {pageNumbers.map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`manage-schedule-pagination-number ${
                            currentPage === number ? "active" : ""
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && (
                            <span className="manage-schedule-pagination-ellipsis">
                              <FaEllipsisH />
                            </span>
                          )}
                          <button
                            onClick={() => paginate(totalPages)}
                            className="manage-schedule-pagination-number"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      className="manage-schedule-pagination-btn"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      title="Trang sau"
                    >
                      <FaArrowRight />
                    </button>
                    <button
                      className="manage-schedule-pagination-btn"
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Trang cuối"
                    >
                      <FaAngleDoubleRight />
                    </button>
                  </div>

                  <div className="manage-schedule-jump-to-page">
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
                      className="manage-schedule-jump-input"
                    />
                    <button
                      onClick={handleJumpToPage}
                      className="manage-schedule-jump-btn"
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

        {showModal && selectedSchedule && (
          <ScheduleDetailModal
            schedule={selectedSchedule}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default Manage_Schedule;
