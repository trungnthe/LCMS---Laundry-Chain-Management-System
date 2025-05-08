import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const getAccountById = (userId) => {
  const token = localStorage.getItem("token");
  return axios
    .get(`${apiUrl}/api/Account/getaccountById/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err.response;
    });
};

const updateProfile = async (name, phone) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      `${apiUrl}/api/Account/update-profile`,
      { name, phone },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error.response?.data || error.message);
    return (
      error.response?.data || { success: false, message: "Lỗi không xác định" }
    );
  }
};

const fetchCustomerById = async (customerId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `${apiUrl}/api/Customer/get-customer-byID`,
      {
        params: { Id: customerId },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi lấy thông tin khách hàng:",
      error.response?.data || error.message
    );
  }
};

const sendUpdateEmailCode = async (newEmail) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `${apiUrl}/api/Account/send-update-email-code`,
      { newEmail },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    return error;
  }
};

const verifyUpdateEmailCode = async (code) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      `${apiUrl}/api/Account/verify-update-email-code`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    return error;
  }
};

export {
  getAccountById,
  updateProfile,
  fetchCustomerById,
  sendUpdateEmailCode,
  verifyUpdateEmailCode,
};
