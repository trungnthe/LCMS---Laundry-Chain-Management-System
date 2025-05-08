import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "../../assets/css/admin/manage_user.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaUserPlus,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaTrophy,
  FaSearch,
  FaTimes,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaEllipsisH,
  FaTicketAlt,
  FaCalendarAlt,
  FaExchangeAlt,
} from "react-icons/fa";

const apiUrl = import.meta.env.VITE_API_URL;

// Modal for Add/Edit User
const UserModal = ({ type, data, onSave, onClose }) => {
  const [userData, setUserData] = useState(data || {});
  const [operationError, setOperationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (
      !userData.customerName ||
      !userData.membershipLevel ||
      !userData.loyaltyPoints
    ) {
      setOperationError("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    onSave(userData);
  };

  return (
    <div className="manage-user-modal show">
      <div className="manage-user-modal-content">
        <div className="manage-user-modal-header">
          <h3>{type === "add" ? "Thêm Người Dùng Mới" : "Sửa Người Dùng"}</h3>
          <button className="manage-user-close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="manage-user-modal-inputs">
          {operationError && (
            <div className="manage-user-error-message">{operationError}</div>
          )}
          <div className="manage-user-form-group">
            <label htmlFor="customerName">
              Tên Khách Hàng <span className="manage-user-required">*</span>
            </label>
            <div className="manage-user-input-container">
              <FaUserPlus className="manage-user-input-icon" />
              <input
                type="text"
                id="customerName"
                name="customerName"
                placeholder="Tên khách hàng"
                value={userData.customerName || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="manage-user-form-group">
            <label htmlFor="membershipLevel">
              Cấp Độ Thành Viên <span className="manage-user-required">*</span>
            </label>
            <input
              type="text"
              id="membershipLevel"
              name="membershipLevel"
              placeholder="Cấp độ thành viên"
              value={userData.membershipLevel || ""}
              onChange={handleChange}
            />
          </div>
          <div className="manage-user-form-group">
            <label htmlFor="loyaltyPoints">
              Điểm Tích Lũy <span className="manage-user-required">*</span>
            </label>
            <input
              type="number"
              id="loyaltyPoints"
              name="loyaltyPoints"
              placeholder="Điểm tích lũy"
              value={userData.loyaltyPoints || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="manage-user-modal-actions">
          <button className="manage-user-modal-save-btn" onClick={handleSubmit}>
            {type === "add" ? "Thêm Người Dùng" : "Lưu Thay Đổi"}
          </button>
          <button className="manage-user-modal-close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const Manage_User = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [error, setError] = useState(null);
  const [jumpToPage, setJumpToPage] = useState("");
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

  // Monthly ticket customers state
  const [monthlyTicketCustomers, setMonthlyTicketCustomers] = useState([]);
  const [loadingMonthlyTickets, setLoadingMonthlyTickets] = useState(true);
  const [searchMonthlyTerm, setSearchMonthlyTerm] = useState("");
  const [currentMonthlyPage, setCurrentMonthlyPage] = useState(1);
  const [recordsPerMonthlyPage, setRecordsPerMonthlyPage] = useState(5);
  const [activeTab, setActiveTab] = useState("allUsers"); // New state for active tab
  const [errorMessage, setErrorMessage] = useState("");

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
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      setLoadingMonthlyTickets(false);
      setError("Token không hợp lệ hoặc không tồn tại");
      return;
    }

    const decodedToken = jwtDecode(token);

    const fetchTotalCustomers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/Customer/total-customers`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTotalCustomers(data.total || data);
      } catch (error) {
        console.error("Error fetching total customers:", error);
        setOperationError("Lỗi khi tải tổng số khách hàng");
        setError("Lỗi khi tải tổng số khách hàng");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/Customer/get-all-customer`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        setOperationError("Lỗi khi tải danh sách người dùng");
        console.error("Error fetching users:", error);
        setLoading(false);
        setError("Lỗi khi tải danh sách người dùng");
      }
    };

    // Fetch monthly ticket customers
    const fetchMonthlyTicketCustomers = async () => {
      try {
        setLoadingMonthlyTickets(true);
        const laundrySubResponse = await fetch(`${apiUrl}/api/LaundrySub`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!laundrySubResponse.ok) {
          throw new Error(
            "Lỗi khi lấy dữ liệu gói tháng: " + laundrySubResponse.statusText
          );
        }
        const laundrySubs = await laundrySubResponse.json();
        const customers = await Promise.all(
          laundrySubs.map(async (sub) => {
            const customerId = sub.customerId;
            const customerResponse = await fetch(
              `${apiUrl}/api/Customer/get-customer-byID?id=${customerId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!customerResponse.ok) {
              throw new Error(
                `Lỗi khi lấy thông tin khách hàng ID ${customerId}: ` +
                  customerResponse.statusText
              );
            }
            const customerData = await customerResponse.json();
            return {
              subscription: sub,
              customer: customerData,
            };
          })
        );
        setMonthlyTicketCustomers(customers);
        setLoadingMonthlyTickets(false);
      } catch (error) {
        setErrorMessage(
          "Lỗi khi lấy dữ liệu khách hàng dùng gói tháng: " + error.message
        );
        console.error("Lỗi khi lấy dữ liệu khách hàng dùng gói tháng:", error);
        setLoadingMonthlyTickets(false);
      }
    };

    fetchTotalCustomers();
    fetchUsers();
    fetchMonthlyTicketCustomers();
  }, []);

  const openModal = (type, user = null) => {
    setCurrentUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(null);
  };

  const addUser = (newUser) => {
    setUsers([...users, { ...newUser, accountId: users.length + 1 }]);
    setShowModal(false);
    setOperation({ status: "success", message: "Thêm người dùng thành công!" });
  };

  const changeUserStatus = async (accountId, newStatus) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOperationError("Token không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    const decodedToken = jwtDecode(token);
    if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
      localStorage.removeItem("token");
      setOperationError("Token hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/Customer/update-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: accountId,
          newStatus: newStatus,
        }),
      });

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.accountId === accountId ? { ...user, status: newStatus } : user
          )
        );
        setOperation({
          status: "success",
          message: `Trạng thái đã được cập nhật thành ${newStatus}`,
        });
      } else {
        const data = await response.json();
        setOperationError(
          data.message || "Lỗi khi thay đổi trạng thái tài khoản"
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setOperationError("Lỗi khi cập nhật trạng thái tài khoản");
    }
  };

  // Sort functions
  const sortUsers = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    const sortedUsers = [...users].sort((a, b) => {
      if (newSortOrder === "asc")
        return a.customerName.localeCompare(b.customerName);
      return b.customerName.localeCompare(a.customerName);
    });
    setUsers(sortedUsers);
  };

  // Search functions
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleMonthlySearch = (e) => {
    setSearchMonthlyTerm(e.target.value);
    setCurrentMonthlyPage(1);
  };

  // Pagination handlers
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleRecordsPerMonthlyPageChange = (e) => {
    setRecordsPerMonthlyPage(parseInt(e.target.value));
    setCurrentMonthlyPage(1);
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

  // Tab switching
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  // Filtering for all users
  const filteredUsers = users.filter(
    (user) =>
      user.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtering for monthly ticket customers
  const filteredMonthlyTicketCustomers = monthlyTicketCustomers.filter(
    (item) =>
      item.customer?.customerName
        ?.toLowerCase()
        .includes(searchMonthlyTerm.toLowerCase()) ||
      item.customer?.email
        ?.toLowerCase()
        .includes(searchMonthlyTerm.toLowerCase()) ||
      item.customer?.phoneNumber
        ?.toLowerCase()
        .includes(searchMonthlyTerm.toLowerCase()) ||
      item.subscription?.packageName
        ?.toLowerCase()
        .includes(searchMonthlyTerm.toLowerCase()) ||
      item.subscription?.status
        ?.toLowerCase()
        .includes(searchMonthlyTerm.toLowerCase())
  );

  // Pagination for all users
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUsers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  // Pagination for monthly ticket customers
  const indexOfLastMonthlyRecord = currentMonthlyPage * recordsPerMonthlyPage;
  const indexOfFirstMonthlyRecord =
    indexOfLastMonthlyRecord - recordsPerMonthlyPage;
  const sortedMonthlyTicketCustomers = [...filteredMonthlyTicketCustomers].sort(
    (a, b) => {
      const statusA =
        a.subscription?.status?.toLowerCase() === "active" ? 0 : 1;
      const statusB =
        b.subscription?.status?.toLowerCase() === "active" ? 0 : 1;
      return statusA - statusB;
    }
  );

  const currentMonthlyRecords = sortedMonthlyTicketCustomers.slice(
    indexOfFirstMonthlyRecord,
    indexOfLastMonthlyRecord
  );

  const totalMonthlyPages = Math.ceil(
    filteredMonthlyTicketCustomers.length / recordsPerMonthlyPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const paginateMonthly = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalMonthlyPages) {
      setCurrentMonthlyPage(pageNumber);
    }
  };

  const getPageNumbers = (currentPage, totalPages) => {
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

  const { pageNumbers, startPage, endPage } = getPageNumbers(
    currentPage,
    totalPages
  );
  const {
    pageNumbers: monthlyPageNumbers,
    startPage: monthlyStartPage,
    endPage: monthlyEndPage,
  } = getPageNumbers(currentMonthlyPage, totalMonthlyPages);

  // Format date functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="manage-user-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />

        <div className="manage-user">
          <h2>Quản Lý Người Dùng</h2>

          <div className="manage-user-form-container">
            {operation.status === "success" && (
              <div className="manage-user-success-message">
                {operation.message}
              </div>
            )}
            {operationError && (
              <div className="manage-user-error-message">{operationError}</div>
            )}
            {errorMessage && (
              <div className="manage-user-error-message">{errorMessage}</div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="manage-user-tabs">
            <button
              className={`manage-user-tab ${
                activeTab === "allUsers" ? "active" : ""
              }`}
              onClick={() => switchTab("allUsers")}
            >
              <FaUserPlus /> Tất cả người dùng
            </button>
            <button
              className={`manage-user-tab ${
                activeTab === "monthlyTickets" ? "active" : ""
              }`}
              onClick={() => switchTab("monthlyTickets")}
            >
              <FaTicketAlt /> Người dùng gói tháng
            </button>
          </div>

          {/* All Users Tab */}
          {activeTab === "allUsers" && (
            <div className="manage-user-tab-content">
              <div className="manage-user-header">
                <div className="manage-user-search">
                  <FaSearch className="manage-user-search-icon" />
                  <input
                    type="text"
                    className="manage-user-search-input"
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  {searchTerm && (
                    <FaTimes
                      className="manage-user-clear-search-icon"
                      onClick={() => setSearchTerm("")}
                    />
                  )}
                </div>
              </div>

              <div className="manage-user-controls">
                <div className="manage-user-total-customers">
                  <FaTrophy /> Tổng số khách hàng booking: {totalCustomers}
                </div>

                <button className="manage-user-sort-btn" onClick={sortUsers}>
                  {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />} Sắp
                  xếp theo tên
                </button>
              </div>

              {loading ? (
                <div className="manage-user-loading-container">
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <div className="manage-user-error-container">
                  <p>{error}</p>
                  <button
                    className="manage-user-reload-btn"
                    onClick={() => window.location.reload()}
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <>
                  <div className="manage-user-table-container">
                    <table className="manage-user-table">
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Tên</th>
                          <th>Email</th>
                          <th>Số điện thoại</th>
                          <th>Cấp độ</th>
                          <th>Điểm tích lũy</th>
                          <th>Tổng chi tiêu</th>
                          <th>Ngày tạo</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="manage-user-no-data">
                              {searchTerm
                                ? "Không tìm thấy người dùng nào phù hợp với tìm kiếm"
                                : "Không có người dùng nào."}
                            </td>
                          </tr>
                        ) : (
                          currentRecords.map((user, index) => (
                            <tr key={user.accountId}>
                              <td>{indexOfFirstRecord + index + 1}</td>
                              <td>{user.customerName}</td>
                              <td>{user.email || "--"}</td>
                              <td>{user.phoneNumber || "--"}</td>
                              <td className="membership-level-cell">
                                {user.membershipLevel ? (
                                  <span
                                    className={`membership-level-badge ${user.membershipLevel.toLowerCase()}`}
                                  >
                                    {user.membershipLevel}
                                  </span>
                                ) : (
                                  "--"
                                )}
                              </td>
                              <td>{user.loyaltyPoints || "0"}</td>
                              <td>{user.totalSpent || "0"}</td>
                              <td>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td>
                                <span
                                  className={`manage-user-status-badge ${user.status?.toLowerCase()}`}
                                >
                                  {user.status}
                                </span>
                              </td>
                              <td>
                                <div className="manage-user-actions">
                                  <select
                                    className="manage-user-status-select"
                                    value={user.status || ""}
                                    onChange={(e) =>
                                      changeUserStatus(
                                        user.accountId,
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="Active">Hoạt động</option>
                                    <option value="Blocked">Khóa</option>
                                    <option value="InActive">
                                      Chưa kích hoạt
                                    </option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filteredUsers.length > 0 && (
                    <div className="manage-user-pagination-controls">
                      <div className="manage-user-pagination-info">
                        <span>
                          Hiển thị {indexOfFirstRecord + 1} -{" "}
                          {Math.min(indexOfLastRecord, filteredUsers.length)}{" "}
                          của {filteredUsers.length} người dùng
                        </span>
                        <div className="manage-user-records-per-page">
                          <label htmlFor="recordsPerPage">Hiển thị:</label>
                          <select
                            id="recordsPerPage"
                            value={recordsPerPage}
                            onChange={handleRecordsPerPageChange}
                            className="manage-user-select"
                          >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                          </select>
                        </div>
                      </div>

                      <div className="manage-user-pagination">
                        <button
                          className="manage-user-pagination-btn"
                          onClick={() => paginate(1)}
                          disabled={currentPage === 1}
                          title="Trang đầu"
                        >
                          <FaAngleDoubleLeft />
                        </button>
                        <button
                          className="manage-user-pagination-btn"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          title="Trang trước"
                        >
                          <FaArrowLeft />
                        </button>

                        <div className="manage-user-pagination-numbers">
                          {startPage > 1 && (
                            <>
                              <button
                                onClick={() => paginate(1)}
                                className="manage-user-pagination-number"
                              >
                                1
                              </button>
                              {startPage > 2 && (
                                <span className="manage-user-pagination-ellipsis">
                                  <FaEllipsisH />
                                </span>
                              )}
                            </>
                          )}

                          {pageNumbers.map((number) => (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`manage-user-pagination-number ${
                                currentPage === number ? "active" : ""
                              }`}
                            >
                              {number}
                            </button>
                          ))}

                          {endPage < totalPages && (
                            <>
                              {endPage < totalPages - 1 && (
                                <span className="manage-user-pagination-ellipsis">
                                  <FaEllipsisH />
                                </span>
                              )}
                              <button
                                onClick={() => paginate(totalPages)}
                                className="manage-user-pagination-number"
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          className="manage-user-pagination-btn"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          title="Trang sau"
                        >
                          <FaArrowRight />
                        </button>
                        <button
                          className="manage-user-pagination-btn"
                          onClick={() => paginate(totalPages)}
                          disabled={currentPage === totalPages}
                          title="Trang cuối"
                        >
                          <FaAngleDoubleRight />
                        </button>
                      </div>

                      <div className="manage-user-jump-to-page">
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
                          className="manage-user-jump-input"
                        />
                        <button
                          onClick={handleJumpToPage}
                          className="manage-user-jump-btn"
                        >
                          Đi
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Monthly Ticket Users Tab */}
          {activeTab === "monthlyTickets" && (
            <div className="manage-user-tab-content">
              <div className="manage-user-header">
                <div className="manage-user-search">
                  <FaSearch className="manage-user-search-icon" />
                  <input
                    type="text"
                    className="manage-user-search-input"
                    placeholder="Tìm kiếm theo tên, email, gói tháng..."
                    value={searchMonthlyTerm}
                    onChange={handleMonthlySearch}
                  />
                  {searchMonthlyTerm && (
                    <FaTimes
                      className="manage-user-clear-search-icon"
                      onClick={() => setSearchMonthlyTerm("")}
                    />
                  )}
                </div>
              </div>

              <div className="manage-user-controls">
                <div className="manage-user-total-customers">
                  <FaTicketAlt /> Tổng số khách hàng dùng gói tháng:{" "}
                  {monthlyTicketCustomers.length}
                </div>
              </div>

              {loadingMonthlyTickets ? (
                <div className="manage-user-loading-container">
                  <p>Đang tải dữ liệu gói tháng...</p>
                </div>
              ) : (
                <>
                  <div className="manage-user-table-container">
                    <table className="manage-user-table">
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Tên khách hàng</th>
                          <th>Email</th>
                          <th>Số điện thoại</th>
                          <th>Gói tháng</th>
                          <th>Ngày bắt đầu</th>
                          <th>Ngày kết thúc</th>
                          <th>Giá gói</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMonthlyRecords.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="manage-user-no-data">
                              {searchMonthlyTerm
                                ? "Không tìm thấy người dùng gói tháng nào phù hợp với tìm kiếm"
                                : "Không có người dùng gói tháng nào."}
                            </td>
                          </tr>
                        ) : (
                          currentMonthlyRecords.map((item, index) => (
                            <tr
                              key={`monthly-${item.subscription.laundrySubId}`}
                            >
                              <td>
                                {indexOfFirstMonthlyRecord + index + 1 || "--"}
                              </td>
                              <td>{item.customer.customerName || "--"}</td>
                              <td>{item.customer.email || "--"}</td>
                              <td>{item.customer.phoneNumber || "--"}</td>
                              <td>{item.subscription.packageName || "--"}</td>
                              <td>{formatDate(item.subscription.startDate)}</td>
                              <td>{formatDate(item.subscription.endDate)}</td>
                              <td>
                                {formatCurrency(item.subscription.price || 0)}
                              </td>
                              <td>
                                <span
                                  className={`manage-user-status-badge ${item.subscription.status?.toLowerCase()}`}
                                >
                                  {item.subscription.status || "Không xác định"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {filteredMonthlyTicketCustomers.length > 0 && (
                    <div className="manage-user-pagination-controls">
                      <div className="manage-user-pagination-info">
                        <span>
                          Hiển thị {indexOfFirstMonthlyRecord + 1} -{" "}
                          {Math.min(
                            indexOfLastMonthlyRecord,
                            filteredMonthlyTicketCustomers.length
                          )}{" "}
                          của {filteredMonthlyTicketCustomers.length} người dùng
                          gói tháng
                        </span>
                        <div className="manage-user-records-per-page">
                          <label htmlFor="recordsPerMonthlyPage">
                            Hiển thị:
                          </label>
                          <select
                            id="recordsPerMonthlyPage"
                            value={recordsPerMonthlyPage}
                            onChange={handleRecordsPerMonthlyPageChange}
                            className="manage-user-select"
                          >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                          </select>
                        </div>
                      </div>

                      <div className="manage-user-pagination">
                        <button
                          className="manage-user-pagination-btn"
                          onClick={() => paginateMonthly(1)}
                          disabled={currentMonthlyPage === 1}
                          title="Trang đầu"
                        >
                          <FaAngleDoubleLeft />
                        </button>
                        <button
                          className="manage-user-pagination-btn"
                          onClick={() =>
                            paginateMonthly(currentMonthlyPage - 1)
                          }
                          disabled={currentMonthlyPage === 1}
                          title="Trang trước"
                        >
                          <FaArrowLeft />
                        </button>

                        <div className="manage-user-pagination-numbers">
                          {monthlyStartPage > 1 && (
                            <>
                              <button
                                onClick={() => paginateMonthly(1)}
                                className="manage-user-pagination-number"
                              >
                                1
                              </button>
                              {monthlyStartPage > 2 && (
                                <span className="manage-user-pagination-ellipsis">
                                  <FaEllipsisH />
                                </span>
                              )}
                            </>
                          )}

                          {monthlyPageNumbers.map((number) => (
                            <button
                              key={number}
                              onClick={() => paginateMonthly(number)}
                              className={`manage-user-pagination-number ${
                                currentMonthlyPage === number ? "active" : ""
                              }`}
                            >
                              {number}
                            </button>
                          ))}

                          {monthlyEndPage < totalMonthlyPages && (
                            <>
                              {monthlyEndPage < totalMonthlyPages - 1 && (
                                <span className="manage-user-pagination-ellipsis">
                                  <FaEllipsisH />
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  paginateMonthly(totalMonthlyPages)
                                }
                                className="manage-user-pagination-number"
                              >
                                {totalMonthlyPages}
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          className="manage-user-pagination-btn"
                          onClick={() =>
                            paginateMonthly(currentMonthlyPage + 1)
                          }
                          disabled={currentMonthlyPage === totalMonthlyPages}
                          title="Trang sau"
                        >
                          <FaArrowRight />
                        </button>
                        <button
                          className="manage-user-pagination-btn"
                          onClick={() => paginateMonthly(totalMonthlyPages)}
                          disabled={currentMonthlyPage === totalMonthlyPages}
                          title="Trang cuối"
                        >
                          <FaAngleDoubleRight />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {showModal && (
            <UserModal
              type={currentUser ? "edit" : "add"}
              data={currentUser}
              onSave={currentUser ? updateUser : addUser}
              onClose={closeModal}
            />
          )}
          <Footer_Admin />
        </div>
      </div>
    </div>
  );
};
export default Manage_User;
