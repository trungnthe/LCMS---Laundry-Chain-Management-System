import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../reuse/Header";
import Footer from "../reuse/Footer";
import RecentBlogs from "../reuse/user/RecentBlogs";
import { PiClockCounterClockwiseDuotone } from "react-icons/pi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../assets/css/user/blogs.css";

const Blogs = () => {
  const [offset, setOffset] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [activeBlogCategory, setActiveBlogCategory] = useState("all");

  // Featured blog slider images
  const sliderImages = [
    {
      id: 1,
      src: "https://pasgo.vn/Upload/anh-slide-show/sen-vang---kdt-thanh-pho-giao-luu-173699792103.webp",
      alt: "Sen Vang",
      link: "/blogs/sen-vang-kdt-thanh-pho",
    },
    {
      id: 2,
      src: "/background.jpg",
      alt: "Background",
      link: "/blogs/background-feature",
    },
    {
      id: 3,
      src: "https://pasgo.vn/Upload/anh-slide-show/royal-buffet-104219612073.webp",
      alt: "Royal Buffet",
      link: "/blogs/royal-buffet-experience",
    },
  ];

  // Blog data
  const blogPosts = [
    {
      id: 1,
      image: "/VeThang.png",
      title: "Chuỗi Giặt Là ABC - Giặt sạch hoàn hảo, dịch vụ tận tâm!",
      date: "23-02-2023",
      summary:
        "Dịch vụ Giặt Là ABC - Chất lượng vượt trội, phục vụ nhanh chóng! Với đội ngũ nhân viên chuyên nghiệp và công nghệ giặt là hiện đại, chúng tôi cam kết ...",
      category: "service",
      slug: "giat-la-abc-chat-luong-dich-vu",
    },
    {
      id: 2,
      image: "/gold.jpg",
      title: "Ưu đãi đặc biệt - Giảm 30% cho khách hàng mới",
      date: "15-03-2023",
      summary:
        "Nhân dịp khai trương chi nhánh mới, chuỗi Giặt Là ABC triển khai chương trình khuyến mãi đặc biệt dành cho khách hàng mới với ưu đãi giảm giá lên đến 30% cho...",
      category: "promotion",
      slug: "uu-dai-dac-biet-giam-30-khach-hang-moi",
    },
    {
      id: 3,
      image:
        "https://tse4.mm.bing.net/th?id=OIP.s8nrvCS59F660xm8DUtXxgHaCk&pid=Api&P=0&h=180",
      title: "5 Bí quyết giữ quần áo bền đẹp như mới",
      date: "05-01-2023",
      summary:
        "Bạn đang tìm kiếm cách để giữ quần áo luôn như mới? Hãy khám phá 5 bí quyết đơn giản từ chuyên gia của chúng tôi để quần áo của bạn luôn bền đẹp và...",
      category: "tips",
      slug: "5-bi-quyet-giu-quan-ao-ben-dep",
    },
    {
      id: 4,
      image: "/VeThang.png",
      title: "Công nghệ mới trong ngành giặt là - Xu hướng 2023",
      date: "12-02-2023",
      summary:
        "Công nghệ giặt là đang phát triển không ngừng với nhiều tiến bộ đáng kinh ngạc. Cùng tìm hiểu những xu hướng công nghệ mới nhất trong ngành giặt là năm 2023...",
      category: "technology",
      slug: "cong-nghe-moi-trong-nganh-giat-la-2023",
    },
    {
      id: 5,
      image: "/VeThang.png",
      title: "Dịch vụ vệ sinh đồ da - Cách bảo quản túi xách, giày cao cấp",
      date: "18-03-2023",
      summary:
        "Đồ da cao cấp cần được chăm sóc đặc biệt. Chuỗi Giặt Là ABC giới thiệu dịch vụ vệ sinh chuyên nghiệp dành riêng cho các sản phẩm da với quy trình...",
      category: "service",
      slug: "dich-vu-ve-sinh-do-da-cach-bao-quan",
    },
    {
      id: 6,
      image: "/VeThang.png",
      title: "Hướng dẫn sử dụng dịch vụ giặt là trực tuyến",
      date: "28-02-2023",
      summary:
        "Tiết kiệm thời gian với dịch vụ đặt giặt là trực tuyến. Hướng dẫn chi tiết cách sử dụng ứng dụng đặt dịch vụ giặt là tại nhà chỉ với vài thao tác đơn giản...",
      category: "guide",
      slug: "huong-dan-su-dung-dich-vu-giat-la-truc-tuyen",
    },
  ];

  // Small blog posts (different layout)
  const smallBlogPosts = [
    {
      id: 7,
      image:
        "https://tse1.mm.bing.net/th?id=OIP.2EH63A6n7SLvMhBwot61PwHaFU&pid=Api&P=0&h=180",
      title: "Chương trình thân thiết - Tích điểm đổi ưu đãi",
      date: "20-03-2023",
      summary:
        "Dịch vụ Giặt Là ABC - Chất lượng vượt trội, phục vụ nhanh chóng! Với đội ngũ nhân viên chuyên....",
      category: "promotion",
      slug: "chuong-trinh-than-thiet-tich-diem",
    },
    {
      id: 8,
      image:
        "https://tse3.mm.bing.net/th?id=OIP.oLXcSBN92MwEkK5f7kaiowHaE8&pid=Api&P=0&h=180",
      title: "Giặt là chuyên nghiệp cho đồ dùng khách sạn",
      date: "10-02-2023",
      summary:
        "Dịch vụ Giặt Là ABC cung cấp giải pháp toàn diện cho các khách sạn với quy trình chuyên nghiệp...",
      category: "service",
      slug: "giat-la-chuyen-nghiep-cho-khach-san",
    },
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate slider width based on window size
  const sliderWidth = windowWidth * 0.8; // 80% of window width (considering 10% margin on each side)

  // Slider navigation handlers
  const handleNext = () => {
    setOffset((prevOffset) =>
      prevOffset + sliderWidth >= sliderWidth * (sliderImages.length - 1)
        ? 0
        : prevOffset + sliderWidth
    );
  };

  const handlePrev = () => {
    setOffset((prevOffset) =>
      prevOffset === 0
        ? sliderWidth * (sliderImages.length - 1)
        : prevOffset - sliderWidth
    );
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [offset]);

  // Filter blogs by category
  const filterBlogsByCategory = (category) => {
    setActiveBlogCategory(category);
  };

  const filteredBlogs =
    activeBlogCategory === "all"
      ? blogPosts
      : blogPosts.filter((blog) => blog.category === activeBlogCategory);

  return (
    <div className="wrapper-container">
      <Header />

      {/* Page Header */}
      <div className="content-header">
        <div className="content-header-content">
          <div className="content-header-image">
            <img src="/blogs.svg" alt="Blog" />
          </div>
          <h2>Tin Tức</h2>
        </div>
      </div>

      <div className="blogs-container">
        {/* Featured Slider */}
        <div className="blogs-slider">
          <div className="blogs-slider-arrow">
            <button
              className="blogs-slider-arrow-left"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              <FaChevronLeft />
            </button>

            <button
              className="blogs-slider-arrow-right"
              onClick={handleNext}
              aria-label="Next slide"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="blogs-slider-images">
            <ul
              style={{
                transform: `translateX(-${offset}px)`,
                transition: "transform 0.5s ease",
                width: `${sliderWidth * sliderImages.length}px`,
              }}
            >
              {sliderImages.map((image) => (
                <li key={image.id} style={{ width: `${sliderWidth}px` }}>
                  <Link to={image.link}>
                    <img src={image.src} alt={image.alt} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Blogs Section */}
        <RecentBlogs />

        {/* Main Blog Content */}
        <div className="blogs-content">
          <h2>Blog và Tin Tức</h2>

          {/* Blog Category Filter */}
          <div className="blog-categories">
            <button
              className={`blog-category-btn ${
                activeBlogCategory === "all" ? "active" : ""
              }`}
              onClick={() => filterBlogsByCategory("all")}
            >
              Tất cả
            </button>
            <button
              className={`blog-category-btn ${
                activeBlogCategory === "service" ? "active" : ""
              }`}
              onClick={() => filterBlogsByCategory("service")}
            >
              Dịch vụ
            </button>
            <button
              className={`blog-category-btn ${
                activeBlogCategory === "promotion" ? "active" : ""
              }`}
              onClick={() => filterBlogsByCategory("promotion")}
            >
              Khuyến mãi
            </button>
            <button
              className={`blog-category-btn ${
                activeBlogCategory === "tips" ? "active" : ""
              }`}
              onClick={() => filterBlogsByCategory("tips")}
            >
              Mẹo hay
            </button>
          </div>

          {/* Main Blog Grid */}
          <div className="blogs-list2">
            {filteredBlogs.map((blog) => (
              <div className="blog-content" key={blog.id}>
                <Link to={`/blogs/${blog.slug}`} className="blog-link">
                  <img src={blog.image} alt={blog.title} />
                  <h5>{blog.title}</h5>
                  <h6>
                    <PiClockCounterClockwiseDuotone /> {blog.date}
                  </h6>
                  <h3>{blog.summary}</h3>
                </Link>
              </div>
            ))}
          </div>

          {/* Additional Blog Section with Different Layout */}
          <h2 className="additional-blogs-title">Bài Viết Nổi Bật</h2>
          <div className="blogs-list3">
            {smallBlogPosts.map((blog) => (
              <div className="blog-content-small" key={blog.id}>
                <Link to={`/blogs/${blog.slug}`} className="blog-link">
                  <img src={blog.image} alt={blog.title} />
                </Link>
                <div className="blog-small">
                  <Link to={`/blogs/${blog.slug}`} className="blog-link">
                    <h5>{blog.title}</h5>
                    <h6>
                      <PiClockCounterClockwiseDuotone /> {blog.date}
                    </h6>
                    <h3>{blog.summary}</h3>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="blog-pagination">
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blogs;
