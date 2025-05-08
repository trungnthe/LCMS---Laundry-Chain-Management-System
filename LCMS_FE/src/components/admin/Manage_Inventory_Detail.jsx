import React, { useState, useEffect } from "react";
import "../../assets/css/admin/manage_inventory_detail.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const apiUrl = import.meta.env.VITE_API_URL;
const Manage_Inventory_Detail = () => {
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [operationError, setOperationError] = useState("");
  const [operation, setOperation] = useState({ status: "", message: "" });
  const [newItem, setNewItem] = useState({
    itemName: "",
    inventoryId: 0,
    quantity: 0,
    price: 0,
    expirationDate: "",
    image: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [modalAction, setModalAction] = useState("");
  const [jumpToPage, setJumpToPage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [inventories, setInventories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [fileError, setFileError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [modalError, setModalError] = useState("");
  const [prioritizeNewAndValid, setPrioritizeNewAndValid] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (operation.status !== "") {
      const timer = setTimeout(() => {
        setOperation({ status: "", message: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [operation.status]);

  useEffect(() => {
    if (operationError !== "") {
      const timer = setTimeout(() => {
        setOperationError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [operationError]);

  useEffect(() => {
    fetchInventoryDetails();
    fetchBranches();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const validFileTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "image/webp",
      ];

      if (!validFileTypes.includes(file.type)) {
        setFileError(
          "Chỉ chấp nhận file ảnh có định dạng: JPG, JPEG, PNG, GIF, SVG, WEBP"
        );
        e.target.value = "";
        return;
      }
      setFileError("");

      setCurrentItem({
        ...currentItem,
        image: file,
        hasNewImage: true,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const fetchInventoryDetails = async () => {
    try {
      const response = await fetchInventoryDetailData(setInventoryDetails);
      if (!response.success) {
        setOperationError("Đã có lỗi xảy ra khi tải dữ liệu chi tiết lô hàng.");
      } else {
        if (prioritizeNewAndValid) {
          sortByNewAndValid(response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching inventory details:", error);
      setOperationError("Đã có lỗi xảy ra khi tải dữ liệu chi tiết lô hàng.");
    }
  };
  const fetchInventoryDetailData = async (setInventoryDetails) => {
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

      const mappedData = data.map((item) => ({
        ...item,
        isActive: item.statusDelete === null || item.statusDelete === true,
      }));

      setInventoryDetails(mappedData);
      return { success: true, data: mappedData };
    } catch (error) {
      console.error("Error fetching inventory details:", error);
      setOperationError("Đã có lỗi xảy ra khi tải dữ liệu chi tiết lô hàng.");
      return { success: false, error: error.message };
    }
  };
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
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
      setOperationError("Đã có lỗi xảy ra khi tải dữ liệu chi nhánh.");
      return { success: false, error: error.message };
    }
  };
  const fetchInventoriesByBranchId = async (branchId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiUrl}/api/Inventory/get-By-BranchID/${branchId}`,
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
      setInventories(data);
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching inventories by branch ID:", error);
      setOperationError(
        "Đã có lỗi xảy ra khi tải dữ liệu lô hàng theo chi nhánh."
      );
      return { success: false, error: error.message };
    }
  };
  const handleBranchChange = async (branchId) => {
    setSelectedBranchId(branchId);
    if (branchId) {
      await fetchInventoriesByBranchId(branchId);
      setCurrentItem({
        ...currentItem,
        inventoryId: "",
      });
    } else {
      setInventories([]);
    }
  };

  const handleFilter = async () => {
    try {
      const response = await filterInventoryDetailByQuantity(
        minQuantity,
        maxQuantity
      );
      if (response.success) {
        if (prioritizeNewAndValid) {
          sortByNewAndValid(response.data);
        } else {
          setInventoryDetails(response.data);
        }
        setOperation({ status: "success", message: "Lọc thành công!" });
      } else {
        setOperation({
          status: "error",
          message: response.message || "Lọc thất bại.",
        });
      }
    } catch (error) {
      console.error("Error filtering inventory details:", error);
    }
  };
  const filterInventoryDetailByQuantity = async (minQuantity, maxQuantity) => {
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
      const mappedData = data.map((item) => ({
        ...item,
        isActive: item.statusDelete === null || item.statusDelete === true,
      }));

      return { success: true, data: mappedData };
    } catch (error) {
      console.error("Error filtering inventory details by quantity:", error);
      return { success: false, error: error.message };
    }
  };
  const handleSort = (field) => {
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);

    setPrioritizeNewAndValid(false);
  };
  const sortByNewAndValid = (data) => {
    const currentDate = new Date();

    const sortedData = [...data].sort((a, b) => {
      const aIsExpired = new Date(a.expirationDate) < currentDate;
      const bIsExpired = new Date(b.expirationDate) < currentDate;

      if (aIsExpired && !bIsExpired) return 1;
      if (!aIsExpired && bIsExpired) return -1;

      return new Date(b.createAt) - new Date(a.createAt);
    });

    setInventoryDetails(sortedData);
  };
  const toggleSortingPreference = () => {
    setPrioritizeNewAndValid(!prioritizeNewAndValid);

    if (!prioritizeNewAndValid) {
      sortByNewAndValid(inventoryDetails);
    } else {
      setSortField("");
      setSortOrder("asc");
    }
  };

  const sortInventoryDetailByPrice = async (ascending = true) => {
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
      const mappedData = data.map((item) => ({
        ...item,
        isActive: item.statusDelete === null || item.statusDelete === true,
      }));

      return { success: true, data: mappedData };
    } catch (error) {
      console.error("Error sorting inventory details by price:", error);
      setOperationError(
        "Đã có lỗi xảy ra khi sắp xếp dữ liệu chi tiết lô hàng."
      );
      return { success: false, error: error.message };
    }
  };

  const openModal = async (action, item = null) => {
    setModalAction(action);
    setModalError("");
    if (item) {
      const creationTime = new Date(item.createAt);
      const currentTime = new Date();
      const isEditable =
        currentTime - creationTime <= 3600000 &&
        new Date(item.expirationDate) >= currentTime;

      const imageUrl = item.image;

      setCurrentItem({
        ...item,
        isActive: item.statusDelete === null || item.statusDelete === true,
        isEditable: isEditable,
        originalImageUrl: imageUrl,
        image: null,
      });

      setImagePreview(imageUrl);

      if (!isEditable) {
        setModalError(
          currentTime - creationTime > 3600000
            ? "Không thể chỉnh sửa chi tiết đã tạo quá 1 giờ"
            : "Không thể chỉnh sửa chi tiết đã hết hạn"
        );
      }

      await fetchBranches();

      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${apiUrl}/api/Inventory/get-byID/${item.inventoryId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const inventoryData = await response.json();
          const branch = branches.find(
            (b) => b.branchName === inventoryData.branchName
          );
          if (branch) {
            const branchId = branch.branchId.toString();
            setSelectedBranchId(branchId);
            await fetchInventoriesByBranchId(branchId);
          }
        }
      } catch (error) {
        console.error("Error fetching inventory details:", error);
      }
    } else {
      setCurrentItem({
        itemName: "",
        inventoryId: "",
        quantity: "",
        price: "",
        expirationDate: "",
        image: null,
        isActive: true,
        isEditable: true,
      });
      setSelectedBranchId("");
      setInventories([]);
      setImagePreview(null);
    }

    setModalVisible(true);
  };
  const openDeleteModal = (item) => {
    if (new Date(item.expirationDate) < new Date()) {
      setOperationError("Không thể xóa chi tiết đã hết hạn");
      return;
    }

    setItemToDelete(item);
    setDeleteModalVisible(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };
  const confirmDelete = async () => {
    if (itemToDelete) {
      const result = await toggleInventoryDetailStatus(
        itemToDelete.inventoryDetailId
      );
      if (result.success) {
        setOperation({
          status: "success",
          message: "Đã xóa chi tiết sản phẩm thành công.",
        });
      }
      closeDeleteModal();
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentItem({});
    setSelectedBranchId("");
    setModalError("");
    setImagePreview(null);
  };

  const handleSave = async () => {
    setModalError("");

    if (!currentItem.inventoryId || currentItem.inventoryId === "") {
      setModalError("Vui lòng chọn lô hàng");
      return;
    }

    if (!currentItem.itemName || currentItem.itemName.trim() === "") {
      setModalError("Vui lòng nhập tên chi tiết lô hàng");
      return;
    }

    if (!currentItem.quantity || currentItem.quantity <= 0) {
      setModalError("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (!currentItem.price || currentItem.price <= 0) {
      setModalError("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (!currentItem.expirationDate) {
      setModalError("Vui lòng chọn ngày hết hạn");
      return;
    }

    if (modalAction === "add") {
      const expirationDate = new Date(currentItem.expirationDate);
      const currentDate = new Date();
      if (expirationDate < currentDate) {
        setModalError("Ngày hết hạn không thể là ngày trong quá khứ");
        return;
      }
    }

    if (modalAction === "add") {
      await addInventoryDetail(currentItem);
    } else if (modalAction === "edit") {
      if (!currentItem.isEditable) {
        setModalError("Không thể chỉnh sửa chi tiết này");
        return;
      }

      const originalItem = inventoryDetails.find(
        (item) => item.inventoryDetailId === currentItem.inventoryDetailId
      );
      const hasChanges =
        originalItem.itemName !== currentItem.itemName ||
        originalItem.quantity !== parseInt(currentItem.quantity) ||
        originalItem.price !== parseInt(currentItem.price) ||
        originalItem.expirationDate.split("T")[0] !==
          currentItem.expirationDate.split("T")[0] ||
        originalItem.isActive !== currentItem.isActive ||
        currentItem.image instanceof File;

      if (!hasChanges) {
        setModalError("Không có thông tin nào được thay đổi");
        return;
      }

      await updateInventoryDetail(currentItem.inventoryDetailId, currentItem);
    }
    closeModal();
  };
  const addInventoryDetail = async (item) => {
    try {
      const response = await addInventoryDetailData(item);
      if (response.success) {
        setOperation({
          status: "success",
          message: "Thêm chi tiết lô hàng thành công!",
        });
        fetchInventoryDetails();
      } else {
        setOperation({
          status: "error",
          message: response.message || "Thêm chi tiết lô hàng thất bại.",
        });
      }
    } catch (error) {
      console.error("Error adding inventory detail:", error);
      setOperationError("Đã có lỗi xảy ra khi thêm chi tiết lô hàng.");
    }
  };
  const addInventoryDetailData = async (item) => {
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
      formData.append("statusDelete", true);

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

        setOperationError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error("Error adding inventory detail:", error);
      setOperationError("Đã có lỗi xảy ra khi thêm chi tiết sản phẩm.");
      return { success: false, message: "Đã có lỗi xảy ra" };
    }
  };

  const updateInventoryDetail = async (id, item) => {
    try {
      if (!item.isEditable) {
        setModalError(
          "Không thể chỉnh sửa chi tiết này do đã quá thời gian cho phép hoặc đã hết hạn"
        );
        return { success: false, message: "Không thể chỉnh sửa" };
      }

      const response = await updateInventoryDetailData(id, item);
      if (response.success) {
        setOperation({
          status: "success",
          message: "Cập nhật chi tiết lô hàng thành công!",
        });
        fetchInventoryDetails();
      } else {
        setOperation({
          status: "error",
          message: response.message || "Cập nhật chi tiết lô hàng thất bại.",
        });
      }
    } catch (error) {
      console.error("Error updating inventory detail:", error);
      setOperationError("Đã có lỗi xảy ra khi cập nhật chi tiết lô hàng.");
    }
  };
  const updateInventoryDetailData = async (id, item) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("itemName", item.itemName);
      formData.append("inventoryId", item.inventoryId);
      formData.append("quantity", item.quantity);
      formData.append("price", item.price);
      formData.append("expirationDate", item.expirationDate);

      formData.append("statusDelete", item.isActive);

      if (item.image instanceof File) {
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

        setOperation({
          status: "success",
          message: "Cập nhật sản phẩm thành công!",
        });
        return { success: true, data };
      } else {
        const responseText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          errorData = { message: responseText };
        }

        setOperation({
          status: "error",
          message: errorData.message || "Cập nhật sản phẩm thất bại.",
        });
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.error("Error updating inventory detail:", error);
      setOperationError("Đã có lỗi xảy ra khi cập nhật chi tiết sản phẩm.");
      return { success: false, message: error.message };
    }
  };

  const toggleInventoryDetailStatus = async (id) => {
    try {
      const itemToToggle = inventoryDetails.find(
        (item) => item.inventoryDetailId === id
      );
      if (!itemToToggle) {
        setOperationError("Không tìm thấy chi tiết lô hàng");
        return { success: false };
      }

      const creationTime = new Date(itemToToggle.createAt);
      const currentTime = new Date();

      if (currentTime - creationTime > 3600000) {
        setOperationError("Không thể xóa chi tiết đã tạo quá 1 giờ");
        return { success: false };
      }

      if (new Date(itemToToggle.expirationDate) < currentTime) {
        setOperationError("Không thể xóa chi tiết đã hết hạn");
        return { success: false };
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiUrl}/api/InventoryDetail/delete-inventoryDetail/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ statusDelete: false }),
        }
      );

      if (response.ok) {
        setOperation({
          status: "success",
          message: "Đã xóa chi tiết sản phẩm.",
        });
        fetchInventoryDetails();
        return { success: true };
      } else {
        const errorData = await response.json();
        setOperation({
          status: "error",
          message: errorData.message || "Xóa chi tiết sản phẩm thất bại.",
        });
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.error("Error deleting inventory detail:", error);
      setOperationError("Đã có lỗi xảy ra khi xóa chi tiết sản phẩm.");
      return { success: false, message: error.message };
    }
  };
  const filteredInventoryDetails = inventoryDetails.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPage);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      paginate(pageNumber);
      setJumpToPage("");
    } else {
      setOperationError(`Vui lòng nhập số trang từ 1 đến ${totalPages}`);
    }
  };

  let sortedData = [...filteredInventoryDetails];

  if (sortField) {
    sortedData.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }
  const sortedByExpiration = [...sortedData].sort((a, b) => {
    const aIsExpired = new Date(a.expirationDate) < new Date();
    const bIsExpired = new Date(b.expirationDate) < new Date();

    if (aIsExpired && !bIsExpired) return 1;
    if (!aIsExpired && bIsExpired) return -1;

    return 0;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedByExpiration.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(sortedData.length / recordsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return { pageNumbers, startPage, endPage };
  };

  const { pageNumbers, startPage, endPage } = getPageNumbers();

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="admin-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />
        <div className="manage-inventory-detail-container">
          <h2>Quản Lý Chi Tiết Lô Hàng</h2>

          {operation.status === "success" && (
            <div className="manage-inventory-detail-success-message">
              {operation.message}
            </div>
          )}
          {operation.status === "error" && (
            <div className="manage-inventory-detail-error-message">
              {operation.message}
            </div>
          )}
          {operationError && (
            <div className="manage-inventory-detail-error-message">
              {operationError}
            </div>
          )}

          <div className="manage-inventory-detail-filter-sort-container">
            <div className="manage-inventory-detail-filter-container">
              <label>Số Lượng:</label>
              <input
                type="number"
                placeholder="Min"
                onChange={(e) => setMinQuantity(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                onChange={(e) => setMaxQuantity(e.target.value)}
              />
              <button onClick={handleFilter}>Lọc</button>
            </div>

            <div className="manage-inventory-detail-sort-container">
              <label>Sắp Xếp Giá:</label>
              <select onChange={(e) => setSortOrder(e.target.value)}>
                <option value="asc">Tăng Dần</option>
                <option value="desc">Giảm Dần</option>
              </select>
              <button onClick={() => handleSort("price")}>Sắp Xếp</button>
            </div>
          </div>

          <div className="manage-inventory-detail-search">
            <FaSearch className="manage-inventory-detail-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm chi tiết lô hàng"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <button
            className="manage-inventory-detail-add-btn"
            onClick={() => openModal("add")}
          >
            <FaPlus /> Thêm Chi Tiết Lô Hàng
          </button>

          <table className="manage-inventory-detail-table">
            <thead>
              <tr>
                <th>Chi tiết lô hàng</th>
                <th>Tên Lô Hàng</th>
                <th>Số Lượng</th>
                <th>Giá 1 sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Ngày Hết Hạn</th>
                <th>Hình Ảnh</th>
                <th>Hạn Sử Dụng</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((item) => (
                <tr
                  key={item.inventoryDetailId}
                  className={
                    new Date(item.expirationDate) < new Date()
                      ? "manage-inventory-detail-expired-row"
                      : !item.isActive
                      ? "manage-inventory-detail-inactive-row"
                      : ""
                  }
                >
                  <td>{item.itemName}</td>
                  <td>{item.inventoryName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price.toLocaleString("vi-VN")} VNĐ</td>
                  <td>
                    {(item.quantity * item.price).toLocaleString("vi-VN")} VNĐ
                  </td>
                  <td>{item.expirationDate}</td>
                  <td>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.itemName}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      <span>Không có ảnh</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`manage-inventory-detail-status ${
                        new Date(item.expirationDate) > new Date()
                          ? "manage-inventory-detail-active"
                          : "manage-inventory-detail-inactive"
                      }`}
                    >
                      {new Date(item.expirationDate) > new Date() ? (
                        <>
                          <FaCheckCircle className="manage-inventory-detail-status-icon" />
                          Còn Hạn
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="manage-inventory-detail-status-icon" />
                          Hết Hạn
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="manage-inventory-detail-actions">
                      {new Date() - new Date(item.createAt) <= 3600000 && (
                        <>
                          <button
                            className="manage-inventory-detail-edit-btn"
                            onClick={() => openModal("edit", item)}
                            disabled={
                              new Date(item.expirationDate) < new Date()
                            }
                            title={
                              new Date(item.expirationDate) < new Date()
                                ? "Không thể chỉnh sửa chi tiết đã hết hạn"
                                : "Chỉnh sửa"
                            }
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="manage-inventory-detail-delete-btn"
                            onClick={() => openDeleteModal(item)}
                            disabled={
                              new Date(item.expirationDate) < new Date()
                            }
                            title={
                              new Date(item.expirationDate) < new Date()
                                ? "Không thể xóa chi tiết đã hết hạn"
                                : "Xóa"
                            }
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="manage-inventory-detail-pagination">
            <div className="manage-inventory-detail-pagination-controls">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="manage-inventory-detail-pagination-btn"
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="manage-inventory-detail-pagination-btn"
              >
                <FaArrowLeft />
              </button>

              {startPage > 1 && (
                <span className="manage-inventory-detail-ellipsis">...</span>
              )}

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`manage-inventory-detail-pagination-btn ${
                    currentPage === number ? "active" : ""
                  }`}
                >
                  {number}
                </button>
              ))}

              {endPage < totalPages && (
                <span className="manage-inventory-detail-ellipsis">...</span>
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="manage-inventory-detail-pagination-btn"
              >
                <FaArrowRight />
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className="manage-inventory-detail-pagination-btn"
              >
                <FaAngleDoubleRight />
              </button>
            </div>

            <div className="manage-inventory-detail-jump-to-page">
              <input
                type="number"
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                placeholder="Trang"
                className="manage-inventory-detail-jump-input"
              />
              <button
                onClick={handleJumpToPage}
                className="manage-inventory-detail-jump-btn"
              >
                Đi đến
              </button>
            </div>

            <div className="manage-inventory-detail-records-per-page">
              <label htmlFor="recordsPerPage">Hiển thị:</label>
              <select
                id="recordsPerPage"
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                className="manage-inventory-detail-select"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>lô hàng mỗi trang</span>
            </div>
          </div>

          <Footer_Admin />

          {modalVisible && (
            <div className="manage-inventory-detail-modal">
              <div className="manage-inventory-detail-modal-content">
                <h3>
                  {modalAction === "add"
                    ? "Thêm Chi Tiết Lô Hàng"
                    : "Sửa Chi Tiết Lô Hàng"}
                </h3>

                <div className="manage-inventory-detail-form">
                  <div className="manage-inventory-detail-form-group">
                    <label>Chi Nhánh:</label>
                    <select
                      className="manage-inventory-detail-modal-inputs"
                      value={selectedBranchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      required
                      disabled={modalAction === "edit"}
                    >
                      <option value="">-- Chọn Chi Nhánh --</option>
                      {branches.map((branch) => (
                        <option key={branch.branchId} value={branch.branchId}>
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Inventory Selection - Based on selected branch */}
                  <div className="manage-inventory-detail-form-group">
                    <label>Tên Lô Hàng:</label>
                    <select
                      className="manage-inventory-detail-modal-inputs"
                      value={currentItem.inventoryId || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          inventoryId: e.target.value,
                        })
                      }
                      required
                      disabled={!selectedBranchId || inventories.length === 0}
                    >
                      <option value="">-- Chọn Lô Hàng --</option>
                      {inventories.map((inventory) => (
                        <option
                          key={inventory.inventoryId}
                          value={inventory.inventoryId}
                        >
                          {inventory.inventoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item Name */}
                  <div className="manage-inventory-detail-form-group">
                    <label>Chi tiết lô hàng:</label>
                    <input
                      className="manage-inventory-detail-modal-inputs"
                      type="text"
                      value={currentItem.itemName || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          itemName: e.target.value,
                        })
                      }
                      disabled={
                        modalAction === "edit" && !currentItem.isEditable
                      }
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="manage-inventory-detail-form-group">
                    <label>Số Lượng:</label>
                    <input
                      className="manage-inventory-detail-modal-inputs"
                      type="number"
                      min="0"
                      value={currentItem.quantity || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          quantity: e.target.value,
                        })
                      }
                      required
                      disabled={
                        modalAction === "edit" && !currentItem.isEditable
                      }
                    />
                  </div>

                  {/* Price */}
                  <div className="manage-inventory-detail-form-group">
                    <label>Giá (VNĐ):</label>
                    <input
                      className="manage-inventory-detail-modal-inputs"
                      type="number"
                      min="0"
                      value={currentItem.price || ""}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          price: e.target.value,
                        })
                      }
                      required
                      disabled={
                        modalAction === "edit" && !currentItem.isEditable
                      }
                    />
                  </div>

                  {/* Expiration Date */}
                  <div className="manage-inventory-detail-form-group">
                    <label>Ngày Hết Hạn:</label>
                    <input
                      className="manage-inventory-detail-modal-inputs"
                      type="date"
                      value={
                        currentItem.expirationDate
                          ? currentItem.expirationDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          expirationDate: e.target.value,
                        })
                      }
                      required
                      disabled={
                        modalAction === "edit" && !currentItem.isEditable
                      }
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="manage-inventory-detail-form-group">
                    <label>Hình Ảnh:</label>
                    <input
                      className="manage-inventory-detail-modal-inputs"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={
                        modalAction === "edit" && !currentItem.isEditable
                      }
                    />
                    {fileError && (
                      <div
                        className="manage-inventory-detail-file-error"
                        style={{
                          color: "red",
                          fontSize: "14px",
                          marginTop: "5px",
                        }}
                      >
                        <span>⚠️ {fileError}</span>
                      </div>
                    )}
                    {(imagePreview ||
                      (currentItem.image &&
                        typeof currentItem.image === "string")) && (
                      <div
                        className="manage-inventory-detail-image-preview"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <img
                          src={imagePreview || currentItem.image}
                          alt="Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "150px",
                            marginTop: "10px",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status Selection (Only for Edit mode) */}

                  {modalError && (
                    <div className="manage-inventory-detail-modal-error">
                      {modalError}
                    </div>
                  )}

                  <div className="manage-inventory-detail-modal-buttons">
                    <button
                      onClick={handleSave}
                      className="manage-inventory-detail-modal-save"
                      disabled={
                        modalAction === "edit" && !currentItem.isEditable
                      }
                    >
                      {modalAction === "add" ? "Thêm" : "Cập Nhật"}
                    </button>
                    <button
                      onClick={closeModal}
                      className="manage-inventory-detail-modal-cancel"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {deleteModalVisible && (
            <div className="manage-inventory-detail-modal">
              <div className="manage-inventory-detail-modal-content">
                <h3>Xác nhận xóa</h3>

                <div className="manage-inventory-detail-delete-confirmation">
                  <p>
                    Bạn có chắc chắn muốn xóa chi tiết lô hàng{" "}
                    <strong>{itemToDelete?.itemName}</strong>?
                  </p>
                  <p>Hành động này không thể hoàn tác.</p>
                </div>

                <div className="manage-inventory-detail-modal-buttons">
                  <button
                    onClick={confirmDelete}
                    className="manage-inventory-detail-modal-delete-confirm"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    onClick={closeDeleteModal}
                    className="manage-inventory-detail-modal-cancel"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Manage_Inventory_Detail;
