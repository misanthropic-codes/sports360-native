import api from "./api";

// ============================================
// INTERFACES
// ============================================

export interface Ground {
  id: string;
  name: string;
  groundOwnerName?: string;
  location?: string;
  address?: string;
  pricePerHour?: number;
  tournamentPrice?: number;
  facilities?: string;
  imageUrls?: string;
  isAvailable?: boolean;
}

export interface BookingRequest {
  groundId: string;
  startTime: string;
  endTime: string;
  purpose: "tournament" | "practice" | "match";
  tournamentId?: string;
  message?: string;
}

export interface Booking {
  id: string;
  groundId: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  message?: string;
  ground?: Ground;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// HELPER
// ============================================

const withAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ============================================
// GROUND BROWSE & SEARCH APIs
// ============================================

/**
 * Browse All Grounds
 * GET /booking/grounds/all
 */
export const getAllGrounds = async (token: string): Promise<Ground[]> => {
  const res = await api.get("/booking/grounds/all", withAuthHeaders(token));
  return res.data?.data || [];
};

/**
 * Search Available Grounds
 * GET /booking/grounds/available?startTime=2025-09-25T10:00:00Z&endTime=2025-09-25T12:00:00Z
 */
export const getAvailableGrounds = async (
  startTime: string,
  endTime: string,
  token: string
): Promise<Ground[]> => {
  const res = await api.get("/booking/grounds/available", {
    params: { startTime, endTime },
    ...withAuthHeaders(token),
  });
  return res.data?.data || [];
};

// ============================================
// BOOKING MANAGEMENT APIs
// ============================================

/**
 * Create Booking Request
 * POST /booking/request
 */
export const createBookingRequest = async (
  data: BookingRequest,
  token: string
): Promise<Booking> => {
  const res = await api.post("/booking/request", data, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * My Booking Requests
 * GET /booking/my-bookings?status=pending
 */
export const getMyBookings = async (
  status?: string,
  token?: string
): Promise<Booking[]> => {
  const params = status ? { status } : {};
  const res = await api.get("/booking/my-bookings", {
    params,
    ...withAuthHeaders(token || ""),
  });
  return res.data?.data || [];
};

/**
 * Cancel Booking
 * DELETE /booking/:id
 */
export const cancelBooking = async (id: string, token: string): Promise<any> => {
  const res = await api.delete(`/booking/${id}`, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Booking Status (role-aware)
 * GET /booking/status?status=pending&purpose=tournament&startDate=2025-09-01&endDate=2025-09-30
 */
export const getBookingStatus = async (
  filters: {
    status?: string;
    purpose?: string;
    startDate?: string;
    endDate?: string;
  },
  token: string
): Promise<Booking[]> => {
  const res = await api.get("/booking/status", {
    params: filters,
    ...withAuthHeaders(token),
  });
  return res.data?.data || [];
};

export default {
  getAllGrounds,
  getAvailableGrounds,
  createBookingRequest,
  getMyBookings,
  cancelBooking,
  getBookingStatus,
};
