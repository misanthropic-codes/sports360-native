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
  error: string | null;
  setTeams: (myTeams: Team[], allTeams: Team[]) => void;
  setLoading: (loading: boolean) => void;
  fetchTeams: (token: string, baseURL: string, _forceRefresh?: boolean) => Promise<void>;
  addToMyTeams: (team: Team) => void;
  invalidateCache: () => void;
};

export const useTeamStore = create<TeamState>((set) => ({
  myTeams: [],
  allTeams: [],
  loading: false,
  error: null,

  setTeams: (myTeams, allTeams) => set({ myTeams, allTeams }),
  setLoading: (loading) => set({ loading }),

  fetchTeams: async (token, baseURL) => {
    set({ loading: true, error: null });
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [myRes, allRes] = await Promise.all([
        axios.get(`${baseURL}/api/v1/team/my-teams`, { headers }),
        axios.get(`${baseURL}/api/v1/team/all`, { headers }),
      ]);
      set({
        myTeams: myRes.data?.data || [],
        allTeams: allRes.data?.data || [],
        error: null,
      });
    } catch (err: any) {
      console.error("❌ Error fetching teams:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch teams",
        loading: false,
      });
      return;
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
    set({ myTeams: [], allTeams: [], error: null });
  },
}));
