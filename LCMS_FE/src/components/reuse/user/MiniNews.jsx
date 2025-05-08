import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MiniNews = () => {
  const [blogs, setBlogs] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const BLOGS_URL = `${apiUrl}/api/blogs`;

  const fetchBlogs = async () => {
    try {
      const response = await fetch(BLOGS_URL);
      const data = await response.json();
      setBlogs(data.filter((blog) => blog.status !== false));
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="mini-news">
      <h4>Tin Tức</h4>
      <div className="mini-news-list">
        {blogs.map((blog, index) => (
          <div
            className="mini-news-news"
            key={index}
            onClick={() =>
              navigate("/user/blogs", {
                state: { blog },
              })
            }
          >
            <img src={blog.imageBlog} alt={blog.blogName} />
            <p>{blog.blogName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniNews;
