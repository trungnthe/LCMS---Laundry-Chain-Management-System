import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const fetchNotifications = (userId = 0) => {
  return axios
    .get(`${apiUrl}/api/Notification/list/${userId}`, {
      withCredentials: true,
    })
    .then((response) => response)
    .catch((err) => err.response);
};

const markAllNotificationsRead = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${apiUrl}/api/Notification/mark-all-read`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    return error.response;
  }
};

const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `${apiUrl}/api/Notification/mark-as-read/${notificationId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    return error.response;
  }
};

export { fetchNotifications, markAllNotificationsRead, markNotificationAsRead };
