import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaRegStar,
  FaUserClock,
  FaUserTie,
  FaUser,
  FaCalendarAlt,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaMoneyBillWave,
  FaInfoCircle,
} from "react-icons/fa";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Header_Manager from "../reuse/Header_Manager";
import Sidebar_Manager from "../reuse/Sidebar_Manager";
import Footer_Manager from "../reuse/Footer_Manager";
import "../../assets/css/manager/manager_customer.css";
import { jwtDecode } from "jwt-decode";

// Set API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Manager_Customer = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [topServiceCustomers, setTopServiceCustomers] = useState([]);
  const [customersByPoints, setCustomersByPoints] = useState([]);
  const [topSpendingCustomers, setTopSpendingCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [daysFilter, setDaysFilter] = useState(30);
  const [topCount, setTopCount] = useState(5);
  const [sortAscending, setSortAscending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerStatusStats, setCustomerStatusStats] = useState({
    Active: 0,
    Inactive: 0,
  });
  const [membershipStats, setMembershipStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [currentPointsPage, setCurrentPointsPage] = useState(1);

  // Replace toast with custom notifications
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

  // Automatically clear success messages after 3 seconds
  useEffect(() => {
    if (operation.status === "success") {
      const timer = setTimeout(() => {
        setOperation({ status: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operation.status]);

  // Automatically clear error messages after 3 seconds
  useEffect(() => {
    if (operationError) {
      const timer = setTimeout(() => {
        setOperationError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [operationError]);

  const recordsPerPage = 3;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      fetchData(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      setOperationError("Lỗi xác thực. Vui lòng đăng nhập lại.");
      setLoading(false);
    }
  }, []);

  const fetchData = async (token) => {
    try {
      setLoading(true);

      // Fetch all customers
      const customersResponse = await fetch(
        `${apiUrl}/api/Customer/get-all-customer`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const customersData = await customersResponse.json();
      setCustomers(customersData);
      setSearchResults(customersData);

      // Calculate customer statistics
      const activeCustomers = customersData.filter(
        (customer) => customer.status === "Active"
      ).length;
      const inactiveCustomers = customersData.filter(
        (customer) => customer.status === "Inactive"
      ).length;

      setCustomerStatusStats({
        Active: activeCustomers,
        Inactive: inactiveCustomers,
      });

      // Calculate membership statistics
      const membershipData = {};
      customersData.forEach((customer) => {
        const level = customer.membershipLevel || "None";
        if (!membershipData[level]) {
          membershipData[level] = 1;
        } else {
          membershipData[level]++;
        }
      });
      setMembershipStats(membershipData);

      // Fetch total customers
      const totalResponse = await fetch(
        `${apiUrl}/api/Customer/total-customers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const totalData = await totalResponse.json();
      setTotalCustomers(totalData);

      // Fetch new customers (default 30 days)
      await fetchNewCustomers(daysFilter, token);

      // Fetch top service customers (default top 5)
      await fetchTopServiceCustomers(topCount, token);

      // Fetch customers sorted by points
      await fetchCustomersByPoints(sortAscending, token);

      // Fetch top spending customers
      await fetchTopSpendingCustomers(token);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setOperationError("Đã xảy ra lỗi khi tải dữ liệu.");
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentServicePage(1);
  }, [topServiceCustomers]);

  useEffect(() => {
    setCurrentPointsPage(1);
  }, [customersByPoints]);

  const fetchNewCustomers = async (days, token) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/Customer/new-customers/${days}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setNewCustomers(data.length || 0);
      return data;
    } catch (error) {
      console.error("Error fetching new customers:", error);
      setOperationError("Lỗi khi lấy dữ liệu khách hàng mới.");
      return [];
    }
  };

  const fetchTopServiceCustomers = async (count, token) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/Customer/top-service-customers/${count}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTopServiceCustomers(data);
      return data;
    } catch (error) {
      console.error("Error fetching top service customers:", error);
      setOperationError(
        "Lỗi khi lấy dữ liệu khách hàng sử dụng dịch vụ nhiều nhất."
      );
      return [];
    }
  };

  const fetchCustomersByPoints = async (ascending, token) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/Customer/sort-customers?ascending=${ascending}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCustomersByPoints(data);
      return data;
    } catch (error) {
      console.error("Error fetching customers by points:", error);
      setOperationError("Lỗi khi lấy dữ liệu khách hàng theo điểm.");
      return [];
    }
  };

  const fetchTopSpendingCustomers = async (token) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/Customer/top-spending-customers`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTopSpendingCustomers(data);
      return data;
    } catch (error) {
      console.error("Error fetching top spending customers:", error);
      setOperationError("Lỗi khi lấy dữ liệu khách hàng chi tiêu nhiều nhất.");
      return [];
    }
  };

  const fetchCustomerById = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${apiUrl}/api/Customer/get-customer-byID?id=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setSelectedCustomer(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      setOperationError("Lỗi khi lấy thông tin chi tiết khách hàng.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(customers);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${apiUrl}/api/Customer/Search-customer-byName?name=${searchTerm}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);

      if (data.length === 0) {
        setOperation({
          status: "success",
          message: "Không tìm thấy khách hàng nào.",
        });
      }
    } catch (error) {
      console.error("Error searching customers:", error);
      setOperationError("Lỗi khi tìm kiếm khách hàng.");
    }
  };

  const handleDaysFilterChange = async (e) => {
    const days = e.target.value;
    setDaysFilter(days);

    if (!days || days <= 0) {
      setOperationError("Vui lòng nhập số ngày hợp lệ.");
      return;
    }

    const token = localStorage.getItem("token");
    await fetchNewCustomers(days, token);
  };

  const handleTopCountChange = async (e) => {
    const count = e.target.value;
    setTopCount(count);

    if (!count || count <= 0) {
      setOperationError("Vui lòng nhập số lượng hợp lệ.");
      return;
    }

    const token = localStorage.getItem("token");
    await fetchTopServiceCustomers(count, token);
  };

  const handleSortToggle = async () => {
    const newSortOrder = !sortAscending;
    setSortAscending(newSortOrder);

    const token = localStorage.getItem("token");
    await fetchCustomersByPoints(newSortOrder, token);
  };

  const handleCustomerClick = (id) => {
    fetchCustomerById(id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  // Calculate indexes for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = searchResults.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(searchResults.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Chart data for customer status
  const statusChartData = {
    labels: Object.keys(customerStatusStats),
    datasets: [
      {
        label: "Trạng thái khách hàng",
        data: Object.values(customerStatusStats),
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for membership levels
  const membershipChartData = {
    labels: Object.keys(membershipStats),
    datasets: [
      {
        label: "Cấp độ thành viên",
        data: Object.values(membershipStats),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(199, 199, 199, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(199, 199, 199, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for top spending customers
  const topSpendingChartData = {
    labels: topSpendingCustomers
      .slice(0, 10)
      .map((customer) => customer.customerName),
    datasets: [
      {
        label: "Chi tiêu (VNĐ)",
        data: topSpendingCustomers
          .slice(0, 10)
          .map((customer) => customer.totalSpent),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="dashboard-manager-container">
      <Sidebar_Manager />
      <div className="dashboard-manager-main-content">
        <Header_Manager />

        <div className="manager_customer-content">
          <div className="manager_customer-header">
            <h2>Quản lý khách hàng</h2>
          </div>

          {/* Display success and error messages */}
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

          {/* Summary Cards */}
          <div className="manager_customer-stats-container">
            <div className="manager_customer-stat-card">
              <div className="manager_customer-stat-icon total">
                <FaUsers />
              </div>
              <div className="manager_customer-stat-info">
                <h3>Tổng số khách hàng</h3>
                <p>{totalCustomers}</p>
              </div>
            </div>

            <div className="manager_customer-stat-card">
              <div className="manager_customer-stat-icon new">
                <FaUserPlus />
              </div>
              <div className="manager_customer-stat-info">
                <h3>Khách hàng mới ({daysFilter} ngày)</h3>
                <p>{newCustomers}</p>
              </div>
            </div>

            <div className="manager_customer-stat-card">
              <div className="manager_customer-stat-icon active">
                <FaUser />
              </div>
              <div className="manager_customer-stat-info">
                <h3>Khách hàng hoạt động</h3>
                <p>{customerStatusStats.Active}</p>
              </div>
            </div>

            <div className="manager_customer-stat-card">
              <div className="manager_customer-stat-icon top">
                <FaMoneyBillWave />
              </div>
              <div className="manager_customer-stat-info">
                <h3>Khách hàng chi tiêu nhiều nhất</h3>
                <p>
                  {topSpendingCustomers.length > 0
                    ? topSpendingCustomers[0].customerName
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Charts and Data Sections */}
          <div className="manager_customer-data-container">
            <div className="manager_customer-row">
              <div className="manager_customer-chart-card">
                <h2>Trạng thái khách hàng</h2>
                <div className="manager_customer-chart">
                  <Doughnut
                    data={statusChartData}
                    options={chartOptions}
                    height={200}
                  />
                </div>
              </div>

              <div className="manager_customer-chart-card">
                <h2>Cấp độ thành viên</h2>
                <div className="manager_customer-chart">
                  <Doughnut
                    data={membershipChartData}
                    options={chartOptions}
                    height={200}
                  />
                </div>
              </div>
            </div>

            <div className="manager_customer-row">
              <div className="manager_customer-chart-card">
                <h2>Top 10 khách hàng chi tiêu nhiều nhất</h2>
                <div className="manager_customer-chart">
                  <Bar
                    data={topSpendingChartData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          display: true,
                          text: "Chi tiêu (VNĐ)",
                        },
                      },
                    }}
                    height={300}
                  />
                </div>
              </div>

              <div className="manager_customer-card">
                <h2>Khách hàng sử dụng dịch vụ nhiều nhất</h2>
                <div className="manager_customer-top-filter">
                  <input
                    type="number"
                    placeholder="Nhập số lượng hiển thị"
                    value={topCount}
                    onChange={handleTopCountChange}
                    className="manager_customer-input"
                  />
                  <button
                    onClick={() =>
                      fetchTopServiceCustomers(
                        topCount,
                        localStorage.getItem("token")
                      )
                    }
                    className="manager_customer-button"
                  >
                    Cập nhật
                  </button>
                </div>
                <div className="manager_customer-table-container">
                  <table className="manager_customer-table">
                    <thead>
                      <tr>
                        <th>Tên khách hàng</th>
                        <th>Cấp độ</th>
                        <th>Điểm tích lũy</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topServiceCustomers.length > 0 ? (
                        topServiceCustomers
                          .slice(
                            (currentServicePage - 1) * 3,
                            currentServicePage * 3
                          )
                          .map((customer) => (
                            <tr key={customer.accountId}>
                              <td>{customer.customerName}</td>
                              <td>{customer.membershipLevel || "Chưa có"}</td>
                              <td>{customer.loyaltyPoints}</td>
                              <td>
                                <span
                                  className={`manager_customer-status manager_customer-status-${customer.status.toLowerCase()}`}
                                >
                                  {customer.status}
                                </span>
                              </td>
                              {/* <td>
                                <button
                                  className="manager_customer-info-button"
                                  onClick={() =>
                                    handleCustomerClick(customer.accountId)
                                  }
                                >
                                  <FaInfoCircle />
                                </button>
                              </td> */}
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="manager_customer-no-data">
                            Không có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Phân trang */}
                {topServiceCustomers.length > 3 && (
                  <div className="manager_customer-pagination">
                    <button
                      onClick={() =>
                        setCurrentServicePage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentServicePage === 1}
                      className="manager_customer-pagination-button"
                    >
                      Trang trước
                    </button>
                    <span className="manager_customer-pagination-info">
                      Trang {currentServicePage} /{" "}
                      {Math.ceil(topServiceCustomers.length / 3)}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentServicePage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(topServiceCustomers.length / 3)
                          )
                        )
                      }
                      disabled={
                        currentServicePage ===
                        Math.ceil(topServiceCustomers.length / 3)
                      }
                      className="manager_customer-pagination-button"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Search and Filter Section */}
          <div className="manager_customer-search-section">
            <h2>Tìm kiếm khách hàng</h2>
            <div className="manager_customer-search-container">
              <div className="manager_customer-filter-box">
                <div className="manager_customer-days-filter">
                  <label>Khách hàng mới:</label>
                  <input
                    type="number"
                    placeholder="Số ngày"
                    value={daysFilter}
                    onChange={handleDaysFilterChange}
                    className="manager_customer-filter-input"
                  />
                  <button
                    onClick={() =>
                      fetchNewCustomers(
                        daysFilter,
                        localStorage.getItem("token")
                      )
                    }
                    className="manager_customer-filter-button"
                  >
                    Lọc
                  </button>
                </div>
                <div className="manager_customer-sort-filter">
                  <label>Sắp xếp theo điểm:</label>
                  <button
                    onClick={handleSortToggle}
                    className="manager_customer-sort-button"
                  >
                    {sortAscending ? <FaSortAmountUp /> : <FaSortAmountDown />}
                    {sortAscending ? " Tăng dần" : " Giảm dần"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customers by Points */}
          <div className="manager_customer-points-section">
            <h2>Khách hàng theo điểm tích lũy</h2>
            <div className="manager_customer-table-container">
              <table className="manager_customer-table">
                <thead>
                  <tr>
                    <th>Tên khách hàng</th>
                    <th>Điểm tích lũy</th>
                    <th>Cấp độ</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                  </tr>
                </thead>
                <tbody>
                  {customersByPoints.length > 0 ? (
                    customersByPoints
                      .slice((currentPointsPage - 1) * 3, currentPointsPage * 3)
                      .map((customer) => (
                        <tr key={customer.accountId}>
                          <td>{customer.customerName}</td>
                          <td>{customer.loyaltyPoints}</td>
                          <td>{customer.membershipLevel || "Chưa có"}</td>
                          <td>{customer.email}</td>
                          <td>{customer.phoneNumber}</td>
                          {/* <td>
                            <button
                              className="manager_customer-info-button"
                              onClick={() =>
                                handleCustomerClick(customer.accountId)
                              }
                            >
                              <FaInfoCircle />
                            </button>
                          </td> */}
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="manager_customer-no-data">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {customersByPoints.length > 3 && (
              <div className="manager_customer-pagination">
                <button
                  onClick={() =>
                    setCurrentPointsPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPointsPage === 1}
                  className="manager_customer-pagination-button"
                >
                  Trang trước
                </button>
                <span className="manager_customer-pagination-info">
                  Trang {currentPointsPage} /{" "}
                  {Math.ceil(customersByPoints.length / 3)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPointsPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(customersByPoints.length / 3)
                      )
                    )
                  }
                  disabled={
                    currentPointsPage ===
                    Math.ceil(customersByPoints.length / 3)
                  }
                  className="manager_customer-pagination-button"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>

          {/* All Customers List */}
          <div className="manager_customer-list-section">
            <h2>Tìm kiếm khách hàng</h2>

            <div className="manager_customer-search-box">
              <input
                type="text"
                placeholder="Nhập tên khách hàng..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="manager_customer-search-input"
              />
              <button
                onClick={handleSearch}
                className="manager_customer-search-button"
              >
                <FaSearch /> Tìm kiếm
              </button>
            </div>
            <div className="manager_customer-table-container">
              <table className="manager_customer-table">
                <thead>
                  <tr>
                    <th>Tên khách hàng</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Cấp độ</th>
                    <th>Điểm tích lũy</th>
                    <th>Tổng chi tiêu</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((customer) => (
                      <tr key={customer.accountId}>
                        <td>{customer.customerName}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phoneNumber}</td>
                        <td>{customer.membershipLevel || "Chưa có"}</td>
                        <td>{customer.loyaltyPoints}</td>
                        <td>{customer.totalSpent.toLocaleString("vi-VN")} đ</td>
                        <td>
                          <span
                            className={`manager_customer-status manager_customer-status-${customer.status.toLowerCase()}`}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td>
                          {new Date(customer.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        {/* <td>
                          <button
                            className="manager_customer-info-button"
                            onClick={() =>
                              handleCustomerClick(customer.accountId)
                            }
                          >
                            <FaInfoCircle />
                          </button>
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="manager_customer-no-data">
                        Không có khách hàng nào phù hợp với tìm kiếm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {searchResults.length > recordsPerPage && (
              <div className="manager_customer-pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="manager_customer-pagination-button"
                >
                  Trang trước
                </button>
                <span className="manager_customer-pagination-info">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="manager_customer-pagination-button"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>

          {/* Customer Detail Modal */}
          {isModalOpen && selectedCustomer && (
            <div className="manager_customer-modal-overlay">
              <div className="manager_customer-modal">
                <div className="manager_customer-modal-header">
                  <h2>Chi tiết khách hàng</h2>
                  <button
                    className="manager_customer-modal-close"
                    onClick={closeModal}
                  >
                    ×
                  </button>
                </div>
                <div className="manager_customer-modal-body">
                  <div className="manager_customer-modal-info">
                    <div className="manager_customer-modal-row">
                      <div className="manager_customer-modal-label">
                        Tên khách hàng:
                      </div>
                      <div className="manager_customer-modal-value">
                        {selectedCustomer.customerName}
                      </div>
                    </div>
                    <div className="manager_customer-modal-row">
                      <div className="manager_customer-modal-label">Email:</div>
                      <div className="manager_customer-modal-value">
                        {selectedCustomer.email}
                      </div>
                    </div>
                    <div className="manager_customer-modal-row">
                      <div className="manager_customer-modal-label">
                        Số điện thoại:
                      </div>
                      <div className="manager_customer-modal-value">
                        {selectedCustomer.phoneNumber}
                      </div>
                    </div>
                    <div className="manager_customer-modal-row">
                      <div className="manager_customer-modal-label">
                        Cấp độ thành viên:
                      </div>
                      <div className="manager_customer-modal-value">
                        {selectedCustomer.membershipLevel || "Chưa có"}
                      </div>
                    </div>
                    <div className="manager_customer-modal-row">
                      <div className="manager_customer-modal-label">
                        Điểm tích lũy:
                      </div>
                      <div className="manager_customer-modal-value">
                        {selectedCustomer.loyaltyPoints}
                      </div>
                    </div>
                    <div className="manager_customer-modal-row">
                      <div className="manager_customer-modal-label">
                        Tổng chi tiêu:
                      </div>
                      <div className="manager_customer-modal-value">
                        {selectedCustomer.totalSpent.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    <div className="manager_customer-modal-row">
                      <div className="manager_customer-modal-label">
                        Trạng thái:
                      </div>
                      <div className="manager_customer-modal-value">
                        <span
                          className={`manager_customer-status manager_customer-status-${selectedCustomer.status.toLowerCase()}`}
                        >
                          {selectedCustomer.status}
                        </span>
                      </div>
                    </div>
                    <div className="manager_customer-modal-row">
                      <div className="manager_customer-modal-label">
                        Ngày tạo:
                      </div>
                      <div className="manager_customer-modal-value">
                        {new Date(
                          selectedCustomer.createdAt
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                  <div className="manager_customer-modal-actions">
                    <button
                      className="manager_customer-modal-button"
                      onClick={closeModal}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer_Manager />
      </div>
    </div>
  );
};

export default Manager_Customer;
