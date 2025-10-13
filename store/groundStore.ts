import { create } from "zustand";

// ✅ Ground structure
export interface Ground {
  businessLogoUrl: any;
  profileImageUrl: any;
  businessName: ReactNode;
  bio: ReactNode;
  contactPhone: any;
  contactEmail: any;
  website: any;
  businessAddress: any;
  id: string;
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
  owner: {
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
  setSelectedGround: (ground: Ground) => void;
  setGroundReviews: (groundId: string, reviewData: GroundReviewData) => void;
}

// ✅ Create store
export const useGroundStore = create<GroundStore>((set) => ({
  selectedGround: null,
  groundReviews: {},

  setSelectedGround: (ground: Ground) => set({ selectedGround: ground }),

  setGroundReviews: (groundId, reviewData) =>
    set((state) => ({
      groundReviews: { ...state.groundReviews, [groundId]: reviewData },
    })),
}));
