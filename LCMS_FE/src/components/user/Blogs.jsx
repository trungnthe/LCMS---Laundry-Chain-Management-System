import React, { useState, useEffect } from "react";
import Header from "../reuse/Header";
import { useLocation } from "react-router-dom";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const location = useLocation();
  const [selectedBlog, setSelectedBlog] = useState(location.state?.blog || 4);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const BLOGS_URL = `${apiUrl}/api/blogs`;

  useEffect(() => {
    document.getElementById("top").scrollIntoView({
      behavior: "smooth",
    });
    fetchBlogs();
    fetchBlogDetail(selectedBlog);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogDetail = async (id) => {
    try {
      setDetailLoading(true);
      const response = await fetch(`${BLOGS_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedBlog(data);
      setError(null);
    } catch (err) {
      setError("Failed to load blog details. Please try again later.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBlogSelect = (id) => {
    fetchBlogDetail(id);
    setTimeout(() => {
      document.getElementById("top").scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className={`modern-blog ${darkMode ? "dark-mode" : ""}`}>
      <Header></Header>
      <div className="content-container">
        <aside className="blog-list-container">
          <div className="blog-list-header">
            <h2>Bài viết</h2>
            <span className="blog-count">
              {blogs.filter((x) => x.status == true).length} bài
            </span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải bài viết...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          ) : blogs.filter((x) => x.status == true).length === 0 ? (
            <div className="empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p>Không tìm thấy bài viết nào</p>
            </div>
          ) : (
            <div className="blog-items">
              {blogs
                .filter((x) => x.status == true)
                .sort(
                  (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
                )
                .map((blog) => (
                  <div
                    key={blog.blogId}
                    className={`blog-item ${
                      selectedBlog && selectedBlog.blogId === blog.blogId
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleBlogSelect(blog.blogId)}
                  >
                    <div className="blog-item-content">
                      <h3>{blog.blogName}</h3>
                      <div className="blog-meta">
                        <span className="author">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {blog.accountName}
                        </span>
                        <span className="date">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {formatDate(blog.createdDate).split(",")[0]}
                        </span>
                      </div>
                    </div>
                    <div className="blog-item-arrow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </aside>

        <main className="blog-detail-container">
          {!selectedBlog && !detailLoading ? (
            <div className="empty-detail-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h2>Chọn một bài viết để xem chi tiết</h2>
              <p>
                Lựa chọn một bài viết từ danh sách bên trái để xem nội dung chi
                tiết tại đây.
              </p>
            </div>
          ) : detailLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải chi tiết bài viết...</p>
            </div>
          ) : (
            selectedBlog && (
              <div className="blog-detail">
                <h2 className="blog-detail-title" style={{ color: "#4d61e3" }}>
                  {selectedBlog.blogName}
                </h2>

                <div className="blog-detail-meta">
                  <div className="meta-item author">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{selectedBlog.accountName}</span>
                  </div>

                  {selectedBlog.lastModified && (
                    <div className="meta-item modified-date">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>
                        Sửa đổi: {formatDate(selectedBlog.lastModified)}
                      </span>
                    </div>
                  )}
                </div>

                {selectedBlog.imageBlog &&
                  selectedBlog.imageBlog !== "http://localhost:5000string" && (
                    <div className="blog-image-container">
                      <img
                        className="blog-image"
                        src={selectedBlog.imageBlog}
                        alt="Blog illustration"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/800x400?text=Image+Not+Available";
                        }}
                      />
                    </div>
                  )}

                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}

export default Blogs;
