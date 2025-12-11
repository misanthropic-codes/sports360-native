// src/store/playerAnalyticsStore.ts
import { create } from "zustand";

interface Match {
  matchId: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  userTeamId: string;
  opponentTeamId: string | null;
  status: string;
  matchTime: string;
  result: string | null;
  scoreA: string | null;
  scoreB: string | null;
}

interface PlayerSummary {
  totalMatchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesCompleted: number;
  matchesUpcoming: number;
  matchesOngoing: number;
  winRate: number;
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  upcomingTournaments: number;
  totalTeams: number;
  totalRuns: number;
  averageScore: number;
  battingAverage: number;
  strikeRate: number;
  totalFours: number;
  totalSixes: number;
  totalWickets: number;
  averageBowlingSpeed: number;
  bowlingAverage: number;
  totalCatches: number;
  totalRunOuts: number;
  totalStumpings: number;
  playerOfMatchAwards: number;
}

interface PlayerAnalyticsState {
  summary: PlayerSummary | null;
  matches: Match[];
  isLoading: boolean;
  isLoaded: boolean;
  lastFetched: number | null;
  error: string | null;
  fetchAnalytics: (token: string, forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const usePlayerAnalyticsStore = create<PlayerAnalyticsState>((set, get) => ({
  summary: null,
  matches: [],
  isLoading: false,
  isLoaded: false,
  lastFetched: null,
  error: null,

  fetchAnalytics: async (token, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.isLoaded) {
      // Check cache freshness
      if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) {
        console.log("[PlayerAnalyticsStore] Using cached analytics data");
        return;
      }
    }
    
    set({ isLoading: true, error: null });
    try {
      console.log("[PlayerAnalyticsStore] Fetching analytics - forceRefresh:", forceRefresh);
      const res = await fetch("https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1/user/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      set({
        summary: data.summary || null,
        matches: data.matches || [],
        isLoading: false,
        isLoaded: true,
        lastFetched: Date.now(),
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      set({ error: "Failed to fetch analytics", isLoading: false });
    }
  },
  
  invalidateCache: () => {
    console.log("[PlayerAnalyticsStore] Cache invalidated");
    set({ isLoaded: false, lastFetched: null });
  },
}));
