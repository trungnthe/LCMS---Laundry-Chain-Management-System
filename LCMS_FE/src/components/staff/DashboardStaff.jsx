import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../reuse/Header_Staff.jsx";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";

import {
  MessageCircle,
  ThumbsUp,
  AlertTriangle,
  Clock,
  Phone,
  Star,
  User,
  Calendar,
} from "lucide-react";

import "../../assets/css/staff/staffs.css";
import {
  FaBoxOpen,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

import {
  getBookingPendingAsync,
  updateBookingStatusAsync,
  getLowStockWarningsAsync,
  fetchAllFeedbacksByBranchAsync,
  responseFeedback,
  getAllBookingsDeliveringAsync,
  fetchStaffInfo,
} from "../../services/fetchApiStaff.js";
const apiUrl = import.meta.env.VITE_API_URL;

const DashboardStaff = () => {
  const [bookingPendingData, setBookingPending] = useState([]);
  const [bookingDeliveringData, setBookingDelivering] = useState([]);
  const navigate = useNavigate();
  const [feedbackData, setFeedback] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFeedbacks = feedbackData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(feedbackData.length / itemsPerPage);
  const [staffData, setStaffData] = useState(null);

  const [loading, setIsLoading] = useState([]);
  const notificationSound = new Audio(
    "/sounds/notification-sound-3-262896.mp3"
  );

  const notificationSoundNewBooking = new Audio(
    "/sounds/notification-1-270124.mp3"
  );
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter items by search term and branch
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inventoryName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get unique branch names for filter dropdown

  // Get warning level class
  const getWarningLevelClass = (warningLevel) => {
    if (warningLevel.includes("Nguy cấp"))
      return "dashboard-staff-inventory-critical";
    if (warningLevel.includes("Cảnh báo"))
      return "dashboard-staff-inventory-warning";
    if (warningLevel.includes("Bình thường"))
      return "dashboard-staff-inventory-normal";
    return "dashboard-staff-inventory-out-of-stock";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    return status === "Active" ? (
      <FaCheckCircle className="dashboard-staff-inventory-status-icon active" />
    ) : (
      <FaInfoCircle className="dashboard-staff-inventory-status-icon inactive" />
    );
  };
  useEffect(() => {
    const fetchDataInfo = async () => {
      try {
        const data = await fetchStaffInfo();
        setStaffData(data);
      } catch (error) {
        console.error("Error fetching staff info:", error);
        toast.error("Không thể tải thông tin nhân viên");
      }
    };

    fetchDataInfo();
  }, []);
  useEffect(() => {
    // Skip connection setup if staffData isn't loaded yet
    if (!staffData) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/signalHub`, {
        transport: signalR.HttpTransportType.WebSockets, // Lưu ý: signalR vẫn cần được import cho HttpTransportType
        accessTokenFactory: () => localStorage.getItem("token"), // nếu bạn có dùng JWT
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information) // signalR vẫn cần cho LogLevel
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR connected ✅");

        // Lắng nghe sự kiện từ server
        connection.on("receiveupdate", (data) => {
          const { action, branchId } = data; // Giả sử data chứa action và branchId
          if (
            action === "NewBooking" &&
            Number(branchId) === Number(staffData.branchId)
          ) {
            fetchDataBookingPending();
          } else {
            console.log(
              "Chi nhánh không khớp:",
              branchId,
              "vs",
              staffData.branchId
            );
          }
        });
      })
      .catch((err) => {
        console.error("❌ SignalR connection error:", err);
      });

    // Cleanup khi component unmount
    return () => {
      connection.stop();
    };

  }, [staffData]);

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`dashboard-staff-feedback-star ${
            i <= rating ? "dashboard-staff-feedback-star-filled" : ""
          }`}
        />
      );
    }
    return stars;
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3");
  };
  // Đế số lượng đơn hàng theo trạng thái
  const countOrdersByStatus = () => {
    const total = bookingPendingData.length;
    const pending = bookingDeliveringData.length;

    return { total, pending };
  };

  const orderCounts = countOrdersByStatus();
  const handleStatusBookingChange = async (bookingId, newStatus) => {
    setIsLoading(true); // Bắt đầu loading
    try {
      const successMessage = await updateBookingStatusAsync(
        bookingId,
        newStatus
      );
      notificationSound.play(); // Phát âm thanh thông báo

      // Kiểm tra nếu successMessage là "Success"
      toast.success("Cập nhật trạng thái thành công!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Gọi lại fetchData để lấy lại dữ liệu sau khi cập nhật
      await fetchDataBookingPending();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false); // Dừng loading khi API hoàn thành
    }
  };
  const fetchDataPending = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        getLowStockWarningsAsync(setInventoryItems),
        getAllBookingsDeliveringAsync(setBookingDelivering),
      ]);
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataPending();
  }, []);
  const fetchDataBookingPending = async () => {
    try {
      setIsLoading(true);
      await Promise.all([getBookingPendingAsync(setBookingPending)]);
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataBookingPending();
  }, []);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchAllFeedbacksByBranchAsync(setFeedback)]);
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  // Empty dependency array ensures this effect only runs once when the component mounts
  const [replyFormVisible, setReplyFormVisible] = useState(null); // Track which feedback has reply form visible
  const [replyText, setReplyText] = useState("");

  // Function to handle the reply button click
  const handleReplyClick = (feedbackId) => {
    // Toggle the visibility of the reply form for the selected feedback
    setReplyFormVisible(replyFormVisible === feedbackId ? null : feedbackId);
  };

  // Function to handle form input change
  const handleInputChange = (e) => {
    setReplyText(e.target.value);
  };
  const handleFormSubmit = async (feedbackId, bookingDetailId) => {
    if (!replyText.trim()) {
      alert("Vui lòng nhập nội dung phản hồi!");
      return;
    }
    const replyData = {
      comment: replyText,
      bookingDetailId: bookingDetailId,
    };

    await responseFeedback(feedbackId, replyData);

    toast.success("Phản hồi đã được gửi!");
    setReplyFormVisible(null);
    setReplyText("");

    // Gọi lại fetchData để reload toàn bộ dữ liệu
    await fetchData();
  };
  const suggestedReplies = [
    "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!",
    "Chúng tôi rất tiếc về trải nghiệm không tốt của bạn.",
    "Chúng tôi sẽ cải thiện để phục vụ bạn tốt hơn lần sau.",
    "Rất vui khi biết bạn hài lòng với dịch vụ của chúng tôi.",
  ];
  const handleSuggestedReplyClick = (text) => {
    setReplyText(text);
  };

  return (
    <>
      <Header />
      <div className="dashboard-staff">
        {/* Header */}

        <div className="dashboard-staff-main-container">
          {/* Sidebar */}

          {/* Main Content */}
          <main className="dashboard-staff-main-content">
            <div className="dashboard-staff-page-title">
              <h2>Tổng quan chi nhánh</h2>
              <div className="dashboard-staff-order-counts">
                <div className="dashboard-staff-count-badge">
                  <span className="dashboard-staff-count-value">
                    {orderCounts.total}
                  </span>
                  <span className="dashboard-staff-count-label">
                    Chờ xác nhận
                  </span>
                </div>
                <div className="dashboard-staff-count-badge warning">
                  <span className="dashboard-staff-count-value">
                    {inventoryItems.length}
                  </span>
                  <span className="dashboard-staff-count-label">
                    Cảnh báo hàng tồn kho
                  </span>
                </div>
                <div className="dashboard-staff-count-badge pending">
                  <span className="dashboard-staff-count-value">
                    {orderCounts.pending}
                  </span>
                  <span className="dashboard-staff-count-label">Chờ giao</span>
                </div>
                <div className="dashboard-staff-count-badge success">
                  <span className="dashboard-staff-count-value">
                    {feedbackData.length}{" "}
                  </span>
                  <span className="dashboard-staff-count-label">
                    Phản hồi khách hàng
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-staff-dashboard-grid">
              {/* Processing Orders */}
              <div className="dashboard-staff-card dashboard-staff-orders-card">
                <div className="dashboard-staff-card-header">
                  <h3>Đơn hàng đang chờ xác nhận</h3>
                  <button
                    className="dashboard-staff-view-all-btn"
                    onClick={() => navigate("/nhan-vien/danh-sach-don-hang")}
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="dashboard-staff-order-list">
                  {loading ? (
                    <div className="dashboard-staff-loading-spinner">
                      <div className="staff-loading-spinner-circle" />
                    </div>
                  ) : bookingPendingData && bookingPendingData.length > 0 ? (
                    bookingPendingData.map((order) => (
                      <div
                        key={order.bookingId}
                        className={`dashboard-staff-order-item ${
                          order.status === "Quá hạn" ? "overdue" : ""
                        }`}
                      >
                        <div key={order.bookingId}>
                          <div className="dashboard-staff-order-header">
                            <div className="dashboard-staff-order-id">
                              Mã vận đơn : {order.bookingId}
                            </div>
                            <div
                              className={`dashboard-staff-order-status ${
                                order.status === "Quá hạn"
                                  ? "dashboard-staff-status-overdue"
                                  : "dashboard-staff-status-processing"
                              }`}
                            >
                              {order.status === "Pending" ? (
                                <AlertTriangle size={14} />
                              ) : (
                                <Clock size={14} />
                              )}
                              <span>
                                {order.status === "Pending"
                                  ? "Chờ xác nhận"
                                  : order.status}
                              </span>
                            </div>
                          </div>
                          <div className="dashboard-staff-order-body">
                            <div className="dashboard-staff-order-info">
                              <div className="dashboard-staff-customer-name">
                                Tên khách hàng:{" "}
                                {order?.customerName || order.guestName}
                              </div>
                              <div className="dashboard-staff-service-type">
                                <div>
                                  Dịch vụ:{" "}
                                  {order.bookingDetailService?.join(", ")}
                                </div>
                              </div>
                              <div className="dashboard-staff-order-items">
                                <div>
                                  {order.bookingDetailItems?.filter(
                                    (item) => item
                                  ).length > 0 && (
                                    <div>
                                      Sản phẩm:{" "}
                                      {order.bookingDetailItems
                                        .filter((item) => item)
                                        .join(", ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="dashboard-staff-order-deadline">
                                <Clock size={14} />
                                <span>
                                  Tạo lúc :{" "}
                                  {new Date(order.bookingDate).toLocaleString()}
                                </span>
                              </div>
                              <div className="dashboard-staff-order-items">
                                <div>Ghi chú đồ của khách : {order?.note}</div>
                              </div>
                              <div className="dashboard-staff-order-deadline">
                                <Phone size={14} />
                                <span>
                                  <div>
                                    Số điện thoại:
                                    {formatPhoneNumber(
                                      order?.phoneNumber ||
                                        order.guestPhoneNumber
                                    )}
                                  </div>
                                </span>
                              </div>
                            </div>
                            <div className="dashboard-staff-order-progress"></div>
                          </div>
                          <div className="dashboard-staff-order-actions">
                            <button
                              className="dashboard-staff-action-btn dashboard-staff-update-btn"
                              onClick={() =>
                                handleStatusBookingChange(
                                  order.bookingId,
                                  "Rejected"
                                )
                              }
                            >
                              Từ chối
                            </button>
                            <button
                              className="dashboard-staff-action-btn dashboard-staff-complete-btn"
                              onClick={() =>
                                handleStatusBookingChange(
                                  order.bookingId,
                                  "Confirmed"
                                )
                              }
                            >
                              Xác nhận
                            </button>
                          </div>
                        </div>{" "}
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-staff-no-orders">
                      Hiện không có đơn nào.
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Delivery Orders */}
              <div className="dashboard-staff-card dashboard-staff-delivery-card">
                <div className="dashboard-staff-card-header">
                  <h3>Đơn hàng chờ giao</h3>
                </div>
                <div className="dashboard-staff-delivery-list">
                  {bookingDeliveringData && bookingDeliveringData.length > 0 ? (
                    bookingDeliveringData.map((order, index) => (
                      <div
                        key={order.bookingId || `order-${index}`} // Fallback an toàn
                        className="dashboard-staff-delivery-item"
                      >
                        <div className="dashboard-staff-delivery-header">
                          <div className="dashboard-staff-order-id">
                            Mã vận đơn: {order.bookingId}
                          </div>
                          <div className="dashboard-staff-service-type">
                            {order.bookingDetailItems?.filter((item) => item)
                              .length > 0 && (
                              <div>
                                Sản phẩm:{" "}
                                {order.bookingDetailItems
                                  .filter((item) => item)
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                          <div className="dashboard-staff-service-type">
                            Dịch vụ: {order.bookingDetailService?.join(", ")}
                          </div>
                        </div>
                        <div className="dashboard-staff-delivery-body">
                          <div className="dashboard-staff-customer-name">
                            Tên khách hàng:{" "}
                            {order?.customerName || order.guestName}{" "}
                          </div>
                          <div className="dashboard-staff-customer-contact">
                            <Phone size={14} />
                            <span>
                              <div>
                                Số điện thoại : {""}
                                {formatPhoneNumber(
                                  order?.phoneNumber || order.guestPhoneNumber
                                )}
                              </div>{" "}
                            </span>
                          </div>
                          <div className="dashboard-staff-delivery-address">
                            Địa chỉ giao hàng cho khách: {order.deliveryAddress}
                          </div>
                        </div>
                        <div className="dashboard-staff-delivery-actions">
                          <button
                            className="dashboard-staff-action-btn dashboard-staff-deliver-btn"
                            onClick={() =>
                              handleStatusBookingChange(
                                order.bookingId,
                                "Delivering"
                              )
                            }
                          >
                            Giao hàng
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard-staff-no-orders">
                      Hiện không có đơn nào chờ giao.
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Information and Notifications */}
              <div className="dashboard-staff-card dashboard-staff-info-notification-card">
                <div className="dashboard-staff-feedback-section">
                  <div className="dashboard-staff-feedback-header">
                    <h3>Đánh giá từ khách hàng</h3>
                    <div className="dashboard-staff-feedback-stats">
                      <div className="dashboard-staff-feedback-stat-item">
                        <MessageCircle />
                        <span>{feedbackData.length} đánh giá</span>
                      </div>
                    </div>
                  </div>

                  {feedbackData.length === 0 ? (
                    <div className="dashboard-staff-feedback-no-reviews">
                      <p>Hiện tại không có đánh giá nào.</p>
                    </div>
                  ) : (
                    <div className="dashboard-staff-feedback-list">
                      {currentFeedbacks.map((feedback) => (
                        <div
                          key={feedback.feedbackId}
                          className={`dashboard-staff-feedback-item dashboard-staff-feedback-${feedback.serviceName}`}
                        >
                          <div className="dashboard-staff-feedback-item-header">
                            <div className="dashboard-staff-feedback-customer">
                              <User className="dashboard-staff-feedback-avatar" />
                              <div className="dashboard-staff-feedback-customer-info">
                                <h4>{feedback.customerName}</h4>
                                <div className="dashboard-staff-feedback-service">
                                  {feedback.serviceName}
                                </div>
                              </div>
                            </div>
                            <div className="dashboard-staff-feedback-rating">
                              {renderStars(feedback.rating)}
                            </div>
                          </div>

                          <div className="dashboard-staff-feedback-content">
                            <p>{feedback.comment}</p>
                          </div>

                          <div className="dashboard-staff-feedback-footer">
                            <div className="dashboard-staff-feedback-time">
                              <Calendar className="dashboard-staff-feedback-time-icon" />
                              <span>
                                {new Date(
                                  feedback.feedbackDate
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="dashboard-staff-feedback-actions">
                              <button
                                className="dashboard-staff-feedback-reply-btn"
                                onClick={() =>
                                  handleReplyClick(feedback.feedbackId)
                                }
                              >
                                Phản hồi
                              </button>
                            </div>
                          </div>
                          {replyFormVisible === feedback.feedbackId && (
                            <div className="dashboard-staff-feedback-reply-form">
                              {/* Gợi ý phản hồi */}
                              <div className="suggested-replies">
                                {suggestedReplies.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className="suggested-reply-btn"
                                    onClick={() =>
                                      handleSuggestedReplyClick(suggestion)
                                    }
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>

                              {/* Textarea nhập phản hồi */}
                              <textarea
                                required
                                value={replyText}
                                onChange={handleInputChange}
                                placeholder="Nhập phản hồi của bạn..."
                              />
                              <button
                                onClick={() =>
                                  handleFormSubmit(
                                    feedback.feedbackId,
                                    feedback.bookingDetailId
                                  )
                                }
                              >
                                Gửi phản hồi
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="dashboard-staff-feedback-pagination">
                        {totalPages > 1 && // Chỉ render phân trang nếu có hơn 1 trang
                          Array.from({ length: totalPages }, (_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPage(index + 1)}
                              className={
                                currentPage === index + 1 ? "active" : ""
                              }
                            >
                              {index + 1}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="dashboard-staff-inventory-section">
                  <div className="dashboard-staff-inventory-header">
                    <div className="dashboard-staff-inventory-title">
                      <FaBoxOpen className="dashboard-staff-inventory-icon" />
                      <h3>Hàng tồn kho</h3>
                    </div>

                    <div className="dashboard-staff-inventory-actions">
                      <div className="dashboard-staff-inventory-search">
                        <FaSearch className="dashboard-staff-inventory-search-icon" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm sản phẩm..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="dashboard-staff-inventory-search-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-staff-inventory-content">
                    <div className="dashboard-staff-inventory-table-container">
                      <table className="dashboard-staff-inventory-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Tên lô hàng</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Trạng thái</th>
                            <th>Mức cảnh báo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                              <tr key={item.inventoryID}>
                                <td>{item.inventoryID}</td>
                                <td>{item.inventoryName}</td>
                                <td className="dashboard-staff-inventory-item-name">
                                  {item.itemName}
                                </td>
                                <td className="dashboard-staff-inventory-quantity">
                                  {item.quantity}
                                </td>
                                <td>
                                  <div className="dashboard-staff-inventory-status">
                                    {getStatusIcon(item.status)}
                                    <span>
                                      {item.status === "Active"
                                        ? "Đang hoạt động"
                                        : "Không hoạt động"}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div
                                    className={`dashboard-staff-inventory-warning ${getWarningLevelClass(
                                      item.warningLevel
                                    )}`}
                                  >
                                    <span className="dashboard-staff-inventory-warning-level">
                                      {item.warningLevel}
                                    </span>
                                    <span className="dashboard-staff-inventory-warning-message">
                                      {item.warningMessage}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="7"
                                className="dashboard-staff-inventory-no-data"
                              >
                                <FaExclamationTriangle />
                                <span>Không tìm thấy dữ liệu phù hợp</span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="dashboard-staff-inventory-summary">
                    <div className="dashboard-staff-inventory-summary-item dashboard-staff-inventory-critical">
                      <span className="dashboard-staff-inventory-summary-label">
                        Nguy cấp:
                      </span>
                      <span className="dashboard-staff-inventory-summary-value">
                        {
                          inventoryItems.filter((item) =>
                            item.warningLevel.includes("Nguy cấp")
                          ).length
                        }
                      </span>
                    </div>
                    <div className="dashboard-staff-inventory-summary-item dashboard-staff-inventory-warning">
                      <span className="dashboard-staff-inventory-summary-label">
                        Cảnh báo:
                      </span>
                      <span className="dashboard-staff-inventory-summary-value">
                        {
                          inventoryItems.filter((item) =>
                            item.warningLevel.includes("Cảnh báo")
                          ).length
                        }
                      </span>
                    </div>
                    <div className="dashboard-staff-inventory-summary-item dashboard-staff-inventory-out-of-stock">
                      <span className="dashboard-staff-inventory-summary-label">
                        Hết hàng:
                      </span>
                      <span className="dashboard-staff-inventory-summary-value">
                        {
                          inventoryItems.filter((item) =>
                            item.warningLevel.includes("Hết hàng")
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer />;
    </>
  );
};

export default DashboardStaff;
