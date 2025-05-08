import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_notification.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin.jsx";
import Header_Admin from "../reuse/Header_Admin.jsx";
import Footer_Admin from "../reuse/Footer_Admin.jsx";
import axios from "axios";

const Send_Notification = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const adminId = userInfo.userId || 0;

  const [loading, setLoading] = useState(false);
  const [contentError, setContentError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [recipientError, setRecipientError] = useState(""); // Added for recipient validation
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    content: "",
    type: "",
    sendToAllRole4: false,
    sendToAllRole23: false,
  });

  useEffect(() => {
    fetchNotificationTypes();
  }, []);

  const fetchNotificationTypes = async () => {
    try {
      setIsLoadingTypes(true);
      const response = await axios.get(
        `${apiUrl}/api/Notification/list-all-Type`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNotificationTypes(response.data);
      if (response.data.length > 0) {
        setNotificationForm((prev) => ({
          ...prev,
          type: response.data[0],
        }));
      }
    } catch (error) {
      setOperationError(
        "Lỗi khi tải loại thông báo: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await axios.get(
        `${apiUrl}/api/Notification/my-notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNotifications(response.data);
      setShowNotificationsModal(true);
    } catch (error) {
      setOperationError(
        "Lỗi khi tải thông báo: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationForm({
      ...notificationForm,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "content") {
      setContentError("");
    }
    if (name === "title") {
      setTitleError("");
    }
    // Clear recipient error when either checkbox is changed
    if (name === "sendToAllRole4" || name === "sendToAllRole23") {
      setRecipientError("");
    }

    // Clear operation error when user starts typing in any field
    if (
      name === "title" ||
      name === "content" ||
      name === "sendToAllRole4" ||
      name === "sendToAllRole23"
    ) {
      setOperationError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOperation({ status: "", message: "" });
    setOperationError("");
    setContentError("");
    setTitleError("");
    setRecipientError("");

    // Validate title, content, and recipients
    const isTitleEmpty = !notificationForm.title.trim();
    const isContentEmpty = !notificationForm.content.trim();
    const noRecipientSelected =
      !notificationForm.sendToAllRole4 && !notificationForm.sendToAllRole23;

    if (isTitleEmpty || isContentEmpty || noRecipientSelected) {
      if (isTitleEmpty) {
        setTitleError("Tiêu đề là bắt buộc");
      }
      if (isContentEmpty) {
        setContentError("Nội dung là bắt buộc");
      }
      if (noRecipientSelected) {
        setRecipientError("Vui lòng chọn ít nhất một nhóm người nhận");
      }
      setLoading(false);
      return;
    }

    try {
      const payload = {
        createdById: adminId,
        title: notificationForm.title,
        content: notificationForm.content,
        type: notificationForm.type,
        sendToAllRole4: notificationForm.sendToAllRole4,
        sendToAllRole23: notificationForm.sendToAllRole23,
      };

      const response = await axios.post(
        `${apiUrl}/api/Notification/create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setOperation({
          status: "Success",
          message: "Gửi thông báo thành công!",
        });
        setTimeout(() => {
          setOperation({ status: "", message: "" });
        }, 3000);

        setNotificationForm({
          title: "",
          content: "",
          type: notificationTypes.length > 0 ? notificationTypes[0] : "",
          sendToAllRole4: false,
          sendToAllRole23: false,
        });
      } else {
        setOperationError("Không thể gửi thông báo");
      }
    } catch (error) {
      setOperationError(
        "Lỗi khi gửi thông báo: " +
          (error.response?.data?.message || error.message)
      );
    }

    setLoading(false);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN"
    )}`;
  };

  return (
    <div className="manage-notification-contain">
      <Sidebar_Admin />
      <div className="manage-notification-main-content">
        <Header_Admin />

        <div className="manage-notification-main">
          <h2>Gửi Thông Báo</h2>

          <div className="manage-notification-actions"></div>

          <div className="manage-notification-form-container">
            {operation.status === "Success" && (
              <div className="manage-notify-success-message">
                {operation.message}
              </div>
            )}

            {operationError && (
              <div className="manage-notify-error-message">
                {operationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="manage-notification-form">
              <h3 className="manage-notification-form-title">
                Tạo Thông Báo Mới
              </h3>

              <div className="manage-notification-form-group">
                <label className="manage-notification-form-label">
                  Tiêu đề:
                </label>
                <input
                  type="text"
                  name="title"
                  value={notificationForm.title}
                  onChange={handleInputChange}
                  className={`manage-notification-form-input ${
                    titleError ? "manage-notify-error-input" : ""
                  }`}
                />
                {titleError && (
                  <span className="manage-notify-error-text">{titleError}</span>
                )}
              </div>

              <div className="manage-notification-form-group">
                <label className="manage-notification-form-label">
                  Nội dung:
                </label>
                <textarea
                  name="content"
                  value={notificationForm.content}
                  onChange={handleInputChange}
                  className={`manage-notification-form-textarea ${
                    contentError ? "manage-notify-error-input" : ""
                  }`}
                  rows="4"
                ></textarea>
                {contentError && (
                  <span className="manage-notify-error-text">
                    {contentError}
                  </span>
                )}
              </div>

              <div className="manage-notification-form-group">
                <label className="manage-notification-form-label">Loại:</label>
                {isLoadingTypes ? (
                  <div className="manage-notification-loading-types">
                    Đang tải loại thông báo...
                  </div>
                ) : (
                  <select
                    name="type"
                    value={notificationForm.type}
                    onChange={handleInputChange}
                    className="manage-notification-form-select"
                    required
                  >
                    {notificationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="manage-notification-form-group manage-notification-checkbox-group">
                <div className="manage-notification-checkbox-container">
                  <input
                    type="checkbox"
                    name="sendToAllRole4"
                    id="sendToAllRole4"
                    checked={notificationForm.sendToAllRole4}
                    onChange={handleInputChange}
                    className="manage-notification-form-checkbox"
                  />
                  <label
                    htmlFor="sendToAllRole4"
                    className="manage-notification-checkbox-label"
                  >
                    Gửi đến tất cả Khách hàng
                  </label>
                </div>

                <div className="manage-notification-checkbox-container">
                  <input
                    type="checkbox"
                    name="sendToAllRole23"
                    id="sendToAllRole23"
                    checked={notificationForm.sendToAllRole23}
                    onChange={handleInputChange}
                    className="manage-notification-form-checkbox"
                  />
                  <label
                    htmlFor="sendToAllRole23"
                    className="manage-notification-checkbox-label"
                  >
                    Gửi đến tất cả Quản lý và Nhân viên
                  </label>
                </div>
                {recipientError && (
                  <span className="manage-notify-error-text">
                    {recipientError}
                  </span>
                )}
              </div>

              <div className="manage-notification-form-buttons">
                <button
                  type="submit"
                  className="manage-notification-submit-btn"
                  disabled={loading || isLoadingTypes}
                >
                  {loading ? "Đang gửi..." : "Gửi Thông Báo"}
                </button>
                <button
                  type="reset"
                  className="manage-notification-cancel-btn"
                  onClick={() => {
                    setNotificationForm({
                      title: "",
                      content: "",
                      type:
                        notificationTypes.length > 0
                          ? notificationTypes[0]
                          : "",
                      sendToAllRole4: false,
                      sendToAllRole23: false,
                    });
                    setContentError("");
                    setTitleError("");
                    setRecipientError("");
                    setOperationError("");
                  }}
                >
                  Đặt lại
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer_Admin />
      </div>

      {/* Modal để hiển thị tất cả thông báo */}
      {showNotificationsModal && (
        <div className="manage-notification-modal-overlay">
          <div className="manage-notification-modal">
            <div className="manage-notification-modal-header">
              <h3>Tất cả thông báo</h3>
              <button
                className="manage-notification-modal-close"
                onClick={() => setShowNotificationsModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="manage-notification-modal-body">
              {isLoadingNotifications ? (
                <div className="manage-notification-loading">
                  Đang tải thông báo...
                </div>
              ) : notifications.length > 0 ? (
                <div className="manage-notification-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="manage-notification-item"
                    >
                      <div className="manage-notification-item-header">
                        <h4 className="manage-notification-item-title">
                          {notification.title}
                        </h4>
                        <span
                          className={`manage-notification-type manage-notification-type-${notification.type.toLowerCase()}`}
                        >
                          {notification.type}
                        </span>
                      </div>
                      <div className="manage-notification-item-content">
                        {notification.content}
                      </div>
                      <div className="manage-notification-item-footer">
                        <span className="manage-notification-item-date">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="manage-notification-no-data">
                  Không có thông báo nào
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Send_Notification;
