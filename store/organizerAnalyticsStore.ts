// store/organizerStore.ts
import { create } from "zustand";

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
  fetchAnalytics: (token: string) => Promise<void>;
}

export const useOrganizerStore = create<OrganizerState>((set) => ({
  summary: null,
  tournaments: [],
  fetchAnalytics: async (token: string) => {
    console.log("🚀 Fetching organizer analytics...");
    try {
      const res = await fetch(
        "http://172.20.10.4:8080/api/v1/organizer-profile/analytics",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token added here
          },
        }
      );

      if (!res.ok) {
        console.error(`❌ Server responded with status: ${res.status}`);
        const text = await res.text();
        console.error("🔍 Response text:", text);
        return;
      }

      const data = await res.json();
      console.log("📦 Organizer analytics response:", data);

      set({
        summary: data.summary || null,
        tournaments: data.tournaments || [],
      });

      console.log("✅ State updated successfully in store.");
    } catch (err) {
      console.error("❌ Failed to fetch organizer analytics:", err);
    }
  },
}));
