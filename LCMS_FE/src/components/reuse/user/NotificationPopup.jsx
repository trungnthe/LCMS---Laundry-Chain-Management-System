import React from "react";

const NotificationPopup = ({ notification, handleNotification }) => {
  if (!notification) return null;

  const handleClick = () => {
    handleNotification(notification.notificationId);
  };

  return (
    <div className="notification-popup" onClick={handleClick}>
      <div className="notification-header">
        <strong>{notification.title}</strong>
      </div>
      <div className="notification-body">{notification.content}</div>
      <div className="notification-footer">
        <span>vừa xong</span>
      </div>
    </div>
  );
};

export default NotificationPopup;
