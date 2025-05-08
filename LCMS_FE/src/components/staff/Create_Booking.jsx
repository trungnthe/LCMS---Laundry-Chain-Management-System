import React, { useState, useEffect } from "react";
import Select from "react-select";
import "../../assets/css/staff/create_booking.css";
import Header from "../reuse/Header_Staff";
import { fetchServiceTypes } from "../../admin/manage_service_type";
import { fetchServicesByServiceType } from "../../admin/manage_service";
import { fetchProductCategories } from "../../admin/manage_product_category";
import { fetchProductsByCategory } from "../../admin/manage_product";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllCustomer,
  getAllDelivery,
  createBooking,
} from "../../services/fetchApiStaff.js";
function Create_Booking() {
  // 🟢 State Management
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customersList, setCustomersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [activeTab, setActiveTab] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingServiceFail, setIsFetchingServiceFail] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [cartServices, setCartServices] = useState([]);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [serviceDetail, setServiceDetail] = useState(null);

  const [pickupOptions, setPickupOptions] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);

  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [deliverySuggestions, setDeliverySuggestions] = useState([]);
  const [selectedLaundryType, setSelectedLaundryType] = useState("");
  const [selectedDeliveryType, setSelectedDeliveryType] = useState("");

  // 🟢 Lắng nghe input với debounce
  const debouncedPickup = useDebouncedSearch(pickupAddress, 500);
  const debouncedDelivery = useDebouncedSearch(deliveryAddress, 500);
  const [customerItemsNote, setCustomerItemsNote] = useState("");
  const [selectedProductData, setSelectedProductData] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const data = await getAllCustomer();
      if (data) {
        // Chuyển đổi dữ liệu về dạng { value, label }
        const formattedCustomers = data.map((customer) => ({
          value: customer.accountId,
          label:
            `${customer.customerName || ""}` +
            (customer.membershipLevel ? ` (${customer.membershipLevel})` : "") +
            (customer.packMonth ? ` (${customer.packMonth})` : ""),
        }));
        setCustomersList(formattedCustomers);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchDeliveryMethods = async () => {
      const data = await getAllDelivery(); // Gọi API
      if (Array.isArray(data)) {
        // Chuyển đổi dữ liệu sang { value, label }
        const formattedData = data
          .filter((item) => item === "None" || item === "HomeDelivery") // Chỉ giữ giá trị hợp lệ
          .map((item) => {
            const label =
              item === "None"
                ? "Đến cửa hàng nhận đồ"
                : "Giao tận nhà cho khách (Có phí)";

            return { value: item, label }; // ✅ value là "None" hoặc "HomeDelivery"
          });

        setDeliveryOptions(formattedData);
      }
    };

    fetchDeliveryMethods();
  }, []);
  useEffect(() => {
    const fetchDeliveryMethods = async () => {
      const data = await getAllDelivery(); // Gọi API

      if (Array.isArray(data)) {
        // Chuyển đổi dữ liệu sang { value, label }
        const formattedData = data
          .filter((item) => item === "None" || item === "Pickup") // Chỉ giữ giá trị hợp lệ
          .map((item) => {
            const label =
              item === "None"
                ? "Khách tự mang đồ đến cửa hàng"
                : "Nhân viên tới lấy đồ tận nơi (Có phí)";

            return { value: item, label }; // Gán value = label
          });

        setPickupOptions(formattedData);
      }
    };

    fetchDeliveryMethods();
  }, []);

  useEffect(() => {
    loadServiceTypes();

    fetchProductCategories()
      .then((data) => {
        const filteredData = (data || []).filter(
          (x) => x.statusDelete !== false
        );
        setCategories(filteredData);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    if (activeTab) loadServicesByType(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory)
        .then((data) => {
          const filteredProducts = (data || []).filter(
            (x) => x.statusDelete !== false
          );
          setProducts(filteredProducts);
        })
        .catch((error) => console.error("Lỗi khi tải sản phẩm:", error));
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedService) return;
    const selectedServiceData = services.find(
      (s) => s.serviceId === selectedService
    );
    const serviceType = serviceTypes.find(
      (type) => type.serviceTypeId === selectedServiceData?.serviceTypeId
    );

    if (serviceType?.serviceTypeName !== "Giặt lẻ") {
      setSelectedProduct(null);
    }
  }, [selectedService, services, serviceTypes]);

  // 🟢 Utility Functions

  // 🟢 Hàm debounce để tối ưu việc gọi API khi nhập địa chỉ
  function useDebouncedSearch(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  }

  // 🟢 Lắng nghe input với debounce để gọi API

  const fetchAddressSuggestions = async (query, setSuggestions) => {
    if (query.length < 3) {
      setSuggestions([]); // Xóa danh sách nếu nhập ít hơn 3 ký tự
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&countrycodes=VN&format=json`,
        {
          headers: {
            "User-Agent": "MyApp/1.0 (myemail@example.com)",
          },
        }
      );

      if (!res.ok) throw new Error("API request blocked or error");

      const data = await res.json();
      setSuggestions(data.map((item) => item.display_name)); // Lưu danh sách gợi ý
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setSuggestions([]);
    }
  };

  // 🟢 Hàm xử lý khi chọn một địa chỉ
  useEffect(() => {
    if (debouncedPickup) {
      fetchAddressSuggestions(debouncedPickup, setPickupSuggestions);
    }
  }, [debouncedPickup]);

  useEffect(() => {
    if (debouncedDelivery) {
      fetchAddressSuggestions(debouncedDelivery, setDeliverySuggestions);
    }
  }, [debouncedDelivery]);

  // 🟢 Xử lý chọn địa chỉ từ danh sách gợi ý
  const handlePickupSelect = (address) => {
    setPickupAddress(address);
    setPickupSuggestions([]);
  };

  const handleDeliverySelect = (address) => {
    setDeliveryAddress(address);
    setDeliverySuggestions([]);
  };

  // 🟢 Fetch Data Functions
  const loadServiceTypes = () => {
    setIsLoading(true);
    setIsFetchingServiceFail(false);

    fetchServiceTypes()
      .then((data) => {
        const filteredTypes = data.filter((x) => x.statusDelete !== false);

        setServiceTypes(filteredTypes);
        if (data.length > 0) setActiveTab(data[0].serviceTypeId);
      })
      .catch((error) => {
        console.error("Error fetching service types:", error);
        setIsFetchingServiceFail(true);
      })
      .finally(() => setIsLoading(false));
  };

  const loadServicesByType = (serviceTypeId) => {
    setIsLoading(true);
    fetchServicesByServiceType(serviceTypeId)
      .then((data) => {
        const filteredTypes = data.filter((x) => x.statusDelete !== false);

        setServices(filteredTypes ?? []);
      }) // Đảm bảo nếu null thì set []
      .catch((error) => {
        setServices([]); // Nếu lỗi, đặt về []
      })
      .finally(() => setIsLoading(false));
  };

  // 🟢 Event Handlers
  const handleServiceDoubleClick = (service) => {
    setServiceDetail(service);
    setShowServiceDetail(true);
  };

  const closeServiceDetail = () => setShowServiceDetail(false);

  const handleServiceSelect = (serviceId) => setSelectedService(serviceId);

  const toggleGuestMode = () => {
    setIsGuest(!isGuest);
    setSelectedCustomer(null);
  };

  const addServiceToCart = () => {
    if (!selectedService) return;

    const selectedServiceData = services.find(
      (s) => s.serviceId === selectedService
    );
    const selectedProductData = products.find(
      (p) => p.productId === Number(selectedProduct)
    );

    const hasProduct = !!selectedProduct && !!selectedProductData;
    const servicePrice = selectedServiceData?.price || 0;
    const productPrice = hasProduct ? selectedProductData.price : 0;
    const addedQuantity = hasProduct ? Math.max(quantity, 1) : null; // ✅ Không có product thì quantity = null
    const productId = hasProduct ? selectedProductData.productId : null;

    setCartServices((prevCart) => {
      return prevCart
        .map((item) => {
          if (
            item.serviceId === selectedService &&
            item.productId === productId
          ) {
            const newQuantity = hasProduct
              ? item.quantity + addedQuantity
              : null;
            return {
              ...item,
              quantity: newQuantity,
              price: servicePrice + productPrice * (newQuantity || 0), // ✅ Đảm bảo tính đúng giá
            };
          }
          return item;
        })
        .concat(
          prevCart.some(
            (item) =>
              item.serviceId === selectedService && item.productId === productId
          )
            ? []
            : [
                {
                  serviceId: selectedService,
                  serviceName:
                    selectedServiceData?.serviceName ||
                    "Dịch vụ không xác định",
                  serviceType:
                    selectedServiceData?.serviceType || "Không xác định",
                  servicePrice,
                  productId,
                  productName: hasProduct
                    ? selectedProductData.productName
                    : "Giặt theo cân",
                  productPrice,
                  quantity: addedQuantity, // ✅ Nếu không có product thì là null
                  price: servicePrice + productPrice * (addedQuantity || 0),
                },
              ]
        );
    });

    setSelectedService(null);
    setQuantity(1);
  };

  const removeService = (index) => {
    setCartServices((prevCart) => prevCart.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Không tìm thấy token đăng nhập!");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return;
    }

    if (!cartServices || cartServices.length === 0) {
      toast.error("Giỏ hàng trống, vui lòng thêm dịch vụ trước khi đặt lịch.");
      return;
    }

    const userBranchId = parseInt(payload.branchId) || 0;
    const userStaffId = payload.staffId || 0;

    const bookingData = {
      customerId: isGuest ? null : selectedCustomer?.value,
      branchId: userBranchId,
      staffId: userStaffId,
      pickupAddress: pickupAddress?.trim() || "",
      deliveryAddress: deliveryAddress?.trim() || "",
      serviceId: selectedService || null,
      shippingFee: 0,
      laundryType: selectedLaundryType,
      deliveryType: selectedDeliveryType,
      note: customerItemsNote?.trim() || "",
      bookingDetails: cartServices.map((service) => ({
        productId: service.productId,
        quantity: service.quantity,
        serviceId: Number(service.serviceId),
        weight: 0,
      })),
    };

    if (isGuest) {
      bookingData.guestName = guestName?.trim();
      bookingData.phoneNumber = guestPhone?.trim();
    }

    const result = await createBooking(bookingData);
  };
  return (
    <>
      <Header />
      <div className="staff-create-booking">
        <h2 className="create_booking_title">Tạo Lịch Giặt</h2>
        <div className="create_booking_card">
          <div className="create_booking_card-content">
            {isFetchingServiceFail ? (
              <div className="error-message">
                Lỗi: Không thể tải dữ liệu dịch vụ.
                <button>Thử lại</button>
              </div>
            ) : (
              <form
                className="create_booking_form-group"
                onSubmit={handleSubmit}
                style={{ width: "90%", margin: "0 auto" }} // Đặt chiều rộng 80% và căn giữa
              >
                {/* Customer Selection Section */}
                {/* Customer Selection Section */}
                <div className="create_booking_col-4 create_booking_select-container">
                  <label className="create_booking_section-label">
                    Thông Tin Khách Hàng
                  </label>
                  {!isGuest ? (
                    <Select
                      options={customersList}
                      value={selectedCustomer}
                      onChange={setSelectedCustomer}
                      placeholder={
                        loading
                          ? "Đang tải danh sách khách hàng..."
                          : "Chọn khách hàng trong hệ thống"
                      }
                      isSearchable
                      className="create_booking_react-select-container"
                      classNamePrefix="create_booking_react-select"
                      isLoading={loading}
                      required
                    />
                  ) : (
                    <>
                      <div className="input-group">
                        <input
                          type="text"
                          placeholder="Nhập tên khách lẻ"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                  <label className="create_booking_label">
                    <input
                      type="checkbox"
                      className="create_booking_input"
                      checked={isGuest}
                      onChange={toggleGuestMode}
                    />
                    Khách vãng lai (Không có tài khoản)
                  </label>
                </div>

                {/* Pickup Address Section */}
                {/* Delivery Pickup Method */}
                <div className="create_booking_col-4">
                  <label
                    htmlFor="pickup-method"
                    className="create_booking_section-label"
                  >
                    Hình Thức Nhận Hàng
                  </label>
                  <select
                    onChange={(e) => setSelectedLaundryType(e.target.value)}
                    id="pickup-method"
                    required
                  >
                    {pickupOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delivery Shipping Method */}
                <div className="create_booking_col-4">
                  <label
                    htmlFor="shipping-method"
                    className="create_booking_section-label"
                  >
                    Hình Thức Giao Hàng
                  </label>
                  <select
                    onChange={(e) => setSelectedDeliveryType(e.target.value)}
                    id="shipping-method"
                    required
                  >
                    {deliveryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLaundryType === "Pickup" && (
                  <div className="create_booking_col-6">
                    <label className="create_booking_section-label">
                      Địa Chỉ nhận hàng ( nếu có )
                    </label>
                    <textarea
                      className="note-input"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Địa chỉ nhận hàng"
                      rows={3}
                    />

                    {pickupSuggestions.length > 0 && (
                      <ul className="create_booking_address-suggestions">
                        {pickupSuggestions.map((item, index) => (
                          <li
                            key={index}
                            onClick={() => handlePickupSelect(item)}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {/* Delivery Address Section - Chỉ hiển thị khi chọn HomeDelivery */}
                {selectedDeliveryType === "HomeDelivery" && (
                  <div className="create_booking_col-6">
                    <label className="create_booking_section-label">
                      Địa Chỉ Giao Hàng ( nếu có )
                    </label>
                    <textarea
                      className="note-input"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Địa chỉ giao hàng"
                      rows={3}
                    />

                    {deliverySuggestions.length > 0 && (
                      <ul className="create_booking_address-suggestions">
                        {deliverySuggestions.map((item, index) => (
                          <li
                            key={index}
                            onClick={() => handleDeliverySelect(item)}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Service Selection Section */}
                <div className="create_booking_col-8 create_booking_service-tabs">
                  <div className="create_booking_tabs">
                    {serviceTypes.map((service) => (
                      <button
                        key={service.serviceTypeId}
                        type="button"
                        className={`create_booking_tab-button ${
                          activeTab === service.serviceTypeId ? "active" : ""
                        }`}
                        onClick={() => {
                          setActiveTab(service.serviceTypeId);
                          setSelectedService(null);
                        }}
                      >
                        {service.serviceTypeName}
                      </button>
                    ))}
                  </div>

                  {/* Service Options */}
                  <div className="create_booking_tab-content">
                    {serviceTypes.find((s) => s.serviceTypeId === activeTab)
                      ?.serviceTypeName === "Giặt lẻ" && (
                      <div className="create-booking-container">
                        <h3 className="section-title">Chọn đồ muốn giặt</h3>

                        <div className="booking-form">
                          <div className="booking-field">
                            <label>Danh Mục</label>
                            <select
                              onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                // Reset sản phẩm và dịch vụ khi thay đổi danh mục
                                setSelectedProduct("");
                                setSelectedProductData(null);
                                setSelectedService(null);
                              }}
                              className="booking-select"
                            >
                              <option value="">Chọn danh mục</option>
                              {categories.map((category) => (
                                <option
                                  key={category.productCategoryId}
                                  value={category.productCategoryId}
                                >
                                  {category.productCategoryName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="booking-field">
                            <label>Sản Phẩm</label>
                            <select
                              onChange={(e) => {
                                const productId = e.target.value;
                                setSelectedProduct(productId);
                                // Tìm sản phẩm được chọn và lưu vào state
                                const product = products.find(
                                  (p) => p.productId.toString() === productId
                                );
                                setSelectedProductData(product);
                                // Reset selected service when product changes
                                setSelectedService(null);
                              }}
                              disabled={!selectedCategory}
                              className="booking-select"
                            >
                              <option value="">Chọn sản phẩm</option>
                              {products.map((product) => (
                                <option
                                  key={product.productId}
                                  value={product.productId}
                                >
                                  {product.productName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="booking-field">
                            <label>Số Lượng</label>
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="booking-input"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chỉ hiển thị phần dịch vụ nếu không phải là "Giặt lẻ" hoặc đã chọn sản phẩm */}
                    {(serviceTypes.find((s) => s.serviceTypeId === activeTab)
                      ?.serviceTypeName !== "Giặt lẻ" ||
                      (selectedProductData &&
                        serviceTypes.find((s) => s.serviceTypeId === activeTab)
                          ?.serviceTypeName === "Giặt lẻ")) && (
                      <div className="create_booking_service-selection">
                        <h4>Chọn Dịch Vụ</h4>
                        <div className="create_booking_service-options">
                          {(() => {
                            // Xác định danh sách dịch vụ cần hiển thị
                            let displayServices = services;

                            // Nếu là "Giặt lẻ" và đã chọn sản phẩm
                            const isGiatLe =
                              serviceTypes.find(
                                (s) => s.serviceTypeId === activeTab
                              )?.serviceTypeName === "Giặt lẻ";

                            if (
                              isGiatLe &&
                              selectedProductData &&
                              selectedProductData.serviceNames &&
                              selectedProductData.serviceNames.length > 0
                            ) {
                              // Tìm các dịch vụ có tên trùng khớp với serviceNames trong selectedProductData
                              displayServices = services.filter((service) =>
                                selectedProductData.serviceNames.includes(
                                  service.serviceName
                                )
                              );
                            }

                            // Hiển thị danh sách dịch vụ
                            if (displayServices.length > 0) {
                              return displayServices.map((service) => (
                                <div
                                  key={service.serviceId}
                                  className={`create_booking_service-option ${
                                    selectedService === service.serviceId
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleServiceSelect(service.serviceId)
                                  }
                                  onDoubleClick={() =>
                                    handleServiceDoubleClick(service)
                                  }
                                >
                                  {service.serviceName} {service.price}đ
                                </div>
                              ));
                            } else {
                              return (
                                <p className="no-services">
                                  Không có dịch vụ nào phù hợp
                                </p>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Phần hiển thị dịch vụ đi kèm đã được loại bỏ theo yêu cầu */}
                    {/* Modal Chi tiết dịch vụ */}
                    {showServiceDetail && serviceDetail && (
                      <div
                        className={`create_booking_service_detail_modal ${
                          showServiceDetail ? "active" : ""
                        }`}
                        onClick={closeServiceDetail}
                      >
                        <div
                          className="create_booking_service_detail_content"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="create_booking_service_detail_header">
                            <h3 className="create_booking_service_detail_title">
                              {serviceDetail.serviceName}
                            </h3>
                            <button
                              className="create_booking_service_detail_close"
                              onClick={closeServiceDetail}
                            >
                              ×
                            </button>
                          </div>

                          <div className="create_booking_service_detail_price">
                            {serviceDetail.price.toLocaleString()}đ
                          </div>

                          <p className="create_booking_service_detail_description">
                            {serviceDetail.description ||
                              "Không có mô tả chi tiết."}
                          </p>

                          <div className="create_booking_service_detail_info">
                            <div className="create_booking_service_detail_info_item">
                              <div className="create_booking_service_detail_info_label">
                                Loại dịch vụ:
                              </div>
                              <div className="create_booking_service_detail_info_value">
                                {serviceDetail.serviceTypeName ||
                                  "Chưa phân loại"}
                              </div>
                            </div>

                            <div className="create_booking_service_detail_info_item">
                              <div className="create_booking_service_detail_info_label">
                                Thời gian:
                              </div>
                              <div className="create_booking_service_detail_info_value">
                                {serviceDetail.estimatedTime ||
                                  "Không xác định"}{" "}
                                phút
                              </div>
                            </div>
                          </div>

                          <button
                            className="create_booking_service_detail_button"
                            onClick={() => {
                              addServiceToCart();
                              closeServiceDetail();
                            }}
                          >
                            Chọn dịch vụ này
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={addServiceToCart}
                      disabled={!selectedService}
                    >
                      Lưu dịch vụ
                    </button>
                  </div>
                </div>
                {/* Additional Fields */}
                <div className="create_booking_col-4 create_booking_cart">
                  {cartServices.length === 0 ? (
                    <p className="create_booking_empty_message">
                      Chưa có dịch vụ nào.
                    </p>
                  ) : (
                    <table className="create_booking_cart_table">
                      <thead>
                        <tr>
                          <th>Dịch vụ</th>
                          <th>Chi tiết</th>
                          <th>Thành tiền</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartServices.map((service, index) => {
                          const hasProduct =
                            service.productId !== null &&
                            service.productName?.trim();

                          const totalPrice = service.price ?? 0; // ✅ Đảm bảo không bị undefined

                          return (
                            <tr key={index}>
                              <td>
                                {index + 1}.{service.serviceName}
                              </td>
                              <td>
                                <span className="create_booking_cart_details">
                                  {hasProduct
                                    ? `${
                                        service.productName
                                      }  - ${service.productPrice.toLocaleString()}đ - ${
                                        service.quantity
                                      } cái`
                                    : `Tính tiền ${service.servicePrice.toLocaleString()} / cân`}
                                </span>
                              </td>
                              <td>{totalPrice.toLocaleString()} VND</td>
                              <td>
                                <button
                                  className="create_booking_delete_btn"
                                  onClick={() => removeService(index)}
                                >
                                  ❌
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Textarea with Label */}
                <div className="create_booking_col-10">
                  <label
                    htmlFor="customer-items-note"
                    className="create_booking_section-label"
                  >
                    Ghi Chú Đồ Khách Mang Đến
                  </label>
                  <textarea
                    id="customer-items-note"
                    placeholder="Ghi lại tất cả đồ mà khách hàng mang đến!"
                    required
                    className="note-input"
                    rows="3"
                    value={customerItemsNote}
                    onChange={(e) => setCustomerItemsNote(e.target.value)}
                  ></textarea>
                  <p className="warning-message">
                    ⚠ Vui lòng ghi chính xác số đồ khách mang đến. Nếu có mất
                    mát, cửa hàng sẽ không chịu trách nhiệm.
                  </p>
                </div>
                <div className="create_booking_col-2">
                  <button type="submit" className="create_booking_btn-submit">
                    Tạo Đơn Hàng
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />;
    </>
  );
}

export default Create_Booking;
