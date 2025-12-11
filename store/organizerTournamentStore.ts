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
  // Tournaments list
  tournaments: OrganizerTournament[];
  loading: boolean;
  isLoaded: boolean;
  lastFetched: number | null;
  error: string | null;
  
  // Actions
  fetchOrganizerTournaments: (token: string, forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
  setTournaments: (tournaments: OrganizerTournament[]) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useOrganizerTournamentStore = create<OrganizerTournamentStore>((set, get) => ({
  // Initial state
  tournaments: [],
  loading: false,
  isLoaded: false,
  lastFetched: null,
  error: null,
  
  // Fetch tournaments with smart caching
  fetchOrganizerTournaments: async (token: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.isLoaded) {
      // Check cache freshness
      if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) {
        console.log("[OrganizerTournamentStore] Using cached tournament data");
        return;
      }
    }
    
    if (!token) {
      console.warn("[OrganizerTournamentStore] No token provided");
      return;
    }
    
    try {
      set({ loading: true, error: null });
      console.log("[OrganizerTournamentStore] Fetching organizer tournaments - forceRefresh:", forceRefresh);
      
      const data = await getOrganizerTournaments(token);
      
      set({
        tournaments: data || [],
        isLoaded: true,
        loading: false,
        lastFetched: Date.now(),
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
  
  // Manual setter for tournaments (useful for optimistic updates)
  setTournaments: (tournaments: OrganizerTournament[]) => {
    set({ tournaments, isLoaded: true, lastFetched: Date.now() });
  },
  
  // Invalidate cache to force fresh data on next fetch
  invalidateCache: () => {
    console.log("[OrganizerTournamentStore] Cache invalidated");
    set({
      isLoaded: false,
      lastFetched: null,
    });
  },
}));
