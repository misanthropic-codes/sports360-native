import { create } from "zustand";
import * as guestApi from "../../api/guest/guestApi";

interface Team {
  id: string;
  name: string;
  sport: string;
  location?: string;
  [key: string]: any;
}

interface Tournament {
  id: string;
  name: string;
  status: string;
  startDate?: string;
  [key: string]: any;
}

interface Ground {
  id: string;
  name: string;
  location?: string;
  groundType?: string;
  [key: string]: any;
}

interface PlatformStats {
  totalTeams?: number;
  totalTournaments?: number;
  totalGrounds?: number;
  [key: string]: any;
}

interface GuestState {
  teams: Team[];
  tournaments: Tournament[];
  grounds: Ground[];
  platformStats: PlatformStats | null;
  loadingTeams: boolean;
  loadingTournaments: boolean;
  loadingGrounds: boolean;
  loadingStats: boolean;
  fetchTeams: (params?: any, _forceRefresh?: boolean) => Promise<void>;
  fetchTournaments: (params?: any, _forceRefresh?: boolean) => Promise<void>;
  fetchGrounds: (params?: any, _forceRefresh?: boolean) => Promise<void>;
  fetchPlatformStats: (_forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
}

export const useGuestStore = create<GuestState>((set) => ({
  teams: [],
  tournaments: [],
  grounds: [],
  platformStats: null,
  loadingTeams: false,
  loadingTournaments: false,
  loadingGrounds: false,
  loadingStats: false,

  fetchTeams: async (params = {}) => {
    set({ loadingTeams: true });
    try {
      const response = await guestApi.getAllTeams(params);
      const teams = response.data?.data || response.data || [];
      set({ teams, loadingTeams: false });
    } catch (error) {
      console.error("❌ Error fetching teams:", error);
      set({ loadingTeams: false });
    }
  },

  fetchTournaments: async (params = {}) => {
    set({ loadingTournaments: true });
    try {
      const response = await guestApi.getAllTournaments(params);
      const tournaments = response.data?.data || response.data || [];
      set({ tournaments, loadingTournaments: false });
    } catch (error) {
      console.error("❌ Error fetching tournaments:", error);
      set({ loadingTournaments: false });
    }
  },

  fetchGrounds: async (params = {}) => {
    set({ loadingGrounds: true });
    try {
      const response = await guestApi.getAllGrounds(params);
      const grounds = response.data?.data || response.data || [];
      set({ grounds, loadingGrounds: false });
    } catch (error) {
      console.error("❌ Error fetching grounds:", error);
      set({ loadingGrounds: false });
    }
  },

  fetchPlatformStats: async () => {
    set({ loadingStats: true });
    try {
      const response = await guestApi.getPlatformStats();
      const stats = response.data?.data || response.data || {};
      set({ platformStats: stats, loadingStats: false });
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      set({ loadingStats: false });
    }
  },

  clearCache: () => {
    set({
      teams: [],
      tournaments: [],
      grounds: [],
      platformStats: null,
    });
  },
}));
