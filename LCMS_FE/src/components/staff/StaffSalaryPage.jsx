import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Header from "../reuse/Header_Staff.jsx";
import {
  fetchStaffInfo,
  fetchSalaryStructure,
  fetchDataTotalHoursWorked,
} from "../../services/fetchApiStaff.js";

import { TrendingUp, Clock, Search } from "lucide-react";
import { Await } from "react-router-dom";

const StaffSalaryPage = () => {
  const [activeTab, setActiveTab] = useState("salary-tracking");
  const [getSalaryTruc, setSalaryStruc] = useState({
    baseSalary: 10000000,
    allowance: 1000000,
    standardHoursPerMonth: 160,
  });
  const currentDate = new Date();

  const [staffData, setStaffData] = useState(null);
  const [searchMonth, setSearchMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [searchYear, setSearchYear] = useState(new Date().getFullYear()); // Current year
  const [salaryData, setSalaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchStaffInfo();
        setStaffData(data);
      } catch (error) {
        console.error("Error fetching staff info:", error);
        toast.error("Không thể tải thông tin nhân viên");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDataSalaryStruc = async () => {
      if (staffData?.employeeRoleId) {
        try {
          const salaryData = await fetchSalaryStructure(
            staffData.employeeRoleId
          );
          if (salaryData) {
            setSalaryStruc(salaryData);
          }
        } catch (error) {
          console.error("Error fetching salary structure:", error);
        }
      }
    };

    fetchDataSalaryStruc();
  }, [staffData]);

  // Default initial data - will be replaced by search results
  const defaultSalaryData = {
    employeeId: staffData?.id || 14,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    totalHoursWorked: 152,
    totalOvertimeHours: 5,
    baseSalary: getSalaryTruc.baseSalary || 10000000,
    allowance: getSalaryTruc.allowance || 1000000,
    estimatedSalary: 11000000,
  };

  // Use salaryData or fall back to default data
  const currentSalaryData = salaryData || defaultSalaryData;

  const fetchSalaryByMonthYear = async () => {
    if (isLoading) return; // Nếu đang loading, không gọi lại API

    setIsLoading(true);
    try {
      // Gọi API thực tế thay vì setTimeout giả lập
      const mockResponse = await fetchDataTotalHoursWorked(
        searchYear,
        searchMonth
      );

      // Kiểm tra dữ liệu trả về
      if (mockResponse) {
        setSalaryData(mockResponse); // Gán dữ liệu cho state
      } else {
        toast.error("Không có dữ liệu lương cho tháng này.");
      }

      setIsLoading(false); // Kết thúc loading sau khi có dữ liệu
    } catch (error) {
      toast.error("Không thể tải dữ liệu lương. Vui lòng thử lại sau.");
      setIsLoading(false); // Kết thúc loading nếu có lỗi xảy ra
    }
  };

  useEffect(() => {
    // Fetch dữ liệu ngay khi vào trang với tháng và năm hiện tại
    if (!salaryData) {
      fetchSalaryByMonthYear();
    }
  }, []); // Chỉ chạy lần đầu tiên khi component mount
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getMonthName = (month) => {
    return `Tháng ${month}/${searchYear}`;
  };

  // Generate month options for select
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate year options (current year and 3 previous years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
  ];

  return (
    <>
      <Header />
      <div className="salary-page-container">
        <div className="salary-page-header">
          <h1 className="page-title">Thông Tin Lương</h1>
        </div>

        {/* Search Section */}
        <div className="search-container card">
          <div className="search-form">
            <div className="search-fields">
              <div className="search-field">
                <label htmlFor="month-select">Tháng</label>
                <select
                  id="month-select"
                  value={searchMonth}
                  onChange={(e) => setSearchMonth(parseInt(e.target.value))}
                  disabled={isLoading}
                >
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="year-select">Năm</label>
                <select
                  id="year-select"
                  value={searchYear}
                  onChange={(e) => setSearchYear(parseInt(e.target.value))}
                  disabled={isLoading}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="search-button"
              onClick={fetchSalaryByMonthYear}
              disabled={isLoading}
            >
              {isLoading ? "Đang tải..." : "Tìm kiếm"}
              {!isLoading && <Search size={16} className="search-icon" />}
            </button>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={`tab-button ${
                activeTab === "salary-tracking" ? "active" : ""
              }`}
              onClick={() => setActiveTab("salary-tracking")}
            >
              Theo Dõi Lương
            </button>
            <button
              className={`tab-button ${
                activeTab === "salary-table" ? "active" : ""
              }`}
              onClick={() => setActiveTab("salary-table")}
            >
              Bảng Lương
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === "salary-table" && (
              <div className="tab-panel">
                <div className="card salary-structure-card">
                  <div className="card-header">
                    <h2 className="card-title">Chi Tiết Cấu Trúc Lương</h2>
                    <p className="card-description">
                      Phân tích chi tiết cấu trúc lương của bạn
                    </p>
                  </div>
                  <div className="card-content">
                    <div className="salary-structure-grid">
                      <div className="salary-structure-item">
                        <h3 className="structure-title">Lương cơ bản</h3>
                        <div className="structure-value">
                          {formatCurrency(getSalaryTruc.baseSalary)}
                        </div>

                        <p className="structure-description">
                          Lương cơ bản dựa trên hợp đồng lao động của bạn
                        </p>
                      </div>

                      <div className="salary-structure-item">
                        <h3 className="structure-title">Thưởng & Phụ cấp</h3>
                        <ul className="benefits-list">
                          <li className="benefit-item">
                            <span>Phụ cấp</span>
                            <span>
                              {formatCurrency(getSalaryTruc.allowance)}
                            </span>
                          </li>

                          <li className="benefit-item">
                            <span>Số lương trên 1 giờ</span>
                            <span>
                              {formatCurrency(
                                getSalaryTruc.baseSalary /
                                  getSalaryTruc.standardHoursPerMonth
                              )}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "salary-tracking" && (
              <div className="tab-panel">
                <div className="metrics-grid">
                  <div className="card metric-card">
                    <div className="card-header">
                      <h2 className="card-title">Lương Tháng</h2>
                      <p className="card-description">
                        {getMonthName(currentSalaryData.month)}
                      </p>
                    </div>
                    <div className="card-content">
                      <div className="metric-value">
                        {formatCurrency(currentSalaryData.estimatedSalary)}
                      </div>
                      <div className="metric-label">Ước tính</div>
                    </div>
                  </div>

                  <div className="card metric-card">
                    <div className="card-header">
                      <h2 className="card-title">Giờ Làm Việc</h2>
                      <p className="card-description">
                        Tổng giờ làm việc tháng này
                      </p>
                    </div>
                    <div className="card-content">
                      <div className="hours-container">
                        <Clock className="hours-icon" size={20} />
                        <div className="metric-value">
                          {currentSalaryData.totalHoursWorked} giờ
                        </div>
                      </div>
                      <div className="metric-label">Trên tổng 160 giờ</div>
                    </div>
                  </div>

                  <div className="card metric-card">
                    <div className="card-header">
                      <h2 className="card-title">Giờ Làm Thêm</h2>
                      <p className="card-description">Tổng giờ làm thêm</p>
                    </div>
                    <div className="card-content">
                      <div className="hours-container">
                        <TrendingUp className="overtime-icon" size={20} />
                        <div className="metric-value">
                          {currentSalaryData.totalOvertimeHours} giờ
                        </div>
                      </div>
                      <div className="metric-label">
                        Giờ làm thêm trong tháng
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card forecast-card">
                  <div className="card-header">
                    <h2 className="card-title">Chi Tiết Lương</h2>
                    <p className="card-description">
                      {getMonthName(currentSalaryData.month)}
                    </p>
                  </div>
                  <div className="card-content">
                    <div className="forecast-grid">
                      <div className="forecast-details">
                        <div className="forecast-item">
                          <div className="forecast-label">Lương cơ bản</div>
                          <div className="forecast-value">
                            {formatCurrency(currentSalaryData.baseSalary)}
                          </div>
                        </div>
                        <div className="forecast-item">
                          <div className="forecast-label">Phụ cấp</div>
                          <div className="forecast-value bonus-amount">
                            {formatCurrency(currentSalaryData.allowance)}
                          </div>
                        </div>
                      </div>
                      <div className="forecast-summary">
                        <div className="summary-label">
                          Ước tính lương tháng này
                        </div>
                        <div className="summary-value">
                          {formatCurrency(currentSalaryData.estimatedSalary)}
                        </div>
                        {currentSalaryData.month ===
                          new Date().getMonth() + 1 && (
                          <div className="trend-indicator">
                            <TrendingUp size={16} className="trend-icon" />
                            <span>Tháng hiện tại</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          /* Main Container Styles */

          .salary-page-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            font-family: "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
            color: #333;
            background-color: #f7f9fc;
          }

          /* Header Styles */
          .salary-page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .page-title {
            font-size: 2rem;
            font-weight: 600;
            color: #1a365d;
            margin: 0;
          }

          .staff-badge {
            display: flex;
            align-items: center;
            background-color: #ebf4ff;
            color: #3182ce;
            border-radius: 0.5rem;
            padding: 0.75rem 1.25rem;
            font-weight: 600;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }

          .badge-icon {
            margin-right: 0.5rem;
          }

          /* Search Styles */
          .search-container {
            margin-bottom: 2rem;
            padding: 1.5rem;
          }

          .search-form {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
          }

          .search-fields {
            display: flex;
            gap: 1rem;
            flex-grow: 1;
          }

          .search-field {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            min-width: 120px;
          }

          .search-field label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #4a5568;
          }

          .search-field select {
            padding: 0.75rem;
            border-radius: 0.375rem;
            border: 1px solid #e2e8f0;
            background-color: #f7fafc;
            font-size: 1rem;
            transition: all 0.2s;
          }

          .search-field select:focus {
            outline: none;
            border-color: #3182ce;
            box-shadow: 0 0 0 1px #3182ce;
          }

          .search-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background-color: #3182ce;
            color: white;
            border: none;
            border-radius: 0.375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .search-button:hover {
            background-color: #2c5282;
          }

          .search-button:disabled {
            background-color: #a0aec0;
            cursor: not-allowed;
          }

          .search-icon {
            stroke-width: 2.5;
          }

          /* Tabs Styles */
          .tabs-container {
            background-color: #fff;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05),
              0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }

          .tabs-header {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 1px solid #e2e8f0;
          }

          .tab-button {
            background: none;
            border: none;
            padding: 1.25rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            color: #718096;
          }

          .tab-button:hover {
            color: #3182ce;
            background-color: #f8fafc;
          }

          .tab-button.active {
            color: #3182ce;
          }

          .tab-button.active::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background-color: #3182ce;
          }

          .tabs-content {
            padding: 2rem;
          }

          .tab-panel {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          /* Card Styles */
          .card {
            background-color: #fff;
            border-radius: 0.75rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #edf2f7;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }

          .card-header {
            padding: 1.5rem;
            border-bottom: 1px solid #edf2f7;
          }

          .card-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
          }

          .card-description {
            margin: 0.5rem 0 0;
            color: #718096;
            font-size: 0.875rem;
          }

          .card-content {
            padding: 1.5rem;
          }

          /* Table Styles */
          .table-responsive {
            overflow-x: auto;
          }

          .data-table {
            width: 100%;
            border-collapse: collapse;
          }

          .data-table th {
            text-align: left;
            padding: 1rem;
            background-color: #f7fafc;
            font-weight: 600;
            color: #4a5568;
            border-bottom: 2px solid #e2e8f0;
            white-space: nowrap;
          }

          .data-table td {
            padding: 1rem;
            border-bottom: 1px solid #edf2f7;
            vertical-align: middle;
          }

          .data-table tr:last-child td {
            border-bottom: none;
          }

          .data-table tr:hover {
            background-color: #f8fafc;
          }

          .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-align: center;
          }

          .status-paid {
            background-color: #c6f6d5;
            color: #276749;
          }

          .bonus-amount {
            color: #38a169;
            font-weight: 500;
          }

          .deduction-amount {
            color: #e53e3e;
            font-weight: 500;
          }

          .net-salary {
            font-weight: 600;
          }

          .total-row {
            background-color: #f7fafc;
          }

          /* Salary Structure Styles */
          .salary-structure-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .structure-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            color: #2d3748;
          }

          .structure-value {
            font-size: 1.5rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
          }

          .structure-description {
            color: #718096;
            font-size: 0.875rem;
            margin: 0;
          }

          .benefits-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .benefit-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid #edf2f7;
          }

          .benefit-item:last-child {
            border-bottom: none;
          }

          /* Metrics Grid Styles */
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .metric-card .card-header {
            padding: 1rem 1.5rem;
          }

          .metric-card .card-title {
            font-size: 1.125rem;
          }

          .metric-value {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          .metric-label {
            color: #718096;
            font-size: 0.875rem;
          }

          /* Progress Bar Styles */
          .progress-bar {
            width: 100%;
            height: 0.5rem;
            background-color: #e2e8f0;
            border-radius: 9999px;
            overflow: hidden;
            margin-top: 0.75rem;
          }

          .progress-bar-fill {
            height: 100%;
            background-color: #3182ce;
            border-radius: 9999px;
            transition: width 0.5s ease;
          }

          /* Hours Display Styles */
          .hours-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .hours-icon {
            color: #3182ce;
          }

          /* Performance Metrics Styles */
          .performance-metrics {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .performance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            border-bottom: 1px solid #edf2f7;
          }

          .performance-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }

          .performance-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .performance-target {
            font-size: 0.875rem;
            color: #718096;
          }

          .performance-value {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .value-text {
            font-weight: 600;
          }

          .success-icon {
            color: #38a169;
          }

          .warning-icon {
            color: #ecc94b;
          }

          /* Forecast Styles */
          .forecast-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .forecast-details {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
          }

          .forecast-item {
            margin-bottom: 1rem;
          }

          .forecast-label {
            font-size: 0.875rem;
            color: #718096;
            margin-bottom: 0.25rem;
          }

          .forecast-value {
            font-size: 1.125rem;
            font-weight: 500;
          }

          .forecast-summary {
            padding-left: 2rem;
            border-left: 1px solid #edf2f7;
          }

          .summary-label {
            font-size: 0.875rem;
            color: #718096;
            margin-bottom: 0.5rem;
          }

          .summary-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #2d3748;
          }

          .trend-indicator {
            display: flex;
            align-items: center;
            color: #38a169;
            font-size: 0.875rem;
            font-weight: 600;
            gap: 0.25rem;
          }

          .trend-icon {
            color: #38a169;
          }

          /* Responsive Styles */
          @media (max-width: 992px) {
            .metrics-grid {
              grid-template-columns: 1fr 1fr;
            }

            .forecast-grid,
            .salary-structure-grid {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }

            .forecast-summary {
              padding-left: 0;
              border-left: none;
              border-top: 1px solid #edf2f7;
              padding-top: 1.5rem;
            }
          }

          @media (max-width: 768px) {
            .metrics-grid {
              grid-template-columns: 1fr;
            }

            .tabs-content {
              padding: 1.5rem;
            }

            .salary-page-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }
          }
        `}</style>
        <style>
          {`
    .salary-box {
      color: red;
    }
  `}
        </style>
      </div>
      <ToastContainer />;
    </>
  );
};

export default StaffSalaryPage;
