import { create } from "zustand";
import { getOrganizerTournaments } from "../api/tournamentApi";

export interface OrganizerTournament {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl?: string;
  teamSize: number;
  teamCount: number;
  prizePool: number;
  entryFee: number;
  totalRevenue: number;
  expenses: number;
  profit: number;
  organizerRating: number;
  totalRatings: number;
  status: "upcoming" | "draft" | "completed";
  createdAt: string;
}

interface OrganizerTournamentStore {
  tournaments: OrganizerTournament[];
  loading: boolean;
  error: string | null;
  fetchOrganizerTournaments: (token: string, _forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
  setTournaments: (tournaments: OrganizerTournament[]) => void;
}

export const useOrganizerTournamentStore = create<OrganizerTournamentStore>((set) => ({
  tournaments: [],
  loading: false,
  error: null,

  fetchOrganizerTournaments: async (token: string) => {
    if (!token) {
      console.warn("[OrganizerTournamentStore] No token provided");
      return;
    }

    try {
      set({ loading: true, error: null });
      const data = await getOrganizerTournaments(token);
      set({
        tournaments: data || [],
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("[OrganizerTournamentStore] Error fetching tournaments:", error);
      set({
        error: error.message || "Failed to load tournaments",
        loading: false,
      });
    }
  },

  setTournaments: (tournaments: OrganizerTournament[]) => {
    set({ tournaments });
  },

  invalidateCache: () => {
    set({ tournaments: [], error: null });
  },
}));
