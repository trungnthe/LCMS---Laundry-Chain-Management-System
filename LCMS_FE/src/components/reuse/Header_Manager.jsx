import React, { useState, useEffect, useRef } from "react";
import "../../assets/css/manager/navbar_manager.css";
import { FaHome, FaUser, FaBell, FaCheckCircle } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { SlLogout } from "react-icons/sl";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import MyProfile from "./user/MyProfile";
import * as signalR from "@microsoft/signalr";
import { logout } from "../../services/auth";
import { refreshToken } from "../../services/authHelper";
import NotificationPopup from "./user/NotificationPopup";

const Header_Manager = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isScrolled, setIsScrolled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [allNotificationsPage, setAllNotificationsPage] = useState(1);
  const [allNotificationsTotalPages, setAllNotificationsTotalPages] =
    useState(1);
  const [allNotifications, setAllNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [firstnotification, setFirstNotification] = useState(null);

  const connectionRef = useRef(null);
  const userDataRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const isConnectingRef = useRef(false);
  const lastReconnectTime = useRef(0);

  const notificationsPerPage = 5;
  const allNotificationsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

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
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);

          const currentTime = Math.floor(Date.now() / 1000);

          if (decoded.exp && decoded.exp < currentTime) {
            const newToken = await refreshToken();
            if (newToken) {
              const newDecoded = jwtDecode(newToken);
              setUserData(newDecoded);
            } else {
              localStorage.removeItem("token");
              setUserData(null);
              window.location.href = "/login";
            }
          } else {
            setUserData(decoded);
          }
        } catch (error) {
          console.error("Token validation error:", error);
          localStorage.removeItem("token");
          setUserData(null);
        }
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setOperationError(
        "Token không hợp lệ hoặc không tồn tại. Vui lòng đăng nhập lại."
      );
      return null;
    }

    try {
      const decodedToken = jwtDecode(token);

      return token;
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("token");
      setOperationError("Token không hợp lệ. Vui lòng đăng nhập lại.");
      return null;
    }
  };

  const fetchNotifications = async (retries = 3) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/Notification/my-notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setAllNotifications(data);

        setTotalPages(Math.ceil(data.length / notificationsPerPage));
        setAllNotificationsTotalPages(
          Math.ceil(data.length / allNotificationsPerPage)
        );

        const unread = data.filter((notif) => !notif.isRead).length;
        setUnreadCount(unread);
      } else {
        console.error("Failed to fetch notifications:", response.status);
        if (
          retries > 0 &&
          (response.status === 503 || response.status === 504)
        ) {
          setTimeout(() => fetchNotifications(retries - 1), 3000);
        } else {
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (retries > 0) {
        setTimeout(() => fetchNotifications(retries - 1), 3000);
      } else {
      }
    }
  };

  useEffect(() => {
    if (connectionStatus === "failed" || connectionStatus === "disconnected") {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 30000);
    } else if (connectionStatus === "connected" && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [connectionStatus]);

  const safelyStopConnection = async () => {
    if (connectionRef.current) {
      try {
        if (
          connectionRef.current.state ===
            signalR.HubConnectionState.Connected &&
          userDataRef.current &&
          userDataRef.current.Id
        ) {
          await connectionRef.current
            .invoke("LeaveUserGroup", userDataRef.current.Id)
            .catch((err) => console.error("Error leaving user group:", err));
        }

        await connectionRef.current.stop();
      } catch (err) {
        console.warn("Error while stopping connection:", err);
      }
    }
  };

  const setupSignalR = async () => {
    if (isConnectingRef.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastReconnect = now - lastReconnectTime.current;
    if (timeSinceLastReconnect < 5000 && connectionAttempts > 2) {
      if (!retryTimeoutRef.current) {
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          setupSignalR();
        }, 5000 - timeSinceLastReconnect);
      }
      return;
    }

    isConnectingRef.current = true;
    lastReconnectTime.current = now;
    setConnectionAttempts((prev) => prev + 1);

    const token = getToken();
    if (!token) {
      isConnectingRef.current = false;
      return;
    }

    setConnectionStatus("connecting");

    await safelyStopConnection();

    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiUrl}/signalHub`, {
          accessTokenFactory: () => token,
          logLevel: signalR.LogLevel.Information,
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
        .build();

      connectionRef.current = connection;

      connection.onreconnecting((error) => {
        setConnectionStatus("reconnecting");
      });

      connection.onreconnected((connectionId) => {
        setConnectionStatus("connected");
        setConnectionAttempts(0);

        if (userDataRef.current && userDataRef.current.Id) {
          connection
            .invoke("JoinUserGroup", userDataRef.current.Id)
            .catch((err) => console.error("Error rejoining user group:", err));
        }
      });

      connection.onclose((error) => {
        setConnectionStatus("disconnected");
        isConnectingRef.current = false;
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        const backoffTime = Math.min(
          5000 * Math.pow(1.5, connectionAttempts),
          30000
        );

        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          setupSignalR();
        }, backoffTime);
      });

      const handleNotificationReceived = (notification) => {
        console.log(notification);

        if (!notification || typeof notification !== "object") {
          console.error("Invalid notification received:", notification);
          return;
        }

        const cleanNotification = {
          notificationId: notification.notificationId || Date.now().toString(),
          title: notification.title || "Thông báo mới",
          content: notification.content || "Không có nội dung",
          createdAt: new Date().toISOString(),
          isRead: false,
          type: notification.type || "Thông báo",
          ...notification,
        };

        setNotifications((prev) => {
          const isDuplicate = prev.some(
            (n) => n.notificationId === cleanNotification.notificationId
          );
          if (isDuplicate) return prev;

          const updatedNotifications = [cleanNotification, ...prev];
          setTotalPages(
            Math.ceil(updatedNotifications.length / notificationsPerPage)
          );
          return updatedNotifications;
        });

        setAllNotifications((prev) => {
          const isDuplicate = prev.some(
            (n) => n.notificationId === cleanNotification.notificationId
          );
          if (isDuplicate) return prev;

          const updatedAllNotifications = [cleanNotification, ...prev];
          setAllNotificationsTotalPages(
            Math.ceil(updatedAllNotifications.length / allNotificationsPerPage)
          );
          return updatedAllNotifications;
        });

        setUnreadCount((prev) => prev + 1);

        setOperation({
          status: "success",
          message: cleanNotification.title,
        });

        setTimeout(() => {
          fetchNotifications();
        }, 1000);
      };

      connection.on("updateNotification", (action, notification) => {
        if (action === "notification") {
          handleNotificationReceived(notification);
          if (!notifications) {
            setFirstNotification(notifications);
            // setTimeout(() => {
            //   setFirstNotification(null);
            // }, 5000);
          }
        }
      });

      connection.on("ReceiveNotification", (newNotification) => {
        console.log("Received notification via ReceiveNotification");
        handleNotificationReceived(newNotification);
      });

      try {
        await connection.start();
        setConnectionStatus("connected");
        setConnectionAttempts(0);

        if (userDataRef.current && userDataRef.current.Id) {
          try {
            await connection.invoke("JoinUserGroup", userDataRef.current.Id);
            console.log(
              "Joined user notification group:",
              userDataRef.current.Id
            );
          } catch (groupError) {
            console.error("Error joining user group:", groupError);
          }
        }
      } catch (startError) {
        console.error("SignalR Connection Error:", startError);
        setConnectionStatus("failed");
        isConnectingRef.current = false;

        const errorMessage = startError.toString().toLowerCase();
        if (
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("401")
        ) {
          console.error("Authentication error with SignalR - invalid token");
          return;
        }
      }
    } catch (setupError) {
      console.error("Error setting up SignalR:", setupError);
      setConnectionStatus("failed");
      isConnectingRef.current = false;

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      retryTimeoutRef.current = setTimeout(() => {
        retryTimeoutRef.current = null;
        setupSignalR();
      }, 5000);
    } finally {
      isConnectingRef.current = false;
    }
  };

  useEffect(() => {
    fetchNotifications();

    setupSignalR();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      safelyStopConnection();
    };
  }, []);

  const handleLogout = async () => {
    const res = logout();
    safelyStopConnection().then(() => {
      localStorage.removeItem("token");
      setUserData(null);
      setTimeout(() => navigate("/login"), 1000);
    });
  };

  const handleNavigate = () => navigate("/manager/dashboard_manager");

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (notificationId) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/Notification/mark-as-read/${notificationId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.notificationId === notificationId
              ? { ...notif, isRead: true }
              : notif
          )
        );

        setAllNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.notificationId === notificationId
              ? { ...notif, isRead: true }
              : notif
          )
        );

        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      } else {
        console.error("Failed to mark notification as read:", response.status);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${apiUrl}/api/Notification/mark-all-read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) => ({ ...notif, isRead: true }))
        );

        setAllNotifications((prevNotifications) =>
          prevNotifications.map((notif) => ({ ...notif, isRead: true }))
        );

        setUnreadCount(0);
      } else {
        console.error("Failed to mark all as read:", response.status);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }

    setSelectedNotification(notification);
    setShowNotificationModal(true);
  };

  const handleNavigateToNotificationTarget = (notification) => {
    if (notification.type === "đơn hàng" && notification.bookingId) {
      navigate(`/manager/orders/${notification.bookingId}`);
    } else if (notification.supportId) {
      navigate(`/manager/supports/${notification.supportId}`);
    }

    setShowNotifications(false);
    setShowNotificationModal(false);
    setShowViewAllModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Vừa xong";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Vừa xong";

      // Cộng thêm 7 tiếng (7 * 60 * 60 * 1000 = 25200000 milliseconds)
      const adjustedDate = new Date(date.getTime());
      const now = new Date();
      const diff = now - adjustedDate;
      if (diff < 60000) return "Vừa xong";
      return adjustedDate.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Vừa xong";
    }
  };

  const getCurrentPageNotifications = () => {
    const startIndex = (currentPage - 1) * notificationsPerPage;
    const endIndex = startIndex + notificationsPerPage;
    return notifications.slice(startIndex, endIndex);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getAllPageNotifications = () => {
    const startIndex = (allNotificationsPage - 1) * allNotificationsPerPage;
    const endIndex = startIndex + allNotificationsPerPage;
    return allNotifications.slice(startIndex, endIndex);
  };

  const handleAllPreviousPage = () => {
    if (allNotificationsPage > 1) {
      setAllNotificationsPage(allNotificationsPage - 1);
    }
  };

  const handleAllNextPage = () => {
    if (allNotificationsPage < allNotificationsTotalPages) {
      setAllNotificationsPage(allNotificationsPage + 1);
    }
  };

  const handleViewAll = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${apiUrl}/api/Notification/my-notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAllNotifications(data);
        setAllNotificationsPage(1);
        setAllNotificationsTotalPages(
          Math.ceil(data.length / allNotificationsPerPage)
        );
        setShowViewAllModal(true);
        setShowNotifications(false);
      } else {
        console.error("Failed to fetch all notifications:", response.status);
      }
    } catch (error) {
      console.error("Error fetching all notifications:", error);
    }
  };

  const handleCloseViewAllModal = () => {
    setShowViewAllModal(false);
  };

  const handleManualReconnect = () => {
    setConnectionAttempts(0);
    setupSignalR();
  };

  return (
    <>
      {operation.status === "success" && (
        <div className="header-manager-notification header-manager-success">
          {operation.message}
        </div>
      )}

      {operationError && (
        <div className="header-manager-notification header-manager-error">
          {operationError}
        </div>
      )}

      <nav
        className={`dashboard-navbar header-manager ${
          isScrolled ? "scrolled" : ""
        }`}
      >
        {firstnotification && (
          <div>
            <NotificationPopup
              notification={firstnotification}
              handleNotification={handleNotificationClick}
            />
          </div>
        )}
        <div className="dashboard-navbar-content header-manager">
          <div className="navbar-left header-manager" onClick={handleNavigate}>
            <div className="navbar-home header-manager">
              <FaHome className="navbar-icon header-manager" />
              <h1>Dashboard</h1>
            </div>
            <div className="breadcrumb header-manager">
              <span style={{ cursor: "pointer" }}>Home</span>
            </div>
          </div>
          <div className="navbar-right header-manager">
            <div className="header-notify-manager-container">
              <div
                className="bell-icon-container header-notify-manager-bell"
                onClick={handleToggleNotifications}
              >
                <FaBell
                  className="bell-icon header-manager"
                  style={{ fontSize: "23px" }}
                />
                {unreadCount > 0 && (
                  <span className="header-notify-manager-badge">
                    {unreadCount}
                  </span>
                )}
              </div>

              {showNotifications && (
                <div className="header-notify-manager-dropdown">
                  <div className="header-notify-manager-header">
                    <h3>Thông báo</h3>
                    <div className="header-notify-manager-actions">
                      <span className="header-notify-manager-count">
                        {unreadCount} chưa đọc
                      </span>
                      {unreadCount > 0 && (
                        <button
                          className="header-notify-manager-mark-all"
                          onClick={markAllAsRead}
                        >
                          <FaCheckCircle size={14} />
                          <span>Đánh dấu đã đọc tất cả</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="header-notify-manager-list">
                    {getCurrentPageNotifications().length > 0 ? (
                      getCurrentPageNotifications().map((notification) => (
                        <div
                          key={notification.notificationId}
                          className={`header-notify-manager-item ${
                            !notification.isRead
                              ? "header-notify-manager-unread"
                              : ""
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="header-notify-manager-item-main">
                            <div className="header-notify-manager-content">
                              <h4>{notification.title || "Thông báo mới"}</h4>
                              <p>
                                {notification.content || "Không có nội dung"}
                              </p>
                              <span className="header-notify-manager-time">
                                {notification.createdAt &&
                                new Date().getTime() -
                                  new Date(notification.createdAt).getTime() <
                                  120000
                                  ? "Vừa xong"
                                  : formatDate(notification.createdAt)}
                              </span>
                            </div>

                            {!notification.isRead && (
                              <div
                                className="header-notify-manager-mark-read"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.notificationId);
                                }}
                              >
                                <FaCheckCircle size={16} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="header-notify-manager-empty">
                        <p>Không có thông báo nào</p>
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="header-notify-manager-footer">
                      <div className="header-notify-manager-pagination">
                        <button
                          className="header-notify-manager-pagination-btn"
                          disabled={currentPage === 1}
                          onClick={handlePreviousPage}
                        >
                          Trước
                        </button>
                        <span className="header-notify-manager-pagination-info">
                          {currentPage}/{totalPages}
                        </span>
                        <button
                          className="header-notify-manager-pagination-btn"
                          disabled={currentPage === totalPages}
                          onClick={handleNextPage}
                        >
                          Sau
                        </button>
                      </div>
                      <button
                        className="header-notify-manager-view-all"
                        onClick={handleViewAll}
                      >
                        Xem tất cả
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="user-icons header-manager">
              <div className="manager-user-hover">
                <FaUser style={{ fontSize: "23px" }} />
                <div className="manager-user-content">
                  <div className="manager-user-info">
                    {userData && (
                      <p className="manager-username">{userData.Name}</p>
                    )}
                    <div className="manager-manage-item-container"></div>
                    <div
                      className="manager-manage-item-container"
                      onClick={() => setShowProfileModal(true)}
                    >
                      <CgProfile />
                      <p>Thông tin cá nhân</p>
                    </div>
                    <div
                      className="manager-manage-item-container"
                      onClick={handleLogout}
                    >
                      <SlLogout />
                      <p>Đăng xuất</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowProfileModal(false)}
            >
              ×
            </button>
            <MyProfile />
          </div>
        </div>
      )}

      {showNotificationModal && selectedNotification && (
        <div className="header-notify-manager-modal-overlay">
          <div className="header-notify-manager-modal-content">
            <div className="header-notify-manager-modal-header">
              <h3>{selectedNotification.title}</h3>
              <button
                className="header-notify-manager-modal-close"
                onClick={() => setShowNotificationModal(false)}
              >
                ×
              </button>
            </div>
            <div className="header-notify-manager-modal-body">
              <p>{selectedNotification.content}</p>
              <div className="header-notify-manager-modal-info">
                <span>
                  Thời gian: {formatDate(selectedNotification.createdAt)}
                </span>
                {selectedNotification.type && (
                  <span>Loại thông báo: {selectedNotification.type}</span>
                )}
              </div>
            </div>
            <div className="header-notify-manager-modal-footer">
              <button
                className="header-notify-manager-modal-action"
                onClick={() => setShowNotificationModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewAllModal && (
        <div className="header-manager-view-all-modal-overlay">
          <div className="header-manager-view-all-modal-content">
            <div className="header-manager-view-all-modal-header">
              <h3>Tất cả thông báo</h3>
              <button
                className="header-manager-view-all-modal-close"
                onClick={handleCloseViewAllModal}
              >
                ×
              </button>
            </div>

            <div className="header-manager-view-all-modal-actions">
              <span className="header-notify-manager-count">
                {unreadCount} chưa đọc
              </span>
              {unreadCount > 0 && (
                <button
                  className="header-notify-manager-mark-all"
                  onClick={markAllAsRead}
                >
                  <FaCheckCircle size={14} />
                  <span>Đánh dấu đã đọc tất cả</span>
                </button>
              )}
            </div>

            <div className="header-manager-view-all-modal-body">
              {getAllPageNotifications().length > 0 ? (
                getAllPageNotifications().map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`header-manager-view-all-item ${
                      !notification.isRead
                        ? "header-manager-view-all-unread"
                        : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="header-manager-view-all-item-main">
                      <div className="header-manager-view-all-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.content}</p>
                        <span className="header-manager-view-all-time">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      {!notification.isRead && (
                        <div
                          className="header-manager-view-all-mark-read"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.notificationId);
                          }}
                        >
                          <FaCheckCircle size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="header-manager-view-all-empty">
                  <p>Không có thông báo nào</p>
                </div>
              )}
            </div>

            {allNotifications.length > 0 && (
              <div className="header-manager-view-all-footer">
                <div className="header-manager-view-all-pagination">
                  <button
                    className="header-manager-view-all-pagination-btn"
                    disabled={allNotificationsPage === 1}
                    onClick={handleAllPreviousPage}
                  >
                    Trước
                  </button>
                  <span className="header-manager-view-all-pagination-info">
                    {allNotificationsPage}/{allNotificationsTotalPages}
                  </span>
                  <button
                    className="header-manager-view-all-pagination-btn"
                    disabled={
                      allNotificationsPage === allNotificationsTotalPages
                    }
                    onClick={handleAllNextPage}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header_Manager;
