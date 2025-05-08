import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export const createPayment = async (payment) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(`${apiUrl}/api/Payment/create`, payment, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return null;
  }
};

export const fetchPaymentById = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `${apiUrl}/api/Payment/get-paymentsuccess-by-bookingId`,
      {
        params: { bookingId: id },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    return null;
  }
};

export const deletePaymentByBooking = async (bookingId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.delete(
      `${apiUrl}/api/Payment/deleteByBooking/${bookingId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    return null;
  }
};
