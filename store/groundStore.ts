import { create } from "zustand";
import { getGrounds } from "../api/tournamentApi";

// ✅ Ground structure
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
  name?: string | null;
  location?: string | null;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  coordinates?: string;
  facilities?: string | null;
  pricePerHour?: number;
  tournamentPrice?: number;
  capacity?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  businessLogoUrl?: any;
  profileImageUrl?: any;
  businessName?: any;
  bio?: any;
  contactPhone?: any;
  contactEmail?: any;
  website?: any;
  businessAddress?: any;
  owner?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  reviewType: string;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface GroundReviewData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  page: number;
  limit: number;
}

interface GroundStore {
  selectedGround: Ground | null;
  groundReviews: Record<string, GroundReviewData>;
  grounds: Ground[];
  groundsLoading: boolean;
  groundsError: string | null;
  setSelectedGround: (ground: Ground) => void;
  setGroundReviews: (groundId: string, reviewData: GroundReviewData) => void;
  fetchGrounds: (token: string, _forceRefresh?: boolean) => Promise<void>;
  invalidateGroundsCache: () => void;
}

export const useGroundStore = create<GroundStore>((set) => ({
  selectedGround: null,
  groundReviews: {},
  grounds: [],
  groundsLoading: false,
  groundsError: null,

  setSelectedGround: (ground: Ground) => set({ selectedGround: ground }),

  setGroundReviews: (groundId, reviewData) =>
    set((state) => ({
      groundReviews: { ...state.groundReviews, [groundId]: reviewData },
    })),

  fetchGrounds: async (token: string) => {
    if (!token) {
      console.warn("[GroundStore] No token provided");
      return;
    }

    try {
      set({ groundsLoading: true, groundsError: null });
      const data = await getGrounds(token);
      set({
        grounds: data || [],
        groundsLoading: false,
        groundsError: null,
      });
    } catch (error: any) {
      console.error("[GroundStore] Error fetching grounds:", error);
      set({
        groundsLoading: false,
        groundsError: error.response?.data?.message || "Failed to fetch grounds",
      });
    }
  },

  invalidateGroundsCache: () => {
    set({ grounds: [], groundsError: null });
  },
}));
