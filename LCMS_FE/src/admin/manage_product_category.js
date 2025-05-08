import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export const fetchProductCategories = () => {
  return fetch(`${apiUrl}/api/ProductCategory/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching product categories:", error);
      throw new Error("Failed to fetch product categories.");
    });
};

export const addProductCategory = (
  newProductCategory,
  productCategories,
  setProductCategories
) => {
  const isProductCategoryNameExist = productCategories.some(
    (productCategory) =>
      productCategory.productCategoryName ===
      newProductCategory.productCategoryName
  );

  if (isProductCategoryNameExist) {
    throw new Error("Loại sản phẩm này đã tồn tại");
  }

  const formData = new FormData();
  formData.append(
    "productCategoryName",
    newProductCategory.productCategoryName
  );
  if (newProductCategory.image) {
    formData.append("image", newProductCategory.image);
  }

  return fetch(`${apiUrl}/api/ProductCategory/create`, {
    method: "POST",
    body: formData, // Không cần thiết lập Content-Type khi dùng FormData
  })
    .then((response) => response.json())
    .then((data) => {
      setProductCategories([...productCategories, data]);
      return data;
    })
    .catch((error) => {});
};

// Hàm để cập nhật loại sản phẩm với hình ảnh
export const editProductCategory = (
  updatedProductCategory,
  productCategories,
  setProductCategories,
  fetchProductCategories
) => {
  const formData = new FormData();
  formData.append(
    "productCategoryName",
    updatedProductCategory.productCategoryName
  );

  if (
    updatedProductCategory.image &&
    updatedProductCategory.image instanceof File
  ) {
    formData.append("image", updatedProductCategory.image);
  }

  return fetch(
    `${apiUrl}/api/ProductCategory/update/${updatedProductCategory.productCategoryId}`,
    {
      method: "PUT",
      body: formData,
    }
  )
    .then((response) => {
      if (response.status === 204) {
        fetchProductCategories()
          .then((data) => {
            setProductCategories(data);
          })
          .catch((error) => {});

        return;
      }
      return response.json();
    })
    .catch((error) => {});
};

// Hàm để xóa loại sản phẩm
export const deleteProductCategory = (
  id,
  productCategories,
  setProductCategories
) => {
  return fetch(`${apiUrl}/api/ProductCategory/delete/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.status === 204) {
        return;
      }
      return response.json();
    })
    .then(() => {
      setProductCategories(
        productCategories.filter(
          (productCategory) => productCategory.productCategoryId !== id
        )
      );
    })
    .catch((error) => {});
};
