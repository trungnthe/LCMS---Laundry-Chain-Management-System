import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const fetchWeatherSuggestions = async (city) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/WeatherSuggestion/weather-suggestions`,
      {
        params: { city },
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

export const fetchCartSuggestions = async (customerId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/Suggestion/cart-suggestions/${customerId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

export const fetchPopularBookingSuggestions = async (
  customerId,
  laundryType,
  deliveryType
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/Suggestion/booking-suggestions-popular/${customerId}`,
      {
        params: {
          laundryType,
          deliveryType,
        },
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

// 4. Products by Service and Customer
export const fetchProductsByServiceAndCustomer = async (
  serviceId,
  customerId
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/Suggestion/products-by-service/${serviceId}/customer/${customerId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
