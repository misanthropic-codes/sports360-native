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
  setTeams: (myTeams: Team[], allTeams: Team[]) => void;
  setLoading: (loading: boolean) => void;
  fetchTeams: (token: string, baseURL: string) => Promise<void>;
  addToMyTeams: (team: Team) => void;
};

export const useTeamStore = create<TeamState>((set) => ({
  myTeams: [],
  allTeams: [],
  loading: false,
  setTeams: (myTeams, allTeams) => set({ myTeams, allTeams }),
  setLoading: (loading) => set({ loading }),
  fetchTeams: async (token, baseURL) => {
    set({ loading: true });
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [myRes, allRes] = await Promise.all([
        axios.get(`${baseURL}/api/v1/team/my-teams`, { headers }),
        axios.get(`${baseURL}/api/v1/team/all`, { headers }),
      ]);
      set({
        myTeams: myRes.data?.data || [],
        allTeams: allRes.data?.data || [],
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
}));
