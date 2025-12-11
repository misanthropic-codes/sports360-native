// store/teamStore.ts
import axios from "axios";
import { create } from "zustand";

export type Team = {
  id: string;
  name: string;
  description: string;
  location: string;
  logoUrl: string;
  isActive: boolean;
};

type TeamState = {
  myTeams: Team[];
  allTeams: Team[];
  loading: boolean;
  isLoaded: boolean;
  lastFetched: number | null;
  setTeams: (myTeams: Team[], allTeams: Team[]) => void;
  setLoading: (loading: boolean) => void;
  fetchTeams: (token: string, baseURL: string, forceRefresh?: boolean) => Promise<void>;
  addToMyTeams: (team: Team) => void;
  invalidateCache: () => void;
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useTeamStore = create<TeamState>((set, get) => ({
  myTeams: [],
  allTeams: [],
  loading: false,
  isLoaded: false,
  lastFetched: null,
  
  setTeams: (myTeams, allTeams) => set({ myTeams, allTeams, isLoaded: true, lastFetched: Date.now() }),
  setLoading: (loading) => set({ loading }),
  
  fetchTeams: async (token, baseURL, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.isLoaded) {
      // Check cache freshness
      if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) {
        console.log("[TeamStore] Using cached team data");
        return;
      }
    }
    
    set({ loading: true });
    try {
      console.log("[TeamStore] Fetching teams - forceRefresh:", forceRefresh, "isLoaded:", state.isLoaded);
      const headers = { Authorization: `Bearer ${token}` };
      const [myRes, allRes] = await Promise.all([
        axios.get(`${baseURL}/api/v1/team/my-teams`, { headers }),
        axios.get(`${baseURL}/api/v1/team/all`, { headers }),
      ]);
      set({
        myTeams: myRes.data?.data || [],
        allTeams: allRes.data?.data || [],
        isLoaded: true,
        lastFetched: Date.now(),
      });
    } catch (err) {
      console.error("❌ Error fetching teams:", err);
      set({ myTeams: [], allTeams: [] });
    } finally {
      set({ loading: false });
    }
  },
  
  addToMyTeams: (team) =>
    set((state) => ({
      myTeams: [...state.myTeams, team],
      allTeams: state.allTeams.filter((t) => t.id !== team.id),
    })),
  
  invalidateCache: () => {
    console.log("[TeamStore] Cache invalidated");
    set({ isLoaded: false, lastFetched: null });
  },
}));
