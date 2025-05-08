import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export const fetchRoles = () => {
  return fetch(`${apiUrl}/api/EmployeeRole/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching roles:", error);
      toast.error("Không thể tải dữ liệu vai trò");
    });
};

export const addRole = (newRole) => {
  return fetch(`${apiUrl}/api/EmployeeRole/add-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newRole),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text();
      }
      return response.json();
    })
    .then((data) => {
      if (typeof data === "string") {
        toast.error(`Lỗi: ${data}`);
      } else {
        toast.success("Vai trò đã được thêm thành công!");
        return data;
      }
    })
    .catch((error) => {
      console.error("Error adding role:", error);
      toast.error("Thêm vai trò thất bại!");
    });
};

export const editRole = (updatedRole) => {
  return fetch(
    `${apiUrl}/api/EmployeeRole/update-role/${updatedRole.employeeRoleId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRole),
    }
  )
    .then((response) => {
      if (!response.ok) {
        return response.text();
      }

      if (response.status === 204) {
        return null;
      }

      return response.json();
    })
    .then((data) => {
      if (data === null) {
        toast.success("Vai trò đã được cập nhật thành công!");
        return null;
      }
      toast.success("Vai trò đã được cập nhật thành công!");
      return data;
    })
    .catch((error) => {
      console.error("Error updating role:", error);
      toast.error("Cập nhật vai trò thất bại!");
    });
};

export const deleteRole = (id) => {
  return fetch(`${apiUrl}/api/EmployeeRole/delete-role/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          // Hiển thị chi tiết lỗi từ server
          console.error("Error response:", text);
          toast.error("Không thể xóa vai trò: " + text);
        });
      }
      if (response.status === 204) {
        toast.success("Vai trò đã được xóa thành công!");
        return null;
      }

      return response.json();
    })
    .then(() => {
      return;
    })
    .catch((error) => {
      console.error("Error deleting role:", error);
      toast.error(`Xóa vai trò thất bại: ${error.message}`);
    });
};
