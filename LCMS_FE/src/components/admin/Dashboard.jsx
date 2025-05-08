import React, { useState, useEffect, useRef } from "react";
import "../../assets/css/admin/dashboard.css";
import {
  FaUsers,
  FaDollarSign,
  FaServicestack,
  FaChartLine,
  FaStore,
  FaFileExcel,
  FaCreditCard,
  FaShoppingCart,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
} from "chart.js";
import "react-toastify/dist/ReactToastify.css";
import { Bar, Doughnut } from "react-chartjs-2";
import Header_Admin from "../reuse/Header_Admin";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler
);
const apiUrl = import.meta.env.VITE_API_URL;
const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("total");
  const [timeRange, setTimeRange] = useState("yearly");
  const [branchFilter, setBranchFilter] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [singleBranchRevenue, setSingleBranchRevenue] = useState(null);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [customerRevenue, setCustomerRevenue] = useState(null);
  const [customerFilter, setCustomerFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [customerBranchRevenue, setCustomerBranchRevenue] = useState(null);
  const [selectedBranchForCustomer, setSelectedBranchForCustomer] =
    useState("all");
  const [topSpendingCustomers, setTopSpendingCustomers] = useState([]);
  const [selectedBranchForTopCustomers, setSelectedBranchForTopCustomers] =
    useState("all");
  const [showAllPendingOrders, setShowAllPendingOrders] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [branchRevenue, setBranchRevenue] = useState(null);
  const [serviceRevenueData, setServiceRevenueData] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [paymentRevenue, setPaymentRevenue] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [monthlyPackageRevenue, setMonthlyPackageRevenue] = useState(null);
  const chartRef = useRef(null);
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [recordsPerPage] = useState(5); // Number of records per page

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentServiceRevenueData = serviceRevenueData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(serviceRevenueData.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };
  useEffect(() => {
    if (isAuthenticated && activeView === "branch") {
      fetchBranchRevenueData();
    }
  }, [isAuthenticated, activeView, selectedDate]);
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const formatDateForBranchAPI = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}-${day}`;
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Token không hợp lệ hoặc không tồn tại.");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        setErrorMessage("Token hết hạn.");
        setLoading(false);
        return;
      }
      setIsAuthenticated(true);
    } catch (error) {
      setErrorMessage("Không thể giải mã token.");
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    return () => {
      if (window.Chart) {
        window.Chart.instances.forEach((instance) => instance.destroy());
      }
    };
  }, []);
  useEffect(() => {
    const resizeChart = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };

    window.addEventListener("resize", resizeChart);
    return () => window.removeEventListener("resize", resizeChart);
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/api/Branch/get-all`);
        setBranches(response.data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);
  //Service
  useEffect(() => {
    const fetchServiceRevenueData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        const formattedDate = formatDateForAPI(selectedDate);

        const serviceResponse = await fetch(
          `${apiUrl}/api/Revenue/service-revenue?date=${formattedDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!serviceResponse.ok) {
          throw new Error("Không thể lấy dữ liệu doanh thu theo dịch vụ.");
        }
        const serviceData = await serviceResponse.json();
        setServiceRevenueData(serviceData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError("Không thể lấy dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    if (isAuthenticated && activeView === "service") {
      fetchServiceRevenueData();
    }
  }, [isAuthenticated, activeView, selectedDate]);

  const fetchMonthlyPackageRevenue = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${apiUrl}/api/Revenue/total-revenuePackageMonth`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu doanh thu vé tháng.");
      }

      const data = await response.json();
      setMonthlyPackageRevenue(data.totalRevenue || 0);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu doanh thu vé tháng");
      setLoading(false);
    }
  };
  const fetchServiceRevenueData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const formattedDate = formatDateForAPI(selectedDate);

      const serviceResponse = await fetch(
        `${apiUrl}/api/Revenue/service-revenue?date=${formattedDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!serviceResponse.ok) {
        throw new Error("Không thể lấy dữ liệu doanh thu theo dịch vụ.");
      }

      const serviceData = await serviceResponse.json();
      setServiceRevenueData(serviceData);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Không thể lấy dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchData();
      fetchTotalCustomers();
      fetchBranchRevenueData();
      fetchMonthlyPackageRevenue();
    }
  }, [
    isAuthenticated,
    activeView,
    timeRange,
    serviceFilter,
    customerFilter,
    paymentFilter,
    currentDate,
  ]);

  const fetchBranchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const formattedDate = formatDateForAPI(selectedDate);
      setBranchFilter(selectedBranch);

      // Fetch all branch revenue data
      const allBranchResponse = await fetch(
        `${apiUrl}/api/Revenue/all-branch-revenue-by-month-and-year?date=${formattedDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!allBranchResponse.ok) {
        const errorText = await allBranchResponse.text();
        throw new Error(
          `Không thể lấy dữ liệu doanh thu theo chi nhánh: ${errorText}`
        );
      }

      const allBranchData = await allBranchResponse.json();
      setBranchRevenue(allBranchData);

      if (selectedBranch !== "all") {
        try {
          const singleBranchResponse = await fetch(
            `${apiUrl}/api/Revenue/branch-revenue-byDatetime?branchId=${selectedBranch}&date=${formattedDate}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!singleBranchResponse.ok) {
            if (singleBranchResponse.status === 404) {
              const alternativeResponse = await fetch(
                `${apiUrl}/api/Revenue/branch-revenue-byDatetime?branchId=${selectedBranch}&date=${formattedDate}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!alternativeResponse.ok) {
              }

              const singleBranchData = await alternativeResponse.json();
              setSingleBranchRevenue(singleBranchData);
            } else {
              const errorText = await singleBranchResponse.text();
              throw new Error(`Lỗi khi lấy dữ liệu chi nhánh: ${errorText}`);
            }
          } else {
            const singleBranchData = await singleBranchResponse.json();
            setSingleBranchRevenue(singleBranchData);
          }
        } catch (branchError) {
          setError(
            `Không thể lấy dữ liệu chi tiết cho chi nhánh: ${branchError.message}`
          );
          setSingleBranchRevenue(null);
        }
      } else {
        setSingleBranchRevenue(null);
      }
    } catch (err) {
      setError(`Không thể lấy dữ liệu: ${err.message}`);
      setBranchRevenue([]);
      setSingleBranchRevenue(null);
    } finally {
      setLoading(false);
    }
  };
  //Customer
  const fetchTotalCustomers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiUrl}/api/Customer/total-customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTotalCustomers(data.total || data);
    } catch (error) {
      setError("Lỗi khi tải tổng số khách hàng");
      setLoading(false);
    }
  };
  const fetchAllCustomers = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${apiUrl}/api/Customer/get-all-customer`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCustomers(response.data || []);
    } catch (error) {
      setError("Không thể tải danh sách khách hàng");
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllCustomers();
    }
  }, [isAuthenticated]);
  const fetchAllCustomerRevenue = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const formattedDate = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const response = await fetch(
        `${apiUrl}/api/Revenue/all-customer-revenue?date=${formattedDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu doanh thu khách hàng");
      }

      const data = await response.json();
      setCustomerRevenue(data);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải dữ liệu doanh thu khách hàng");
      setLoading(false);
    }
  };

  const fetchPaymentTypes = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${apiUrl}/api/Revenue/payment-revenue`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPaymentTypes(response.data.map((item) => item.paymentType));
    } catch (error) {
      setError("Không thể tải danh sách phương thức thanh toán");
    }
  };

  const fetchPaymentRevenueData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await axios.get(
        `${apiUrl}/api/Revenue/payment-revenue`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPaymentRevenue(response.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu doanh thu theo phương thức thanh toán");
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      fetchPaymentTypes();
      fetchPaymentRevenueData();
    }
  }, [isAuthenticated]);

  const fetchBranchCustomerRevenue = async () => {
    if (selectedBranchForCustomer === "all") {
      setOperationError("Vui lòng chọn một chi nhánh cụ thể");
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const formattedDate = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const response = await fetch(
        `${apiUrl}/api/Revenue/branch-customer-revenue/${selectedBranchForCustomer}?date=${formattedDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu khách hàng theo chi nhánh");
      }

      const data = await response.json();
      setCustomerBranchRevenue(data);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải dữ liệu khách hàng theo chi nhánh");
      setLoading(false);
    }
  };

  const fetchTopSpendingCustomers = async () => {
    if (selectedBranchForTopCustomers === "all") {
      setOperationError("Vui lòng chọn một chi nhánh cụ thể");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${apiUrl}/api/Customer/top-spending-customers?branchId=${selectedBranchForTopCustomers}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu top khách hàng");
      }

      const data = await response.json();
      setTopSpendingCustomers(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Không thể tải dữ liệu top khách hàng");
      setLoading(false);
    }
  };
  useEffect(() => {
    if (customerFilter === "branch" && selectedBranchForCustomer !== "all") {
      fetchBranchCustomerRevenue();
    } else if (
      customerFilter === "top" &&
      selectedBranchForTopCustomers !== "all"
    ) {
      fetchTopSpendingCustomers();
    }
  }, [selectedBranchForCustomer, selectedBranchForTopCustomers]);
  // Add this useEffect to handle filter changes
  useEffect(() => {
    // Reset data when changing filter types
    if (customerFilter === "all") {
      setCustomerBranchRevenue(null);
      setTopSpendingCustomers([]);
      fetchAllCustomerRevenue(); // Automatically fetch revenue for all customers
    } else if (customerFilter === "branch") {
      setTopSpendingCustomers([]);
      if (selectedBranchForCustomer !== "all") {
        fetchBranchCustomerRevenue(); // Automatically fetch revenue for a specific branch
      }
    } else if (customerFilter === "top") {
      setCustomerBranchRevenue(null);
      if (selectedBranchForTopCustomers !== "all") {
        fetchTopSpendingCustomers(); // Automatically fetch top spending customers for a branch
      }
    }
  }, [
    customerFilter,
    selectedBranchForTopCustomers,
    selectedBranchForCustomer,
    selectedDate,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllCustomers();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = getAuthToken();
      const formattedDate = formatDateForAPI(currentDate);
      const formattedBranchDate = formatDateForBranchAPI(currentDate);

      if (!token) {
        setErrorMessage("Token không tồn tại hoặc không hợp lệ.");
        setLoading(false);
        return;
      }

      const totalRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/total-revenue`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!totalRevenueResponse.ok) {
        const errorResponse = await totalRevenueResponse.text();
        throw new Error("Không thể lấy dữ liệu tổng doanh thu.");
      }

      const totalRevenueData = await totalRevenueResponse.json();
      setTotalRevenue(totalRevenueData);

      // Fetch all bookings from the AdminBooking endpoint as requested
      const adminBookingResponse = await fetch(
        `${apiUrl}/api/AdminBooking/get-all-booking`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!adminBookingResponse.ok) {
        throw new Error("Không thể lấy dữ liệu đơn hàng từ Admin API.");
      }
      const adminBookingData = await adminBookingResponse.json();

      // Count completed orders with status "done"
      const completedOrders = adminBookingData.filter(
        (order) => order.status === "Done"
      ).length;

      const bookingResponse = await fetch(`${apiUrl}/api/Booking/list-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!bookingResponse.ok) {
        throw new Error("Không thể lấy dữ liệu đơn hàng.");
      }
      const bookingData = await bookingResponse.json();

      const pendingOrders = bookingData.filter(
        (order) => order.status === "Pending"
      ).length;

      setOrderStats({
        Done: completedOrders,
        Pending: pendingOrders,
        Cancelled: 0,
      });

      setLoading(false);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrorMessage("Your session has expired. Please login again.");
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(
          "Failed to fetch data. Please check your connection or try again later."
        );
      }
      setLoading(false);
    }
  };
  const handleViewAllPendingOrders = () => {
    setShowAllPendingOrders(true);
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const formattedDate = formatDateForAPI(currentDate);
      const response = await axios.get(
        `${apiUrl}/api/Revenue/export-full-revenue?date=${formattedDate}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `revenue_report_${formattedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert("Xuất báo cáo Excel thành công!");
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrorMessage("Your session has expired. Please login again.");
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Xuất báo cáo Excel thất bại!");
      }
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const branchRevenueData = {
      labels: months,
      datasets: branches.map((branch, index) => ({
        label: branch.branchName,
        data:
          branchRevenue?.revenueByBranch?.[branch.branchId] ||
          Array(12).fill(0),
        backgroundColor: `hsl(${index * 50}, 70%, 60%)`,
        borderRadius: 5,
        fill: true,
      })),
    };

    let serviceRevenueData;

    if (serviceFilter === "all" || !serviceFilter) {
      serviceRevenueData = {
        labels: services.map((service) => service.serviceName) || [],
        datasets: [
          {
            label: "Doanh thu theo dịch vụ",
            data: services.map(
              (service) =>
                serviceRevenueData?.revenueByService?.[service.serviceId] || 0
            ),
            backgroundColor: services.map(
              (_, index) => `hsla(${index * 60}, 70%, 60%, 0.8)`
            ),
            borderColor: services.map(
              (_, index) => `hsla(${index * 60}, 70%, 60%, 1)`
            ),
            borderWidth: 1,
            fill: true,
          },
        ],
      };
    }
    const customerTypesData = customerRevenue?.customerTypeRevenue || null;
    const customerLabels = customerTypesData
      ? Object.keys(customerTypesData)
      : [];
    const customerData = {
      labels: customerLabels,
      datasets: [
        {
          data: customerTypesData?.new || [],
          backgroundColor: "rgba(255, 99, 132, 0.8)",
          borderRadius: 5,
          fill: true,
        },
        {
          data: customerTypesData?.regular || [],
          backgroundColor: "rgba(52, 152, 219, 0.8)",
          borderRadius: 5,
          fill: true,
        },
        {
          data: customerTypesData?.vip || [],
          backgroundColor: "rgba(46, 204, 113, 0.8)",
          borderRadius: 5,
          fill: true,
        },
      ],
    };

    const paymentMethodLabels = paymentRevenue?.paymentMethods || [];
    const paymentMethodData = {
      labels: paymentMethodLabels,
      datasets: [
        {
          label: "Doanh thu theo phương thức thanh toán",
          data: paymentMethodLabels.map(
            (method) => paymentRevenue?.revenueByPaymentMethod?.[method] || 0
          ),
          backgroundColor: paymentMethodLabels.map(
            (_, index) => `hsla(${index * 70}, 70%, 60%, 0.8)`
          ),
          borderWidth: 1,
          fill: true,
        },
      ],
    };

    return {
      branchRevenueData,
      serviceRevenueData,
      customerData,
      paymentMethodData,
    };
  };

  const chartData = prepareChartData();
  const renderRevenueChart = () => {
    if (loading) {
      return <div className="loading-indicator">Đang tải dữ liệu...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    switch (activeView) {
      case "branch":
        return (
          <div className="dashboard-admin-chart-container">
            <div className="dashboard-admin-chart-header">
              <h3>Doanh thu theo chi nhánh</h3>
              <div className="dashboard-admin-filter-section">
                <div className="dashboard-admin-filter-item">
                  <label>Thời gian:</label>
                  <div className="dashboard-admin-date-picker">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="MM/yyyy"
                      showMonthYearPicker
                      maxDate={new Date()}
                      className="dashboard-admin-date-input"
                    />

                    <FaCalendarAlt className="dashboard-admin-calendar-icon" />
                  </div>
                </div>
                <button
                  className="dashboard-admin-view-btn"
                  onClick={fetchBranchRevenueData}
                >
                  <FaSearch /> Xem
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="dashboard-admin-branch-revenue-section">
                <h4>Tổng doanh thu tất cả chi nhánh</h4>
                <div className="dashboard-admin-branch-revenue-summary">
                  <div className="dashboard-admin-total-revenue-card">
                    <div className="dashboard-admin-total-revenue-value">
                      {formatCurrency(
                        branchRevenue?.reduce(
                          (total, item) => total + item.totalRevenue,
                          0
                        ) || 0
                      )}
                    </div>
                    <div className="dashboard-admin-total-revenue-label">
                      Tổng doanh thu theo đơn hàng tháng{" "}
                      {selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
                    </div>
                  </div>

                  <div className="dashboard-admin-branch-chart">
                    <Bar
                      ref={chartRef}
                      data={{
                        labels: branches.map((branch) => branch.branchName),
                        datasets: [
                          {
                            label: `Doanh thu tháng ${
                              selectedDate.getMonth() + 1
                            }/${selectedDate.getFullYear()}`,
                            data: branches.map((branch) => {
                              const branchData = branchRevenue?.find(
                                (item) =>
                                  item.branchID.toString() ===
                                  branch.branchId.toString()
                              );
                              return branchData ? branchData.totalRevenue : 0;
                            }),
                            backgroundColor: branches.map(
                              (_, index) => `hsla(${index * 50}, 70%, 60%, 0.8)`
                            ),
                            borderColor: branches.map(
                              (_, index) => `hsla(${index * 50}, 70%, 60%, 1)`
                            ),
                            borderWidth: 1,
                            borderRadius: 5,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: "top",
                            labels: {
                              font: {
                                size: 14,
                                weight: "bold",
                              },
                            },
                          },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            titleFont: {
                              size: 16,
                              weight: "bold",
                            },
                            bodyFont: {
                              size: 14,
                            },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                              label: function (context) {
                                let label = context.dataset.label || "";
                                if (label) {
                                  label += ": ";
                                }
                                if (context.parsed.y !== null) {
                                  label += new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(context.parsed.y);
                                }
                                return label;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Doanh thu (VNĐ)",
                              font: {
                                size: 14,
                                weight: "bold",
                              },
                            },
                            ticks: {
                              callback: function (value, index, values) {
                                return new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(value);
                              },
                              font: {
                                size: 12,
                              },
                            },
                          },
                          x: {
                            ticks: {
                              font: {
                                size: 12,
                              },
                            },
                          },
                        },
                        layout: {
                          padding: {
                            left: 10,
                            right: 10,
                            top: 0,
                            bottom: 10,
                          },
                        },
                        animation: {
                          duration: 1000,
                          easing: "easeInOutQuart",
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "service":
        return (
          <div className="dashboard-admin-chart-container">
            <div className="dashboard-admin-chart-header">
              <h3>Doanh thu theo dịch vụ</h3>
              <div className="dashboard-admin-filter-section">
                <div className="dashboard-admin-filter-item">
                  <label>Thời gian:</label>
                  <div className="dashboard-admin-date-picker">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="MM/yyyy"
                      showMonthYearPicker
                      className="dashboard-admin-date-input"
                      maxDate={new Date()}
                    />
                    <FaCalendarAlt className="dashboard-admin-calendar-icon" />
                  </div>
                </div>
                <button
                  className="dashboard-admin-view-btn"
                  onClick={fetchServiceRevenueData}
                >
                  <FaSearch /> Xem
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <div className="dashboard-admin-service-revenue-section">
                  <h4>
                    Doanh thu theo dịch vụ tháng {selectedDate.getMonth() + 1}/
                    {selectedDate.getFullYear()}
                  </h4>
                  <div className="dashboard-admin-service-revenue-summary">
                    <div className="dashboard-admin-total-revenue-card">
                      <div className="dashboard-admin-total-revenue-value">
                        {formatCurrency(
                          serviceRevenueData.reduce(
                            (total, item) => total + item.totalRevenue,
                            0
                          ) || 0
                        )}
                      </div>
                      <div className="dashboard-admin-total-revenue-label">
                        Tổng doanh thu dịch vụ theo đơn hàng
                      </div>
                    </div>

                    <div className="dashboard-admin-service-chart">
                      <Bar
                        ref={chartRef}
                        data={{
                          labels: serviceRevenueData.map(
                            (service) =>
                              `${service.serviceName} - ${service.serviceType}`
                          ),
                          datasets: [
                            {
                              label: `Doanh thu tháng ${
                                selectedDate.getMonth() + 1
                              }/${selectedDate.getFullYear()}`,
                              data: serviceRevenueData.map(
                                (service) => service.totalRevenue
                              ),
                              backgroundColor: serviceRevenueData.map(
                                (_, index) =>
                                  `hsl(${index * 60 + 180}, 70%, 60%)`
                              ),
                              borderRadius: 5,
                              maxBarThickness: 50,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              position: "top",
                            },
                            tooltip: {
                              callbacks: {
                                title: (tooltipItems) => {
                                  const index = tooltipItems[0].dataIndex;
                                  return `${serviceRevenueData[index].serviceName} - ${serviceRevenueData[index].serviceType}`;
                                },
                                label: (context) => {
                                  let label = context.dataset.label || "";
                                  if (label) {
                                    label += ": ";
                                  }
                                  if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
                                  }
                                  return label;
                                },
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "Doanh thu (VNĐ)",
                              },
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                              },
                            },
                          },
                          barPercentage: 0.6,
                          categoryPercentage: 0.7,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="dashboard-admin-service-detail-section">
                  <h4>Chi tiết doanh thu theo dịch vụ</h4>
                  <div className="dashboard-admin-service-table">
                    <table className="dashboard-admin-table">
                      <thead>
                        <tr>
                          <th>Tên dịch vụ</th>
                          <th>Loại dịch vụ</th>
                          <th>Tháng</th>
                          <th>Năm</th>
                          <th>Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentServiceRevenueData.length > 0 ? (
                          currentServiceRevenueData.map((service, index) => (
                            <tr key={index}>
                              <td>{service.serviceName}</td>
                              <td>{service.serviceType}</td>
                              <td>{service.month}</td>
                              <td>{service.year}</td>
                              <td>{formatCurrency(service.totalRevenue)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="no-data">
                              Không có dữ liệu
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="admin-service-pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <span>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "customer":
        return (
          <div className="dashboard-admin-chart-container">
            <div className="dashboard-admin-chart-header">
              <h3>Doanh thu theo khách hàng</h3>
              <div className="dashboard-admin-filter-section">
                <div className="dashboard-admin-filter-item">
                  <label>Chế độ xem:</label>
                  <select
                    className="dashboard-admin-select"
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                  >
                    <option value="all">Tất cả khách hàng</option>
                    <option value="top">Top khách hàng chi tiêu</option>
                    <option value="branch">Theo chi nhánh</option>
                  </select>
                </div>
                {customerFilter === "top" ? (
                  <div className="dashboard-admin-filter-item">
                    <label>Chi nhánh:</label>
                    <select
                      className="dashboard-admin-select"
                      value={selectedBranchForTopCustomers}
                      onChange={(e) =>
                        setSelectedBranchForTopCustomers(e.target.value)
                      }
                    >
                      <option value="all">Chọn chi nhánh</option>
                      {branches.map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="dashboard-admin-filter-item">
                    <label>Thời gian:</label>
                    <div className="dashboard-admin-date-picker">
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        className="dashboard-admin-date-input"
                      />
                      <FaCalendarAlt className="dashboard-admin-calendar-icon" />
                    </div>
                  </div>
                )}
                {customerFilter === "branch" && (
                  <div className="dashboard-admin-filter-item">
                    <label>Chi nhánh:</label>
                    <select
                      className="dashboard-admin-select"
                      value={selectedBranchForCustomer}
                      onChange={(e) =>
                        setSelectedBranchForCustomer(e.target.value)
                      }
                    >
                      <option value="all">Chọn chi nhánh</option>
                      {branches.map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  className="dashboard-admin-view-btn"
                  onClick={() => {
                    if (customerFilter === "all") {
                      fetchAllCustomerRevenue();
                    } else if (
                      customerFilter === "top" &&
                      selectedBranchForTopCustomers === "all"
                    ) {
                      setOperationError(
                        "Vui lòng chọn chi nhánh để xem top khách hàng"
                      );
                    } else if (
                      customerFilter === "branch" &&
                      selectedBranchForCustomer === "all"
                    ) {
                      setOperationError(
                        "Vui lòng chọn chi nhánh để xem khách hàng"
                      );
                    }
                  }}
                >
                  <FaSearch /> Xem
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-indicator">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                {customerFilter === "all" &&
                  customerRevenue &&
                  customerRevenue.length > 0 && (
                    <div className="dashboard-admin-customer-revenue-section">
                      <h4>
                        Tổng doanh thu khách hàng -{" "}
                        {selectedDate.getMonth() + 1}/
                        {selectedDate.getFullYear()}
                      </h4>
                      <div className="dashboard-admin-total-revenue-card">
                        <div className="dashboard-admin-total-revenue-value">
                          {formatCurrency(
                            customerRevenue.reduce(
                              (total, item) => total + item.totalRevenue,
                              0
                            ) || 0
                          )}
                        </div>
                        <div className="dashboard-admin-total-revenue-label">
                          Tổng doanh thu từ tất cả khách hàng
                        </div>
                      </div>

                      <div className="dashboard-admin-customer-table">
                        <h4>Chi tiết doanh thu theo khách hàng</h4>
                        <table className="dashboard-admin-table">
                          <thead>
                            <tr>
                              <th>ID Khách hàng</th>
                              <th>Tên khách hàng</th>
                              <th>Tháng</th>
                              <th>Năm</th>
                              <th>Doanh thu</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerRevenue.map((item, index) => (
                              <tr key={index}>
                                <td>{item.customerID}</td>
                                <td>{item.customerName}</td>
                                <td>{item.month}</td>
                                <td>{item.year}</td>
                                <td>{formatCurrency(item.totalRevenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {customerFilter === "top" &&
                  topSpendingCustomers &&
                  topSpendingCustomers.length > 0 && (
                    <div className="dashboard-admin-top-customers-section">
                      <h4>Top khách hàng chi tiêu nhiều nhất tại chi nhánh</h4>

                      <div className="dashboard-admin-top-customers-chart">
                        <Bar
                          ref={chartRef}
                          data={{
                            labels: topSpendingCustomers.map(
                              (customer) => customer.customerName
                            ),
                            datasets: [
                              {
                                label: "Tổng chi tiêu",
                                data: topSpendingCustomers.map(
                                  (customer) => customer.totalSpent
                                ),
                                backgroundColor: topSpendingCustomers.map(
                                  (_, index) =>
                                    `hsl(${index * 30 + 180}, 70%, 60%)`
                                ),
                                borderRadius: 5,
                                maxBarThickness: 50,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: true,
                                position: "top",
                              },
                              tooltip: {
                                callbacks: {
                                  label: function (context) {
                                    let label = context.dataset.label || "";
                                    if (label) {
                                      label += ": ";
                                    }
                                    if (context.parsed.y !== null) {
                                      label += new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                        maximumFractionDigits: 0,
                                      }).format(context.parsed.y);
                                    }
                                    return label;
                                  },
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: "Tổng chi tiêu (VNĐ)",
                                },
                                ticks: {
                                  callback: function (value) {
                                    return new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                      maximumFractionDigits: 0,
                                    }).format(value);
                                  },
                                },
                              },
                              x: {
                                grid: {
                                  display: false,
                                },
                              },
                            },
                            barPercentage: 0.6,
                            categoryPercentage: 0.7,
                          }}
                        />
                      </div>
                    </div>
                  )}

                {customerFilter === "branch" &&
                  customerBranchRevenue &&
                  customerBranchRevenue.length > 0 && (
                    <div className="dashboard-admin-branch-customer-section">
                      <h4>
                        Doanh thu khách hàng tại chi nhánh{" "}
                        {branches.find(
                          (branch) =>
                            branch.branchId.toString() ===
                            selectedBranchForCustomer
                        )?.branchName || ""}{" "}
                        - {selectedDate.getMonth() + 1}/
                        {selectedDate.getFullYear()}
                      </h4>

                      <div className="dashboard-admin-total-revenue-card">
                        <div className="dashboard-admin-total-revenue-value">
                          {formatCurrency(
                            customerBranchRevenue.reduce(
                              (total, item) => total + item.totalRevenue,
                              0
                            ) || 0
                          )}
                        </div>
                        <div className="dashboard-admin-total-revenue-label">
                          Tổng doanh thu tại chi nhánh đã chọn
                        </div>
                      </div>

                      <div className="dashboard-admin-branch-customer-table">
                        <h4>
                          Chi tiết doanh thu khách hàng tại chi nhánh{" "}
                          {branches.find(
                            (branch) =>
                              branch.branchId.toString() ===
                              selectedBranchForCustomer
                          )?.branchName || ""}{" "}
                          - {selectedDate.getMonth() + 1}/
                          {selectedDate.getFullYear()}
                        </h4>

                        <table className="dashboard-admin-table">
                          <thead>
                            <tr>
                              <th>ID Khách hàng</th>
                              <th>Tên khách hàng</th>
                              <th>Tháng</th>
                              <th>Năm</th>
                              <th>Doanh thu</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerBranchRevenue.map((item, index) => (
                              <tr key={index}>
                                <td>{item.customerID}</td>
                                <td>{item.customerName}</td>
                                <td>{item.month}</td>
                                <td>{item.year}</td>
                                <td>{formatCurrency(item.totalRevenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {(!customerRevenue || customerRevenue.length === 0) &&
                  (!customerBranchRevenue ||
                    customerBranchRevenue.length === 0) &&
                  (!topSpendingCustomers ||
                    topSpendingCustomers.length === 0) && (
                    <div className="no-data-message">
                      Không có dữ liệu cho các tùy chọn đã chọn. Vui lòng chọn
                      các tùy chọn khác hoặc nhấn "Xem".
                    </div>
                  )}
              </>
            )}
          </div>
        );

      case "payment":
        const filteredPaymentData =
          paymentFilter === "all"
            ? paymentRevenue
            : paymentRevenue.filter(
                (item) => item.paymentType === paymentFilter
              );

        // Calculate the total based on filtered data
        const filteredTotal = filteredPaymentData.reduce(
          (total, item) => total + item.totalRevenue,
          0
        );
        return (
          <div className="dashboard-admin-chart-container">
            <div className="dashboard-admin-chart-header">
              <h3>Doanh thu theo phương thức thanh toán</h3>
              <select
                className="dashboard-admin-select"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">Tất cả phương thức</option>
                {paymentRevenue.map((item) => (
                  <option key={item.paymentType} value={item.paymentType}>
                    {item.paymentType}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <div className="loading-indicator">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="dashboard-admin-payment-revenue-section">
                {/* Modified grid layout with two rows */}
                <div className="dashboard-admin-chart-content-grid">
                  {/* First row: Revenue card and chart side by side */}
                  <div className="dashboard-admin-upper-content">
                    <div className="dashboard-admin-total-revenue-card">
                      <div className="dashboard-admin-total-revenue-value">
                        {formatCurrency(filteredTotal)}
                      </div>
                      <div className="dashboard-admin-total-revenue-label">
                        {paymentFilter === "all"
                          ? "Tổng doanh thu theo phương thức thanh toán"
                          : `Doanh thu từ ${paymentFilter}`}
                      </div>
                    </div>

                    {/* Limited chart size with max dimensions */}
                    <div className="dashboard-admin-doughnut-wrapper">
                      <Doughnut
                        data={{
                          labels: filteredPaymentData.map(
                            (item) => item.paymentType || "Khác"
                          ),
                          datasets: [
                            {
                              data: filteredPaymentData.map(
                                (item) => item.totalRevenue
                              ),
                              backgroundColor: [
                                "#36A2EB", // Blue for QR
                                "#4BC0C0", // Teal for QRCode
                                "#FF6384", // Pink for TienMat
                                "#FFCD56", // Yellow (extra color if needed)
                                "#9966FF", // Purple (extra color if needed)
                              ],
                              borderWidth: 1,
                              borderColor: "#ffffff",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          cutout: "60%",
                          plugins: {
                            legend: {
                              display: true,
                              position: "right",
                              labels: {
                                font: {
                                  size: 14,
                                },
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: "circle",
                              },
                            },
                            tooltip: {
                              backgroundColor: "rgba(0, 0, 0, 0.8)",
                              padding: 12,
                              titleFont: {
                                size: 14,
                                weight: "bold",
                              },
                              bodyFont: {
                                size: 13,
                              },
                              callbacks: {
                                label: (context) => {
                                  const label = context.label || "";
                                  const value = context.raw || 0;
                                  const total = context.dataset.data.reduce(
                                    (a, b) => a + b,
                                    0
                                  );
                                  const percentage = (
                                    (value / total) *
                                    100
                                  ).toFixed(2);
                                  return `${label}: ${formatCurrency(
                                    value
                                  )} (${percentage}%)`;
                                },
                              },
                            },
                          },
                          animation: {
                            animateScale: true,
                            animateRotate: true,
                            duration: 1000,
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Second row: Table takes full width */}
                  <div className="dashboard-admin-payment-table">
                    <h4>Chi tiết doanh thu theo phương thức thanh toán</h4>
                    <table className="dashboard-admin-table">
                      <thead>
                        <tr>
                          <th>Phương thức thanh toán</th>
                          <th>Doanh thu</th>
                          <th>Tỷ lệ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPaymentData.map((item, index) => {
                          const total = filteredTotal;
                          const percentage = (
                            (item.totalRevenue / total) *
                            100
                          ).toFixed(2);
                          return (
                            <tr key={index}>
                              <td>{item.paymentType || "Khác"}</td>
                              <td>{formatCurrency(item.totalRevenue)}</td>
                              <td>{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="dashboard-admin-chart-container">
            <div className="dashboard-admin-chart-header">
              <h3>Tổng hợp doanh thu</h3>
            </div>
            <div className="dashboard-admin-revenue-table">
              {loading ? (
                <div className="loading-indicator">Đang tải dữ liệu...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : (
                <table className="dashboard-admin-table">
                  <thead>
                    <tr>
                      <th>Thông tin</th>
                      <th>Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Tổng doanh thu</td>
                      <td>{formatCurrency(totalRevenue?.totalRevenue || 0)}</td>
                    </tr>
                    <tr>
                      <td>Doanh thu gói tháng</td>
                      <td>{formatCurrency(monthlyPackageRevenue || 0)}</td>
                    </tr>
                    <tr>
                      <td>Tổng khách hàng</td>
                      <td>{totalCustomers || 0}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated && errorMessage) {
    return (
      <div className="dashboard-auth-error">
        <h2>{errorMessage}</h2>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard-admin-container">
      {/* Sidebar */}
      <Sidebar_Admin
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      {/* Main Content */}
      <div className="dashboard-admin-main-content">
        <Header_Admin />
        {operation.status === "success" && (
          <div className="dashboard-admin-success-message">
            {operation.message}
          </div>
        )}
        {operationError && (
          <div className="dashboard-admin-error-message">{operationError}</div>
        )}

        {/* Summary Widgets */}
        <section className="dashboard-admin-summary">
          <div className="dashboard-admin-widget">
            <div className="dashboard-admin-widget-icon-wrapper">
              <FaDollarSign className="dashboard-admin-widget-icon" />
            </div>
            <div className="dashboard-admin-widget-content">
              <h3>Tổng doanh thu</h3>
              <p className="dashboard-admin-widget-value">
                {totalRevenue !== null
                  ? formatCurrency(totalRevenue.totalRevenue)
                  : "Đang tải..."}
              </p>
              <p className="dashboard-admin-widget-change">
                Cập nhật gần nhất: hôm nay
              </p>
            </div>
          </div>

          <div className="dashboard-admin-widget">
            <div className="dashboard-admin-widget-icon-wrapper">
              <FaUsers className="dashboard-admin-widget-icon" />
            </div>
            <div className="dashboard-admin-widget-content">
              <h3>Số khách hàng booking</h3>
              <p className="dashboard-admin-widget-value">
                {totalCustomers !== undefined ? totalCustomers : "Đang tải..."}
              </p>
              <p className="dashboard-admin-widget-change">
                Cập nhật gần nhất: hôm nay
              </p>
            </div>
          </div>

          <div className="dashboard-admin-widget">
            <div className="dashboard-admin-widget-icon-wrapper">
              <FaShoppingCart className="dashboard-admin-widget-icon" />
            </div>
            <div className="dashboard-admin-widget-content">
              <h3>Đơn hàng hoàn thành</h3>
              <p className="dashboard-admin-widget-value">
                {orderStats?.Done !== undefined
                  ? orderStats.Done
                  : "Đang tải..."}
              </p>
              <p className="dashboard-admin-widget-change">
                Cập nhật gần nhất: hôm nay
              </p>
            </div>
          </div>

          <div className="dashboard-admin-widget">
            <div className="dashboard-admin-widget-icon-wrapper">
              <FaChartLine className="dashboard-admin-widget-icon" />
            </div>
            <div className="dashboard-admin-widget-content">
              <h3>Đơn hàng đang chờ xác nhận</h3>
              <p className="dashboard-admin-widget-value">
                {orderStats?.Pending !== undefined
                  ? orderStats.Pending
                  : "Đang tải..."}
              </p>
              <p className="dashboard-admin-widget-change">
                Cập nhật gần nhất: hôm nay
              </p>
            </div>
          </div>
        </section>
        {/* Revenue Filter Section */}
        <section className="dashboard-admin-revenue-filter">
          <div className="dashboard-admin-tab-container">
            <button
              className={`dashboard-admin-tab ${
                activeView === "total" ? "active" : ""
              }`}
              onClick={() => setActiveView("total")}
            >
              <FaDollarSign /> Tổng hợp doanh thu
            </button>
            <button
              className={`dashboard-admin-tab ${
                activeView === "branch" ? "active" : ""
              }`}
              onClick={() => setActiveView("branch")}
            >
              <FaStore /> Theo chi nhánh
            </button>
            <button
              className={`dashboard-admin-tab ${
                activeView === "service" ? "active" : ""
              }`}
              onClick={() => setActiveView("service")}
            >
              <FaServicestack /> Theo dịch vụ
            </button>
            <button
              className={`dashboard-admin-tab ${
                activeView === "customer" ? "active" : ""
              }`}
              onClick={() => setActiveView("customer")}
            >
              <FaUsers /> Theo khách hàng
            </button>
            <button
              className={`dashboard-admin-tab ${
                activeView === "payment" ? "active" : ""
              }`}
              onClick={() => setActiveView("payment")}
            >
              <FaCreditCard /> Theo phương thức thanh toán
            </button>
            <button
              className="dashboard-admin-tab dashboard-admin-export-btn"
              onClick={exportToExcel}
              disabled={loading}
            >
              <FaFileExcel /> {loading ? "Đang xuất..." : "Xuất Excel"}
            </button>
          </div>
          {/* Revenue Chart Section - Dynamic based on filter */}
          <div className="dashboard-admin-chart-section">
            {renderRevenueChart()}
          </div>
        </section>

        {/* Footer Section */}
        <Footer_Admin />
      </div>
    </div>
  );
};

export default Dashboard;
