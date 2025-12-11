import axios from "axios";
import { create } from "zustand";

const BASE_URL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Types
export interface Booking {
  id: string;
  groundId: string;
  groundName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  message: string;
  status: string;
}

export interface GroundDetails {
  id: string;
  businessName: string;
  businessAddress?: string;
  groundDescription?: string;
  facilityAvailable?: string;
  profileImageUrl?: string;
  businessLogoUrl?: string;
  [key: string]: any;
}

interface BookingStore {
  // My bookings
  bookings: Booking[];
  bookingsLoading: boolean;
  bookingsLoaded: boolean;
  bookingsLastFetched: number | null;
  
  // Ground details cache (keyed by groundId)
  groundDetails: Record<string, GroundDetails>;
  groundDetailsLoading: Record<string, boolean>;
  groundDetailsLoaded: Record<string, boolean>;
  groundDetailsLastFetched: Record<string, number>;
  
  // Actions
  fetchMyBookings: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchGroundDetails: (groundId: string, forceRefresh?: boolean) => Promise<void>;
  getGroundDetails: (groundId: string) => GroundDetails | null;
  invalidateBookings: () => void;
  invalidateGroundDetails: (groundId: string) => void;
  invalidateAllCache: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  // Initial state
  bookings: [],
  bookingsLoading: false,
  bookingsLoaded: false,
  bookingsLastFetched: null,
  groundDetails: {},
  groundDetailsLoading: {},
  groundDetailsLoaded: {},
  groundDetailsLastFetched: {},
  
  // Fetch my bookings with smart caching
  fetchMyBookings: async (token: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.bookingsLoaded) {
      if (state.bookingsLastFetched && Date.now() - state.bookingsLastFetched < CACHE_TTL) {
        console.log("[BookingStore] Using cached bookings");
        return;
      }
    }
    
    try {
      set({ bookingsLoading: true });
      console.log("[BookingStore] Fetching my bookings - forceRefresh:", forceRefresh);
      
      const response = await axios.get(`${BASE_URL}/booking/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const bookings = response.data?.data || [];
      
      set({
        bookings,
        bookingsLoaded: true,
        bookingsLastFetched: Date.now(),
        bookingsLoading: false,
      });
    } catch (error) {
      console.error("[BookingStore] Error fetching bookings:", error);
      set({ bookingsLoading: false });
    }
  },
  
  // Fetch ground details with smart caching
  fetchGroundDetails: async (groundId: string, forceRefresh = false) => {
    const state = get();
    const cached = state.groundDetailsLoaded[groundId];
    const lastFetched = state.groundDetailsLastFetched[groundId];
    
    // Check if we should skip fetching
    if (!forceRefresh && cached) {
      if (lastFetched && Date.now() - lastFetched < CACHE_TTL) {
        console.log("[BookingStore] Using cached ground details for:", groundId);
        return;
      }
    }
    
    try {
      set((state) => ({
        groundDetailsLoading: { ...state.groundDetailsLoading, [groundId]: true },
      }));
      
      console.log("[BookingStore] Fetching ground details - groundId:", groundId, "forceRefresh:", forceRefresh);
      
      const response = await axios.get(`${BASE_URL}/booking/grounds/${groundId}`);
      const groundData = response.data.data;
      
      set((state) => ({
        groundDetails: {
          ...state.groundDetails,
          [groundId]: groundData,
        },
        groundDetailsLoaded: {
          ...state.groundDetailsLoaded,
          [groundId]: true,
        },
        groundDetailsLastFetched: {
          ...state.groundDetailsLastFetched,
          [groundId]: Date.now(),
        },
        groundDetailsLoading: {
          ...state.groundDetailsLoading,
          [groundId]: false,
        },
      }));
    } catch (error) {
      console.error("[BookingStore] Error fetching ground details:", error);
      set((state) => ({
        groundDetailsLoading: { ...state.groundDetailsLoading, [groundId]: false },
      }));
    }
  },
  
  // Get cached ground details
  getGroundDetails: (groundId: string) => {
    return get().groundDetails[groundId] || null;
  },
  
  // Invalidate bookings cache
  invalidateBookings: () => {
    console.log("[BookingStore] Invalidating bookings cache");
    set({
      bookingsLoaded: false,
      bookingsLastFetched: null,
    });
  },
  
  // Invalidate specific ground details cache
  invalidateGroundDetails: (groundId: string) => {
    console.log("[BookingStore] Invalidating ground details cache for:", groundId);
    set((state) => ({
      groundDetailsLoaded: {
        ...state.groundDetailsLoaded,
        [groundId]: false,
      },
      groundDetailsLastFetched: {
        ...state.groundDetailsLastFetched,
        [groundId]: 0,
      },
    }));
  },
  
  // Invalidate all caches
  invalidateAllCache: () => {
    console.log("[BookingStore] Invalidating all booking caches");
    set({
      bookingsLoaded: false,
      bookingsLastFetched: null,
      groundDetails: {},
      groundDetailsLoaded: {},
      groundDetailsLastFetched: {},
    });
  },
}));
