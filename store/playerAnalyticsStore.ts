// src/store/playerAnalyticsStore.ts
import { create } from "zustand";
import api from "../api/api";

interface Match {
  matchId: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  userTeamId: string;
  userTeamName?: string;
  opponentTeamId: string | null;
  opponentTeamName?: string;
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
  error: string | null;
  fetchAnalytics: (token: string, _forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

export const usePlayerAnalyticsStore = create<PlayerAnalyticsState>((set) => ({
  summary: null,
  matches: [],
  isLoading: false,
  error: null,

  fetchAnalytics: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/user/analytics", {
        headers: { Authorization: `Bearer ${token}` },
        skipGlobalErrorHandler: true,
      });

      const data = response.data;

      set({
        summary: data.summary || null,
        matches: data.matches || [],
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch analytics",
        isLoading: false,
      });
    }
  },

  invalidateCache: () => {
    set({ summary: null, matches: [], error: null });
  },
}));
