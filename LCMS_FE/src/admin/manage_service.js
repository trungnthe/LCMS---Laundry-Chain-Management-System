import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

// Fetch Service Types
export const fetchServiceTypes = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/ServiceType/get-all`);
    if (!response.ok) throw new Error("Không thể lấy loại dịch vụ!");
    const data = await response.json();
    return data;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

// Fetch service by ID
export const fetchServiceById = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/Service/getbyId/${id}`);
    if (!response.ok) throw new Error("Không thể tải thông tin dịch vụ.");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi tải dịch vụ: " + error.message);
    throw error;
  }
};

export const fetchServiceTypeById = async (id) => {
  try {
    const response = await fetch(
      `${apiUrl}/api/ServiceType/getServiceById/${id}`
    );
    if (!response.ok) throw new Error("Không thể tải thông tin dịch vụ.");
    const data = await response.json();
    return data;
  } catch (error) {
    toast.error("Lỗi khi tải dịch vụ: " + error.message);
    throw error;
  }
};

export const fetchServicesByServiceType = async (serviceTypeId) => {
  try {
    const response = await fetch(
      `${apiUrl}/api/Service/byServiceType/${serviceTypeId}`
    );

    if (response.status === 404) return null; // Không tìm thấy thì trả về null, không báo lỗi
    if (!response.ok) throw new Error("Không thể tải danh sách dịch vụ.");

    return await response.json();
  } catch (error) {
    toast.error("Lỗi khi tải danh sách dịch vụ: " + error.message);
    return null; // Trả về null để tránh lỗi undefined
  }
};

// Fetch Services
export const fetchServices = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/Service/get-all`);
    if (!response.ok) throw new Error("Không thể lấy dịch vụ!");
    const data = await response.json();
    return data;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

// Add Service
export const addService = async (newService) => {
  try {
    const formData = new FormData();
    formData.append("serviceName", newService.serviceName);
    formData.append("description", newService.description);
    formData.append("price", newService.price);
    formData.append("serviceTypeId", newService.serviceTypeId);
    formData.append("estimatedTime", newService.estimatedTime);
    formData.append("image", newService.image); // giữ file đúng cách

    const response = await fetch(`${apiUrl}/api/Service/Create`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Lỗi khi thêm dịch vụ!");
    if (response.status === 204 || !response.bodyUsed) return null;
    return await response.json();
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

// Edit Service
export const editService = async (updatedService) => {
  try {
    const formData = new FormData();
    formData.append("ServiceId", updatedService.serviceId);
    formData.append("ServiceName", updatedService.serviceName);
    formData.append("Price", updatedService.price);
    formData.append("Description", updatedService.description);
    formData.append("ServiceTypeId", updatedService.serviceTypeId);
    formData.append("EstimatedTime", updatedService.estimatedTime);

    if (updatedService.image) {
      formData.append("Image", updatedService.image);
    }

    const response = await fetch(
      `${apiUrl}/api/Service/update/${updatedService.serviceId}`,
      { method: "PUT", body: formData }
    );

    if (!response.ok) throw new Error("Lỗi khi cập nhật dịch vụ!");
    if (response.status === 204 || !response.bodyUsed) return null;
    return await response.json();
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

// Delete Service
export const deleteService = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/Service/delete/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Lỗi khi xóa dịch vụ!");
    return true;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};
