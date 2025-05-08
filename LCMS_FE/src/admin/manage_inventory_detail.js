import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

// Hàm fetch inventory detail
export const fetchInventoryDetailData = async (setInventoryDetails) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${apiUrl}/api/InventoryDetail/get-all-inventoryDetail`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    setInventoryDetails(data);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    toast.error("Đã có lỗi xảy ra khi tải dữ liệu chi tiết kho.");
    return { success: false, error: error.message };
  }
};

export const fetchInventories = async (setInventories, token) => {
  try {
    const response = await fetch(`${apiUrl}/api/Inventory/get-all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    setInventories(data);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching inventories:", error);
    toast.error("Đã có lỗi xảy ra khi tải dữ liệu kho.");
    return { success: false, error: error.message };
  }
};

// Hàm thêm chi tiết sản phẩm
export const addInventoryDetailData = async (item) => {
  try {
    const token = localStorage.getItem("token");
    const currentDate = new Date();
    const expirationDate = new Date(item.expirationDate);

    if (expirationDate < currentDate) {
      return {
        success: false,
        message: "Ngày hết hạn không hợp lệ, không thể thêm",
      };
    }

    const formData = new FormData();
    formData.append("itemName", item.itemName);
    formData.append("inventoryId", item.inventoryId);
    formData.append("quantity", item.quantity);
    formData.append("price", item.price);
    formData.append("expirationDate", item.expirationDate);

    if (item.image) {
      formData.append("image", item.image);
    }

    const response = await fetch(
      `${apiUrl}/api/InventoryDetail/create-inventoryDetail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.ok) {
      const textResponse = await response.text();

      if (!textResponse || textResponse.trim() === "") {
        return { success: true, data: {} };
      }

      try {
        const responseData = JSON.parse(textResponse);
        return { success: true, data: responseData };
      } catch (parseError) {
        return { success: true, message: textResponse };
      }
    } else {
      const errorText = await response.text();
      let errorMessage;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || "Thêm sản phẩm thất bại.";
      } catch (parseError) {
        errorMessage =
          errorText || `Lỗi ${response.status}: ${response.statusText}`;
      }

      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    console.error("Error adding inventory detail:", error);
    toast.error("Đã có lỗi xảy ra khi thêm chi tiết sản phẩm.");
    return { success: false, message: "Đã có lỗi xảy ra" };
  }
};

// Hàm cập nhật chi tiết sản phẩm
export const updateInventoryDetailData = async (id, item) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("itemName", item.itemName);
    formData.append("inventoryId", item.inventoryId);
    formData.append("quantity", item.quantity);
    formData.append("price", item.price);
    formData.append("expirationDate", item.expirationDate);

    if (item.image) {
      formData.append("image", item.image);
    }

    const response = await fetch(
      `${apiUrl}/api/InventoryDetail/update-inventoryDetail/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.ok) {
      let data;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { message: responseText };
      }

      toast.success("Cập nhật sản phẩm thành công!");
      return { success: true, data };
    } else {
      const responseText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (parseError) {
        errorData = { message: responseText };
      }

      toast.error(errorData.message || "Cập nhật sản phẩm thất bại.");
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    console.error("Error updating inventory detail:", error);
    toast.error("Đã có lỗi xảy ra khi cập nhật chi tiết sản phẩm.");
    return { success: false, message: error.message };
  }
};

// Hàm xóa chi tiết sản phẩm
export const deleteInventoryDetailData = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${apiUrl}/api/InventoryDetail/delete-inventoryDetail/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      toast.success("Chi tiết sản phẩm đã được xóa.");
      return { success: true };
    } else {
      const errorData = await response.json();
      toast.error(errorData.message || "Xóa chi tiết sản phẩm thất bại.");
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    console.error("Error deleting inventory detail:", error);
    toast.error("Đã có lỗi xảy ra khi xóa chi tiết sản phẩm.");
    return { success: false, message: error.message };
  }
};

// Hàm lọc chi tiết sản phẩm theo số lượng
export const filterInventoryDetailByQuantity = async (
  minQuantity,
  maxQuantity
) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${apiUrl}/api/InventoryDetail/filter-by-quantity?minQuantity=${minQuantity}&maxQuantity=${maxQuantity}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error filtering inventory details by quantity:", error);
    toast.error("Đã có lỗi xảy ra khi lọc dữ liệu chi tiết kho.");
    return { success: false, error: error.message };
  }
};

// Hàm sắp xếp chi tiết sản phẩm theo giá
export const sortInventoryDetailByPrice = async (ascending = true) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${apiUrl}/api/InventoryDetail/sort-by-price?ascending=${ascending}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error sorting inventory details by price:", error);
    toast.error("Đã có lỗi xảy ra khi sắp xếp dữ liệu chi tiết kho.");
    return { success: false, error: error.message };
  }
};
