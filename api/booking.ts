export const reviewBookingRequest = async (
  bookingId: string,
  status: "approved" | "rejected" | "pending" | "cancelled",
  token: string
) => {
  try {
    const response = await fetch(
      `http://172.20.10.4:8080/api/v1/ground-owner/booking-requests/${bookingId}/review`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (err) {
    console.error("Review booking request failed:", err);
    throw err;
  }
};
