import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaWarehouse,
  FaSearch,
  FaExclamationTriangle,
  FaBoxes,
  FaDollarSign,
  FaEye,
  FaFilter,
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
import "../../assets/css/manager/manager_inventory.css";
import { jwtDecode } from "jwt-decode";

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

const Manager_Inventory = () => {
  const [inventories, setInventories] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLowStockPage, setCurrentLowStockPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [inventoryDetails, setInventoryDetails] = useState(null);
  const [inventoryStatusStats, setInventoryStatusStats] = useState({
    Active: 0,
    Inactive: 0,
  });
  const [totalInventories, setTotalInventories] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthlyInventoryValues, setMonthlyInventoryValues] = useState([]);
  const [filteredByMonthResults, setFilteredByMonthResults] = useState([]);
  const [selectedDetailMonth, setSelectedDetailMonth] = useState("");

  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });
  const [inventoryDetailData, setInventoryDetailData] = useState({});

  useEffect(() => {
    if (operation.status === "success") {
      const timer = setTimeout(() => {
        setOperation({ status: "", message: "" });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [operation.status]);

  useEffect(() => {
    if (operationError) {
      const timer = setTimeout(() => {
        setOperationError("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [operationError]);

  const recordsPerPage = 5;

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

  const fetchInventoryDetailData = async (token) => {
    try {
      const detailResponse = await fetch(
        `${apiUrl}/api/InventoryDetail/get-all-inventoryDetail`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (detailResponse.ok) {
        const detailData = await detailResponse.json();

        const detailMap = {};
        detailData.forEach((detail) => {
          detailMap[detail.inventoryDetailId] = detail;
        });

        setInventoryDetailData(detailMap);
      }
    } catch (error) {
      console.error("Error fetching inventory detail data:", error);
    }
  };
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetchData(token);
      fetchInventoryDetailData(token);
    }
  }, []);
  const getMonthOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        value: `${currentYear}-${month.toString().padStart(2, "0")}`,
        label: `Tháng ${month}/${currentYear}`,
      };
    });
  };

  const calculateMonthlyValues = (inventories, inventoryDetailMap) => {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();

    for (let i = 1; i <= 12; i++) {
      const monthKey = `${currentYear}-${i.toString().padStart(2, "0")}`;
      monthlyData[monthKey] = 0;
    }

    for (const inventory of inventories) {
      if (inventory.createdDate) {
        const date = new Date(inventory.createdDate);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        const details = inventoryDetailMap[inventory.inventoryId] || [];
        const inventoryValue = details.reduce(
          (sum, detail) => sum + (detail.totalPrice || 0),
          0
        );
        monthlyData[monthKey] += inventoryValue;
      }
    }

    return Object.keys(monthlyData).map((month) => ({
      month,
      value: monthlyData[month],
    }));
  };
  useEffect(() => {
    if (inventories.length > 0 && Object.keys(inventoryDetailData).length > 0) {
      const detailsArray = Object.values(inventoryDetailData);
      const inventoryDetailMap = groupDetailsByInventoryId(detailsArray);
      const monthlyValues = calculateMonthlyValues(
        inventories,
        inventoryDetailMap
      );
      setMonthlyInventoryValues(monthlyValues);
    }
  }, [inventories, inventoryDetailData]);

  const filterInventoriesByMonth = (inventoriesData, month) => {
    if (!month) return inventoriesData;

    return inventoriesData.filter((inventory) => {
      if (!inventory.createdDate) return false;

      const date = new Date(inventory.createdDate);
      const inventoryMonth = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      return inventoryMonth === month;
    });
  };

  const fetchData = async (token) => {
    try {
      setLoading(true);

      const inventoriesResponse = await fetch(
        `${apiUrl}/api/Inventory/get-all`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!inventoriesResponse.ok) {
        throw new Error(`HTTP error! Status: ${inventoriesResponse.status}`);
      }

      const inventoriesData = await inventoriesResponse.json();
      setInventories(inventoriesData);
      setSearchResults(inventoriesData);
      setFilteredByMonthResults(inventoriesData);
      setTotalInventories(inventoriesData.length);

      const detailsArray = Object.values(inventoryDetailData);
      const inventoryDetailMap = groupDetailsByInventoryId(detailsArray);
      const monthlyValues = calculateMonthlyValues(
        inventoriesData,
        inventoryDetailMap
      );
      setMonthlyInventoryValues(monthlyValues);

      let detailTotalValue = 0;
      for (const inventory of inventoriesData) {
        try {
          const detailResponse = await fetch(
            `${apiUrl}/api/Inventory/get-byID/${inventory.inventoryId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            if (
              detailData.inventoryDetails &&
              detailData.inventoryDetails.length > 0
            ) {
              for (const detail of detailData.inventoryDetails) {
                detailTotalValue += detail.totalPrice || 0;
              }
            }
          }
        } catch (error) {
          console.error(
            `Error fetching details for inventory ${inventory.inventoryId}:`,
            error
          );
        }
      }
      setTotalValue(detailTotalValue);

      const activeInventories = inventoriesData.filter(
        (inventory) => inventory.status === "Active"
      ).length;
      const inactiveInventories = inventoriesData.filter(
        (inventory) => inventory.status === "Inactive"
      ).length;

      setInventoryStatusStats({
        Active: activeInventories,
        Inactive: inactiveInventories,
      });

      const lowStockResponse = await fetch(
        `${apiUrl}/api/Inventory/get-low-stock-warnings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!lowStockResponse.ok) {
        throw new Error(`HTTP error! Status: ${lowStockResponse.status}`);
      }

      const lowStockData = await lowStockResponse.json();
      setLowStockItems(lowStockData);
      setLowStockCount(lowStockData.length);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setOperationError("Đã xảy ra lỗi khi tải dữ liệu.");
      setLoading(false);
    }
  };

  const fetchInventoryDetails = async (inventoryId) => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await fetch(
        `${apiUrl}/api/Inventory/get-byID/${inventoryId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Find the original inventory object that has the date
      const originalInventory = inventories.find(
        (inv) => inv.inventoryId === inventoryId
      );

      // Make sure the date is included in the details
      if (originalInventory?.createdDate) {
        data.createdDate = originalInventory.createdDate;
      }

      setInventoryDetails(data);
      setLoading(false);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching inventory details:", error);
      setOperationError("Đã xảy ra lỗi khi tải chi tiết lô hàng.");
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults(selectedMonth ? filteredByMonthResults : inventories);
      return;
    }

    const baseResults = selectedMonth ? filteredByMonthResults : inventories;

    const filteredResults = baseResults.filter(
      (inventory) =>
        inventory.inventoryName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        inventory.branchName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filteredResults);
    setCurrentPage(1);

    if (filteredResults.length === 0) {
      setOperation({
        status: "success",
        message: "Không tìm thấy lô hàng nào.",
      });
    }
  };

  const handleMonthChange = async (e) => {
    const month = e.target.value;
    setSelectedMonth(month);

    const filteredInventories = filterInventoriesByMonth(inventories, month);
    setFilteredByMonthResults(filteredInventories);
    setSearchResults(filteredInventories);
    setCurrentPage(1);

    const token = localStorage.getItem("token");

    if (!month) {
      let allTotal = 0;
      for (const inventory of inventories) {
        try {
          const detailResponse = await fetch(
            `${apiUrl}/api/Inventory/get-byID/${inventory.inventoryId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            if (
              detailData.inventoryDetails &&
              detailData.inventoryDetails.length > 0
            ) {
              for (const detail of detailData.inventoryDetails) {
                allTotal += detail.totalPrice || 0;
              }
            }
          }
        } catch (error) {
          console.error(
            `Error fetching details for inventory ${inventory.inventoryId}:`,
            error
          );
        }
      }
      setTotalValue(allTotal);
    } else {
      let monthlyTotal = 0;
      for (const inventory of filteredInventories) {
        try {
          const detailResponse = await fetch(
            `${apiUrl}/api/Inventory/get-byID/${inventory.inventoryId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            if (
              detailData.inventoryDetails &&
              detailData.inventoryDetails.length > 0
            ) {
              for (const detail of detailData.inventoryDetails) {
                monthlyTotal += detail.totalPrice || 0;
              }
            }
          }
        } catch (error) {
          console.error(
            `Error fetching details for inventory ${inventory.inventoryId}:`,
            error
          );
        }
      }
      setTotalValue(monthlyTotal);
    }

    setTotalInventories(filteredInventories.length);

    if (month && filteredInventories.length === 0) {
      setOperation({
        status: "success",
        message: "Không có lô hàng nào trong tháng đã chọn.",
      });
    }
  };
  const groupDetailsByInventoryId = (detailsArray) => {
    const map = {};
    detailsArray.forEach((detail) => {
      if (!map[detail.inventoryId]) map[detail.inventoryId] = [];
      map[detail.inventoryId].push(detail);
    });
    return map;
  };

  const calculateTotalValue = (inventories) => {
    return inventories.reduce((total, inventory) => {
      const inventoryValue = inventory.inventoryDetails?.reduce(
        (sum, detail) => sum + (detail.totalPrice || 0),
        0
      );
      return total + inventoryValue;
    }, 0);
  };

  const handleDetailMonthChange = (e) => {
    const month = e.target.value;
    setSelectedDetailMonth(month);
  };

  const getFilteredInventoryDetails = () => {
    if (!inventoryDetails || !inventoryDetails.inventoryDetails) {
      return [];
    }

    if (!selectedDetailMonth) {
      return inventoryDetails.inventoryDetails;
    }

    return inventoryDetails.inventoryDetails.filter((detail) => {
      if (
        !detail.inventoryDetailId ||
        !inventoryDetailData[detail.inventoryDetailId]?.createAt
      ) {
        return false;
      }

      const importDate = new Date(
        inventoryDetailData[detail.inventoryDetailId].createAt
      );
      const detailMonth = `${importDate.getFullYear()}-${(
        importDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

      return detailMonth === selectedDetailMonth;
    });
  };

  const getFilteredDetailsTotalValue = () => {
    const filteredDetails = getFilteredInventoryDetails();
    return filteredDetails.reduce(
      (total, detail) => total + (detail.totalPrice || 0),
      0
    );
  };

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

  const lowStockRecordsPerPage = 4;
  const totalLowStockPages = Math.ceil(
    lowStockItems.length / lowStockRecordsPerPage
  );
  const indexOfLastLowStockRecord =
    currentLowStockPage * lowStockRecordsPerPage;
  const indexOfFirstLowStockRecord =
    indexOfLastLowStockRecord - lowStockRecordsPerPage;
  const currentLowStockRecords = lowStockItems.slice(
    indexOfFirstLowStockRecord,
    indexOfLastLowStockRecord
  );

  const handleNextLowStockPage = () => {
    if (currentLowStockPage < totalLowStockPages) {
      setCurrentLowStockPage(currentLowStockPage + 1);
    }
  };

  const handlePreviousLowStockPage = () => {
    if (currentLowStockPage > 1) {
      setCurrentLowStockPage(currentLowStockPage - 1);
    }
  };

  const openViewModal = (inventoryId) => {
    fetchInventoryDetails(inventoryId);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setInventoryDetails(null);
    setSelectedDetailMonth("");
  };

  const statusChartData = {
    labels: Object.keys(inventoryStatusStats),
    datasets: [
      {
        label: "Trạng thái lô hàng",
        data: Object.values(inventoryStatusStats),
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const monthlyValueChartData = {
    labels: monthlyInventoryValues.map((item) => {
      const [year, month] = item.month.split("-");
      return `T${month}/${year}`;
    }),
    datasets: [
      {
        label: "Giá trị lô hàng theo tháng",
        data: monthlyInventoryValues.map((item) => item.value),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
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
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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
        ticks: {
          callback: function (value, index, values) {
            return new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="dashboard-manager-container">
      <Sidebar_Manager />
      <div className="dashboard-manager-main-content">
        <Header_Manager />

        <div className="manager-inventory-content">
          <div className="manager-inventory-header">
            <h1>Quản lý lô hàng</h1>
          </div>
          {operation.status === "success" && (
            <div className="manager-inventory-success-message">
              {operation.message}
            </div>
          )}
          {operationError && (
            <div className="manager-inventory-error-message">
              {operationError}
            </div>
          )}
          <div className="manager-inventory-filter-section">
            <div className="manager-inventory-filter-container">
              <label
                htmlFor="monthFilter"
                className="manager-inventory-filter-label"
              >
                <FaCalendarAlt /> Lọc theo tháng:
              </label>
              <select
                id="monthFilter"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="manager-inventory-filter-select"
              >
                <option value="">Tất cả</option>
                {getMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="manager-inventory-stats-container">
            <div className="manager-inventory-stat-card">
              <div className="manager-inventory-stat-icon total">
                <FaWarehouse />
              </div>
              <div className="manager-inventory-stat-info">
                <h3>Tổng số lô hàng</h3>
                <p>{totalInventories}</p>
                {selectedMonth && (
                  <span className="manager-inventory-filter-note">
                    Trong tháng đã chọn
                  </span>
                )}
              </div>
            </div>

            <div className="manager-inventory-stat-card">
              <div className="manager-inventory-stat-icon new">
                <FaDollarSign />
              </div>
              <div className="manager-inventory-stat-info">
                <h3>Tổng giá trị hàng</h3>
                <p>{totalValue.toLocaleString("vi-VN")} đ</p>
                {selectedMonth && (
                  <span className="manager-inventory-filter-note">
                    Trong tháng đã chọn
                  </span>
                )}
              </div>
            </div>

            <div className="manager-inventory-stat-card">
              <div className="manager-inventory-stat-icon active">
                <FaBoxes />
              </div>
              <div className="manager-inventory-stat-info">
                <h3>Lô hàng hoạt động</h3>
                <p>{inventoryStatusStats.Active}</p>
              </div>
            </div>

            <div className="manager-inventory-stat-card">
              <div className="manager-inventory-stat-icon top">
                <FaExclamationTriangle />
              </div>
              <div className="manager-inventory-stat-info">
                <h3>Cảnh báo sắp hết hàng</h3>
                <p>{lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="manager-inventory-data-container">
            <div className="manager-inventory-row">
              <div className="manager-inventory-chart-card">
                <h2>Trạng thái lô hàng</h2>
                <div className="manager-inventory-chart">
                  <Doughnut
                    data={statusChartData}
                    options={chartOptions}
                    height={200}
                  />
                </div>
              </div>

              <div className="manager-inventory-chart-card">
                <h2>Giá trị lô hàng theo tháng</h2>
                <div className="manager-inventory-chart">
                  <Line
                    data={monthlyValueChartData}
                    options={lineChartOptions}
                    height={200}
                  />
                </div>
              </div>
            </div>
            <div className="manager-inventory-low-stock-card">
              <h2>Cảnh báo sắp hết hàng</h2>
              <div className="manager-inventory-table-container">
                <table className="manager-inventory-table">
                  <thead>
                    <tr>
                      <th>Lô hàng</th>
                      <th>Chi nhánh</th>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Mức cảnh báo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLowStockRecords.length > 0 ? (
                      currentLowStockRecords.map((item, index) => (
                        <tr key={index}>
                          <td>{item.inventoryName}</td>
                          <td>{item.branchName}</td>
                          <td>{item.itemName}</td>
                          <td>{item.quantity}</td>
                          <td>
                            <span
                              className={`manager-inventory-warning ${
                                item.warningLevel.includes("Nguy cấp")
                                  ? "danger"
                                  : "warning"
                              }`}
                            >
                              {item.warningLevel}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="manager-inventory-no-data">
                          Không có cảnh báo hàng sắp hết
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {lowStockItems.length > lowStockRecordsPerPage && (
                <div className="manager-inventory-pagination">
                  <button
                    onClick={handlePreviousLowStockPage}
                    disabled={currentLowStockPage === 1}
                    className="manager-inventory-pagination-button"
                  >
                    Trang trước
                  </button>
                  <span className="manager-inventory-pagination-info">
                    Trang {currentLowStockPage} / {totalLowStockPages}
                  </span>
                  <button
                    onClick={handleNextLowStockPage}
                    disabled={currentLowStockPage === totalLowStockPages}
                    className="manager-inventory-pagination-button"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>
          </div>{" "}
          <div className="manager-inventory-search-section">
            <h2>Quản lý lô hàng</h2>
            <div className="manager-inventory-action-container">
              <div className="manager-inventory-search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm lô hàng..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="manager-inventory-search-input"
                />
                <button
                  onClick={handleSearch}
                  className="manager-inventory-search-button"
                >
                  <FaSearch /> Tìm kiếm
                </button>
              </div>
            </div>
          </div>
          {/* Inventory List */}
          <div className="manager-inventory-list-section">
            <div className="manager-inventory-table-container">
              <table className="manager-inventory-table">
                <thead>
                  <tr>
                    <th>Tên lô hàng</th>
                    <th>Chi nhánh</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Hình ảnh</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((inventory) => (
                      <tr key={inventory.inventoryId}>
                        <td>{inventory.inventoryName}</td>
                        <td>{inventory.branchName}</td>
                        <td>
                          {inventory.createdDate
                            ? new Date(
                                inventory.createdDate
                              ).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </td>
                        <td>
                          <span
                            className={`manager-inventory-status manager-inventory-status-${inventory.status.toLowerCase()}`}
                          >
                            {inventory.status}
                          </span>
                        </td>
                        <td>
                          {inventory.image ? (
                            <img
                              src={inventory.image}
                              alt={inventory.inventoryName}
                              className="manager-inventory-thumbnail"
                            />
                          ) : (
                            <span>Không có hình ảnh</span>
                          )}
                        </td>
                        <td className="manager-inventory-actions">
                          <button
                            className="manager-inventory-view-button"
                            onClick={() => openViewModal(inventory.inventoryId)}
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="manager-inventory-no-data">
                        Không có lô hàng nào phù hợp với tìm kiếm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {searchResults.length > recordsPerPage && (
              <div className="manager-inventory-pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="manager-inventory-pagination-button"
                >
                  Trang trước
                </button>
                <span className="manager-inventory-pagination-info">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="manager-inventory-pagination-button"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
          {/* View Inventory Details Modal */}
          {isViewModalOpen && inventoryDetails && (
            <div className="manager-inventory-modal-overlay">
              <div className="manager-inventory-modal manager-inventory-modal-large">
                <div className="manager-inventory-modal-header">
                  <h2>Chi tiết lô hàng</h2>
                  <button
                    className="manager-inventory-modal-close"
                    onClick={closeViewModal}
                  >
                    ×
                  </button>
                </div>
                <div className="manager-inventory-modal-body">
                  <div className="manager-inventory-details">
                    <div className="manager-inventory-detail-header">
                      <div className="manager-inventory-image-container">
                        {inventoryDetails.image ? (
                          <img
                            src={inventoryDetails.image}
                            alt={inventoryDetails.inventoryName}
                            className="manager-inventory-detail-image"
                          />
                        ) : (
                          <div className="manager-inventory-no-image">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="manager-inventory-info">
                        <h3>{inventoryDetails.inventoryName}</h3>
                        <p>
                          <strong>Chi nhánh:</strong>{" "}
                          {inventoryDetails.branchName}
                        </p>
                        <p>
                          <strong>Ngày tạo:</strong>{" "}
                          {inventoryDetails.createdDate ||
                          inventoryDetails.createdAt
                            ? new Date(
                                inventoryDetails.createdDate ||
                                  inventoryDetails.createdAt
                              ).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </p>
                        <p>
                          <strong>Trạng thái:</strong>{" "}
                          <span
                            className={`manager-inventory-status manager-inventory-status-${inventoryDetails.status?.toLowerCase()}`}
                          >
                            {inventoryDetails.status}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Filter inventory details by month */}
                    <div className="manager-inventory-detail-filter">
                      <div className="manager-inventory-detail-summary">
                        <p>
                          <strong>Tổng giá trị:</strong>{" "}
                          {getFilteredDetailsTotalValue().toLocaleString(
                            "vi-VN"
                          )}{" "}
                          đ
                          {selectedDetailMonth && (
                            <span className="manager-inventory-filter-note">
                              {" "}
                              (trong tháng đã chọn)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <h4>Chi tiết các sản phẩm</h4>
                    <div className="manager-inventory-table-container">
                      <table className="manager-inventory-table manager-inventory-detail-table">
                        <thead>
                          <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Giá nhập</th>
                            <th>Thành tiền</th>
                            <th>Ngày hết hạn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredInventoryDetails().length > 0 ? (
                            getFilteredInventoryDetails().map(
                              (detail, index) => (
                                <tr key={index}>
                                  <td>{detail.itemName}</td>
                                  <td>{detail.quantity}</td>
                                  <td>
                                    {detail.inventoryDetailId &&
                                    inventoryDetailData[
                                      detail.inventoryDetailId
                                    ]?.price
                                      ? inventoryDetailData[
                                          detail.inventoryDetailId
                                        ].price.toLocaleString("vi-VN")
                                      : detail.importPrice?.toLocaleString(
                                          "vi-VN"
                                        )}{" "}
                                    đ
                                  </td>
                                  <td>
                                    {detail.totalPrice?.toLocaleString("vi-VN")}{" "}
                                    đ
                                  </td>

                                  <td>
                                    {detail.expirationDate
                                      ? new Date(
                                          detail.expirationDate
                                        ).toLocaleDateString("vi-VN")
                                      : "N/A"}
                                  </td>
                                </tr>
                              )
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan="7"
                                className="manager-inventory-no-data"
                              >
                                {selectedDetailMonth
                                  ? "Không có sản phẩm nào có hạn sử dụng trong tháng đã chọn"
                                  : "Không có chi tiết sản phẩm"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
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

export default Manager_Inventory;
