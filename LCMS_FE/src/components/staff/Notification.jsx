import { useState } from "react";
import {
  Bell,
  Check,
  UserPlus,
  ThumbsUp,
  MessageCircle,
  Gift,
  Calendar,
  Image,
  Video,
  Flag,
} from "lucide-react";
import Header from "../reuse/Header_Staff.jsx";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "friend_request",
      user: "Nguyễn Văn A",
      avatar: "/api/placeholder/40/40",
      content: "đã gửi cho bạn lời mời kết bạn",
      time: "5 phút trước",
      read: false,
    },
    {
      id: 2,
      type: "like",
      user: "Trần Thị B",
      avatar: "/api/placeholder/40/40",
      content: "đã thích bài viết của bạn",
      time: "10 phút trước",
      read: false,
    },
    {
      id: 3,
      type: "comment",
      user: "Lê Văn C",
      avatar: "/api/placeholder/40/40",
      content: "đã bình luận về bài viết của bạn",
      time: "25 phút trước",
      read: false,
    },
    {
      id: 4,
      type: "birthday",
      user: "Phạm Thị D",
      avatar: "/api/placeholder/40/40",
      content: "đang có sinh nhật hôm nay. Hãy gửi lời chúc mừng!",
      time: "1 giờ trước",
      read: true,
    },
    {
      id: 5,
      type: "photo_tag",
      user: "Hoàng Văn E",
      avatar: "/api/placeholder/40/40",
      content: "đã gắn thẻ bạn trong một bức ảnh",
      time: "3 giờ trước",
      read: true,
    },
    {
      id: 6,
      type: "event",
      user: "Sự kiện Tech Meetup",
      avatar: "/api/placeholder/40/40",
      content: "sẽ diễn ra vào ngày mai",
      time: "4 giờ trước",
      read: true,
    },
    {
      id: 7,
      type: "video",
      user: "Vũ Thị G",
      avatar: "/api/placeholder/40/40",
      content: "đã đăng một video mới",
      time: "5 giờ trước",
      read: true,
    },
    {
      id: 8,
      type: "group_activity",
      user: "Nhóm Lập trình viên Việt Nam",
      avatar: "/api/placeholder/40/40",
      content: "có bài đăng mới",
      time: "1 ngày trước",
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "friend_request":
        return (
          <UserPlus size={20} className="notification-icon friend-request" />
        );
      case "like":
        return <ThumbsUp size={20} className="notification-icon like" />;
      case "comment":
        return (
          <MessageCircle size={20} className="notification-icon comment" />
        );
      case "birthday":
        return <Gift size={20} className="notification-icon birthday" />;
      case "event":
        return <Calendar size={20} className="notification-icon event" />;
      case "photo_tag":
        return <Image size={20} className="notification-icon photo" />;
      case "video":
        return <Video size={20} className="notification-icon video" />;
      case "group_activity":
        return <Flag size={20} className="notification-icon group" />;
      default:
        return <Bell size={20} className="notification-icon" />;
    }
  };

  return (
    <>
      <Header />
      <div className="notifications-container">
        <style
          dangerouslySetInnerHTML={{
            __html: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        body {
          background-color: #f0f2f5;
          color: #1c1e21;
        }
        
        .notifications-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e4e6eb;
          background-color: white;
          position: sticky;
          top: 0;
        }
        
        .notifications-title {
          font-size: 24px;
          font-weight: bold;
        }
        
        .notifications-actions {
          display: flex;
          gap: 8px;
        }
        
        .notifications-actions button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notifications-actions button:hover {
          background-color: #f2f2f2;
        }
        
        .mark-read-btn {
          background-color: #e7f3ff;
          color: #1877f2;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .mark-read-btn:hover {
          background-color: #dbeeff;
        }
        
        .tabs {
          display: flex;
          padding: 0 16px;
          border-bottom: 1px solid #e4e6eb;
        }
        
        .tab {
          padding: 16px 12px;
          margin-right: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #65676b;
          position: relative;
        }
        
        .tab.active {
          color: #1877f2;
        }
        
        .tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #1877f2;
          border-radius: 3px 3px 0 0;
        }
        
        .notification-list {
          max-height: 70vh;
          overflow-y: auto;
        }
        
        .notification-item {
          display: flex;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f2f5;
          position: relative;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .notification-item:hover {
          background-color: #f5f6f7;
        }
        
        .notification-item.unread {
          background-color: #e7f3ff;
        }
        
        .notification-item.unread:hover {
          background-color: #dbeeff;
        }
        
        .notification-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          margin-right: 12px;
          position: relative;
        }
        
        .notification-icon-wrapper {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background-color: #1877f2;
          border-radius: 50%;
          padding: 4px;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notification-icon {
          color: white;
        }
        
        .notification-icon.like {
          color: white;
        }
        
        .notification-icon.friend-request {
          color: white;
        }
        
        .notification-icon.comment {
          color: white;
        }
        
        .notification-icon.birthday {
          color: white;
        }
        
        .notification-icon.event {
          color: white;
        }
        
        .notification-icon.photo {
          color: white;
        }
        
        .notification-icon.video {
          color: white;
        }
        
        .notification-icon.group {
          color: white;
        }
        
        .notification-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .notification-message {
          font-size: 15px;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        
        .notification-user {
          font-weight: 600;
        }
        
        .notification-time {
          font-size: 13px;
          color: #65676b;
        }
        
        .unread-dot {
          width: 12px;
          height: 12px;
          background-color: #1877f2;
          border-radius: 50%;
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .notification-options {
          margin-left: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .notification-item:hover .notification-options {
          opacity: 1;
        }
        
        .mobile-mark-all {
          display: none;
        }
        
        @media (max-width: 768px) {
          .notifications-container {
            max-width: 100%;
            border-radius: 0;
            box-shadow: none;
          }
          
          .mobile-mark-all {
            display: block;
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background-color: #f0f2f5;
            text-align: center;
          }
        }
      `,
          }}
        />

        <div className="notifications-header">
          <div className="notifications-title">Thông báo</div>
          <div className="notifications-actions">
            <button className="mark-read-btn" onClick={markAllAsRead}>
              <Check size={16} style={{ marginRight: "4px" }} />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>

        <div className="tabs">
          <div className="tab active">Tất cả</div>
          <div className="tab">Chưa đọc</div>
        </div>

        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                notification.read ? "" : "unread"
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-avatar-container">
                <img
                  src={notification.avatar}
                  alt={notification.user}
                  className="notification-avatar"
                />
                <div className="notification-icon-wrapper">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              <div className="notification-content">
                <div className="notification-message">
                  <span className="notification-user">{notification.user}</span>{" "}
                  {notification.content}
                </div>
                <div className="notification-time">{notification.time}</div>
              </div>

              {!notification.read && <div className="unread-dot"></div>}
            </div>
          ))}

          <div className="mobile-mark-all">
            <button className="mark-read-btn" onClick={markAllAsRead}>
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
