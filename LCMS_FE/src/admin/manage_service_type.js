const apiUrl = import.meta.env.VITE_API_URL;

// Hàm để lấy tất cả các loại dịch vụ
export const fetchServiceTypes = () => {
  return fetch(`${apiUrl}/api/ServiceType/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching service types:", error);
      throw new Error("Failed to fetch service types.");
    });
};

// Hàm để thêm một loại dịch vụ mới
export const addServiceType = async (
  newServiceType,
  serviceTypes,
  setServiceTypes
) => {
  const isServiceTypeNameExist = serviceTypes.some(
    (serviceType) =>
      serviceType.serviceTypeName === newServiceType.serviceTypeName
  );

  if (isServiceTypeNameExist) {
    throw new Error(
      "Loại dịch vụ này đã tồn tại, vui lòng tạo loại dịch vụ khác!"
    );
  }

  const formData = new FormData();
  formData.append("ServiceTypeName", newServiceType.serviceTypeName);
  formData.append("Description", newServiceType.description);
  if (newServiceType.imageFile) {
    formData.append("Image", newServiceType.imageFile);
  }

  const response = await fetch(`${apiUrl}/api/ServiceType/Create`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Lỗi khi thêm loại dịch vụ");
  }
  const refreshedData = await fetchServiceTypes();
  setServiceTypes(refreshedData);
};

// cập nhật thông tin loại dịch vụ
export const editServiceType = async (
  updatedServiceType,
  serviceTypes,
  setServiceTypes
) => {
  const formData = new FormData();
  formData.append("ServiceTypeName", updatedServiceType.serviceTypeName);
  formData.append("Description", updatedServiceType.description);
  if (updatedServiceType.imageFile) {
    formData.append("Image", updatedServiceType.imageFile);
  }

  const response = await fetch(
    `${apiUrl}/api/ServiceType/update/${updatedServiceType.serviceTypeId}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Lỗi khi cập nhật loại dịch vụ");
  }

  const refreshedData = await fetchServiceTypes();
  setServiceTypes(refreshedData);
};

// Hàm để xóa loại dịch vụ
export const deleteServiceType = async (id, serviceTypes, setServiceTypes) => {
  const response = await fetch(`${apiUrl}/api/ServiceType/delete/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Lỗi khi xóa loại dịch vụ");
  }

  if (response.status !== 204) {
    await response.json();
  }

  const updatedServiceTypes = serviceTypes.filter(
    (serviceType) => serviceType.serviceTypeId !== id
  );
  setServiceTypes(updatedServiceTypes);
};
