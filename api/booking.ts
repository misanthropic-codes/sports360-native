import { API_BASE_URL } from "../config/apiConfig";

export const reviewBookingRequest = async (
  bookingId: string,
  status: "approved" | "rejected",
  token: string
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/ground-owner/booking-requests/${bookingId}/review`,
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
