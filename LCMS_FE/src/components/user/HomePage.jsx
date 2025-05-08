import React, { useEffect, useState } from "react";
import "../../assets/css/user/homepage.css";
import {
  FaArrowCircleRight,
  FaCloudRain,
  FaHandPointRight,
  FaList,
  FaPhone,
  FaWater,
} from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import Header from "../reuse/Header";
import Footer from "../reuse/Footer";
import { useNavigate } from "react-router-dom";
import { fetchBranches } from "../../admin/manage_branches";
import { PiClockCounterClockwiseDuotone } from "react-icons/pi";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import LoadingState from "../reuse/LoadingState";
import { fetchServiceTypes } from "../../admin/manage_service_type";
import RecentBlogs from "../reuse/user/RecentBlogs";
import {
  fetchCartSuggestions,
  fetchWeatherSuggestions,
} from "../../services/suggestion";
import { jwtDecode } from "jwt-decode";
import { fetchServices } from "../../admin/manage_service";
import { addToCart } from "../../services/cart";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [weatherSuggestion, setWeatherSuggestion] = useState([]);
  const [cartSuggestion, setCartSuggestion] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBranchesFail, setIsFetchingBranchesFail] = useState(true);
  const [isFetchingSuggestionFail, setIsFetchingSuggestionFail] =
    useState(true);
  const [isFetchingWeatherSuggestionFail, setIsFetchingWeatherSuggestionFail] =
    useState(true);
  const [isFetchingServiceFail, setIsFetchingServiceFail] = useState(true);
  const [messagebyWeather, setMessageByWeather] = useState(false);
  const [iconbyWeather, setIconByWeather] = useState(false);

  const token = localStorage.getItem("token");
  let userId = null;
  const [role, setRole] = useState(null);

  const getUserIdFromToken = () => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLogin(true);
        userId = decoded?.AccountId || null;
        setRole(
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ]
        );
      } catch (error) {}
    }
  };

  useEffect(() => {
    getUserIdFromToken();
    setIsLoading(true);
    fetchBranches()
      .then((data) => {
        setBranches(data.filter((x) => x.statusDelete !== false));
        setIsFetchingBranchesFail(false);
      })
      .catch((error) => {
        setIsFetchingBranchesFail(true);
      });

    fetchServiceTypes()
      .then((data) => {
        setIsFetchingServiceFail(false);
        setServiceTypes(data.filter((x) => x.statusDelete !== false));
      })
      .catch((error) => {
        setIsFetchingServiceFail(true);
      });

    fetchWeatherSuggestions()
      .then((data) => {
        setWeatherSuggestion(data);
        setIsFetchingWeatherSuggestionFail(false);
        switch (data.weather) {
          case "Rain":
            setMessageByWeather(
              "Hôm nay trời mưa, alo cho Giặt Là Nhanh để đồ sạch khô nhanh chóng thôi nào "
            );
            setIconByWeather("🌧️");
            break;
          case "Clear":
            setMessageByWeather(
              "Hôm nay trời nắng, hãy để Giặt Là Nhanh giúp bạn giặt sạch quần áo nhé! "
            );
            setIconByWeather("☀️");
            break;
          case "Clouds":
            setMessageByWeather(
              "Hôm nay trời âm u, hãy để Giặt Là Nhanh giúp bạn giặt sạch quần áo nhé!"
            );
            setIconByWeather("🌨️");
            break;

          default:
            setMessageByWeather(
              "Các dịch vụ giặt là phù hợp với thời tiết hôm nay, hãy để Giặt Là Nhanh giúp bạn giặt sạch quần áo nhé!"
            );
            setIconByWeather("🌤️");
            break;
        }
      })
      .catch((error) => {
        isFetchingWeatherSuggestionFail(true);
      });

    fetchCartSuggestions(userId)
      .then((data) => {
        setCartSuggestion(data);
        console.log(data);

        setIsFetchingSuggestionFail(false);
      })
      .catch((error) => {
        setIsFetchingSuggestionFail(true);
      });

    setIsLoading(false);
  }, []);

  const handleViewAllBranches = () => {
    navigate("/user/branches");
  };

  const handleBranchDetail = (id) => {
    navigate(`/user/branches/${id}`);
  };

  const handleServiceDetail = (id) => {
    document.getElementById("top").scrollIntoView({
      behavior: "smooth",
    });
    navigate(`/user/services/service-type/${id}`);
  };

  const handleViewAllServices = () => {
    navigate("/user/services");
  };

  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const handleLoginBeforeAddToCart = () => {
    if (isLogin) {
    } else {
      toast.error("Vui lòng đăng nhập trước khi thêm vào giỏ hàng!", {
        className: "custom_toast",
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  const handleAddToCart = async (serviceId, productID, quantity, price) => {
    try {
      const item = {
        serviceId,
        productID,
        quantity:
          productID === undefined || productID === null ? null : quantity,
        price,
      };

      await addToCart(item);

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
    } catch (error) {}
  };

  return (
    <>
      {isLoading ? (
        <div className="loading-state">
          <LoadingState></LoadingState>
        </div>
      ) : (
        <>
          <div className="laundry-container">
            <Header key={key}></Header>
            <section className="hero">
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
              <div className="hero-content">
                {!isLogin || role === "Admin" ? (
                  <div className="hero-banner">
                    <h2>Buông bỏ bộn bề cùng với Giặt Là Nhanh</h2>
                    <p onClick={() => handleViewAllServices()}>Xem dịch vụ</p>
                  </div>
                ) : (
                  <div className="branch-container">
                    <div className="branch-title">
                      <div className="weather-section">
                        <span>Gợi ý cho bạn</span>
                        <a>
                          Dựa trên lịch sử giặt là của bạn, chúng tôi đã tìm ra
                          những dịch vụ phù hợp nhất với bạn, giúp bạn tiết kiệm
                          thời gian.
                        </a>
                      </div>
                    </div>
                    <div className="branch-list">
                      {isFetchingSuggestionFail ? (
                        <></>
                      ) : (
                        <>
                          {cartSuggestion?.length < 4 ? (
                            <>
                              {(cartSuggestion?.length > 0
                                ? cartSuggestion.slice(0, 4)
                                : []
                              ).map((b) => {
                                const price =
                                  b.productId == null
                                    ? 0
                                    : (b.productPrice || 0) +
                                      (b.servicePrice || 0);
                                return (
                                  <div
                                    key={`cart-${b.serviceId}-${b.productId}`}
                                    className="branch"
                                    onClick={() => {
                                      handleAddToCart(
                                        b.serviceId,
                                        b.productId,
                                        b.quantity,
                                        price
                                      );
                                    }}
                                  >
                                    <div className="branch-img">
                                      <div className="img-stack">
                                        <img
                                          src={`http://localhost:5000/${b.serviceImage}`}
                                          className="img-main"
                                        />
                                        {b.productId != null && (
                                          <img
                                            src={`http://localhost:5000/${b.productImage}`}
                                            className="img-overlay"
                                          />
                                        )}
                                      </div>
                                    </div>
                                    <div className="branch-info">
                                      <span>Dịch vụ: {b.serviceName}</span>
                                      <br />
                                      <a>
                                        {b.productId
                                          ? `${b.productName} (${b.quantity} cái)`
                                          : "1kg"}
                                      </a>
                                    </div>
                                    <div className="branch-book">
                                      <FaArrowCircleRight />
                                      <span>Thêm vào giỏ hàng ngay</span>
                                    </div>
                                  </div>
                                );
                              })}

                              {(weatherSuggestion?.suggestions?.length > 0
                                ? weatherSuggestion.suggestions.slice(
                                    0,
                                    4 - (cartSuggestion?.length || 0)
                                  )
                                : []
                              ).map((b) => {
                                const price =
                                  b.productId == null
                                    ? 0
                                    : (b.productPrice || 0) +
                                      (b.servicePrice || 0);
                                return (
                                  <div
                                    key={`weather-${b.serviceId}-${b.productId}`}
                                    className="branch"
                                    onClick={() => {
                                      handleAddToCart(
                                        b.serviceId,
                                        b.productId,
                                        b.quantity,
                                        price
                                      );
                                    }}
                                  >
                                    <div className="branch-img">
                                      <div className="img-stack">
                                        <img
                                          src={b.serviceImage}
                                          className="img-main"
                                        />
                                        {b.productId != null && (
                                          <img
                                            src={b.productImage}
                                            className="img-overlay"
                                          />
                                        )}
                                      </div>
                                    </div>
                                    <div className="branch-info">
                                      <span>Dịch vụ: {b.serviceName}</span>
                                      <br />
                                      <a>
                                        {b.productId
                                          ? `${b.productName} (${b.quantity} cái)`
                                          : "1kg"}
                                      </a>
                                    </div>
                                    <div className="branch-book">
                                      <FaArrowCircleRight />
                                      <span>Thêm vào giỏ hàng ngay</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          ) : (
                            <>
                              {cartSuggestion?.slice(0, 4).map((b) => {
                                return (
                                  <div
                                    className="branch"
                                    onClick={() => {
                                      const price =
                                        b.productId == null
                                          ? 0
                                          : (b.productPrice || 0) +
                                            (b.servicePrice || 0);

                                      handleAddToCart(
                                        b.serviceId,
                                        b.productId,
                                        b.quantity,
                                        price
                                      );
                                    }}
                                  >
                                    <div className="branch-img">
                                      <div className="img-stack">
                                        <img
                                          src={`http://localhost:5000/${b.serviceImage}`}
                                          className="img-main"
                                        />
                                        {b.productId != null && (
                                          <img
                                            src={`http://localhost:5000/${b.productImage}`}
                                            className="img-overlay"
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <div className="branch-info">
                                      <span>Dịch vụ: {b.serviceName}</span>
                                      <br></br>
                                      <a>
                                        {b.productId
                                          ? `${b.productName} (${b.quantity} cái)`
                                          : "1kg"}
                                      </a>
                                    </div>
                                    <div className="branch-book">
                                      <FaArrowCircleRight></FaArrowCircleRight>
                                      <span>Thêm vào giỏ hàng ngay</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {!isLogin || role === "Admin" ? (
                  <div className="branch-container">
                    <div className="branch-title">
                      <div className="weather-section">
                        <span>
                          <div className="weather-icon">{iconbyWeather}</div>
                          Thời tiết hôm nay
                        </span>
                        <a>{messagebyWeather}</a>
                      </div>
                    </div>

                    <div className="branch-list">
                      {isFetchingWeatherSuggestionFail ? (
                        <></>
                      ) : (
                        <>
                          {weatherSuggestion?.suggestions
                            ?.slice(0, 4)
                            .map((b) => {
                              return (
                                <div
                                  className="branch"
                                  onClick={() => {
                                    handleLoginBeforeAddToCart();
                                  }}
                                >
                                  <div className="branch-img">
                                    <div className="img-stack">
                                      <img
                                        src={b.serviceImage}
                                        className="img-main"
                                      />
                                      {b.productId != null && (
                                        <img
                                          src={b.productImage}
                                          className="img-overlay"
                                        />
                                      )}
                                    </div>
                                  </div>

                                  <div className="branch-info">
                                    <span>Dịch vụ: {b.serviceName}</span>
                                    <br></br>
                                    <a>
                                      {b.productName} ({b.quantity} cái)
                                    </a>
                                  </div>
                                  <div className="branch-book">
                                    <FaArrowCircleRight></FaArrowCircleRight>
                                    <span>Thêm vào giỏ hàng ngay</span>
                                  </div>
                                </div>
                              );
                            })}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="branch-container">
                      <div className="branch-title">
                        <div className="weather-section">
                          <span>
                            <div className="weather-icon">{iconbyWeather}</div>
                            Thời tiết hôm nay
                          </span>
                          <a>{messagebyWeather}</a>
                        </div>
                      </div>

                      <div className="branch-list">
                        {isFetchingWeatherSuggestionFail ? (
                          <></>
                        ) : (
                          <>
                            {weatherSuggestion?.suggestions
                              ?.slice(0, 4)
                              .map((b) => {
                                return (
                                  <div
                                    className="branch"
                                    onClick={() => {
                                      const price =
                                        b.productId == null
                                          ? 0
                                          : (b.productPrice || 0) +
                                            (b.servicePrice || 0);

                                      handleAddToCart(
                                        b.serviceId,
                                        b.productId,
                                        b.quantity,
                                        price
                                      );
                                    }}
                                  >
                                    <div className="branch-img">
                                      <div className="img-stack">
                                        <img
                                          src={b.serviceImage}
                                          className="img-main"
                                        />
                                        {b.productId != null && (
                                          <img
                                            src={b.productImage}
                                            className="img-overlay"
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <div className="branch-info">
                                      <span>Dịch vụ: {b.serviceName}</span>
                                      <br></br>
                                      <a>
                                        {b.productName} ({b.quantity} cái)
                                      </a>
                                    </div>
                                    <div className="branch-book">
                                      <FaArrowCircleRight></FaArrowCircleRight>
                                      <span>Thêm vào giỏ hàng ngay</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="hero-image">
                <div className="bubble-decoration top"></div> {/* Bubble top */}
                <img src="/Picture2.png" alt="Washing Machine" />
                <div className="bubble-decoration bottom"></div>{" "}
                {/* Bubble bottom */}
              </div>
            </section>

            {/* Our Service Section */}
            <section className="service" style={{ marginTop: "50px" }}>
              <div className="service-text appear">
                <h2>
                  <span>Chi nhánh </span>của chúng tôi
                </h2>
                <p>
                  Chúng tôi có các chi nhánh phân bố khắp Hòa Lạc, bạn có thể
                  xem chi tiết và chọn cơ sở tiện nhất cho mình. Chúng tôi sẽ có
                  thể đến tận nơi để nhận đồ giặt và giao lại cho bạn sau khi
                  hoàn tất.
                </p>
              </div>
              <div className="service-list appear">
                {isFetchingBranchesFail ? (
                  <>Chưa có chi nhánh</>
                ) : (
                  <>
                    {branches.slice(0, 4).map((s) => {
                      return (
                        <div
                          className="service-detail"
                          style={{ backgroundImage: `url(${s.image})` }}
                          key={s.serviceTypeId}
                          onClick={() => handleBranchDetail(s.branchId)}
                        >
                          <div className="service-name">
                            <p>
                              {s.branchName}: {s.address}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </section>
            <section className="steps">
              <div className="service-text appear">
                <h2>
                  <span>Quy trình </span>làm việc
                </h2>
                <p style={{ textAlign: "center" }}>
                  Quy trình làm việc chuyên nghiệp, nhanh chóng và tiện lợi. Từ
                  khâu tiếp nhận, phân loại, giặt sạch đến sấy khô và đóng gói,
                  chúng tôi đảm bảo quần áo của bạn luôn thơm tho, sạch sẽ
                </p>
              </div>
              <div className="laundry-process appear">
                <div className="step">
                  <div className="icon">📲</div>
                  <h3 className="title">Tiếp Nhận</h3>
                  <p className="description">Nhận yêu cầu từ khách hàng</p>
                </div>

                <div className="arrow-up"></div>

                <div className="step">
                  <div className="icon"> 📑 </div>
                  <h3 className="title">Nhận Đồ Giặt</h3>
                  <p className="description">Tiếp nhận đồ, kiểm tra quần áo</p>
                </div>

                <div className="arrow-down"></div>

                <div className="step">
                  <div className="icon">🧼</div>
                  <h3 className="title">Giặt và làm sạch</h3>
                  <p className="description">Tiến hành giặt và làm sạch</p>
                </div>

                <div className="arrow-up"></div>

                <div className="step">
                  <div className="icon">👔</div>
                  <h3 className="title">Sấy khô, là ủi</h3>
                  <p className="description">
                    Thực hiện sấy khô, là phẳng quần áo
                  </p>
                </div>

                <div className="arrow-down"></div>

                <div className="step">
                  <div className="icon">📦</div>
                  <h3 className="title">Đóng gói và sẵn sàng</h3>
                  <p className="description">
                    Đóng gói, sẵn sàng giao tới khách hàng
                  </p>
                </div>
              </div>
            </section>

            <section className="service">
              <div className="service-text appear">
                <h2>
                  <span>Dịch vụ </span>của chúng tôi
                </h2>
                <p>
                  Giải pháp chuyên nghiệp cho trang phục hàng ngày của bạn, đảm
                  bảo sự thơm mát và sạch sẽ sau mỗi lần giặt. Với công nghệ
                  giặt tiên tiến và quy trình chuyên nghiệp, quần áo của bạn sẽ
                  được giữ luôn như mới.
                </p>
              </div>
              <div className="service-list appear">
                {isFetchingServiceFail ? (
                  <>Chưa có dịch vụ</>
                ) : (
                  <>
                    {serviceTypes.slice(0, 4).map((s) => {
                      return (
                        <div
                          className="service-detail"
                          style={{ backgroundImage: `url(${s.image})` }}
                          key={s.serviceTypeId}
                          onClick={() => handleServiceDetail(s.serviceTypeId)}
                        >
                          <div className="service-name">
                            <p>{s.serviceTypeName}</p>
                            <div className="service-icon">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M16.6697 12.5788L8.48825 20.7602C8.41224 20.8363 8.322 20.8965 8.22268 20.9377C8.12336 20.9788 8.01692 21 7.90942 21C7.80192 21 7.69547 20.9788 7.59615 20.9377C7.49684 20.8965 7.40659 20.8363 7.33058 20.7602C7.25457 20.6842 7.19427 20.594 7.15313 20.4947C7.11199 20.3953 7.09082 20.2889 7.09082 20.1814C7.09082 20.0739 7.11199 19.9675 7.15313 19.8681C7.19427 19.7688 7.25457 19.6786 7.33058 19.6026L14.9342 12L7.33058 4.39743C7.17706 4.24391 7.09082 4.0357 7.09082 3.8186C7.09082 3.60149 7.17706 3.39328 7.33058 3.23976C7.4841 3.08624 7.69231 3 7.90942 3C8.12652 3 8.33473 3.08624 8.48825 3.23976L16.6697 11.4212C16.7457 11.4971 16.8061 11.5874 16.8472 11.6867C16.8884 11.786 16.9096 11.8925 16.9096 12C16.9096 12.1075 16.8884 12.214 16.8472 12.3133C16.8061 12.4126 16.7457 12.5029 16.6697 12.5788Z"
                                  fill="white"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </section>

            {/* Our Service Section */}
            <section className="blogg">
              <div className="blog-text appear">
                <h3>
                  <span>Bảo Quản&nbsp;</span>Quần Áo Thế Nào Cho Đúng
                </h3>
                <h2>Giặt đúng cách – Bền lâu hơn</h2>
              </div>
              <div className="blog">
                <div className="swiper-container appear">
                  <Swiper
                    style={{
                      "--swiper-navigation-color": "#fff",
                      "--swiper-pagination-color": "#fff",
                      paddingBottom: "10",
                    }}
                    spaceBetween={10}
                    navigation={true}
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="mySwiper2"
                  >
                    <SwiperSlide>
                      <img src="/blog2.jpg" />
                    </SwiperSlide>

                    <SwiperSlide>
                      <img src="/blog6.webp" />
                    </SwiperSlide>
                    <SwiperSlide>
                      <img src="blog4.jpg" />
                    </SwiperSlide>
                    <SwiperSlide>
                      <img src="/blog3.png" />
                    </SwiperSlide>
                  </Swiper>
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="mySwiper"
                  >
                    <SwiperSlide>
                      <img src="/blog2.jpg" />
                    </SwiperSlide>
                    <SwiperSlide>
                      <img src="/blog6.webp" />
                    </SwiperSlide>
                    <SwiperSlide>
                      <img src="blog4.jpg" />
                    </SwiperSlide>
                    <SwiperSlide>
                      <img src="/blog3.png" />
                    </SwiperSlide>
                  </Swiper>
                </div>
                <div className="blog-textt appear">
                  <div className="blog-tip appear">
                    <p>
                      <FaCheck color="green" /> Phân loại quần áo trước khi giặt
                    </p>
                    <p>
                      <FaCheck color="green" /> Chọn nhiệt độ nước phù hợp
                    </p>
                    <p>
                      <FaCheck color="green" /> Sử dụng nước giặt & xả phù hợp
                    </p>
                    <p>
                      <FaCheck color="green" /> Ủi/là ở nhiệt độ phù hợp
                    </p>
                  </div>

                  <div className="blog-beg appear">
                    <h5>
                      <FaHandPointRight color="#efbc15" /> Không có thời gian
                      chăm sóc quần áo? Hãy để chúng tôi giúp bạn!
                    </h5>
                    <h5>
                      <FaWater color="blue" /> Dịch vụ giặt là chuyên nghiệp –
                      Nhanh chóng – Tiện lợi
                    </h5>
                    <h5>
                      <FaPhone color="red" /> Gọi ngay 09474523737 để giữ quần
                      áo của bạn luôn như mới!
                    </h5>
                  </div>
                </div>
              </div>
            </section>

            <div className="recent-blog-container">
              <div className="blog-text appear">
                <h3>
                  <span>Bài viết&nbsp;</span>gần đây
                </h3>
              </div>
              <RecentBlogs></RecentBlogs>
            </div>

            {/* Footer Section */}
            <Footer></Footer>
          </div>
        </>
      )}
    </>
  );
};

export default HomePage;
