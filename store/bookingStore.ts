import axios from "axios";
import { create } from "zustand";
import { API_BASE_URL } from "../config/apiConfig";

const BASE_URL = API_BASE_URL;

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

export interface GroundWithBookings {
  ground: any;
  bookings: any[];
}

interface BookingStore {
  bookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  groundDetails: Record<string, GroundDetails>;
  groundDetailsLoading: Record<string, boolean>;
  groundDetailsError: Record<string, string | null>;
  grounds: GroundWithBookings[];
  selectedGround: GroundWithBookings | null;
  fetchMyBookings: (token: string, _forceRefresh?: boolean) => Promise<void>;
  fetchGroundDetails: (groundId: string, _forceRefresh?: boolean) => Promise<void>;
  getGroundDetails: (groundId: string) => GroundDetails | null;
  setGrounds: (grounds: GroundWithBookings[]) => void;
  setSelectedGround: (ground: GroundWithBookings | null) => void;
  invalidateBookings: () => void;
  invalidateGroundDetails: (groundId: string) => void;
  invalidateAllCache: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  bookingsLoading: false,
  bookingsError: null,
  groundDetails: {},
  groundDetailsLoading: {},
  groundDetailsError: {},
  grounds: [],
  selectedGround: null,

  fetchMyBookings: async (token: string) => {
    try {
      set({ bookingsLoading: true, bookingsError: null });

      const response = await axios.get(`${BASE_URL}/booking/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bookings = response.data?.data || [];

      set({
        bookings,
        bookingsLoading: false,
        bookingsError: null,
      });
    } catch (error: any) {
      console.error("[BookingStore] Error fetching bookings:", error);
      set({
        bookingsLoading: false,
        bookingsError: error.response?.data?.message || "Failed to fetch bookings",
      });
    }
  },

  fetchGroundDetails: async (groundId: string) => {
    try {
      set((state) => ({
        groundDetailsLoading: { ...state.groundDetailsLoading, [groundId]: true },
      }));

      const response = await axios.get(`${BASE_URL}/booking/grounds/${groundId}`);
      const groundData = response.data.data;

      set((state) => ({
        groundDetails: {
          ...state.groundDetails,
          [groundId]: groundData,
        },
        groundDetailsLoading: {
          ...state.groundDetailsLoading,
          [groundId]: false,
        },
      }));
    } catch (error: any) {
      console.error("[BookingStore] Error fetching ground details:", error);
      set((state) => ({
        groundDetailsLoading: { ...state.groundDetailsLoading, [groundId]: false },
        groundDetailsError: {
          ...state.groundDetailsError,
          [groundId]: error.response?.data?.message || "Failed to fetch ground details",
        },
      }));
    }
  },

  getGroundDetails: (groundId: string) => {
    return get().groundDetails[groundId] || null;
  },

  setGrounds: (grounds: GroundWithBookings[]) => {
    set({ grounds });
  },

  setSelectedGround: (ground: GroundWithBookings | null) => {
    set({ selectedGround: ground });
  },

  invalidateBookings: () => {
    set({ bookings: [], bookingsError: null });
  },

  invalidateGroundDetails: (groundId: string) => {
    set((state) => {
      const groundDetails = { ...state.groundDetails };
      const groundDetailsLoading = { ...state.groundDetailsLoading };
      const groundDetailsError = { ...state.groundDetailsError };
      delete groundDetails[groundId];
      delete groundDetailsLoading[groundId];
      delete groundDetailsError[groundId];
      return { groundDetails, groundDetailsLoading, groundDetailsError };
    });
  },

  invalidateAllCache: () => {
    set({
      bookings: [],
      bookingsError: null,
      groundDetails: {},
      groundDetailsLoading: {},
      groundDetailsError: {},
      grounds: [],
      selectedGround: null,
    });
  },
}));
