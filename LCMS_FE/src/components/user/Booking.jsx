import React, { useEffect, useRef, useState } from "react";
import Header from "../reuse/Header";
import "../../assets/css/user/booking.css";
import { fetchServices } from "../../admin/manage_service";
import { fetchServiceTypes } from "../../admin/manage_service_type";
import { fetchCategories, fetchProducts } from "../../admin/manage_product";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addToCart } from "../../services/cart";
import { fetchProductsByServiceAndCustomer } from "../../services/suggestion";
import { jwtDecode } from "jwt-decode";

const Booking = () => {
  const [selected, setSelected] = useState(1);
  const [userId, setUserId] = useState(null);
  const [checkedServices, setCheckedServices] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [serviceList, setServiceList] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState();
  const [selectedServices, setSelectedServices] = useState(null);
  const [isServiceLocked, setIsServiceLocked] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [key, setKey] = useState(0);
  const cateRef = useRef(null);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded?.AccountId || null);
      } catch (error) {}
    }
  };

  useEffect(() => {
    getUserIdFromToken();

    fetchServices()
      .then((data) => {
        setServiceList(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {});

    fetchServiceTypes()
      .then((data) => {
        const filteredTypes = data.filter((x) => x.statusDelete !== false);
        setServiceTypes(filteredTypes);

        if (!serviceTypeId && filteredTypes.length > 0) {
          setSelected(filteredTypes[0].id);
        }
      })
      .catch((error) => {});

    fetchProducts()
      .then((data) => {
        setProducts(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {});

    fetchCategories()
      .then((data) => {
        setProductTypes(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {});
  }, []);

  useEffect(() => {
    // console.log("====================================");
    // console.log(checkedServices);
    // console.log("====================================");
  }, [checkedServices]);

  const handleDone = () => {
    setCheckedServices((prev) => {
      const newCheckedServices = Object.fromEntries(
        Object.entries(prev).filter(([key, value]) => {
          // Giữ nếu không liên quan selectedServices
          if (!key.startsWith(`${selectedServices}-`)) return true;

          // Chỉ giữ lại item có productId và quantity > 0
          const hasValidQuantity =
            value.productId !== null && parseInt(value.quantity) > 0;

          return hasValidQuantity;
        })
      );

      return newCheckedServices;
    });

    setSelectedServices(null);
    setIsServiceLocked(false);
  };

  const handleClickOutside = (event) => {
    if (cateRef.current && !cateRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleCheckbox = (serviceId) => {
    setCheckedServices((prev) => {
      const key = `${serviceId}-null`;
      const newCheckedServices = { ...prev };

      if (newCheckedServices[key]) {
        delete newCheckedServices[key];
      } else {
        newCheckedServices[key] = {
          serviceId: serviceId,
          productId: null,
          weight: 0,
          quantity: null,
          price: 0,
        };
      }
      return newCheckedServices;
    });
  };

  const toggleCheckbox2 = (serviceId) => {
    setCheckedServices((prev) => {
      let newCheckedServices = { ...prev };

      if (
        Object.keys(newCheckedServices).some((key) =>
          key.startsWith(`${serviceId}-`)
        )
      ) {
        newCheckedServices = Object.fromEntries(
          Object.entries(newCheckedServices).filter(
            ([key]) => !key.startsWith(`${serviceId}-`)
          )
        );
        setSelectedServices(null);
        setIsServiceLocked(false);
      } else {
        newCheckedServices[`${serviceId}-null`] = {
          serviceId: serviceId,
          productId: null,
          weight: null,
          quantity: null,
          price: 0,
        };
        if (!isServiceLocked) {
          setSelectedServices(serviceId);
          setIsServiceLocked(true);
        }
      }

      return newCheckedServices;
    });

    if (serviceId) {
      fetchProductsByServiceAndCustomer(serviceId, userId)
        .then((data) => {
          if (data.length == 0) {
            setSuggestedProducts([]);
            setSelectedProductType(null);
          } else {
            setSuggestedProducts(data.filter((x) => x.statusDelete !== false));

            setSelectedProductType("suggestion");
          }
        })
        .catch((error) => {
          if (error && error.response.status == 404) {
            setSuggestedProducts([]);
          } else {
          }
        });
    }
  };

  const handleOpenProduct = (serviceId) => {
    if (
      serviceId != null &&
      Object.keys(checkedServices).some(
        (key) => key.startsWith(`${serviceId}-`) && /^\d+$/
      )
    ) {
      setSelectedServices(serviceId);
      setIsServiceLocked(true);
    }
  };

  const toggleCheckboxProduct = (serviceId, productId) => {
    setCheckedServices((prev) => {
      const key = `${serviceId}-${productId}`;
      const newCheckedServices = { ...prev };

      if (newCheckedServices[key]) {
        delete newCheckedServices[key];
      } else {
        newCheckedServices[key] = {
          serviceId: serviceId,
          productId: productId,
          weight: null,
          quantity: null,
          price: 0,
        };
      }
      return newCheckedServices;
    });
  };

  const handleInputChange = (e, serviceId, productId, field) => {
    let value = e.target.value;
    let num = value == 0 ? "" : value;

    const key = `${serviceId}-${productId}`;

    setCheckedServices((prev) => {
      if (!prev[key]) return prev;

      return {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: num,
          price:
            serviceList.find((s) => s.serviceId === serviceId)?.price +
            products.find((p) => p.productId === productId)?.price * num,
        },
      };
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleCategorized = (id) => {
    setIsOpen(!isOpen);
    setSelectedProductType(id);
  };

  const handleAddToCart = async () => {
    const validItems = Object.values(checkedServices).filter(
      (item) => item && (item.weight === 0 || item.quantity > 0)
    );

    if (validItems.length === 0) {
      return toast.error("Vui lòng chọn dịch vụ", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }

    try {
      for (const item of validItems) {
        await addToCart(item);
      }

      toast.success("Đã thêm vào giỏ hàng!", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setKey((prevKey) => prevKey + 1);
      setCheckedServices({});
      setSelected(1);
      setSelectedServices(null);
      setIsServiceLocked(false);
    } catch (error) {}
  };

  return (
    <div>
      <Header key={key} />
      <div className="book-container">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={3}
          transition={Bounce}
        />
        <div className="book-header">
          <div className="branches-content">
            <h5>Đặt lịch</h5>
          </div>
        </div>
        <div className="book-container-content">
          <div className="book-content">
            <div className="book-radio-inputs">
              {serviceTypes.map((label) => (
                <label className="book-radio" key={label.serviceTypeId}>
                  <input
                    type="radio"
                    name="radio"
                    checked={selected === label.serviceTypeId}
                    onChange={() => {
                      setSelected(label.serviceTypeId);
                    }}
                  />
                  <span className="book-name">{label.serviceTypeName}</span>
                </label>
              ))}
            </div>

            <div className="book-instruction">
              * Chọn dịch vụ giặt mà bạn muốn
            </div>

            {selected === 2 ? (
              <>
                {" "}
                <div className="book-options">
                  <div
                    style={{
                      width: "50%",
                      maxHeight: "40vh",
                      overflowY: "auto",
                    }}
                    className="book-options-list appear"
                  >
                    {serviceList
                      .filter((x) => x.serviceTypeId == 2)
                      .map((service) => (
                        <div
                          style={{ width: "100%" }}
                          className="book-option"
                          key={service.serviceId}
                          onClick={() => handleOpenProduct(service.serviceId)}
                        >
                          <div className="book-option-checkbox">
                            <label className="checkbox-container">
                              <input
                                className="custom-checkbox"
                                type="checkbox"
                                disabled={
                                  isServiceLocked &&
                                  selectedServices !== service.serviceId
                                }
                                checked={Object.keys(checkedServices).some(
                                  (key) =>
                                    key.startsWith(`${service.serviceId}-`) &&
                                    /^\d+$/
                                )}
                                onChange={() =>
                                  toggleCheckbox2(service.serviceId)
                                }
                              />

                              <span className="checkmark"></span>
                            </label>
                          </div>

                          <div className="book-option-info">
                            <p>{service.serviceName}</p>

                            <div className="book-option-info-input">
                              <h5>
                                {new Intl.NumberFormat("vi-VN").format(
                                  service.price
                                ) + " vnđ"}{" "}
                              </h5>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {selectedServices && (
                    <div className="book-products" style={{ width: "40%" }}>
                      <div className="dropdown" ref={cateRef}>
                        <div className="dropdown-button">
                          <button
                            className="dropdown-btn"
                            onClick={toggleDropdown}
                          >
                            Loại quần áo
                          </button>
                          <button
                            className="dropdown-btn-done"
                            onClick={handleDone}
                          >
                            Xong
                          </button>
                        </div>
                        <ul className={`dropdown-menu ${isOpen ? "show" : ""}`}>
                          {suggestedProducts?.length > 0 ? (
                            <li
                              className="dropdown-item"
                              onClick={() => {
                                toggleCategorized("suggestion");
                              }}
                            >
                              {" "}
                              Gợi ý cho bạn
                            </li>
                          ) : (
                            <></>
                          )}
                          <li
                            className="dropdown-item"
                            onClick={() => {
                              toggleCategorized(null);
                            }}
                          >
                            {" "}
                            Tất cả
                          </li>
                          {productTypes.map((pt) => {
                            return (
                              <li
                                key={pt.productCategoryId}
                                className="dropdown-item"
                                onClick={() => {
                                  toggleCategorized(pt.productCategoryId);
                                }}
                              >
                                {pt.productCategoryName}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="book-instruction">
                        * Đơn giá đã bao gồm cả giá dịch vụ tương ứng
                      </div>
                      {selectedProductType == "suggestion" ? (
                        <>
                          <div
                            className="book-instruction"
                            style={{ color: "green" }}
                          >
                            * Sản phẩm được gợi ý dựa trên lịch sử đặt hàng của
                            bạn.
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                      <div
                        className="book-options-list appear"
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        {selectedProductType == "suggestion" &&
                        suggestedProducts.length > 0 ? (
                          <>
                            {suggestedProducts?.map((p) => (
                              <div
                                style={{ width: "100%" }}
                                className="book-option"
                                key={p.productId}
                              >
                                <div className="book-option-checkbox">
                                  <label className="checkbox-container">
                                    <input
                                      className="custom-checkbox"
                                      type="checkbox"
                                      checked={
                                        !!checkedServices[
                                          `${selectedServices}-${p.productId}`
                                        ]
                                      }
                                      onChange={() =>
                                        toggleCheckboxProduct(
                                          selectedServices,
                                          p.productId
                                        )
                                      }
                                    />

                                    <span className="checkmark"></span>
                                  </label>
                                </div>

                                <div className="book-option-info">
                                  <p>{p.productName}</p>
                                  {checkedServices[
                                    `${selectedServices}-${p.productId}`
                                  ] ? (
                                    <>
                                      <div className="book-option-info-input">
                                        {checkedServices[
                                          `${selectedServices}-${p.productId}`
                                        ]?.quantity > 0 && (
                                          <>
                                            <h3>
                                              {new Intl.NumberFormat(
                                                "vi-VN"
                                              ).format(
                                                (serviceList.find(
                                                  (x) =>
                                                    x.serviceId ==
                                                    selectedServices
                                                )?.price +
                                                  p.productPrice) *
                                                  checkedServices[
                                                    `${selectedServices}-${p.productId}`
                                                  ]?.quantity
                                              )}
                                            </h3>
                                            <h6
                                              style={{
                                                paddingRight: "10px",
                                              }}
                                            >
                                              vnđ
                                            </h6>
                                          </>
                                        )}
                                        <input
                                          type="number"
                                          placeholder="0"
                                          min="0"
                                          value={
                                            checkedServices[
                                              `${selectedServices}-${p.productId}`
                                            ]?.quantity || ""
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              e,
                                              selectedServices,
                                              p.productId,
                                              "quantity"
                                            )
                                          }
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="book-option-info-input">
                                        <h5>
                                          Đơn giá:{" "}
                                          {new Intl.NumberFormat(
                                            "vi-VN"
                                          ).format(
                                            p.productPrice +
                                              serviceList.find(
                                                (x) =>
                                                  x.serviceId ==
                                                  selectedServices
                                              )?.price
                                          ) + " vnđ"}
                                        </h5>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {selectedProductType ? (
                              <>
                                {products
                                  .filter((p) => {
                                    return (
                                      p.productCategoryId ==
                                        selectedProductType &&
                                      p.serviceList.includes(selectedServices)
                                    );
                                  })
                                  .map((p) => (
                                    <div
                                      style={{ width: "100%" }}
                                      className="book-option"
                                      key={p.productId}
                                    >
                                      <div className="book-option-checkbox">
                                        <label className="checkbox-container">
                                          <input
                                            className="custom-checkbox"
                                            type="checkbox"
                                            checked={
                                              !!checkedServices[
                                                `${selectedServices}-${p.productId}`
                                              ]
                                            }
                                            onChange={() =>
                                              toggleCheckboxProduct(
                                                selectedServices,
                                                p.productId
                                              )
                                            }
                                          />

                                          <span className="checkmark"></span>
                                        </label>
                                      </div>

                                      <div className="book-option-info">
                                        <p className="booking-product-text">
                                          {p.productName}
                                        </p>
                                        {checkedServices[
                                          `${selectedServices}-${p.productId}`
                                        ] ? (
                                          <>
                                            <div className="book-option-info-input">
                                              <h3>
                                                {new Intl.NumberFormat(
                                                  "vi-VN"
                                                ).format(
                                                  p.price *
                                                    (checkedServices[
                                                      `${selectedServices}-${p.productId}`
                                                    ]?.quantity || 0)
                                                )}
                                                {" vnđ"}
                                              </h3>
                                              <input
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                value={
                                                  checkedServices[
                                                    `${selectedServices}-${p.productId}`
                                                  ]?.quantity || ""
                                                }
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    e,
                                                    selectedServices,
                                                    p.productId,
                                                    "quantity"
                                                  )
                                                }
                                              />
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="book-option-info-input">
                                              <h5>
                                                {new Intl.NumberFormat(
                                                  "vi-VN"
                                                ).format(p.price) + " vnđ"}
                                              </h5>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </>
                            ) : (
                              <>
                                {products
                                  .filter((p) => {
                                    return p.serviceList.includes(
                                      selectedServices
                                    );
                                  })
                                  .map((p) => (
                                    <div
                                      style={{ width: "100%" }}
                                      className="book-option"
                                      key={p.productId}
                                    >
                                      <div className="book-option-checkbox">
                                        <label className="checkbox-container">
                                          <input
                                            className="custom-checkbox"
                                            type="checkbox"
                                            checked={
                                              !!checkedServices[
                                                `${selectedServices}-${p.productId}`
                                              ]
                                            }
                                            onChange={() =>
                                              toggleCheckboxProduct(
                                                selectedServices,
                                                p.productId
                                              )
                                            }
                                          />

                                          <span className="checkmark"></span>
                                        </label>
                                      </div>

                                      <div className="book-option-info">
                                        <p>{p.productName}</p>
                                        {checkedServices[
                                          `${selectedServices}-${p.productId}`
                                        ] ? (
                                          <>
                                            <div className="book-option-info-input">
                                              {checkedServices[
                                                `${selectedServices}-${p.productId}`
                                              ]?.quantity > 0 && (
                                                <>
                                                  <h3>
                                                    {new Intl.NumberFormat(
                                                      "vi-VN"
                                                    ).format(
                                                      (serviceList.find(
                                                        (x) =>
                                                          x.serviceId ==
                                                          selectedServices
                                                      )?.price +
                                                        p.price) *
                                                        checkedServices[
                                                          `${selectedServices}-${p.productId}`
                                                        ]?.quantity
                                                    )}
                                                  </h3>
                                                  <h6
                                                    style={{
                                                      paddingRight: "10px",
                                                    }}
                                                  >
                                                    vnđ
                                                  </h6>
                                                </>
                                              )}
                                              <input
                                                type="number"
                                                placeholder="0"
                                                min="0"
                                                value={
                                                  checkedServices[
                                                    `${selectedServices}-${p.productId}`
                                                  ]?.quantity || ""
                                                }
                                                onChange={(e) =>
                                                  handleInputChange(
                                                    e,
                                                    selectedServices,
                                                    p.productId,
                                                    "quantity"
                                                  )
                                                }
                                              />
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <div className="book-option-info-input">
                                              <h5>
                                                Đơn giá:{" "}
                                                {new Intl.NumberFormat(
                                                  "vi-VN"
                                                ).format(
                                                  p.price +
                                                    serviceList.find(
                                                      (x) =>
                                                        x.serviceId ==
                                                        selectedServices
                                                    )?.price
                                                ) + " vnđ"}
                                              </h5>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {" "}
                <div className="book-options-list appear">
                  {serviceList
                    .filter((x) => x.serviceTypeId == selected)
                    .map((service) => (
                      <div
                        className="book-option"
                        key={service.serviceId}
                        style={{ width: "47%" }}
                      >
                        <div className="book-option-checkbox">
                          <label className="checkbox-container">
                            <input
                              className="custom-checkbox"
                              type="checkbox"
                              checked={
                                !!checkedServices[`${service.serviceId}-null`]
                              }
                              onChange={() => toggleCheckbox(service.serviceId)}
                            />

                            <span className="checkmark"></span>
                          </label>
                        </div>

                        <div className="book-option-info">
                          <p>{service.serviceName}</p>

                          <>
                            <div className="book-option-info-input">
                              <h5>
                                {new Intl.NumberFormat("vi-VN").format(
                                  service.price
                                ) + " vnđ"}
                              </h5>
                            </div>
                          </>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
          <div className="book-history-card">
            <div className="book-history-header">
              <div className="book-history-top">
                <div className="book-history-circle">
                  <span className="book-history-red book-history-circle2"></span>
                </div>
                <div className="book-history-circle">
                  <span className="book-history-yellow book-history-circle2"></span>
                </div>
                <div className="book-history-circle">
                  <span className="book-history-green book-history-circle2"></span>
                </div>
                <div className="book-history-title">
                  <p id="title2">Dịch vụ bạn đã chọn:</p>
                </div>
              </div>
            </div>
            <div className="book-history-code-container">
              <div className="book-history-area">
                {Object.keys(checkedServices).length > 0 ? (
                  <>
                    {Object.entries(checkedServices)
                      .filter(
                        ([key, value]) =>
                          value.weight === 0 || value.quantity > 0
                      )
                      .map(
                        ([key, { serviceId, productId, weight, quantity }]) => {
                          const serviceName =
                            serviceList.find(
                              (s) => String(s.serviceId) === String(serviceId)
                            )?.serviceName || "Không xác định";

                          const serviceType =
                            serviceList.find(
                              (s) => String(s.serviceId) === String(serviceId)
                            )?.serviceTypeId || "Không xác định";

                          const serviceTypename =
                            serviceTypes.find(
                              (st) =>
                                String(st.serviceTypeId) === String(serviceType)
                            )?.serviceTypeName || "Không xác định";

                          const productName =
                            products.find((p) => p.productId == productId)
                              ?.productName || "Không xác định";

                          const priceProduct =
                            products.find((p) => p.productId == productId)
                              ?.price * quantity || "Không xác định";

                          const priceService =
                            serviceList.find(
                              (s) => String(s.serviceId) === String(serviceId)
                            )?.price * weight || "Không xác định";

                          return (
                            <div key={key} className="book-history">
                              {weight != null && quantity == null ? (
                                <div className="book-history-text">
                                  <p style={{ fontSize: "14px", width: "45%" }}>
                                    Loại dịch vụ: {serviceName}
                                  </p>
                                  <p style={{ fontSize: "14px", width: "45%" }}>
                                    Dịch vụ: {serviceTypename}
                                  </p>
                                </div>
                              ) : (
                                <div className="book-history-text">
                                  <p style={{ fontSize: "14px", width: "40%" }}>
                                    Dịch vụ: {serviceName}
                                  </p>
                                  <p style={{ fontSize: "14px", width: "45%" }}>
                                    Tên đồ giặt: {productName}
                                  </p>
                                  <p style={{ fontSize: "14px", width: "15%" }}>
                                    {quantity} cái
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                  </>
                ) : (
                  <>
                    <div
                      className="book-history-text"
                      style={{ border: "none", paddingTop: "3%" }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          width: "100%",
                          color: "gray",
                        }}
                      >
                        Chưa có dịch vụ được chọn
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="book-btn">
          <button className="book-btn-CartBtn" onClick={handleAddToCart}>
            <span className="book-btn-IconContainer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 576 512"
                fill="rgb(17, 17, 17)"
                className="book-btn-cart"
              >
                <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
              </svg>
            </span>
            <p className="book-btn-text">Xác Nhận</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Booking;
