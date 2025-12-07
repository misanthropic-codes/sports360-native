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
  error: string | null;
  fetchAnalytics: (token: string) => Promise<void>;
}

export const usePlayerAnalyticsStore = create<PlayerAnalyticsState>((set) => ({
  summary: null,
  matches: [],
  isLoading: false,
  error: null,

  fetchAnalytics: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1/user/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      set({
        summary: data.summary || null,
        matches: data.matches || [],
        isLoading: false,
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      set({ error: "Failed to fetch analytics", isLoading: false });
    }
  },
}));
