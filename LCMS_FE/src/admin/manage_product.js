import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

// Fetch all products (including image URLs)
export const fetchProducts = () => {
  return fetch(`${apiUrl}/api/Product/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
      throw new Error("Không thể tải sản phẩm.");
    });
};

export const fetchProductsByCategory = (categoryId) => {
  return fetch(`${apiUrl}/api/Product/get-product-by-category-id/${categoryId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Không thể lấy sản phẩm theo danh mục.");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Lỗi khi tải sản phẩm theo danh mục:", error);
      return [];
    });
};

export const fetchCategories = () => {
  return fetch(`${apiUrl}/api/ProductCategory/get-all`)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Lỗi khi tải danh mục sản phẩm:", error);
      throw new Error("Không thể tải danh mục.");
    });
};

// Add product with image
export const addProduct = (
  productData,
  products,
  setProducts,
  fetchCategories,
  categories
) => {
  const formData = new FormData();
  formData.append("productName", productData.productName);
  formData.append("price", productData.price);
  formData.append("productCategoryId", productData.productCategoryId);
  if (productData.image) {
    formData.append("image", productData.image);
  }

  return fetch(`${apiUrl}/api/Product/create`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((newProduct) => {
      const selectedCategory = categories.find(
        (category) =>
          category.productCategoryId === newProduct.productCategoryId
      );
      if (selectedCategory) {
        newProduct.productCategoryName = selectedCategory.productCategoryName;
      }
      fetchProducts()
        .then((data) => setProducts(data))
        .catch((error) => {
          console.error("Lỗi khi tải sản phẩm sau khi thêm:", error);
        });
    })
    .catch((error) => {
      console.error("Lỗi khi thêm sản phẩm:", error);
    });
};

// Edit product with image
export const editProduct = (
  updatedProductData,
  products,
  setProducts,
  fetchCategories,
  fetchProducts
) => {
  const formData = new FormData();
  formData.append("productName", updatedProductData.productName);
  formData.append("price", updatedProductData.price);
  formData.append("productCategoryId", updatedProductData.productCategoryId);
  if (updatedProductData.image) {
    formData.append("image", updatedProductData.image);
  }

  return fetch(`${apiUrl}/api/Product/update/${updatedProductData.productId}`, {
    method: "PUT",
    body: formData,
  })
    .then((response) => {
      if (response.status === 204) {
        fetchProducts()
          .then((newProductList) => {
            setProducts(newProductList);
          })
          .catch((error) => {
            console.error("Lỗi khi tải danh sách sản phẩm cập nhật:", error);
          });

        fetchCategories()
          .then((categories) => {
            const selectedCategory = categories.find(
              (category) =>
                category.productCategoryId ===
                updatedProductData.productCategoryId
            );
            if (selectedCategory) {
              updatedProductData.productCategoryName =
                selectedCategory.productCategoryName;
            }

            setProducts((prevProducts) => {
              return prevProducts.map((product) =>
                product.productId === updatedProductData.productId
                  ? updatedProductData
                  : product
              );
            });
          })
          .catch((error) => {
            console.error("Lỗi khi tải danh mục sản phẩm:", error);
          });
      } else {
      }
    })
    .catch((error) => {});
};

// Delete product
export const deleteProduct = (productId, products, setProducts) => {
  return fetch(`${apiUrl}/api/Product/delete/${productId}`, {
    method: "DELETE",
  })
    .then(() => {
      const updatedProducts = products.filter(
        (product) => product.productId !== productId
      );
      setProducts(updatedProducts);
    })
    .catch((error) => {
      console.error("Lỗi khi xóa sản phẩm:", error);
    });
};
