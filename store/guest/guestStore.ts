import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import * as guestApi from '../../api/guest/guestApi';

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
  // Data
  teams: Team[];
  tournaments: Tournament[];
  grounds: Ground[];
  platformStats: PlatformStats | null;
  
  // Loading states
  loadingTeams: boolean;
  loadingTournaments: boolean;
  loadingGrounds: boolean;
  loadingStats: boolean;
  
  // Cache timestamps
  teamsCachedAt: number | null;
  tournamentsCachedAt: number | null;
  groundsCachedAt: number | null;
  statsCachedAt: number | null;
  
  // Actions
  fetchTeams: (params?: any, forceRefresh?: boolean) => Promise<void>;
  fetchTournaments: (params?: any, forceRefresh?: boolean) => Promise<void>;
  fetchGrounds: (params?: any, forceRefresh?: boolean) => Promise<void>;
  fetchPlatformStats: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => Promise<void>;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CACHE_KEYS = {
  TEAMS: 'guest_teams',
  TOURNAMENTS: 'guest_tournaments',
  GROUNDS: 'guest_grounds',
  STATS: 'guest_stats',
};

const isCacheValid = (cachedAt: number | null): boolean => {
  if (!cachedAt) return false;
  return Date.now() - cachedAt < CACHE_DURATION;
};

export const useGuestStore = create<GuestState>((set, get) => ({
  // Initial state
  teams: [],
  tournaments: [],
  grounds: [],
  platformStats: null,
  
  loadingTeams: false,
  loadingTournaments: false,
  loadingGrounds: false,
  loadingStats: false,
  
  teamsCachedAt: null,
  tournamentsCachedAt: null,
  groundsCachedAt: null,
  statsCachedAt: null,
  
  // Fetch teams with caching
  fetchTeams: async (params = {}, forceRefresh = false) => {
    const state = get();
    
    // Check cache validity
    if (!forceRefresh && isCacheValid(state.teamsCachedAt) && state.teams.length > 0) {
      console.log('📦 Using cached teams data');
      return;
    }
    
    set({ loadingTeams: true });
    try {
      const response = await guestApi.getAllTeams(params);
      const teams = response.data?.data || response.data || [];
      
      // Cache data
      await AsyncStorage.setItem(CACHE_KEYS.TEAMS, JSON.stringify(teams));
      
      set({
        teams,
        teamsCachedAt: Date.now(),
        loadingTeams: false,
      });
      
      console.log('✅ Teams fetched and cached:', teams.length);
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      
      // Try to load from cache on error
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.TEAMS);
      if (cachedData) {
        set({ teams: JSON.parse(cachedData) });
        console.log('📦 Loaded teams from cache on error');
      }
      
      set({ loadingTeams: false });
    }
  },
  
  // Fetch tournaments with caching
  fetchTournaments: async (params = {}, forceRefresh = false) => {
    const state = get();
    
    if (!forceRefresh && isCacheValid(state.tournamentsCachedAt) && state.tournaments.length > 0) {
      console.log('📦 Using cached tournaments data');
      return;
    }
    
    set({ loadingTournaments: true });
    try {
      const response = await guestApi.getAllTournaments(params);
      const tournaments = response.data?.data || response.data || [];
      
      await AsyncStorage.setItem(CACHE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
      
      set({
        tournaments,
        tournamentsCachedAt: Date.now(),
        loadingTournaments: false,
      });
      
      console.log('✅ Tournaments fetched and cached:', tournaments.length);
    } catch (error) {
      console.error('❌ Error fetching tournaments:', error);
      
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.TOURNAMENTS);
      if (cachedData) {
        set({ tournaments: JSON.parse(cachedData) });
        console.log('📦 Loaded tournaments from cache on error');
      }
      
      set({ loadingTournaments: false });
    }
  },
  
  // Fetch grounds with caching
  fetchGrounds: async (params = {}, forceRefresh = false) => {
    const state = get();
    
    if (!forceRefresh && isCacheValid(state.groundsCachedAt) && state.grounds.length > 0) {
      console.log('📦 Using cached grounds data');
      return;
    }
    
    set({ loadingGrounds: true });
    try {
      const response = await guestApi.getAllGrounds(params);
      const grounds = response.data?.data || response.data || [];
      
      await AsyncStorage.setItem(CACHE_KEYS.GROUNDS, JSON.stringify(grounds));
      
      set({
        grounds,
        groundsCachedAt: Date.now(),
        loadingGrounds: false,
      });
      
      console.log('✅ Grounds fetched and cached:', grounds.length);
    } catch (error) {
      console.error('❌ Error fetching grounds:', error);
      
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.GROUNDS);
      if (cachedData) {
        set({ grounds: JSON.parse(cachedData) });
        console.log('📦 Loaded grounds from cache on error');
      }
      
      set({ loadingGrounds: false });
    }
  },
  
  // Fetch platform stats with caching
  fetchPlatformStats: async (forceRefresh = false) => {
    const state = get();
    
    if (!forceRefresh && isCacheValid(state.statsCachedAt) && state.platformStats) {
      console.log('📦 Using cached stats data');
      return;
    }
    
    set({ loadingStats: true });
    try {
      const response = await guestApi.getPlatformStats();
      const stats = response.data?.data || response.data || {};
      
      await AsyncStorage.setItem(CACHE_KEYS.STATS, JSON.stringify(stats));
      
      set({
        platformStats: stats,
        statsCachedAt: Date.now(),
        loadingStats: false,
      });
      
      console.log('✅ Platform stats fetched and cached');
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.STATS);
      if (cachedData) {
        set({ platformStats: JSON.parse(cachedData) });
        console.log('📦 Loaded stats from cache on error');
      }
      
      set({ loadingStats: false });
    }
  },
  
  // Clear all cache
  clearCache: async () => {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEYS.TEAMS),
      AsyncStorage.removeItem(CACHE_KEYS.TOURNAMENTS),
      AsyncStorage.removeItem(CACHE_KEYS.GROUNDS),
      AsyncStorage.removeItem(CACHE_KEYS.STATS),
    ]);
    
    set({
      teams: [],
      tournaments: [],
      grounds: [],
      platformStats: null,
      teamsCachedAt: null,
      tournamentsCachedAt: null,
      groundsCachedAt: null,
      statsCachedAt: null,
    });
    
    console.log('🗑️ Guest cache cleared');
  },
}));
