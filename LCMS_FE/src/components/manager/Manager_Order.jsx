import React, { useState, useEffect } from "react";
import {
  FaBoxOpen,
  FaCheck,
  FaTimes,
  FaClock,
  FaUserTie,
  FaUser,
  FaCalendarAlt,
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
import "react-toastify/dist/ReactToastify.css";
import "../../assets/css/manager/manager_order.css";
import { jwtDecode } from "jwt-decode";
import Select from "react-select";

const apiUrl = import.meta.env.VITE_API_URL;

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

const Manager_Order = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [doneOrders, setDoneOrders] = useState(0);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [branchOrders, setBranchOrders] = useState({});
  const [statusStats, setStatusStats] = useState({});
  const [latestOrders, setLatestOrders] = useState([]);
  const [staffOrders, setStaffOrders] = useState(null);
  const [staffId, setStaffId] = useState("");
  const [customerOrders, setCustomerOrders] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [totalBranchBookings, setTotalBranchBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ordersList, setOrdersList] = useState([]);
  const [filteredOrdersList, setFilteredOrdersList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [days, setDays] = useState("");
  const [date, setDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const orderRecordsPerPage = 5;
  const [branchId, setBranchId] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [timeFilter, setTimeFilter] = useState("all"); // new state for time filtering: "all", "week", "month"

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
    if (ordersList.length > 0) {
      filterOrdersByTime(timeFilter);
    }
  }, [timeFilter, ordersList]);

  // Filter orders based on selected time period
  const filterOrdersByTime = (filter) => {
    const now = new Date();
    let filtered = [...ordersList];

    if (filter === "week") {
      const startOfWeek = new Date(now);
      const dayOfWeek = startOfWeek.getDay(); // 0 is Sunday, 1 is Monday, etc.

      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(now.getDate() - daysToSubtract);
      startOfWeek.setHours(0, 0, 0, 0);

      console.log("Start of week:", startOfWeek.toLocaleString("vi-VN"));

      filtered = ordersList.filter((order) => {
        const orderDate = new Date(order.bookingDate);

        console.log(
          "Order date:",
          orderDate.toLocaleString("vi-VN"),
          "Is >= start of week:",
          orderDate >= startOfWeek
        );

        return orderDate >= startOfWeek;
      });

      setOperation({
        status: "success",
        message: `Đang xem ${filtered.length} đơn hàng trong tuần này`,
      });
    } else if (filter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      filtered = ordersList.filter((order) => {
        const orderDate = new Date(order.bookingDate);
        return orderDate >= startOfMonth;
      });

      setOperation({
        status: "success",
        message: `Đang xem ${filtered.length} đơn hàng trong tháng này`,
      });
    } else if (filter === "all") {
    }

    setFilteredOrdersList(filtered);
    setOrderCurrentPage(1);
  };

  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };

  // Pagination for order list
  const indexOfLastOrder = orderCurrentPage * orderRecordsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - orderRecordsPerPage;
  const currentOrderRecords = filteredOrdersList.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalOrderPages = Math.ceil(
    filteredOrdersList.length / orderRecordsPerPage
  );

  const handleNextOrderPage = () => {
    if (orderCurrentPage < totalOrderPages) {
      setOrderCurrentPage(orderCurrentPage + 1);
    }
  };

  const handlePreviousOrderPage = () => {
    if (orderCurrentPage > 1) {
      setOrderCurrentPage(orderCurrentPage - 1);
    }
  };

  // Initial data loading
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

      // Extract branchId from token
      if (decodedToken.BranchId) {
        setBranchId(decodedToken.BranchId);

        // Also fetch branch name if needed
        if (decodedToken.BranchName) {
          setBranchName(decodedToken.BranchName);
        }
      }

      fetchData(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      setOperationError("Lỗi xác thực. Vui lòng đăng nhập lại.");
      setLoading(false);
    }
  }, [date]);

  // Fetch employees and customers data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchEmployeesData = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/Employee/get-all-employee`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const employeesData = await response.json();

        if (branchId) {
          const filteredEmployees = employeesData.filter(
            (emp) =>
              emp.branchId === parseInt(branchId) && emp.employeeRoleId !== 0
          );
          setEmployees(filteredEmployees);
        } else {
          const filteredEmployees = employeesData.filter(
            (emp) => emp.employeeRoleId !== 0
          );
          setEmployees(filteredEmployees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setOperationError("Lỗi khi tải danh sách nhân viên.");
      }
    };

    const fetchCustomersData = async () => {
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
        const customersData = await response.json();
        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setOperationError("Lỗi khi tải danh sách khách hàng.");
      }
    };

    fetchEmployeesData();
    fetchCustomersData();
  }, [branchId]);

  useEffect(() => {
    if (employees.length > 0 && staffId) {
      const employee = employees.find((emp) => emp.accountId === staffId);
      setEmployeeName(
        employee ? employee.employeeName : "Không tìm thấy nhân viên"
      );
    }
  }, [employees, staffId]);

  useEffect(() => {
    if (customers.length > 0 && customerId) {
      const customer = customers.find((cus) => cus.accountId === customerId);
      setCustomerName(
        customer ? customer.customerName : "Không tìm thấy khách hàng"
      );
    }
  }, [customers, customerId]);

  // Prepare select options
  const employeeOptions = employees.map((emp) => ({
    value: emp.accountId,
    label: emp.employeeName,
  }));

  const customerOptions = customers.map((cus) => ({
    value: cus.accountId,
    label: cus.customerName,
  }));

  // Pagination for latest orders
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = latestOrders.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(latestOrders.length / recordsPerPage);

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

  // Main data fetching function
  const fetchData = async (token) => {
    try {
      setLoading(true);

      // Fetch status list
      const statusResponse = await fetch(
        `${apiUrl}/api/Booking/list-all-Status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const statusData = await statusResponse.json();
      setStatusList(statusData);

      // Fetch all bookings for the branch if branchId is available
      const bookingsUrl = branchId
        ? `${apiUrl}/api/Booking/list-by-branch/${branchId}`
        : `${apiUrl}/api/Booking/list-all`;

      const bookingsResponse = await fetch(bookingsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bookingsData = await bookingsResponse.json();
      setOrdersList(bookingsData);
      setFilteredOrdersList(bookingsData); // Initialize filtered list with all orders

      // Calculate order statistics
      let total = bookingsData.length;
      let completed = bookingsData.filter(
        (order) => order.status === "Completed"
      ).length;
      let done = bookingsData.filter((order) => order.status === "Done").length;
      let canceled = bookingsData.filter(
        (order) => order.status === "Canceled"
      ).length;
      let pending = bookingsData.filter(
        (order) => order.status === "Pending"
      ).length;

      setTotalOrders(total);
      setCompletedOrders(completed);
      setDoneOrders(done);
      setCanceledOrders(canceled);
      setPendingOrders(pending);

      const branchResponse = await fetch(
        branchId
          ? `${apiUrl}/api/AdminBooking/get-bookings-by-branch/${branchId}`
          : `${apiUrl}/api/AdminBooking/get-all-booking`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const branchData = await branchResponse.json();

      const branchStats = {};
      branchData.forEach((order) => {
        if (!branchStats[order.branchName]) {
          branchStats[order.branchName] = 1;
        } else {
          branchStats[order.branchName]++;
        }
      });
      setBranchOrders(branchStats);

      const statusStatsObj = {};
      for (const status of statusData) {
        const statusStatsUrl = branchId
          ? `${apiUrl}/api/AdminBooking/list-By-Status-Branch?status=${status}&branchId=${branchId}`
          : `${apiUrl}/api/AdminBooking/list-By-Status?status=${status}`;

        const statusStatsResponse = await fetch(statusStatsUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const statusStatsData = await statusStatsResponse.json();
        statusStatsObj[status] = statusStatsData.length;
      }
      setStatusStats(statusStatsObj);

      const formattedDate = date.toISOString().split("T")[0];
      let latestUrl = `${apiUrl}/api/AdminBooking/latest?date=${formattedDate}`;
      if (branchId) {
        latestUrl += `&branchId=${branchId}`;
      }

      const latestResponse = await fetch(latestUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const latestData = await latestResponse.json();
      setLatestOrders(latestData);

      // Fetch total branch bookings
      const totalBookingsUrl = branchId
        ? `${apiUrl}/api/AdminBooking/totalbookings-branch/${branchId}`
        : `${apiUrl}/api/AdminBooking/totalbookings`;

      const totalBookingsResponse = await fetch(totalBookingsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const totalBookingsData = await totalBookingsResponse.json();
      setTotalBranchBookings(totalBookingsData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const selectedStatus = e.target.value;
    setStatusFilter(selectedStatus);
    // Reset other filters when changing status
    setStaffId("");
    setCustomerId("");
    setStaffOrders(null);
    setCustomerOrders(null);

    if (!selectedStatus) return;

    const token = localStorage.getItem("token");

    try {
      const statusUrl = branchId
        ? `${apiUrl}/api/AdminBooking/list-By-Status-Branch?status=${selectedStatus}&branchId=${branchId}`
        : `${apiUrl}/api/AdminBooking/list-By-Status?status=${selectedStatus}`;

      const response = await fetch(statusUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.length === 0) {
        setOperation({
          status: "success",
          message: `Chưa có đơn hàng cho trạng thái ${selectedStatus}.`,
        });
      } else {
        setOperation({
          status: "success",
          message: `Có ${data.length} đơn hàng cho trạng thái ${selectedStatus}.`,
        });
      }
    } catch (error) {}
  };

  // Handler for staff selection
  const handleStaffSelect = async (selectedOption) => {
    // Reset customer filter when selecting staff
    setCustomerId("");
    setCustomerOrders(null);

    if (!selectedOption) {
      setStaffId("");
      setStaffOrders(null);
      return;
    }

    setStaffId(selectedOption.value);
    handleStaffChange(selectedOption.value);
  };

  // Handler for staff orders
  const handleStaffChange = async (staffId) => {
    setStaffId(staffId);

    if (!staffId) {
      setStaffOrders(null);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const staffUrl = `${apiUrl}/api/AdminBooking/staff/${staffId}`;

      const response = await fetch(staffUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      const employee = employees.find((emp) => emp.accountId === staffId);
      const staffName = employee ? employee.employeeName : "Không xác định";

      setStaffOrders({
        staffName: staffName,
        orders: data,
        length: data.length,
      });

      if (employee && branchName) {
        setOperation({
          status: "success",
          message: `Đang xem ${data.length} đơn hàng của nhân viên ${staffName} thuộc chi nhánh ${branchName}`,
        });
      } else {
        setOperation({
          status: "success",
          message: `Đang xem ${data.length} đơn hàng của nhân viên ${staffName}`,
        });
      }
    } catch (error) {
      console.error("Error fetching staff orders:", error);
      setOperationError("Lỗi khi lấy đơn hàng theo nhân viên.");
    }
  };

  const handleCustomerSelect = async (selectedOption) => {
    // Reset staff filter when selecting customer
    setStaffId("");
    setStaffOrders(null);

    if (!selectedOption) {
      setCustomerId("");
      setCustomerOrders(null);
      return;
    }

    setCustomerId(selectedOption.value);
    handleCustomerChange(selectedOption.value);
  };

  const handleCustomerChange = async (customerId) => {
    setCustomerId(customerId);

    if (!customerId) {
      setCustomerOrders(null);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const customerUrl = `${apiUrl}/api/AdminBooking/employee/${customerId}`;

      const response = await fetch(customerUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      const customer = customers.find((cus) => cus.accountId === customerId);
      const customerName = customer ? customer.customerName : "Không xác định";

      setCustomerOrders({
        customerName: customerName,
        orders: data,
        length: data.length,
      });

      setOperation({
        status: "success",
        message: `Đang xem ${data.length} đơn hàng của khách hàng ${customerName}`,
      });
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      setOperationError("Lỗi khi lấy đơn hàng theo khách hàng.");
    }
  };

  const fetchLatestOrders = async (days) => {
    // Convert string to number and validate
    const daysNum = Number(days);
    if (!daysNum || daysNum <= 0) {
      setOperationError("Vui lòng nhập số ngày hợp lệ.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      return;
    }

    try {
      let latestUrl = `${apiUrl}/api/AdminBooking/latest?days=${daysNum}`;
      if (branchId) {
        latestUrl += `&branchId=${branchId}`;
      }

      const response = await fetch(latestUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.length === 0) {
        setOperation({
          status: "success",
          message: `Không có đơn hàng nào trong ${daysNum} ngày qua.`,
        });
      } else {
        setLatestOrders(data);
        setOperation({
          status: "success",
          message: `Đã tìm thấy ${data.length} đơn hàng trong ${daysNum} ngày qua.`,
        });
      }
    } catch (error) {
      console.error("Error fetching latest orders:", error);
      setOperationError(
        `Đã xảy ra lỗi khi tải đơn hàng mới nhất: ${error.message}`
      );
    }
  };

  // Chart data for status statistics
  const statusChartData = {
    labels: Object.keys(statusStats),
    datasets: [
      {
        label: "Số lượng đơn hàng",
        data: Object.values(statusStats),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(199, 199, 199, 0.6)",
          "rgba(83, 102, 255, 0.6)",
          "rgba(78, 121, 167, 0.6)",
          "rgba(242, 142, 43, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(199, 199, 199, 1)",
          "rgba(83, 102, 255, 1)",
          "rgba(78, 121, 167, 1)",
          "rgba(242, 142, 43, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for branch statistics
  const branchChartData = {
    labels: Object.keys(branchOrders),
    datasets: [
      {
        label: "Số đơn hàng theo chi nhánh",
        data: Object.values(branchOrders),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
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

  // Order summary chart
  const orderSummaryData = {
    labels: ["Hoàn thành", "Đã hủy", "Chờ xử lý", "Khác"],
    datasets: [
      {
        data: [
          doneOrders,
          canceledOrders,
          pendingOrders,
          totalOrders - (doneOrders + canceledOrders + pendingOrders),
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-manager-container">
      <Sidebar_Manager />
      <div className="dashboard-manager-main-content">
        <Header_Manager />

        {/* Custom notification messages */}

        <div className="manager-orders-content">
          <div className="manager-orders-header">
            <h2>
              {branchName
                ? `Quản lý đơn hàng - Chi nhánh ${branchName}`
                : "Quản lý đơn hàng"}
            </h2>
          </div>
          {operation.status === "success" && (
            <div className="manager-order-success-message">
              {operation.message}
            </div>
          )}

          {operationError && (
            <div className="manager-order-error-message">{operationError}</div>
          )}

          {/* Summary Cards */}
          <div className="manager-orders-stats-container">
            <div className="manager-orders-stat-card">
              <div className="manager-orders-stat-icon total">
                <FaBoxOpen />
              </div>
              <div className="manager-orders-stat-info">
                <h3>Tổng số đơn hàng</h3>
                <p>{totalOrders}</p>
              </div>
            </div>

            <div className="manager-orders-stat-card">
              <div className="manager-orders-stat-icon completed">
                <FaCheck />
              </div>
              <div className="manager-orders-stat-info">
                <h3>Đơn hàng hoàn thành</h3>
                <p>{doneOrders}</p>
              </div>
            </div>

            <div className="manager-orders-stat-card">
              <div className="manager-orders-stat-icon canceled">
                <FaTimes />
              </div>
              <div className="manager-orders-stat-info">
                <h3>Đơn hàng hủy</h3>
                <p>{canceledOrders}</p>
              </div>
            </div>

            <div className="manager-orders-stat-card">
              <div className="manager-orders-stat-icon pending">
                <FaClock />
              </div>
              <div className="manager-orders-stat-info">
                <h3>Đơn hàng chờ xử lý</h3>
                <p>{pendingOrders}</p>
              </div>
            </div>
          </div>

          {/* Charts and Data Sections */}
          <div className="manager-orders-data-container">
            <div className="manager-orders-row">
              <div className="manager-orders-chart-card">
                <h2>Tổng quan đơn hàng</h2>
                <div className="manager-orders-chart">
                  <Doughnut
                    data={orderSummaryData}
                    options={chartOptions}
                    height={200}
                  />
                </div>
              </div>

              <div className="manager-orders-chart-card">
                <h2>Đơn hàng theo chi nhánh</h2>
                <div className="manager-orders-branch-summary">
                  {Object.keys(branchOrders).length > 0 ? (
                    <ul className="manager-orders-branch-list">
                      {Object.entries(branchOrders).map(([branch, count]) => (
                        <li key={branch} className="manager-orders-branch-item">
                          <span className="manager-orders-branch-name">
                            {branch}:
                          </span>
                          <span className="manager-orders-branch-count">
                            {count} đơn hàng
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="manager-orders-no-data">
                      Không có dữ liệu chi nhánh
                    </p>
                  )}
                </div>
                <div className="manager-orders-total-branch">
                  <p>
                    Tổng số đơn hàng trong chi nhánh:{" "}
                    <strong>{totalBranchBookings}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="manager-orders-row">
              <div className="manager-orders-chart-card">
                <h2>Thống kê theo trạng thái</h2>
                <div className="manager-orders-chart">
                  <Bar
                    data={statusChartData}
                    options={chartOptions}
                    height={250}
                  />
                </div>
              </div>

              <div className="manager-orders-card">
                <h2>Đơn hàng mới nhất</h2>
                <div className="manager-orders-days-filter">
                  <input
                    type="number"
                    placeholder="Nhập số ngày"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="manager-orders-input"
                  />
                  <button
                    onClick={() => fetchLatestOrders(days)}
                    className="manager-orders-button"
                  >
                    Tìm kiếm
                  </button>
                </div>
                <div className="manager-orders-latest-list">
                  {currentRecords.length > 0 ? (
                    <>
                      <table className="manager-orders-table">
                        <thead>
                          <tr>
                            <th>Khách hàng</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Tổng tiền</th>
                            <th>Cấp độ thành viên</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRecords.map((order, index) => (
                            <tr key={order.bookingId}>
                              <td>{order.customerName}</td>
                              <td>
                                <span
                                  className={`manager-orders-status manager-orders-status-${order.status.toLowerCase()}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                {new Date(order.bookingDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </td>
                              <td>
                                {order.totalAmount?.toLocaleString("vi-VN")} đ
                              </td>
                              <td>
                                {order.membershipLevel || "Không có cấp độ"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Pagination Controls */}
                      <div className="manager-orders-pagination">
                        <button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className="manager-orders-pagination-button"
                        >
                          Trang trước
                        </button>
                        <span className="manager-orders-pagination-info">
                          Trang {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="manager-orders-pagination-button"
                        >
                          Trang sau
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="manager-orders-no-data">
                      Không có đơn hàng mới cho khoảng thời gian đã chọn.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Staff and Customer Orders */}
          <div className="manager-orders-search-container">
            <div className="manager-orders-search-card">
              <h2>
                <FaUserTie /> Đơn hàng theo nhân viên
              </h2>
              <div className="manager-orders-search">
                <Select
                  options={employeeOptions}
                  value={employeeOptions.find(
                    (option) => option.value === staffId
                  )}
                  onChange={handleStaffSelect}
                  placeholder="Chọn nhân viên"
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: 250,
                    }),
                  }}
                />
              </div>
              <div className="manager-orders-search-result">
                {staffOrders ? (
                  <div className="manager-orders-staff-info">
                    <h3>{staffOrders.staffName || "Nhân viên"}</h3>
                    <p>
                      Số lượng đơn hàng:{" "}
                      <strong>{staffOrders.length || 0}</strong>
                    </p>
                    {staffOrders.orders && staffOrders.orders.length > 0 && (
                      <div className="manager-orders-mini-table">
                        <table>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Ngày đặt</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {staffOrders.orders
                              .slice(0, 3)
                              .map((order, index) => (
                                <tr key={index}>
                                  <td>#{order.bookingId}</td>
                                  <td>
                                    {new Date(
                                      order.bookingDate
                                    ).toLocaleDateString("vi-VN")}
                                  </td>
                                  <td>{order.status}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>Chọn nhân viên để xem đơn hàng</p>
                )}
              </div>
            </div>

            <div className="manager-orders-search-card">
              <h2>
                <FaUser /> Đơn hàng theo khách hàng
              </h2>
              <div className="manager-orders-search">
                <Select
                  options={customerOptions}
                  value={customerOptions.find(
                    (option) => option.value === customerId
                  )}
                  onChange={handleCustomerSelect}
                  placeholder="Chọn khách hàng"
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: 250,
                    }),
                  }}
                />
              </div>
              <div className="manager-orders-search-result">
                {customerOrders ? (
                  <div className="manager-orders-customer-info">
                    <h3>{customerOrders.customerName || "Khách hàng"}</h3>
                    <p>
                      Số lượng đơn hàng:{" "}
                      <strong>{customerOrders.length || 0}</strong>
                    </p>
                    {customerOrders.orders &&
                      customerOrders.orders.length > 0 && (
                        <div className="manager-orders-mini-table">
                          <table>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customerOrders.orders
                                .slice(0, 3)
                                .map((order, index) => (
                                  <tr key={index}>
                                    <td>#{order.bookingId}</td>
                                    <td>
                                      {new Date(
                                        order.bookingDate
                                      ).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td>
                                      {order.totalAmount?.toLocaleString(
                                        "vi-VN"
                                      )}{" "}
                                      đ
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                ) : (
                  <p>Chọn khách hàng để xem đơn hàng</p>
                )}
              </div>
            </div>
          </div>

          {/* Order List Table */}
          <div className="manager-orders-table-container">
            <div className="manager-orders-table-header">
              <h2>Tất cả đơn hàng của chi nhánh</h2>

              {/* Add time filter dropdown here */}
              <div className="manager-orders-time-filter">
                <div className="time-filter-container">
                  <span className="time-filter-icon">
                    <FaCalendarAlt />
                  </span>
                  <span className="time-filter-label">Thời gian:</span>
                  <select
                    value={timeFilter}
                    onChange={handleTimeFilterChange}
                    className="time-filter-select"
                  >
                    <option value="all">Tất cả</option>
                    <option value="week">Tuần này</option>
                    <option value="month">Tháng này</option>
                  </select>
                </div>
              </div>
            </div>

            <table className="manager-orders-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Khách hàng</th>
                  <th>Chi nhánh</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {currentOrderRecords.slice(0, 10).map((order, index) => (
                  <tr key={order.bookingId}>
                    <td>{indexOfFirstOrder + index + 1}</td>
                    <td>{order.customerName}</td>
                    <td>{order.branchName}</td>
                    <td>
                      {new Date(order.bookingDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <span
                        className={`manager-orders-status manager-orders-status-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{order.totalAmount?.toLocaleString("vi-VN")} đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ordersList.length > orderRecordsPerPage && (
              <div className="manager-orders-pagination order-pagination">
                <button
                  onClick={handlePreviousOrderPage}
                  disabled={orderCurrentPage === 1}
                  className="manager-orders-pagination-button"
                >
                  Trang trước
                </button>
                <span className="manager-orders-pagination-info">
                  Trang {orderCurrentPage} / {totalOrderPages}
                </span>
                <button
                  onClick={handleNextOrderPage}
                  disabled={orderCurrentPage === totalOrderPages}
                  className="manager-orders-pagination-button"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </div>
        <Footer_Manager />
      </div>
    </div>
  );
};

export default Manager_Order;
