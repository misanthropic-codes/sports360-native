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
  coordinates?: string;
  facilities?: string | null;
  pricePerHour?: number;
  tournamentPrice?: number;
  capacity?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields that might still be needed or can be optional
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

// ✅ Review structure
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

// ✅ Review data container
export interface GroundReviewData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  page: number;
  limit: number;
}

// ✅ Zustand store interface
interface GroundStore {
  selectedGround: Ground | null;
  groundReviews: Record<string, GroundReviewData>; // Key: groundId
  
  // Grounds list caching
  grounds: Ground[];
  groundsLoading: boolean;
  groundsLoaded: boolean;
  groundsLastFetched: number | null;
  groundsError: string | null;
  
  setSelectedGround: (ground: Ground) => void;
  setGroundReviews: (groundId: string, reviewData: GroundReviewData) => void;
  
  // Grounds fetching
  fetchGrounds: (token: string, forceRefresh?: boolean) => Promise<void>;
  invalidateGroundsCache: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// ✅ Create store
export const useGroundStore = create<GroundStore>((set, get) => ({
  selectedGround: null,
  groundReviews: {},
  
  // Grounds list state
  grounds: [],
  groundsLoading: false,
  groundsLoaded: false,
  groundsLastFetched: null,
  groundsError: null,

  setSelectedGround: (ground: Ground) => set({ selectedGround: ground }),

  setGroundReviews: (groundId, reviewData) =>
    set((state) => ({
      groundReviews: { ...state.groundReviews, [groundId]: reviewData },
    })),
  
  // Fetch grounds with smart caching
  fetchGrounds: async (token: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.groundsLoaded) {
      // Check cache freshness
      if (state.groundsLastFetched && Date.now() - state.groundsLastFetched < CACHE_TTL) {
        console.log("[GroundStore] Using cached grounds data");
        return;
      }
    }
    
    if (!token) {
      console.warn("[GroundStore] No token provided");
      return;
    }
    
    try {
      set({ groundsLoading: true, groundsError: null });
      console.log("[GroundStore] Fetching grounds - forceRefresh:", forceRefresh);
      
      const data = await getGrounds(token);
      
      set({
        grounds: data || [],
        groundsLoaded: true,
        groundsLoading: false,
        groundsLastFetched: Date.now(),
        groundsError: null,
      });
    } catch (error: any) {
      console.error("[GroundStore] Error fetching grounds:", error);
      // Error handled by axios interceptor, update local state only
      set({ 
        groundsLoading: false,
        groundsError: error.response?.data?.message || "Failed to fetch grounds"
      });
    }
  },
  
  // Invalidate grounds cache
  invalidateGroundsCache: () => {
    console.log("[GroundStore] Grounds cache invalidated");
    set({
      groundsLoaded: false,
      groundsLastFetched: null,
    });
  },
}));
