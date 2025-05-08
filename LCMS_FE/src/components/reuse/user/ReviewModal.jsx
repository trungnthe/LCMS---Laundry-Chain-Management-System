import React, { useState, useEffect } from "react";
import {
  fetchFeedback,
  postFeedback,
  replyReview,
} from "../../../services/review";

const ReviewModal = ({ productId, isOpen, onClose, currentUserId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    bookingDetailId: productId ?? null,
    rating: 0,
    comment: "",
  });
  const [replyData, setReplyData] = useState({
    feedbackId: null,
    bookingDetailId: productId,
    comment: "",
    parentFeedbackId: null,
  });
  const [activeReplyId, setActiveReplyId] = useState(null);

  useEffect(() => {
    if (productId) {
      setNewReview((prev) => ({ ...prev, bookingDetailId: productId }));
    }
  }, [productId]);

  useEffect(() => {
    if (isOpen && productId) fetchReviews();
  }, [isOpen, productId]);

  const fetchReviews = async () => {
    const res = await fetchFeedback(productId);
    setReviews(Array.isArray(res) ? res : []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const res = await postFeedback(newReview);
    if (res) {
      setNewReview({ bookingDetailId: productId, rating: 5, comment: "" });
      fetchReviews();
    } else alert("Lỗi khi gửi đánh giá, vui lòng thử lại!");
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ★
      </span>
    ));

  const handleShowReplyForm = (feedbackId, accountId) => {
    // Check if the review was made by the current user
    if (accountId == currentUserId) {
      return;
    }

    setActiveReplyId(feedbackId);
    setReplyData({
      feedbackId: null,
      bookingDetailId: productId,
      comment: "",
      parentFeedbackId: feedbackId,
    });
  };

  const handleReplyChange = (e) => {
    setReplyData((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    const res = await replyReview(replyData.parentFeedbackId, replyData);
    if (res) {
      setActiveReplyId(null);
      fetchReviews();
    } else alert("Lỗi khi gửi phản hồi, vui lòng thử lại!");
  };

  const handleCancelReply = () => setActiveReplyId(null);

  // Create a hierarchical structure for all reviews and their replies
  const organizeNestedReviews = () => {
    // First, create a map of all reviews indexed by their feedbackId
    const reviewMap = {};
    reviews.forEach((review) => {
      reviewMap[review.feedbackId] = {
        ...review,
        replies: [],
      };
    });

    // Create the hierarchical structure - both for top-level and nested replies
    const parentReviews = [];

    reviews.forEach((review) => {
      // If it has a parent, add it to that parent's replies
      if (review.parentFeedbackId && reviewMap[review.parentFeedbackId]) {
        reviewMap[review.parentFeedbackId].replies.push(
          reviewMap[review.feedbackId]
        );
      }
      // If it doesn't have a parent, it's a top-level review
      else if (!review.parentFeedbackId) {
        parentReviews.push(reviewMap[review.feedbackId]);
      }
    });

    return parentReviews;
  };

  // Format date string for better display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render a single review with its reply functionality
  const renderReview = (review, depth = 0) => (
    <div
      key={review.feedbackId}
      className={`review-item ${depth > 0 ? "review-reply-item" : ""}`}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="review-header">
        <div className="review-user">
          {review.accountName || "Ẩn danh"}
          {review.accountId == currentUserId && (
            <span className="current-user-badge">Bạn</span>
          )}
        </div>
        <div className="review-date">{formatDate(review.feedbackDate)}</div>
      </div>
      <div className="review-rating">
        {depth === 0 && renderStars(review.rating)}
      </div>
      <div className="review-comment">"{review.comment}"</div>

      {activeReplyId === review.feedbackId ? (
        <div className="reply-form-container">
          <form onSubmit={handleSubmitReply}>
            <textarea
              placeholder="Nhập phản hồi của bạn..."
              value={replyData.comment}
              onChange={handleReplyChange}
              rows="3"
              required
            ></textarea>
            <div className="reply-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelReply}
              >
                Huỷ
              </button>
              <button type="submit" className="submit-button">
                Gửi phản hồi
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {review.accountId == currentUserId ? (
            <></>
          ) : (
            <button
              className="reply-button"
              onClick={() =>
                handleShowReplyForm(review.feedbackId, review.accountId)
              }
            >
              <i className="fa fa-reply"></i> Trả lời
            </button>
          )}
        </>
      )}

      {/* Recursively render replies */}
      {review.replies && review.replies.length > 0 && (
        <div className={`review-replies depth-${depth + 1}`}>
          {review.replies.map((reply) => renderReview(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  const nestedReviews = organizeNestedReviews();

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <div className="review-modal-header">
          <h2>
            Đánh giá dịch vụ{" "}
            <span className="product-id">(ID: {productId})</span>
          </h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="review-modal-content combined-layout">
          <div className="reviews-section">
            <h3>
              Đánh giá và phản hồi{" "}
              <span className="review-count">({nestedReviews.length})</span>
            </h3>
            <div className="reviews-list">
              {nestedReviews.length === 0 ? (
                <p className="no-reviews">Bạn chưa đánh giá về dịch vụ này.</p>
              ) : (
                nestedReviews.map((review) => renderReview(review))
              )}
            </div>
          </div>

          {nestedReviews.length === 0 ? (
            <div className="review-form-container">
              <h3>Viết đánh giá của bạn</h3>
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="form-group">
                  <label>Đánh giá:</label>
                  <div className="rating-input">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="rating-label">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={newReview.rating === rating}
                          onChange={handleInputChange}
                        />
                        <span className="star">{rating} ★</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="comment">Nhận xét:</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={newReview.comment}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-button">
                  <i className="fa fa-paper-plane"></i> Gửi đánh giá
                </button>
              </form>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
