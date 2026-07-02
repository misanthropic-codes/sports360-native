import { create } from "zustand";
import { getPlayerAnalytics, getUserProfile, PlayerAnalytics, UserProfile } from "../api/userApi";

interface UserStore {
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  analytics: PlayerAnalytics | null;
  analyticsLoading: boolean;
  analyticsError: string | null;
  fetchProfile: (token: string, _forceRefresh?: boolean) => Promise<void>;
  fetchAnalytics: (token: string, _forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  profileLoading: false,
  profileError: null,
  analytics: null,
  analyticsLoading: false,
  analyticsError: null,

  fetchProfile: async (token: string) => {
    if (!token) return;

    try {
      set({ profileLoading: true, profileError: null });
      const data = await getUserProfile(token);
      set({
        profile: data,
        profileLoading: false,
        profileError: null,
      });
    } catch (error: any) {
      console.error("[UserStore] Error fetching profile:", error);
      set({
        profileLoading: false,
        profileError: error.response?.data?.message || "Failed to fetch profile",
      });
    }
  },

  fetchAnalytics: async (token: string) => {
    if (!token) return;

    try {
      set({ analyticsLoading: true, analyticsError: null });
      const data = await getPlayerAnalytics("overall", undefined, undefined, token);
      set({
        analytics: data,
        analyticsLoading: false,
        analyticsError: null,
      });
    } catch (error: any) {
      console.error("[UserStore] Error fetching analytics:", error);
      set({
        analyticsLoading: false,
        analyticsError: error.response?.data?.message || "Failed to fetch analytics",
      });
    }
  },

  invalidateCache: () => {
    set({ profile: null, analytics: null, profileError: null, analyticsError: null });
  },
}));
