import { toast } from "react-toastify"; // Import toast

const apiUrl = import.meta.env.VITE_API_URL;

// Hàm fetch inventory
export const fetchInventoryData = async (setInventory, token) => {
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

    const processedData = data.map((item) => {
      if (item.image && !item.image.startsWith("http")) {
        item.image = `${apiUrl}${item.image.startsWith("/") ? "" : "/"}${
          item.image
        }`;
      }
      return item;
    });

    setInventory(processedData);
    return { success: true, data: processedData };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    toast.error("Đã có lỗi xảy ra khi tải dữ liệu kho.");
    return { success: false, error: error.message };
  }
};

// Hàm fetch branches
export const fetchBranchesData = async (setBranches, token) => {
  try {
    const response = await fetch(`${apiUrl}/api/Branch/get-all`, {
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
    setBranches(data);
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching branches:", error);
    toast.error("Đã có lỗi xảy ra khi tải dữ liệu chi nhánh.");
    return { success: false, error: error.message };
  }
};

export const addInventoryData = async (item, token, fetchInventory) => {
  try {
    const formData = new FormData();
    formData.append("inventoryName", item.inventoryName);
    formData.append("branchId", item.branchId);
    const status = item.status === "Hoạt động (Active)" ? "Active" : "Inactive";
    formData.append("status", status);

    if (item.image instanceof File) {
      console.log(
        "Appending file:",
        item.image.name,
        item.image.type,
        item.image.size
      );
      formData.append("image", item.image, item.image.name);
    } else if (item.image) {
      console.log("Image is not a File object:", typeof item.image);
      formData.append("image", item.image);
    }

    // Log the form data for debugging
    for (let pair of formData.entries()) {
      console.log(
        pair[0] + ": " + (pair[1] instanceof File ? pair[1].name : pair[1])
      );
    }

    const response = await fetch(`${apiUrl}/api/Inventory/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const textResponse = await response.text();

      if (!textResponse || textResponse.trim() === "") {
        setTimeout(() => {
          fetchInventory();
        }, 500);
        return { success: true, data: {} };
      }

      try {
        const responseData = JSON.parse(textResponse);
        setTimeout(() => {
          fetchInventory();
        }, 500);
        return { success: true, data: responseData };
      } catch (parseError) {
        setTimeout(() => {
          fetchInventory();
        }, 500);
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
    console.error("Error adding inventory:", error);
    toast.error("Đã có lỗi xảy ra khi thêm sản phẩm.");
    return { success: false, message: "Đã có lỗi xảy ra" };
  }
};

export const updateInventoryData = async (id, item, token, fetchInventory) => {
  try {
    const formData = new FormData();
    formData.append("inventoryName", item.inventoryName);
    formData.append("branchId", item.branchId);
    const status = item.status === "Hoạt động (Active)" ? "Active" : "Inactive";
    formData.append("status", status);

    if (item.image) {
      formData.append("image", item.image);
    }

    const response = await fetch(
      `${apiUrl}/api/Inventory/update-inventory/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const textResponse = await response.text();

    if (response.ok) {
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        data = { message: textResponse };
      }

      fetchInventory();
      toast.success("Cập nhật sản phẩm thành công!");
      return { success: true, data };
    } else {
      let errorData;
      try {
        errorData = JSON.parse(textResponse);
      } catch (parseError) {
        errorData = { message: textResponse };
      }

      toast.error(errorData.message || "Cập nhật sản phẩm thất bại.");
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    console.error("Error updating inventory:", error);
    toast.error("Đã có lỗi xảy ra khi cập nhật sản phẩm.");
    return { success: false, message: error.message };
  }
};

export const deleteInventoryData = async (id, token, fetchInventory) => {
  try {
    const response = await fetch(`${apiUrl}/api/Inventory/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      fetchInventory();
      toast.success("Sản phẩm đã được xóa.");
      return { success: true };
    } else {
      const errorData = await response.json();
      toast.error(errorData.message || "Xóa sản phẩm thất bại.");
      return { success: false, message: errorData.message };
    }
  } catch (error) {
    console.error("Error deleting inventory:", error);
    toast.error("Đã có lỗi xảy ra khi xóa sản phẩm.");
    return { success: false, message: error.message };
  }
};
