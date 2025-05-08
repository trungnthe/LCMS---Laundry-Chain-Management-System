import { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/css/admin/manage_suggestion.css";
import Sidebar_Admin from "../reuse/Sidebar_Admin";
import Header_Admin from "../reuse/Header_Admin";
import Footer_Admin from "../reuse/Footer_Admin";
import { fetchServices, fetchServiceTypes } from "../../admin/manage_service";
import { fetchCategories, fetchProducts } from "../../admin/manage_product";
import { FaTrashAlt, FaEdit } from "react-icons/fa";

export default function WeatherSuggestionAdmin() {
  const [suggestions, setSuggestions] = useState([]);
  const [weatherSuggestions, setWeatherSuggestions] = useState([]);
  const [form, setForm] = useState({
    weatherKeyword: "",
    productId: null,
    serviceId: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWeatherSuggestions, setShowWeatherSuggestions] = useState(false);
  const [city, setCity] = useState("Hanoi");
  const [errorMessage, setErrorMessage] = useState();
  const [serviceList, setServiceList] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [serviceTypeId, setServiceTypeId] = useState(null);
  const [productCategoryId, setProductCategoryId] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const api = `${apiUrl}/api/WeatherSuggestionAdmin`;

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(api);
      // Reverse the data array before setting it to state
      setSuggestions(res.data.reverse());
    } catch (error) {
      showNotification("Lỗi khi tải dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${apiUrl}/api/WeatherSuggestion/weather-suggestions?city=${city}`
      );
      setWeatherSuggestions(res.data.suggestions);
      setCurrentWeather(res.data.weather);
    } catch (error) {
      showNotification("Lỗi khi tải gợi ý thời tiết", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let hasChanges = true;

    // Check if any changes were made when editing
    if (editingId !== null) {
      const originalData = suggestions.find((s) => s.id === editingId);
      if (originalData) {
        hasChanges =
          originalData.weatherKeyword !== form.weatherKeyword ||
          String(originalData.productId) !== String(form.productId) ||
          String(originalData.serviceId) !== String(form.serviceId);
      }
    }

    if (!hasChanges) {
      setErrorMessage("Bạn chưa thay đổi gì để cập nhật");
      setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
      setIsLoading(false);
      return;
    }

    try {
      // Make sure form data is properly structured with weatherKeyword
      const formData = {
        ...form,
        weatherKeyword: form.weatherKeyword,
        productId: form.productId || null,
        serviceId: form.serviceId,
      };

      if (editingId) {
        await axios.put(`${api}/${editingId}`, formData);
        showNotification("Cập nhật thành công!");
      } else {
        await axios.post(api, formData);
        showNotification("Thêm mới thành công!");
      }
      setForm({ weatherKeyword: "", productId: null, serviceId: null });
      setEditingId(null);
      setShowAddForm(false);
      fetchSuggestions();
    } catch (error) {
      showNotification("Có lỗi xảy ra", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (s) => {
    // Set form values from the selected suggestion
    setForm({
      weatherKeyword: s.weatherKeyword,
      productId: s.productId,
      serviceId: s.serviceId,
    });

    // Find the service to get serviceTypeId
    const service = serviceList.find(
      (service) => String(service.serviceId) === String(s.serviceId)
    );

    if (service) {
      setServiceTypeId(service.serviceTypeId);
    }

    // Find the product to get productCategoryId if a product is selected
    if (s.productId) {
      const product = products.find(
        (product) => String(product.productId) === String(s.productId)
      );
      if (product) {
        setProductCategoryId(product.productCategoryId);
      }
    }

    setEditingId(s.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    setIsLoading(true);
    try {
      await axios.delete(`${api}/${deleteConfirm.id}`);
      showNotification("Xóa thành công!");
      fetchSuggestions();
    } catch (error) {
      showNotification("Lỗi khi xóa", "error");
    } finally {
      setIsLoading(false);
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  const handleCancel = () => {
    setForm({ weatherKeyword: "", productId: null, serviceId: null });
    setEditingId(null);
    setServiceTypeId(null);
    setProductCategoryId(null);
    setShowAddForm(false);
  };

  const toggleWeatherSuggestions = () => {
    if (!showWeatherSuggestions) {
      fetchWeatherSuggestions();
    }
    setShowWeatherSuggestions(!showWeatherSuggestions);
  };

  // Filter suggestions based on search term
  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.weatherKeyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.productName &&
        s.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.serviceName &&
        s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuggestions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSuggestions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchSuggestions();

    // Fetch services
    fetchServices()
      .then((data) => {
        setServiceList(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => console.error(error));

    // Fetch service types
    fetchServiceTypes()
      .then((data) => {
        const filteredTypes = data.filter((x) => x.statusDelete !== false);
        setServiceTypes(filteredTypes);
      })
      .catch((error) => console.error(error));

    // Fetch products
    fetchProducts()
      .then((data) => {
        setProducts(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => console.error(error));

    // Fetch product categories
    fetchCategories()
      .then((data) => {
        setProductTypes(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="manage-suggestion-admin-container">
      <Sidebar_Admin />
      <div className="main-content">
        <Header_Admin />
        <div className="admin-containerrrr">
          <h1 className="manage-suggestion-admin-title">
            Quản lý gợi ý theo thời tiết
          </h1>

          {notification.show && (
            <div
              className={`manage-suggestion-notification ${notification.type}`}
            >
              {notification.message}
            </div>
          )}

          <div className="manage-suggestion-search-filter-container">
            <div className="manage-suggestion-search-box">
              <i className="manage-suggestion-search-icon">🔍</i>
              <input
                type="text"
                placeholder="Tìm kiếm theo từ khóa thời tiết hoặc sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="manage-suggestion-summary-actions">
            <div className="manage-suggestion-summary">
              <span>Tổng số gợi ý: {filteredSuggestions.length}</span>
            </div>

            <button
              className="manage-suggestion-add-button"
              onClick={() => setShowAddForm(true)}
            >
              <span>+</span> Thêm gợi ý
            </button>
          </div>

          <div className="manage-suggestion-table-container">
            <table className="manage-suggestion-data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Từ khóa thời tiết</th>
                  <th>Tên dịch vụ</th>
                  <th>Tên sản phẩm</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && !currentItems.length ? (
                  <tr>
                    <td colSpan="9" className="manage-suggestion-loading-cell">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="manage-suggestion-empty-cell">
                      Không có dữ liệu gợi ý
                    </td>
                  </tr>
                ) : (
                  currentItems.map((s, index) => (
                    <tr key={s.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{s.weatherKeyword}</td>
                      <td>{s.serviceName || "-"}</td>
                      <td>
                        {s.productName === "No Product" ? "" : s.productName}
                      </td>

                      <td>
                        <div className="manage-suggestion-action-buttons">
                          <button
                            className="manage-suggestion-edit-button"
                            onClick={() => handleEdit(s)}
                            title="Sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="manage-suggestion-delete-button"
                            onClick={() => handleDelete(s.id)}
                            title="Xóa"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="manage-suggestion-pagination-container">
            <div className="manage-suggestion-pagination-info">
              Hiển thị {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredSuggestions.length)} của{" "}
              {filteredSuggestions.length} gợi ý
            </div>
            <div className="manage-suggestion-pagination">
              <button
                className="manage-suggestion-pagination-button"
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              <button
                className="manage-suggestion-pagination-button"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lsaquo;
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={i}
                    className={`manage-suggestion-pagination-button ${
                      currentPage === pageNum ? "active" : ""
                    }`}
                    onClick={() => paginate(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="manage-suggestion-pagination-button"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &rsaquo;
              </button>
              <button
                className="manage-suggestion-pagination-button"
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
            <div className="manage-suggestion-pagination-goto">
              <span>Đến trang: </span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Number.parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    paginate(page);
                  }
                }}
              />
              <button className="manage-suggestion-go-button">Đi</button>
            </div>
          </div>

          {showAddForm && (
            <div className="manage-suggestion-modal-overlay">
              <div className="manage-suggestion-form-modal">
                <div className="manage-suggestion-modal-header">
                  <h3>{editingId ? "Cập nhật gợi ý" : "Thêm gợi ý mới"}</h3>
                  <button
                    className="manage-suggestion-close-button"
                    onClick={handleCancel}
                  >
                    ×
                  </button>
                </div>

                <div className="manage-suggestion-modal-body">
                  <form onSubmit={handleSubmit}>
                    {errorMessage && (
                      <div className="manage-suggestion-form-group">
                        <label style={{ color: "red", textAlign: "center" }}>
                          {errorMessage}
                        </label>
                      </div>
                    )}
                    <div className="manage-suggestion-form-group">
                      <label htmlFor="weatherKeyword">Từ khóa thời tiết:</label>
                      <select
                        id="weatherKeyword"
                        value={form.weatherKeyword}
                        onChange={(e) =>
                          setForm({ ...form, weatherKeyword: e.target.value })
                        }
                        required
                      >
                        <option value="">Chọn từ khóa thời tiết</option>
                        <option value="Clear">Nắng</option>
                        <option value="Clouds">Nhiều Mây</option>
                        <option value="Rain">Mưa to</option>
                        <option value="Drizzle">Mưa phùn</option>
                        <option value="Mist">Sương mù</option>
                      </select>
                    </div>

                    {/* Dropdown loại dịch vụ */}
                    <div className="manage-suggestion-form-group">
                      <label htmlFor="serviceType">Loại dịch vụ:</label>
                      <select
                        id="serviceType"
                        value={serviceTypeId || ""}
                        onChange={(e) => {
                          const selectedServiceTypeId = e.target.value;
                          setServiceTypeId(selectedServiceTypeId);
                          setForm({ ...form, serviceId: null });
                          setProductCategoryId(null);
                          setForm({ ...form, productId: null });
                        }}
                        required
                      >
                        <option value="">Chọn loại dịch vụ</option>
                        {serviceTypes.map((type) => (
                          <option
                            key={type.serviceTypeId}
                            value={type.serviceTypeId}
                          >
                            {type.serviceTypeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dropdown dịch vụ */}
                    <div className="manage-suggestion-form-group">
                      <label htmlFor="serviceName">Dịch vụ:</label>
                      <select
                        id="serviceName"
                        value={form.serviceId || ""}
                        onChange={(e) =>
                          setForm({ ...form, serviceId: e.target.value })
                        }
                        required
                        disabled={!serviceTypeId} // Disable nếu chưa chọn loại dịch vụ
                      >
                        <option value="">Chọn dịch vụ</option>
                        {serviceList
                          .filter(
                            (s) =>
                              String(s.serviceTypeId) === String(serviceTypeId)
                          ) // Lọc dịch vụ theo serviceTypeId
                          .map((service) => (
                            <option
                              key={service.serviceId}
                              value={service.serviceId}
                            >
                              {service.serviceName}
                            </option>
                          ))}
                      </select>
                    </div>

                    {serviceTypeId == 2 && (
                      <>
                        <div className="manage-suggestion-form-group">
                          <label htmlFor="productType">Loại sản phẩm:</label>
                          <select
                            id="productType"
                            value={productCategoryId || ""}
                            onChange={(e) => {
                              setProductCategoryId(e.target.value);
                              setForm({ ...form, productId: null }); // Reset productId khi thay đổi loại sản phẩm
                            }}
                            required
                          >
                            <option value="">Chọn loại sản phẩm</option>
                            {productTypes.map((type) => (
                              <option
                                key={type.productCategoryId}
                                value={type.productCategoryId}
                              >
                                {type.productCategoryName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="manage-suggestion-form-group">
                          <label htmlFor="productName">Sản phẩm:</label>
                          <select
                            id="productName"
                            value={form.productId || ""}
                            onChange={(e) =>
                              setForm({ ...form, productId: e.target.value })
                            }
                            required
                            disabled={!productCategoryId} // Disable nếu chưa chọn loại sản phẩm
                          >
                            <option value="">Chọn sản phẩm</option>
                            {products
                              .filter(
                                (p) =>
                                  String(p.productCategoryId) ===
                                  String(productCategoryId)
                              ) // Lọc sản phẩm theo productCategoryId
                              .map((product) => (
                                <option
                                  key={product.productId}
                                  value={product.productId}
                                >
                                  {product.productName}
                                </option>
                              ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Các nút hành động */}
                    <div className="manage-suggestion-form-actions">
                      <button
                        type="button"
                        className="manage-suggestion-cancel-button"
                        onClick={handleCancel}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="manage-suggestion-submit-button"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? "Đang xử lý..."
                          : editingId
                          ? "Cập nhật"
                          : "Thêm mới"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm.show && (
            <div className="manage-suggestion-modal-overlay">
              <div className="manage-suggestion-delete-modal">
                <div className="manage-suggestion-delete-modal-header">
                  <h3>Xác nhận xóa</h3>
                  <button
                    className="manage-suggestion-close-button"
                    onClick={cancelDelete}
                  >
                    ×
                  </button>
                </div>
                <div className="manage-suggestion-delete-modal-body">
                  <p>Bạn có chắc chắn muốn xóa gợi ý này không?</p>
                  <p className="manage-suggestion-warning-text">
                    Hành động này không thể hoàn tác.
                  </p>
                </div>
                <div className="manage-suggestion-delete-modal-footer">
                  <button
                    className="manage-suggestion-cancel-button"
                    onClick={cancelDelete}
                  >
                    Hủy
                  </button>
                  <button
                    className="manage-suggestion-delete-confirm-button"
                    onClick={confirmDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <Footer_Admin />
        </div>
      </div>
    </div>
  );
}
