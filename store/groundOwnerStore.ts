import { create } from "zustand";

const BASE_URL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Types
export interface Summary {
  totalMyRequests: number;
  myPendingRequests: number;
  myApprovedRequests: number;
  myRejectedRequests: number;
  totalGroundRequests: number;
  groundPendingRequests: number;
  groundApprovedRequests: number;
  groundRejectedRequests: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface Ground {
  id: string;
  userId: string;
  groundOwnerName: string;
  ownerName: string;
  groundType: string;
  yearsOfOperation: string;
  primaryLocation: string;
  facilityAvailable: string;
  bookingFrequency: string;
  groundDescription: string;
  imageUrls: string;
  acceptOnlineBookings: boolean;
  allowTournamentsBookings: boolean;
  receiveGroundAvailabilityNotifications: boolean;
}

export interface BookingRequest {
  id: string;
  userId: string;
  groundId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  tournamentId: string;
  status: string;
  message: string;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  ground: Ground;
  user: User;
}

export interface BookingStatusData {
  summary: Summary;
  myBookingRequests: BookingRequest[];
  groundBookingRequests: BookingRequest[];
}

export interface GroundWithBookings {
  ground: Ground;
  bookings: BookingRequest[];
}

interface GroundOwnerStore {
  // Booking status cache
  bookingStatus: BookingStatusData | null;
  bookingStatusLoading: boolean;
  bookingStatusLoaded: boolean;
  bookingStatusLastFetched: number | null;
  bookingStatusError: string | null;
  
  // Booking requests cache
  bookingRequests: GroundWithBookings[];
  bookingRequestsLoading: boolean;
  bookingRequestsLoaded: boolean;
  bookingRequestsLastFetched: number | null;
  bookingRequestsError: string | null;
  
  // Actions
  fetchBookingStatus: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchBookingRequests: (token: string, forceRefresh?: boolean) => Promise<void>;
  invalidateBookingStatus: () => void;
  invalidateBookingRequests: () => void;
  invalidateAllCache: () => void;
  updateBookingRequestStatus: (bookingId: string, status: "approved" | "rejected") => void;
}

export const useGroundOwnerStore = create<GroundOwnerStore>((set, get) => ({
  // Initial state
  bookingStatus: null,
  bookingStatusLoading: false,
  bookingStatusLoaded: false,
  bookingStatusLastFetched: null,
  bookingStatusError: null,
  
  bookingRequests: [],
  bookingRequestsLoading: false,
  bookingRequestsLoaded: false,
  bookingRequestsLastFetched: null,
  bookingRequestsError: null,
  
  // Fetch booking status with smart caching (for dashboard)
  fetchBookingStatus: async (token: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.bookingStatusLoaded) {
      if (state.bookingStatusLastFetched && Date.now() - state.bookingStatusLastFetched < CACHE_TTL) {
        console.log("[GroundOwnerStore] Using cached booking status");
        return;
      }
    }
    
    if (!token) {
      console.warn("[GroundOwnerStore] No token provided for fetchBookingStatus");
      return;
    }
    
    try {
      set({ bookingStatusLoading: true, bookingStatusError: null });
      console.log("[GroundOwnerStore] Fetching booking status - forceRefresh:", forceRefresh);
      
      const response = await fetch(`${BASE_URL}/booking/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      set({
        bookingStatus: {
          summary: data.summary,
          myBookingRequests: data.data?.myBookingRequests || [],
          groundBookingRequests: data.data?.groundBookingRequests || [],
        },
        bookingStatusLoaded: true,
        bookingStatusLoading: false,
        bookingStatusLastFetched: Date.now(),
        bookingStatusError: null,
      });
    } catch (error: any) {
      console.error("[GroundOwnerStore] Error fetching booking status:", error);
      set({
        bookingStatusLoading: false,
        bookingStatusError: error.message || "Failed to fetch booking status",
      });
    }
  },
  
  // Fetch booking requests with smart caching (for booking requests screen)
  fetchBookingRequests: async (token: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.bookingRequestsLoaded) {
      if (state.bookingRequestsLastFetched && Date.now() - state.bookingRequestsLastFetched < CACHE_TTL) {
        console.log("[GroundOwnerStore] Using cached booking requests");
        return;
      }
    }
    
    if (!token) {
      console.warn("[GroundOwnerStore] No token provided for fetchBookingRequests");
      return;
    }
    
    try {
      set({ bookingRequestsLoading: true, bookingRequestsError: null });
      console.log("[GroundOwnerStore] Fetching booking requests - forceRefresh:", forceRefresh);
      
      const response = await fetch(`${BASE_URL}/ground-owner/booking-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      // Group bookings by ground
      const grouped = json.data?.reduce((acc: any, request: any) => {
        const groundId = request.ground.id;
        if (!acc[groundId]) {
          acc[groundId] = { ground: request.ground, bookings: [] };
        }
        acc[groundId].bookings.push(request);
        return acc;
      }, {});
      
      const groupedArray = Object.values(grouped || {}) as GroundWithBookings[];
      
      set({
        bookingRequests: groupedArray,
        bookingRequestsLoaded: true,
        bookingRequestsLoading: false,
        bookingRequestsLastFetched: Date.now(),
        bookingRequestsError: null,
      });
    } catch (error: any) {
      console.error("[GroundOwnerStore] Error fetching booking requests:", error);
      set({
        bookingRequestsLoading: false,
        bookingRequestsError: error.message || "Failed to fetch booking requests",
      });
    }
  },
  
  // Update booking request status locally after approval/rejection
  updateBookingRequestStatus: (bookingId: string, status: "approved" | "rejected") => {
    set((state) => {
      // Update in bookingRequests
      const updatedRequests = state.bookingRequests.map((groundWithBookings) => ({
        ...groundWithBookings,
        bookings: groundWithBookings.bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        ),
      }));
      
      // Update in bookingStatus if it exists
      let updatedBookingStatus = state.bookingStatus;
      if (updatedBookingStatus) {
        updatedBookingStatus = {
          ...updatedBookingStatus,
          groundBookingRequests: updatedBookingStatus.groundBookingRequests.map((booking) =>
            booking.id === bookingId ? { ...booking, status } : booking
          ),
        };
      }
      
      return {
        bookingRequests: updatedRequests,
        bookingStatus: updatedBookingStatus,
      };
    });
  },
  
  // Invalidate booking status cache
  invalidateBookingStatus: () => {
    console.log("[GroundOwnerStore] Invalidating booking status cache");
    set({
      bookingStatusLoaded: false,
      bookingStatusLastFetched: null,
    });
  },
  
  // Invalidate booking requests cache
  invalidateBookingRequests: () => {
    console.log("[GroundOwnerStore] Invalidating booking requests cache");
    set({
      bookingRequestsLoaded: false,
      bookingRequestsLastFetched: null,
    });
  },
  
  // Invalidate all caches
  invalidateAllCache: () => {
    console.log("[GroundOwnerStore] Invalidating all ground owner caches");
    set({
      bookingStatusLoaded: false,
      bookingStatusLastFetched: null,
      bookingRequestsLoaded: false,
      bookingRequestsLastFetched: null,
    });
  },
}));
