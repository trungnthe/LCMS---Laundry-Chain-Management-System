import React, { useEffect, useState } from "react";
import Header from "../reuse/Header";
import Footer from "../reuse/Footer";
import "../../assets/css/user/pricing.css";
import { fetchServices, fetchServiceTypes } from "../../admin/manage_service";
import { fetchCategories, fetchProducts } from "../../admin/manage_product";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const [serviceList, setServiceList] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setProductTypes] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices()
      .then((data) => {
        setServiceList(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {});

    fetchServiceTypes()
      .then((data) => {
        setServiceTypes(data.filter((x) => x.statusDelete !== false));
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

  // Get type 2 services (Giặt riêng)
  const type2Services = serviceList.filter(
    (service) => service.serviceTypeId === 2
  );

  return (
    <div>
      <Header />

      <div className="content-header">
        <div className="content-header-content">
          <div className="content-header-image">
            <img src="/pricing.svg" alt="Service" />
          </div>
          <h2>Bảng Giá</h2>
        </div>
      </div>

      <div className="pricing-container">
        <div className="pricing-first-row">
          {serviceTypes
            .filter((st) => st.serviceTypeName != "Giặt lẻ")
            .map((x) => (
              <div className="pricing-detail" key={x.serviceTypeId}>
                <div className="pricing-title">
                  <h3>{x.serviceTypeName}</h3>
                </div>
                <div className="pricing-content">
                  <div className="pricing-image">
                    <img src={x.image} alt={x.serviceTypeName} />
                  </div>
                  <div className="pricing-table-container">
                    <table className="pricing-table">
                      <tbody>
                        {serviceList.filter(
                          (s) => s.serviceTypeId == x.serviceTypeId
                        ).length === 0 ? (
                          <tr>
                            <td style={{ textAlign: "center" }}>
                              Chưa có dịch vụ
                            </td>
                          </tr>
                        ) : (
                          serviceList
                            .filter((s) => s.serviceTypeId == x.serviceTypeId)
                            .map((s) => (
                              <tr key={s.id}>
                                <td>{s.serviceName}</td>
                                <td>{s.price} VND</td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                    <div className="pricing-button">
                      <button
                        className="pricing-button-hover1"
                        onClick={() =>
                          navigate(
                            `/user/services/service-type/${x.serviceTypeId}`
                          )
                        }
                      >
                        Xem ngay
                      </button>
                      {/* <button
                        className="pricing-button-hover2"
                        onClick={() => {
                          navigate(`/user/booking`);
                          localStorage.setItem("serviceType", x.serviceTypeId);
                        }}
                      >
                        Lên lịch ngay
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="pricing-title">
          <h3>Giặt theo sản phẩm</h3>
        </div>

        <div className="pricing-second-row">
          <div className="marquee">
            <div className="marquee-content">
              {items.map((item, index) => (
                <div
                  className="marquee-item"
                  onClick={() =>
                    setSelectedCategoryId(
                      selectedCategoryId === item.productCategoryId
                        ? null
                        : item.productCategoryId
                    )
                  }
                  key={item.productCategoryId}
                >
                  <img src={item.image} />
                  <p>{item.productCategoryName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product-Service Pricing Matrix */}
        <div className="table-container">
          <table className="pricing-matrix">
            <thead>
              <tr className="pricing-header">
                <th>Sản phẩm</th>
                {type2Services.map((service) => (
                  <th key={service.serviceId}>{service.serviceName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedCategoryId
                ? products
                    .filter(
                      (product) =>
                        product.productCategoryId === selectedCategoryId
                    )
                    .map((product) => (
                      <tr key={product.productId}>
                        <td>{product.productName}</td>
                        {type2Services.map((service) => {
                          const serviceList =
                            product.serviceList?.split(",") || [];
                          const hasService = serviceList.includes(
                            String(service.serviceId)
                          );

                          return (
                            <td
                              key={`${product.productId}-${service.serviceId}`}
                            >
                              {hasService
                                ? (
                                    product.price + service.price
                                  ).toLocaleString() + " VNĐ"
                                : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                : products.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.productName}</td>
                      {type2Services.map((service) => (
                        <td key={`${product.productId}-${service.serviceId}`}>
                          {(product.price + service.price).toLocaleString()} VNĐ
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
