import { create } from "zustand"; // Correct import for zustand

interface Ground {
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

interface GroundStore {
  selectedGround: Ground | null;
  setSelectedGround: (ground: Ground) => void;
}

// Use create with proper typing for the store
export const useGroundStore = create<GroundStore>((set) => ({
  selectedGround: null,
  setSelectedGround: (ground: Ground) => set({ selectedGround: ground }),
}));
