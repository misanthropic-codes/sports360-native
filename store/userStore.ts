import { create } from "zustand";
import { getPlayerAnalytics, getUserProfile, PlayerAnalytics, UserProfile } from "../api/userApi";

interface UserStore {
  // Profile state
  profile: UserProfile | null;
  profileLoading: boolean;
  profileLoaded: boolean;
  
  // Analytics state
  analytics: PlayerAnalytics | null;
  analyticsLoading: boolean;
  analyticsLoaded: boolean;
  
  // Cache management
  lastFetched: number | null;
  
  // Actions
  fetchProfile: (token: string, forceRefresh?: boolean) => Promise<void>;
  fetchAnalytics: (token: string, forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  profile: null,
  profileLoading: false,
  profileLoaded: false,
  
  analytics: null,
  analyticsLoading: false,
  analyticsLoaded: false,
  
  lastFetched: null,
  
  // Fetch user profile with smart caching
  fetchProfile: async (token: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.profileLoaded) {
      // Check cache freshness
      if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) {
        console.log("[UserStore] Using cached profile data");
        return;
      }
    }
    
    if (!token) {
      console.warn("[UserStore] No token provided for fetchProfile");
      return;
    }
    
    try {
      set({ profileLoading: true });
      console.log("[UserStore] Fetching user profile - forceRefresh:", forceRefresh);
      
      const data = await getUserProfile(token);
      
      set({
        profile: data,
        profileLoaded: true,
        profileLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      console.error("[UserStore] Error fetching profile:", error);
      set({ profileLoading: false });
    }
  },
  
  // Fetch player analytics with smart caching
  fetchAnalytics: async (token: string, forceRefresh = false) => {
    const state = get();
    
    // Check if we should skip fetching
    if (!forceRefresh && state.analyticsLoaded) {
      // Check cache freshness
      if (state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL) {
        console.log("[UserStore] Using cached analytics data");
        return;
      }
    }
    
    if (!token) {
      console.warn("[UserStore] No token provided for fetchAnalytics");
      return;
    }
    
    try {
      set({ analyticsLoading: true });
      console.log("[UserStore] Fetching analytics - forceRefresh:", forceRefresh);
      
      const data = await getPlayerAnalytics("overall", undefined, undefined, token);
      
      set({
        analytics: data,
        analyticsLoaded: true,
        analyticsLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      console.error("[UserStore] Error fetching analytics:", error);
      set({ analyticsLoading: false });
    }
  },
  
  // Invalidate cache to force fresh data on next fetch
  invalidateCache: () => {
    console.log("[UserStore] Cache invalidated");
    set({
      profileLoaded: false,
      analyticsLoaded: false,
      lastFetched: null,
    });
  },
}));
