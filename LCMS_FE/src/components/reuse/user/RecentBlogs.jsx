import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";

const RecentBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const BLOGS_URL = `${apiUrl}/api/blogs`;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(BLOGS_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBlogs(data);
      setError(null);
    } catch (err) {
      setError("Failed to load blogs. Please try again later.");
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const displayBlogs = blogs.length > 0 ? blogs.slice(0, 5) : [];

  return (
    <div className="recent-blogs-container">
      <div className="recent-blogsblogs-list">
        <div className="recent-blogsbranches-title">
          <div className="recent-blogsblogs-recent">
            {loading && (
              <div className="recent-blogsloading-indicator">Loading...</div>
            )}
            {error && <div className="recent-blogserror-message">{error}</div>}

            {!loading && (
              <div className="recent-blogsblogs-slider">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 30,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    },
                  }}
                  className="recent-blogsblogs-swiper"
                >
                  {displayBlogs
                    .filter((x) => x.status == true)
                    .map((blog) => (
                      <SwiperSlide
                        key={blog.blogId}
                        className="recent-blogsblog-slide"
                      >
                        <div className="recent-blogsblog-card">
                          <a
                            onClick={() =>
                              navigate("/user/blogs", {
                                state: { blog },
                              })
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <div className="recent-blogsblog-image-container">
                              <div className="recent-blogsblog-image-containerr">
                                <img
                                  src={blog.imageBlog}
                                  alt={blog.blogName}
                                  className="recent-blogsblog-imagee"
                                />
                              </div>
                              <div className="recent-blogsblog-content">
                                <p className="recent-blogsblog-title">
                                  {blog.blogName}
                                </p>
                              </div>
                            </div>
                          </a>
                        </div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentBlogs;
