import { create } from "zustand";
import { getAllTournaments } from "../api/tournamentApi";

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  location?: string;
  tournamentFormat?: string;
  status?: string;
  startDate: string;
  endDate?: string;
  entryFee?: number | string;
  teams?: any[];
  maxTeams?: number;
  organizerId?: string;
  imageUrl?: string;
}

interface TournamentStore {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  fetchTournaments: (token: string, _forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
  setTournaments: (tournaments: Tournament[]) => void;
}

export const useTournamentStore = create<TournamentStore>((set) => ({
  tournaments: [],
  loading: false,
  error: null,

  fetchTournaments: async (token: string) => {
    if (!token) {
      console.warn("[TournamentStore] No token provided");
      return;
    }

    try {
      set({ loading: true, error: null });
      const data = await getAllTournaments(token);
      set({
        tournaments: data || [],
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("[TournamentStore] Error fetching tournaments:", error);
      set({
        error: error.message || "Failed to load tournaments",
        loading: false,
      });
    }
  },

  setTournaments: (tournaments: Tournament[]) => {
    set({ tournaments });
  },

  invalidateCache: () => {
    set({ tournaments: [], error: null });
  },
}));
