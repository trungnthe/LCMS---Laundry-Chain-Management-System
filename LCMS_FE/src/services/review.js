import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/Feedback`;

const fetchFeedback = async (bookingId) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

const postFeedback = async (feedbackData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(API_BASE_URL, feedbackData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

const replyReview = async (feedbackId, replyData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${feedbackId}/reply`,
      replyData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    return { success: false, error: error.response?.data || error.message };
  }
};

export { fetchFeedback, postFeedback, replyReview };
