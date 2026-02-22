
import { create } from "zustand";
import { MatchScoreState, getMatchScore } from "../api/scoreApi";

interface MatchStore {
  matchData: MatchScoreState | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchMatchData: (matchId: string, token?: string | null) => Promise<void>;
  updateMatchData: (data: MatchScoreState) => void; // Called by Socket or direct update
  resetMatchData: () => void;
}

export const useMatchStore = create<MatchStore>((set) => ({
  matchData: null,
  loading: false,
  error: null,

  fetchMatchData: async (matchId: string, token?: string | null) => {
    try {
      set({ loading: true, error: null });
      const data = await getMatchScore(matchId, token);
      set({ matchData: data, loading: false });
    } catch (error: any) {
      console.error("[MatchStore] Error fetching match score:", error);
      set({ error: error.message || "Failed to load match score", loading: false });
    }
  },

  updateMatchData: (data: MatchScoreState) => {
    set({ matchData: data });
  },

  resetMatchData: () => {
    set({ matchData: null, error: null, loading: false });
  },
}));
