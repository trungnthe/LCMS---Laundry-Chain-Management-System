import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const fetchBookingHistoryByCustomerId = async (userId) => {
  try {
    const bookingResponse = await axios.get(
      `${apiUrl}/api/Booking/list-by-CusId?customerId=${userId}`
    );
    const bookings = bookingResponse.data;

    if (!bookings.length) {
      return;
    }

    const detailRequests = bookings.map((booking) =>
      axios.get(`${apiUrl}/api/Booking/${booking.bookingId}`)
    );

    const detailsResponses = await Promise.all(detailRequests);
    const bookingDetails = detailsResponses.map((res) => res.data);

    const fullBookings = bookings.map((booking, index) => ({
      ...booking,
      details: bookingDetails[index],
    }));

    return fullBookings;
  } catch (error) {
    console.error(
      "Error fetching bookings and details:",
      error.response ? error.response.data : error.message
    );
    return error;
  }
};

const fetchBookingHistoryByCustomerIdAndPayment = async (userId) => {
  const token = localStorage.getItem("token");

  try {
    const bookingResponse = await axios.get(
      `${apiUrl}/api/Booking/list-by-CusId?customerId=${userId}`
    );
    const bookings = bookingResponse.data;

    if (!bookings.length) {
      return [];
    }

    const detailRequests = bookings.map((booking) =>
      axios.get(`${apiUrl}/api/Booking/${booking.bookingId}`)
    );
    const detailsResponses = await Promise.all(detailRequests);
    const bookingDetails = detailsResponses.map((res) => res.data);

    const paymentRequests = bookings.map((booking) =>
      axios
        .get(`${apiUrl}/api/Payment/get-PaymentByBooking`, {
          params: { bookingId: booking.bookingId },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => res.data)
    );
    const paymentResponses = await Promise.all(paymentRequests);

    const fullBookings = bookings.map((booking, index) => ({
      ...booking,
      details: bookingDetails[index],
      payment: paymentResponses[index],
    }));

    return fullBookings;
  } catch (error) {}
};

const fetchBookingStatusByBookingId = async (bookingId) => {
  try {
    const response = await axios.get(`${apiUrl}/api/BookingHistory/all`);
    const statusList = response.data;

    if (!statusList.length) {
      return;
    }

    const statusById = statusList.filter((x) => x.bookingId == bookingId);

    return statusById;
  } catch (error) {
    console.error(
      "Error fetching status by Id",
      error.response ? error.response.data : error.message
    );
    return error;
  }
};

export {
  fetchBookingHistoryByCustomerId,
  fetchBookingStatusByBookingId,
  fetchBookingHistoryByCustomerIdAndPayment,
};
