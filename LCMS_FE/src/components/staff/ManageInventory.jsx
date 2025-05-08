import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Minus,
  Save,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "../../assets/css/staff/inventorymanagement.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../reuse/Header_Staff";
import { GetAllInventory, addDeduct } from "../../services/fetchApiStaff.js";

export default function LotInventoryManagement() {
  // Inventory data state

  const [inventories, setInventories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLots, setExpandedLots] = useState([1]); // Default expand first lot
  const [editingItem, setEditingItem] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState({
    inventoryId: null,
    detailId: null,
    amount: 0,
    action: null,
  });
  const [loading, setLoading] = useState(true);

  const [sortField, setSortField] = useState("inventoryName");
  const [sortDirection, setSortDirection] = useState("asc");
  const fetchDataInventory = async () => {
    try {
      const inventoriesData = await GetAllInventory();
      const filteredInventories = (inventoriesData || []).filter(
        (x) => x.statusDelete !== false && x.status === "Active"
      );
      setInventories(filteredInventories);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Không thể tải dữ liệu kho hàng");
    }
  };

  useEffect(() => {
    fetchDataInventory();
  }, []);

  // Filter by search term
  const filteredInventories = inventories.filter((inventory) => {
    // Search in inventory info
    const inventoryMatches = inventory.inventoryName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Search in inventory details
    const detailsMatch = inventory.inventoryDetails.some((detail) =>
      detail.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return inventoryMatches || detailsMatch;
  });

  // Sort inventories
  const sortedInventories = [...filteredInventories].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  // Toggle lot expansion
  const toggleLotExpansion = (inventoryId) => {
    if (expandedLots.includes(inventoryId)) {
      setExpandedLots(expandedLots.filter((id) => id !== inventoryId));
    } else {
      setExpandedLots([...expandedLots, inventoryId]);
    }
  };

  // Prepare to edit item
  const prepareEditItem = (inventoryId, item) => {
    setEditingItem({
      ...item,
      inventoryId: inventoryId,
    });
  };

  // Save edited item

  // Prepare to adjust quantity
  const prepareAdjustQuantity = (inventoryId, detailId, action) => {
    setAdjustQuantity({ inventoryId, detailId, amount: 1, action });
  };

  // Cancel quantity adjustment
  const cancelAdjustQuantity = () => {
    setAdjustQuantity({
      inventoryId: null,
      detailId: null,
      amount: 0,
      action: null,
    });
  };

  // Count total items in inventory
  const totalItemsCount = inventories.reduce((total, inventory) => {
    return (
      total +
      inventory.inventoryDetails.reduce(
        (invTotal, detail) => invTotal + detail.quantity,
        0
      )
    );
  }, 0);

  // Count low stock items (less than 10 units)
  const lowStockCount = inventories.reduce((total, inventory) => {
    return (
      total +
      inventory.inventoryDetails.filter((detail) => detail.quantity < 10).length
    );
  }, 0);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };
  const handleSubmitDeduct = async (itemIdDeduct) => {
    setLoading(true); // Bắt đầu loading

    try {
      // Chuẩn bị dữ liệu
      const deductData = {
        itemId: itemIdDeduct,
        quantity: adjustQuantity.amount,
        note: "Trừ số lương sản phẩm từ UI",
      };
      // Gọi API thanh toán
      const result = await addDeduct(deductData);
      await fetchDataInventory();
    } catch (error) {
    } finally {
      setLoading(false); // Kết thúc loading
      setAdjustQuantity({
        inventoryId: null,
        detailId: null,
        amount: 0,
        action: null,
      });
    }
  };

  return (
    <>
      <Header />
      <div className="manage-inventory-staff-container">
        <div className="manage-inventory-staff-wrapper">
          <header className="manage-inventory-staff-header">
            <h1 className="manage-inventory-staff-title">
              Quản Lý Kho - Cửa Hàng Giặt Là
            </h1>
            <p className="manage-inventory-staff-subtitle">
              Quản lý theo lô hàng, cập nhật số lượng nhập/xuất
            </p>
          </header>

          <div className="manage-inventory-staff-card">
            <div className="manage-inventory-staff-toolbar">
              <div className="manage-inventory-staff-search-container">
                <input
                  type="text"
                  placeholder="Tìm kiếm lô hàng hoặc sản phẩm..."
                  className="manage-inventory-staff-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  className="manage-inventory-staff-search-icon"
                  size={18}
                />
              </div>
            </div>

            {/* Inventory list */}
            <div className="manage-inventory-staff-lot-list">
              {sortedInventories.length > 0 ? (
                sortedInventories.map((inventory) => (
                  <div
                    key={inventory.inventoryId}
                    className="manage-inventory-staff-lot-item"
                  >
                    <div
                      className="manage-inventory-staff-lot-header"
                      onClick={() => toggleLotExpansion(inventory.inventoryId)}
                    >
                      <div className="manage-inventory-staff-lot-header-info">
                        <div className="manage-inventory-staff-lot-code">
                          {expandedLots.includes(inventory.inventoryId) ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronUp size={20} />
                          )}
                          <span>
                            Lô: {inventory.inventoryName} - Tạo lúc:{" "}
                            {new Date(inventory.createdDate)
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 19)}
                          </span>
                        </div>
                        <div className="manage-inventory-staff-lot-details">
                          <span>Chi nhánh: {inventory?.branchName}</span>
                          <span>Trạng thái: {inventory?.status}</span>
                          <span className="manage-inventory-staff-lot-count">
                            {inventory.inventoryDetails.length} sản phẩm
                          </span>
                          {/* <span>
                            Tổng giá trị:{" "}
                            {inventory.totalAmount.toLocaleString("vi-VN")} VNĐ
                          </span> */}
                        </div>
                      </div>
                    </div>

                    {expandedLots.includes(inventory.inventoryId) && (
                      <div className="manage-inventory-staff-lot-content">
                        <table className="manage-inventory-staff-table">
                          <thead className="manage-inventory-staff-table-header">
                            <tr>
                              <th className="manage-inventory-staff-table-th">
                                Tên sản phẩm
                              </th>
                              <th className="manage-inventory-staff-table-th">
                                Số lượng
                              </th>
                              <th className="manage-inventory-staff-table-th">
                                Đơn giá
                              </th>
                              <th className="manage-inventory-staff-table-th">
                                Thành tiền
                              </th>
                              <th className="manage-inventory-staff-table-th">
                                Hạn sử dụng
                              </th>
                              <th className="manage-inventory-staff-table-th manage-inventory-staff-actions-column">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {inventory.inventoryDetails.map((detail) => (
                              <tr
                                key={detail?.inventoryDetailId}
                                className="manage-inventory-staff-table-row"
                              >
                                <td className="manage-inventory-staff-table-td">
                                  {detail?.itemName}
                                </td>
                                <td className="manage-inventory-staff-table-td">
                                  <span
                                    className={
                                      detail?.quantity < 10
                                        ? "manage-inventory-staff-low-quantity"
                                        : ""
                                    }
                                  >
                                    {detail?.quantity}
                                  </span>
                                </td>
                                <td className="manage-inventory-staff-table-td">
                                  {detail?.price.toLocaleString("vi-VN")} VNĐ
                                </td>
                                <td className="manage-inventory-staff-table-td">
                                  {detail?.totalPrice != null
                                    ? detail.totalPrice.toLocaleString("vi-VN")
                                    : "0"}{" "}
                                  VNĐ
                                </td>

                                <td className="manage-inventory-staff-table-td">
                                  {editingItem &&
                                  editingItem.inventoryDetailId ===
                                    detail.inventoryDetailId ? (
                                    <input
                                      type="date"
                                      className="manage-inventory-staff-edit-input"
                                      value={
                                        editingItem.expirationDate
                                          ? editingItem.expirationDate.split(
                                              "T"
                                            )[0]
                                          : ""
                                      }
                                      onChange={(e) =>
                                        setEditingItem({
                                          ...editingItem,
                                          expirationDate: e.target.value,
                                        })
                                      }
                                    />
                                  ) : (
                                    formatDate(detail.expirationDate)
                                  )}
                                </td>
                                <td className="manage-inventory-staff-table-td manage-inventory-staff-actions-cell">
                                  {/* Edit item */}

                                  {/* Update quantity */}
                                  {adjustQuantity.inventoryId ===
                                    inventory.inventoryId &&
                                  adjustQuantity.detailId ===
                                    detail.inventoryDetailId ? (
                                    <div className="manage-inventory-staff-quantity-adjustment">
                                      <input
                                        type="number"
                                        min="1"
                                        className="manage-inventory-staff-quantity-input"
                                        value={adjustQuantity.amount}
                                        onChange={(e) =>
                                          setAdjustQuantity({
                                            ...adjustQuantity, // Giữ lại các giá trị cũ
                                            amount:
                                              parseInt(e.target.value) || 1, // Cập nhật giá trị mới, mặc định là 1 nếu không phải số
                                          })
                                        }
                                      />
                                      <button
                                        className="manage-inventory-staff-icon-button manage-inventory-staff-confirm-icon"
                                        onClick={() =>
                                          handleSubmitDeduct(
                                            detail.inventoryDetailId
                                          )
                                        }
                                      >
                                        <Check size={18} />
                                      </button>

                                      <div className="manage-inventory-staff-quantity-actions">
                                        <button
                                          className="manage-inventory-staff-icon-button manage-inventory-staff-cancel-icon"
                                          onClick={cancelAdjustQuantity}
                                        >
                                          <X size={18} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="manage-inventory-staff-quantity-buttons">
                                      <button
                                        className="manage-inventory-staff-icon-button manage-inventory-staff-minus-icon"
                                        title="Trừ số lượng"
                                        onClick={() =>
                                          prepareAdjustQuantity(
                                            inventory.inventoryId,
                                            detail.inventoryDetailId,
                                            "subtract"
                                          )
                                        }
                                      >
                                        <Minus size={18} />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="manage-inventory-staff-empty-message">
                  Không tìm thấy lô hàng nào
                </div>
              )}
            </div>
          </div>

          <div className="manage-inventory-staff-card">
            <h2 className="manage-inventory-staff-section-title">
              Thống kê nhanh
            </h2>
            <div className="manage-inventory-staff-stats-grid">
              <div className="manage-inventory-staff-stat-card manage-inventory-staff-stat-blue">
                <div className="manage-inventory-staff-stat-label">
                  Tổng số lô hàng
                </div>
                <div className="manage-inventory-staff-stat-value">
                  {inventories.length}
                </div>
              </div>
              <div className="manage-inventory-staff-stat-card manage-inventory-staff-stat-green">
                <div className="manage-inventory-staff-stat-label">
                  Tổng số sản phẩm
                </div>
                <div className="manage-inventory-staff-stat-value">
                  {totalItemsCount}
                </div>
              </div>
              <div className="manage-inventory-staff-stat-card manage-inventory-staff-stat-red">
                <div className="manage-inventory-staff-stat-label">
                  Cần bổ sung
                </div>
                <div className="manage-inventory-staff-stat-value">
                  {lowStockCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
