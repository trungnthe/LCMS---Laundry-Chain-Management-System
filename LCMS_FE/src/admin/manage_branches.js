import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

// Fetch all branches
export const fetchBranches = () => {
  return fetch(`${apiUrl}/api/Branch/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching branches:", error);
      toast.error("Đã có lỗi xảy ra khi tải dữ liệu chi nhánh.");
      throw new Error("Failed to fetch branches.");
    });
};

// Fetch branch by ID
export const fetchBranchById = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/Branch/getById/${id}`);
    if (!response.ok) throw new Error("Không thể tải thông tin chi nhánh.");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi tải chi nhánh: " + error.message);
    throw error;
  }
};

// Add a new branch with image support
export const addBranch = (formData, setBranches) => {
  fetch(`${apiUrl}/api/Branch/get-all`)
    .then((response) => response.json())
    .then((existingBranches) => {
      const existingBranch = existingBranches.find(
        (branch) => branch.address === formData.get("address")
      );

      if (existingBranch) {
        toast.error("Địa chỉ này đã tồn tại. Vui lòng chọn địa chỉ khác.");
        return;
      }

      fetch(`${apiUrl}/api/Branch/create`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text || "Failed to add branch");
            });
          }
          return response.json();
        })
        .then((data) => {
          fetch(`${apiUrl}/api/Branch/get-all`)
            .then((response) => response.json())
            .then((updatedBranches) => {
              setBranches(updatedBranches);
              toast.success("Chi nhánh đã được thêm thành công!");
            })
            .catch((error) => {
              console.error("Error fetching updated branches:", error);
              toast.error("Lỗi khi tải lại danh sách chi nhánh!");
            });
        })
        .catch((error) => {
          console.error("Error adding branch:", error);
          toast.error("Thêm chi nhánh thất bại: " + error.message);
        });
    })
    .catch((error) => {
      console.error("Error fetching branches:", error);
      toast.error("Đã có lỗi xảy ra khi tải danh sách chi nhánh.");
    });
};

// Update an existing branch with image support
export const updateBranch = (branchId, formData, setBranches) => {
  return fetch(`${apiUrl}/api/Branch/update/${branchId}`, {
    method: "PUT",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text || "Error updating branch");
        });
      }
      if (response.status === 204) {
        toast.success("Chi nhánh đã được cập nhật thành công!");
        return;
      }
      return response.json();
    })
    .then((data) => {
      return fetch(`${apiUrl}/api/Branch/get-all`)
        .then((response) => response.json())
        .then((updatedBranches) => {
          setBranches(updatedBranches);
        })
        .catch((error) => {
          console.error("Error fetching updated branches:", error);
          toast.error("Lỗi khi tải lại danh sách chi nhánh!");
        });
    })
    .catch((error) => {
      console.error("Error updating branch:", error);
      toast.error("Cập nhật chi nhánh thất bại: " + error.message);
    });
};

// Delete a branch
export const deleteBranch = (branchId, setBranches) => {
  return fetch(`${apiUrl}/api/Branch/delete/${branchId}`, {
    method: "DELETE",
  })
    .then(() => {
      fetch(`${apiUrl}/api/Branch/get-all`)
        .then((response) => response.json())
        .then((updatedBranches) => {
          setBranches(updatedBranches);
          toast.success("Chi nhánh đã được xóa thành công!");
        })
        .catch((error) => {
          console.error("Error fetching updated branches:", error);
          toast.error("Lỗi khi tải lại danh sách chi nhánh!");
        });
    })
    .catch((error) => {
      console.error("Error deleting branch:", error);
      toast.error("Xóa chi nhánh thất bại!");
    });
};
