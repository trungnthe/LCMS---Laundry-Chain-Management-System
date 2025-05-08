import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/LaundrySub`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const fetchAllLaundrySubs = async () => {
  try {
    const response = await axios.get(API_BASE_URL, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    return error;
  }
};

export const fetchLaundrySubsByAccount = async (accountId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/get-by-account/${accountId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    console.log("LaundrySubsByAccount:", response.data);
    return response.data;
  } catch (error) {
    return error;
  }
};

export const fetchAllLaundrySubsByAccount = async (accountId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/get-all-by-account/${accountId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    console.log("AllLaundrySubsByAccount:", response.data);
    return response.data;
  } catch (error) {
    return error;
  }
};
