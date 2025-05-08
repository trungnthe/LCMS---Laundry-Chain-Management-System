import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export const addToCart = async (cartItem) => {
  try {
    const response = await axios.post(`${apiUrl}/api/Cart/add`, cartItem, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    toast.error("Lỗi khi thêm vào giỏ hàng!");
  }
};

export const fetchCart = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/cart`, {
      withCredentials: true,
    });
    return response.data.items;
  } catch (error) {}
};

export const removeFromCart = async (id) => {
  try {
    const response = await axios.delete(`${apiUrl}/api/Cart/remove/${id}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi xóa sản phẩm!");
  }
};

export const updateQuantity = async (id, quantity) => {
  try {
    const response = await axios.put(
      `${apiUrl}/api/Cart/update/${id}/${quantity}`,
      {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi update sản phẩm!");
    return null;
  }
};

export const getBranchById = async (id) => {
  try {
    const response = await axios.get(`${apiUrl}/api/Branch/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Lỗi khi lấy thông tin chi nhánh!"
    );
    return null;
  }
};
