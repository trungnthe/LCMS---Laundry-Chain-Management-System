import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaChartLine,
  FaStoreAlt,
  FaClipboardList,
  FaCreditCard,
  FaUserClock,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
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
import "../../assets/css/manager/dashboard_manager.css";
import { jwtDecode } from "jwt-decode";

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

const Manager_Revenue = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [branchId, setBranchId] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [serviceRevenue, setServiceRevenue] = useState([]);
  const [paymentRevenue, setPaymentRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });

  const [serviceChartType, setServiceChartType] = useState("bar");

  const [hoursWorkedStats, setHoursWorkedStats] = useState([]);
  const [staffPerformanceView, setStaffPerformanceView] = useState("chart");

  const apiUrl = import.meta.env.VITE_API_URL;

  const today = new Date();

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

      if (decodedToken.branchId) {
        setBranchId(decodedToken.branchId);
      }

      fetchData(token);

      const [year, month] = selectedDate.split("-");
      fetchTotalHoursStats(token, year, month);
    } catch (error) {
      console.error("Error decoding token:", error);
      setOperationError("Lỗi xác thực. Vui lòng đăng nhập lại.");
      setLoading(false);
    }
  }, [selectedDate, apiUrl]);

  const fetchData = async (token) => {
    try {
      setLoading(true);
      setHasData(true);

      const totalRevenueResponse = await fetch(
        `${apiUrl}/api/Revenue/branch/Totalrevenue`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (totalRevenueResponse.ok) {
        const totalRevenueData = await totalRevenueResponse.json();
        if (
          totalRevenueData &&
          typeof totalRevenueData.totalRevenue === "number"
        ) {
          setTotalRevenue(totalRevenueData.totalRevenue);
          if (!branchId && totalRevenueData.branchId) {
            setBranchId(totalRevenueData.branchId);
          }
        } else {
          console.error(
            "Invalid total revenue data structure:",
            totalRevenueData
          );
          setOperationError("Lỗi khi truy xuất dữ liệu doanh thu chi nhánh");
        }
      } else {
        console.error(
          "Failed to fetch total revenue:",
          totalRevenueResponse.status
        );
        setOperationError("Không thể truy xuất dữ liệu doanh thu chi nhánh");
      }

      try {
        const revenueByDateResponse = await fetch(
          `${apiUrl}/api/Revenue/branch-revenue-byDatetime?date=${selectedDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!revenueByDateResponse.ok) {
          setMonthlyRevenue({ totalRevenue: 0 });
          setHasData(false);
        } else {
          const revenueByDateData = await revenueByDateResponse.json();
          setMonthlyRevenue(revenueByDateData);
          if (revenueByDateData.branchName) {
            setBranchName(revenueByDateData.branchName);
          }
        }
      } catch (error) {
        setMonthlyRevenue({ totalRevenue: 0 });
        setHasData(false);
      }

      try {
        const serviceRevenueResponse = await fetch(
          `${apiUrl}/api/Revenue/branch-service-revenue?date=${selectedDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!serviceRevenueResponse.ok) {
          setServiceRevenue([]);
        } else {
          const serviceRevenueData = await serviceRevenueResponse.json();
          setServiceRevenue(
            Array.isArray(serviceRevenueData) ? serviceRevenueData : []
          );
        }
      } catch (error) {
        setServiceRevenue([]);
      }

      try {
        const paymentRevenueResponse = await fetch(
          `${apiUrl}/api/Revenue/payment-revenue?date=${selectedDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (paymentRevenueResponse.ok) {
          const paymentRevenueData = await paymentRevenueResponse.json();
          setPaymentRevenue(paymentRevenueData);
        } else {
          setPaymentRevenue([]);
        }
      } catch (error) {
        setPaymentRevenue([]);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setHasData(false);
    }
  };

  const fetchTotalHoursStats = async (token, year, month) => {
    try {
      const url = `${apiUrl}/api/Attendance/manager/get-total-hours-worked/${year}/${month}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hours stats");
      }

      const data = await response.json();
      setHoursWorkedStats(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Error fetching hours stats:", error);
      setHoursWorkedStats([]);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleServiceChartTypeChange = (e) => {
    setServiceChartType(e.target.value);
  };

  const handleStaffPerformanceViewChange = (view) => {
    setStaffPerformanceView(view);
  };

  const currentMonth = selectedDate.split("-")[1];
  const currentYear = selectedDate.split("-")[0];

  const serviceChartData = {
    labels: serviceRevenue.map(
      (item) => `${item.serviceName} - ${item.serviceType}`
    ),
    datasets: [
      {
        label: "Doanh thu theo dịch vụ",
        data: serviceRevenue.map((item) => item.totalRevenue),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const paymentChartData = {
    labels: paymentRevenue.map((item) =>
      item.paymentType ? item.paymentType : "Không xác định"
    ),
    datasets: [
      {
        label: "Doanh thu theo phương thức thanh toán",
        data: paymentRevenue.map((item) => item.totalRevenue),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Staff performance chart data
  const staffPerformanceChartData = {
    labels: hoursWorkedStats.map(
      (item) => item.fullName || `Nhân viên ${item.employeeId}`
    ),
    datasets: [
      {
        label: "Số giờ làm việc",
        data: hoursWorkedStats.map((item) => item.totalHoursWorked || 0),
        backgroundColor: hoursWorkedStats.map((item) =>
          (item.totalHoursWorked || 0) >= 160
            ? "rgba(75, 192, 192, 0.6)"
            : "rgba(255, 99, 132, 0.6)"
        ),
        borderColor: hoursWorkedStats.map((item) =>
          (item.totalHoursWorked || 0) >= 160
            ? "rgba(75, 192, 192, 1)"
            : "rgba(255, 99, 132, 1)"
        ),
        borderWidth: 1,
      },
      {
        label: "Mức tối thiểu (160 giờ)",
        data: hoursWorkedStats.map(() => 160),
        type: "line",
        fill: false,
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw.toLocaleString("vi-VN")} đ`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const staffPerformanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Mức tối thiểu (160 giờ)") {
              return `${context.dataset.label}: ${context.raw} giờ`;
            }
            return `${context.dataset.label}: ${context.raw} giờ`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số giờ làm việc",
        },
      },
    },
  };

  const calculateTrend = () => {
    if (!hasData || !monthlyRevenue || monthlyRevenue.totalRevenue === 0) {
      return "Chưa có dữ liệu";
    }

    const randomTrend = Math.random() > 0.5;
    return randomTrend ? "Tăng ↑" : "Giảm ↓";
  };

  const calculateStaffPerformanceStats = () => {
    if (!hoursWorkedStats || hoursWorkedStats.length === 0) {
      return {
        belowTarget: 0,
        atOrAboveTarget: 0,
        averageHours: 0,
        topPerformer: { name: "N/A", hours: 0 },
      };
    }

    const belowTarget = hoursWorkedStats.filter(
      (staff) => (staff.totalHoursWorked || 0) < 160
    ).length;

    const atOrAboveTarget = hoursWorkedStats.filter(
      (staff) => (staff.totalHoursWorked || 0) >= 160
    ).length;

    const totalHours = hoursWorkedStats.reduce(
      (sum, staff) => sum + (staff.totalHoursWorked || 0),
      0
    );

    const averageHours =
      hoursWorkedStats.length > 0
        ? Math.round(totalHours / hoursWorkedStats.length)
        : 0;

    const topPerformer = hoursWorkedStats.reduce(
      (top, staff) => {
        return (staff.totalHoursWorked || 0) > top.hours
          ? {
              name: staff.fullName || `Nhân viên ${staff.employeeId}`,
              hours: staff.totalHoursWorked || 0,
            }
          : top;
      },
      { name: "N/A", hours: 0 }
    );

    return {
      belowTarget,
      atOrAboveTarget,
      averageHours,
      topPerformer,
    };
  };

  const staffStats = calculateStaffPerformanceStats();

  return (
    <div className="dashboard-manager-container">
      <Sidebar_Manager />
      <div className="dashboard-manager-main-content">
        <Header_Manager />
        <div className="dashboard-manager-revenue-content">
          <div className="dashboard-manager-revenue-header">
            <h2>Quản lý doanh thu - {branchName}</h2>
          </div>
          {operation.status === "success" && (
            <div className="dashboard-manager-success-message">
              {operation.message}
            </div>
          )}
          {operationError && (
            <div className="dashboard-manager-error-message">
              {operationError}
            </div>
          )}
          <div className="dashboard-manager-revenue-stats-container">
            <div className="dashboard-manager-revenue-stat-card">
              <div className="dashboard-manager-revenue-stat-icon total">
                <FaMoneyBillWave />
              </div>
              <div className="dashboard-manager-revenue-stat-info">
                <h3>Tổng doanh thu cả năm: </h3>
                <p>{totalRevenue?.toLocaleString("vi-VN")} đ</p>
              </div>
            </div>

            <div className="dashboard-manager-revenue-stat-card">
              <div className="dashboard-manager-revenue-stat-icon monthly">
                <FaCalendarAlt />
              </div>
              <div className="dashboard-manager-revenue-stat-info">
                <h3>
                  Doanh thu tháng {currentMonth}/{currentYear}
                </h3>
                <p>
                  {hasData && monthlyRevenue?.totalRevenue > 0
                    ? `${monthlyRevenue.totalRevenue.toLocaleString("vi-VN")} đ`
                    : "Chưa có dữ liệu"}
                </p>
              </div>
            </div>

            <div className="dashboard-manager-revenue-stat-card">
              <div className="dashboard-manager-revenue-stat-icon branch">
                <FaStoreAlt />
              </div>
              <div className="dashboard-manager-revenue-stat-info">
                <h3>Mã chi nhánh</h3>
                <p>{branchId}</p>
              </div>
            </div>

            <div className="dashboard-manager-revenue-stat-card">
              <div className="dashboard-manager-revenue-stat-icon trend">
                <FaChartLine />
              </div>
              <div className="dashboard-manager-revenue-stat-info">
                <h3>Xu hướng</h3>
                <p>{calculateTrend()}</p>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="dashboard-manager-revenue-filter-container">
            <div className="dashboard-manager-revenue-filter">
              <label>Chọn tháng xem doanh thu:</label>
              <input
                type="month"
                value={selectedDate}
                onChange={handleDateChange}
                className="dashboard-manager-revenue-date-input"
              />
            </div>
          </div>

          {!hasData ? (
            <div className="dashboard-manager-revenue-no-data-message">
              <div className="dashboard-manager-revenue-no-data-icon">
                <FaCalendarAlt />
              </div>
              <h3>
                Tháng {currentMonth}/{currentYear} chưa có dữ liệu doanh thu
              </h3>
              <p>Vui lòng chọn tháng khác hoặc quay lại sau khi có dữ liệu.</p>
            </div>
          ) : (
            <div className="dashboard-manager-revenue-data-container">
              <div className="dashboard-manager-revenue-row">
                {/* Payment Revenue Chart */}
                <div className="dashboard-manager-revenue-chart-card">
                  <h2>Doanh thu theo phương thức thanh toán</h2>
                  <div className="dashboard-manager-revenue-chart">
                    {paymentRevenue.length > 0 ? (
                      <Doughnut
                        data={paymentChartData}
                        options={chartOptions}
                        height={300}
                      />
                    ) : (
                      <div className="dashboard-manager-revenue-no-chart-data">
                        Không có dữ liệu thanh toán trong tháng này
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Revenue Chart */}
                <div className="dashboard-manager-revenue-chart-card">
                  <div className="dashboard-manager-revenue-chart-header">
                    <h2>Doanh thu theo dịch vụ</h2>
                  </div>
                  <div className="dashboard-manager-revenue-chart">
                    {serviceRevenue.length > 0 ? (
                      serviceChartType === "bar" ? (
                        <Bar
                          data={serviceChartData}
                          options={chartOptions}
                          height={300}
                        />
                      ) : (
                        <Doughnut
                          data={serviceChartData}
                          options={chartOptions}
                          height={300}
                        />
                      )
                    ) : (
                      <div className="dashboard-manager-revenue-no-chart-data">
                        Không có dữ liệu dịch vụ trong tháng này
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="dashboard-manager-revenue-chart-card">
                <div className="dashboard-manager-revenue-chart-header">
                  <h2>
                    Phân tích hiệu suất làm việc nhân viên - Tháng{" "}
                    {currentMonth}/{currentYear}
                  </h2>
                  <div className="dashboard-manager-revenue-view-controls">
                    <button
                      className={`dashboard-manager-revenue-view-btn ${
                        staffPerformanceView === "chart" ? "active" : ""
                      }`}
                      onClick={() => handleStaffPerformanceViewChange("chart")}
                    >
                      Biểu đồ
                    </button>
                    <button
                      className={`dashboard-manager-revenue-view-btn ${
                        staffPerformanceView === "table" ? "active" : ""
                      }`}
                      onClick={() => handleStaffPerformanceViewChange("table")}
                    >
                      Bảng
                    </button>
                  </div>
                </div>

                <div className="dashboard-manager-staff-stats-container">
                  <div className="dashboard-manager-staff-stat-card">
                    <div className="dashboard-manager-staff-stat-icon warning">
                      <FaExclamationTriangle />
                    </div>
                    <div className="dashboard-manager-staff-stat-info">
                      <h3>Dưới chuẩn</h3>
                      <p>{staffStats.belowTarget} nhân viên</p>
                    </div>
                  </div>

                  <div className="dashboard-manager-staff-stat-card">
                    <div className="dashboard-manager-staff-stat-icon success">
                      <FaCheckCircle />
                    </div>
                    <div className="dashboard-manager-staff-stat-info">
                      <h3>Đạt chuẩn</h3>
                      <p>{staffStats.atOrAboveTarget} nhân viên</p>
                    </div>
                  </div>

                  <div className="dashboard-manager-staff-stat-card">
                    <div className="dashboard-manager-staff-stat-icon info">
                      <FaUserClock />
                    </div>
                    <div className="dashboard-manager-staff-stat-info">
                      <h3>Trung bình giờ làm</h3>
                      <p>{staffStats.averageHours} giờ</p>
                    </div>
                  </div>

                  <div className="dashboard-manager-staff-stat-card">
                    <div className="dashboard-manager-staff-stat-icon star">
                      <FaChartLine />
                    </div>
                    <div className="dashboard-manager-staff-stat-info">
                      <h3>Nhân viên xuất sắc</h3>
                      <p>
                        {staffStats.topPerformer.name} (
                        {staffStats.topPerformer.hours} giờ)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-manager-revenue-chart">
                  {hoursWorkedStats.length > 0 ? (
                    staffPerformanceView === "chart" ? (
                      <Bar
                        data={staffPerformanceChartData}
                        options={staffPerformanceChartOptions}
                        height={300}
                      />
                    ) : (
                      <div className="dashboard-manager-staff-table-container">
                        <table className="dashboard-manager-revenue-table">
                          <thead>
                            <tr>
                              <th>Tên nhân viên</th>
                              <th>ID nhân viên</th>
                              <th>Tổng giờ làm việc</th>
                              <th>So với chuẩn (160 giờ)</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hoursWorkedStats.map((staff, index) => {
                              const diff = (staff.totalHoursWorked || 0) - 160;
                              const status =
                                diff >= 0 ? "Đạt chuẩn" : "Dưới chuẩn";
                              const statusClass =
                                diff >= 0
                                  ? "staff-status-success"
                                  : "staff-status-warning";

                              return (
                                <tr key={index}>
                                  <td>{staff.fullName || "N/A"}</td>
                                  <td>{staff.employeeId}</td>
                                  <td>{staff.totalHoursWorked || 0} giờ</td>
                                  <td
                                    className={
                                      diff >= 0
                                        ? "positive-diff"
                                        : "negative-diff"
                                    }
                                  >
                                    {diff >= 0 ? `+${diff}` : diff} giờ
                                  </td>
                                  <td className={statusClass}>{status}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    <div className="dashboard-manager-revenue-no-chart-data">
                      Không có dữ liệu hiệu suất nhân viên trong tháng này
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-manager-revenue-table-card">
                <h2>
                  Chi tiết doanh thu theo dịch vụ - Tháng {currentMonth}/
                  {currentYear}
                </h2>
                <div className="dashboard-manager-revenue-table-container">
                  <table className="dashboard-manager-revenue-table">
                    <thead>
                      <tr>
                        <th>Tên dịch vụ</th>
                        <th>Loại dịch vụ</th>
                        <th>Doanh thu</th>
                        <th>Tỷ lệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceRevenue && serviceRevenue.length > 0 ? (
                        serviceRevenue.map((service, index) => {
                          const totalServiceRevenue = serviceRevenue.reduce(
                            (acc, curr) => acc + curr.totalRevenue,
                            0
                          );
                          const percentage = totalServiceRevenue
                            ? (
                                (service.totalRevenue / totalServiceRevenue) *
                                100
                              ).toFixed(2)
                            : 0;

                          return (
                            <tr key={index}>
                              <td>{service.serviceName}</td>
                              <td>{service.serviceType}</td>
                              <td>
                                {service.totalRevenue.toLocaleString("vi-VN")} đ
                              </td>
                              <td>{percentage}%</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="dashboard-manager-revenue-no-data"
                          >
                            Không có dữ liệu doanh thu theo dịch vụ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="dashboard-manager-revenue-info-container">
                <div className="dashboard-manager-revenue-info-card">
                  <h2>
                    <FaClipboardList /> Thống kê chi nhánh
                  </h2>
                  <div className="dashboard-manager-revenue-info-content">
                    <div className="dashboard-manager-revenue-info-item">
                      <span className="dashboard-manager-revenue-info-label">
                        Chi nhánh:
                      </span>
                      <span className="dashboard-manager-revenue-info-value">
                        {branchName}
                      </span>
                    </div>
                    <div className="dashboard-manager-revenue-info-item">
                      <span className="dashboard-manager-revenue-info-label">
                        Mã chi nhánh:
                      </span>
                      <span className="dashboard-manager-revenue-info-value">
                        {branchId}
                      </span>
                    </div>
                    <div className="dashboard-manager-revenue-info-item">
                      <span className="dashboard-manager-revenue-info-label">
                        Tổng doanh thu cả năm:
                      </span>
                      <span className="dashboard-manager-revenue-info-value">
                        {totalRevenue?.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="dashboard-manager-revenue-info-item">
                      <span className="dashboard-manager-revenue-info-label">
                        Doanh thu tháng {currentMonth}/{currentYear}:
                      </span>
                      <span className="dashboard-manager-revenue-info-value">
                        {hasData && monthlyRevenue?.totalRevenue > 0
                          ? `${monthlyRevenue.totalRevenue.toLocaleString(
                              "vi-VN"
                            )} đ`
                          : "Chưa có dữ liệu"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-manager-revenue-info-card">
                  <h2>
                    <FaCreditCard /> Thông tin thanh toán - Tháng {currentMonth}
                    /{currentYear}
                  </h2>
                  <div className="dashboard-manager-revenue-info-content">
                    {paymentRevenue.length > 0 ? (
                      paymentRevenue.map((payment, index) => (
                        <div
                          key={index}
                          className="dashboard-manager-revenue-info-item"
                        >
                          <span className="dashboard-manager-revenue-info-label">
                            {payment.paymentType
                              ? payment.paymentType
                              : "Không xác định"}
                            :
                          </span>
                          <span className="dashboard-manager-revenue-info-value">
                            {payment.totalRevenue?.toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="dashboard-manager-revenue-no-data">
                        Không có dữ liệu thanh toán trong tháng này
                      </p>
                    )}
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
export default Manager_Revenue;
