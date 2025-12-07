import api from "./api";

// ============================================
// INTERFACES
// ============================================

export interface Review {
  id: string;
  bookingId: string;
  groundId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  reviewType: "ground" | "service";
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
  groundName?: string;
}

export interface CreateReviewPayload {
  bookingId: string;
  groundId: string;
  rating: number;
  comment?: string;
  reviewType: "ground" | "service";
}

export interface UpdateReviewPayload {
  rating: number;
  comment?: string;
}

export interface GroundRatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
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
// REVIEW CRUD APIs
// ============================================

/**
 * Create Review
 * POST /review/create
 */
export const createReview = async (
  data: CreateReviewPayload,
  token: string
): Promise<Review> => {
  const res = await api.post("/review/create", data, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Update Review
 * PUT /review/:reviewId
 */
export const updateReview = async (
  reviewId: string,
  data: UpdateReviewPayload,
  token: string
): Promise<Review> => {
  const res = await api.put(`/review/${reviewId}`, data, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Delete Review
 * DELETE /review/:reviewId
 */
export const deleteReview = async (reviewId: string, token: string): Promise<any> => {
  const res = await api.delete(`/review/${reviewId}`, withAuthHeaders(token));
  return res.data?.data || null;
};

// ============================================
// VIEW REVIEWS APIs
// ============================================

/**
 * My Reviews
 * GET /review/my-reviews?page=1&limit=10
 */
export const getMyReviews = async (
  page: number = 1,
  limit: number = 10,
  token?: string
): Promise<{ reviews: Review[]; total: number }> => {
  const res = await api.get("/review/my-reviews", {
    params: { page, limit },
    ...withAuthHeaders(token || ""),
  });
  return {
    reviews: res.data?.data || [],
    total: res.data?.total || 0,
  };
};

/**
 * Ground Reviews (public)
 * GET /review/ground/:groundId?page=1&limit=10
 */
export const getGroundReviews = async (
  groundId: string,
  page: number = 1,
  limit: number = 10,
  token?: string
): Promise<{ reviews: Review[]; total: number }> => {
  console.log("🔍 API Call: getGroundReviews", { groundId, page, limit });
  const res = await api.get(`/review/ground/${groundId}`, {
    params: { page, limit },
    ...withAuthHeaders(token || ""),
  });
  console.log("✅ API Response - getGroundReviews:", res.data);
  console.log("✅ Reviews data:", res.data?.data);
  return {
    reviews: res.data?.data || [],
    total: res.data?.total || 0,
  };
};

/**
 * Ground Rating Stats (public)
 * GET /review/ground/:groundId/stats
 */
export const getGroundRatingStats = async (
  groundId: string,
  token?: string
): Promise<GroundRatingStats> => {
  console.log("🔍 API Call: getGroundRatingStats", { groundId });
  const res = await api.get(`/review/ground/${groundId}/stats`, {
    ...withAuthHeaders(token || ""),
  });
  console.log("✅ API Response - getGroundRatingStats:", res.data);
  console.log("✅ Stats data:", res.data?.data);
  return res.data?.data || { averageRating: 0, totalReviews: 0 };
};

export default {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getGroundReviews,
  getGroundRatingStats,
};
