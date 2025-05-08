import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export const createBookingFromCart = async (bookingData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${apiUrl}/api/Booking/from-cart`,
      bookingData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    toast.success("Lên đơn thành công", {
      className: "custom_toast",
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi đặt hàng!");
    console.error("Lỗi API createBookingFromCart:", error);
    return null;
  }
};

export const updateBooking = async (bookingId, bookingData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.put(
      `${apiUrl}/api/Booking/${bookingId}`,
      bookingData,
      {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Success:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, newStatus) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${apiUrl}/api/BookingHistory/update-status`, {
      method: "PUT",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bookingId: bookingId,
        newStatus: newStatus,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Success:", data);
    return data;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};
