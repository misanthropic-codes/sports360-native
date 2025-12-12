// store/organizerStore.ts
import { create } from "zustand";
import api from "../api/api";

interface Tournament {
  tournamentId: string;
  tournamentName: string;
  registrations: number;
  matchesCount: number;
  entryFee: number;
  revenue: number;
  expenses: number;
  prizePool: number;
  profit: number;
  rating: number;
  totalRatings: number;
  status: string;
  startDate: string;
  endDate: string;
  teamCount: number;
  maxTeams: number;
}

interface Summary {
  totalTournamentsCreated: number;
  activeTournaments: number;
  completedTournaments: number;
  totalMatchesOrganized: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageRevenuePerTournament: number;
  averageProfitPerTournament: number;
  totalRegistrations: number;
  averageRegistrationsPerTournament: number;
  overallRating: number;
  totalRatingsReceived: number;
}

interface OrganizerState {
  summary: Summary | null;
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: (token: string) => Promise<void>;
  resetStore: () => void;
}

export const useOrganizerStore = create<OrganizerState>((set) => ({
  summary: null,
  tournaments: [],
  isLoading: false,
  error: null,
  fetchAnalytics: async (token: string) => {
    console.log("🚀 Fetching organizer analytics...");
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get("/organizer-profile/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      console.log("📦 Organizer analytics response:", data);

      set({
        summary: data.summary || null,
        tournaments: data.tournaments || [],
        isLoading: false,
        error: null,
      });

      console.log("✅ State updated successfully in store.");
    } catch (err: any) {
      console.error("❌ Failed to fetch organizer analytics:", err);
      // Error is already handled by axios interceptor, just update local state
      set({ 
        error: err.response?.data?.message || "Failed to fetch organizer analytics",
        isLoading: false 
      });
    }
  },
  
  resetStore: () => {
    console.log("[OrganizerAnalyticsStore] Resetting store");
    set({
      summary: null,
      tournaments: [],
      isLoading: false,
      error: null,
    });
  },
}));
