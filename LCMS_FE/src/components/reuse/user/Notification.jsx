import React, { useEffect, useState } from "react";
import "../../../assets/css/user/profile.css";
import { BiCheck } from "react-icons/bi";
import { BsDot } from "react-icons/bs";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationAsRead,
} from "../../../services/notification";
import { jwtDecode } from "jwt-decode";
import { fetchBookingHistoryByCustomerId } from "../../../services/bookingHistory";
import { useNavigate } from "react-router-dom";

const Notification = () => {
  const [selectedButton, setSelectedButton] = useState("all");
  const [notification, setNotification] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  let userId;

  if (token) {
    const decoded = jwtDecode(token);
    userId = decoded.AccountId;
  }

  const handleButtonClick = (buttonType) => {
    setSelectedButton(buttonType);
  };

  const handleNotification = async (id) => {
    const res = await markNotificationAsRead(id);
    if (res?.status === 200) {
      const updatedNotification = notification.map((n) =>
        n.notificationId === id ? { ...n, isRead: true } : n
      );
      setNotification(updatedNotification);

      if (
        notification.find((n) => n.notificationId === id).type === "đơn hàng"
      ) {
        let bookingDetail;

        await fetchBookingHistoryByCustomerId(userId).then((response) => {
          bookingDetail = response.find(
            (x) =>
              x.bookingId ==
              notification.find((n) => n.notificationId === id)?.bookingId
          );
        });

        navigate(
          "/user/profile/booking-history/" +
            notification.find((n) => n.notificationId === id)?.bookingId,
          { state: { bookingDetail } }
        );
      }
    }
  };

  const handleReadAll = async () => {
    try {
      const response = await markAllNotificationsRead();

      if (response.status == "200") {
        fetchNotifications(userId)
          .then((response) => {
            setNotification(Array.isArray(response.data) ? response.data : []);
          })
          .catch((error) => {
            setNotification([]);
          });
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchNotifications(userId)
      .then((response) => {
        setNotification(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        setNotification([]);
      });
  }, []);

  return (
    <div>
      <div className="my-profile-header">
        <h5>Thông báo</h5>
        <h3>Tất cả các thông báo về đơn hàng và về hỗ trợ</h3>
      </div>
      <div className="notification-filter">
        <div className="notification-button"></div>
        <p onClick={() => handleReadAll()}>
          <BiCheck /> Đánh dấu tất cả là đã đọc
        </p>
      </div>
      <div className="notification-list">
        {notification.map((n) => {
          return (
            <div
              className="notification-container"
              key={n.notificationId}
              onClick={() => handleNotification(n.notificationId)}
            >
              <div className="notification-content">
                <div className="notification-text">
                  <h3>{n.title}</h3>
                  <p>{n.content}</p>
                </div>
              </div>
              <div className="notification-isRead">
                {n.isRead ? "" : <BsDot></BsDot>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notification;
