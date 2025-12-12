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
  // Tournaments list
  tournaments: Tournament[];
  loading: boolean;
  isLoaded: boolean;
  lastFetched: number | null;
  error: string | null;
  
  // Actions
  fetchTournaments: (token: string, forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
  setTournaments: (tournaments: Tournament[]) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  // Initial state
  tournaments: [],
  loading: false,
  isLoaded: false,
  lastFetched: null,
  error: null,
  
  // Fetch tournaments with smart caching
  fetchTournaments: async (token: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.isLoaded) {
      // Check cache freshness
      if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) {
        console.log("[TournamentStore] Using cached tournament data");
        return;
      }
    }
    
    if (!token) {
      console.warn("[TournamentStore] No token provided");
      return;
    }
    
    try {
      set({ loading: true, error: null });
      console.log("[TournamentStore] Fetching tournaments - forceRefresh:", forceRefresh);
      
      const data = await getAllTournaments(token);
      
      set({
        tournaments: data || [],
        isLoaded: true,
        loading: false,
        lastFetched: Date.now(),
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
  
  // Manual setter for tournaments (useful for optimistic updates)
  setTournaments: (tournaments: Tournament[]) => {
    set({ tournaments, isLoaded: true, lastFetched: Date.now() });
  },
  
  // Invalidate cache to force fresh data on next fetch
  invalidateCache: () => {
    console.log("[TournamentStore] Cache invalidated");
    set({
      isLoaded: false,
      lastFetched: null,
    });
  },
}));
