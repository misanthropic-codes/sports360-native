import { create } from "zustand";
import { getPlayerAnalytics, getUserProfile, PlayerAnalytics, UserProfile } from "../api/userApi";

interface UserStore {
  // Profile state
  profile: UserProfile | null;
  profileLoading: boolean;
  profileLoaded: boolean;
  profileError: string | null;
  
  // Analytics state
  analytics: PlayerAnalytics | null;
  analyticsLoading: boolean;
  analyticsLoaded: boolean;
  analyticsError: string | null;
  
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
  profileError: null,
  
  analytics: null,
  analyticsLoading: false,
  analyticsLoaded: false,
  analyticsError: null,
  
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
      set({ profileLoading: true, profileError: null });
      console.log("[UserStore] Fetching user profile - forceRefresh:", forceRefresh);
      
      const data = await getUserProfile(token);
      
      set({
        profile: data,
        profileLoaded: true,
        profileLoading: false,
        profileError: null,
        lastFetched: Date.now(),
      });
    } catch (error: any) {
      console.error("[UserStore] Error fetching profile:", error);
      // Error handled by axios interceptor, update local state only
      set({ 
        profileLoading: false,
        profileError: error.response?.data?.message || "Failed to fetch profile"
      });
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
      set({ analyticsLoading: true, analyticsError: null });
      console.log("[UserStore] Fetching analytics - forceRefresh:", forceRefresh);
      
      const data = await getPlayerAnalytics("overall", undefined, undefined, token);
      
      set({
        analytics: data,
        analyticsLoaded: true,
        analyticsLoading: false,
        analyticsError: null,
        lastFetched: Date.now(),
      });
    } catch (error: any) {
      console.error("[UserStore] Error fetching analytics:", error);
      // Error handled by axios interceptor, update local state only
      set({ 
        analyticsLoading: false,
        analyticsError: error.response?.data?.message || "Failed to fetch analytics"
      });
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
