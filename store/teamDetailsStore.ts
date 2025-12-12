import axios from "axios";
import { create } from "zustand";

const BASE_URL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Types
export interface TeamMember {
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  isActive: boolean;
  addedAt: string;
  addedBy: string;
  updatedAt: string;
  updatedBy: string;
  removedAt: string | null;
  removedBy: string | null;
  fullName: string;
  email: string;
  profilePicUrl: string | null;
  playingPosition: string;
  battingStyle: string;
  bowlingStyle: string;
  batsmanType: string | null;
  isBenched?: boolean;
}

export interface TeamTournament {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bannerImageUrl?: string;
  teamSize?: number;
  teamCount?: number;
  prizePool?: number;
  status?: string;
}

export interface TeamMatch {
  id: string;
  tournamentName: string;
  matchType: string;
  teamAName?: string;
  teamBName?: string;
  opponentTeamName?: string;
  matchTime: string;
  status: string;
  scoreA?: string;
  scoreB?: string;
  result?: string | null;
}

export interface JoinRequest {
  userId: string;
  teamId: string;
  status: string;
  requestedAt: string;
  name?: string;
}

interface TeamDetailsCache {
  members: TeamMember[];
  tournaments: TeamTournament[];
  matches: TeamMatch[];
  joinRequests: JoinRequest[];
  membersLoaded: boolean;
  tournamentsLoaded: boolean;
  matchesLoaded: boolean;
  joinRequestsLoaded: boolean;
  lastFetched: number | null;
}

interface TeamDetailsStore {
  // Cache for each team (keyed by teamId)
  teamData: Record<string, TeamDetailsCache>;
  loading: Record<string, boolean>;
  
  // Fetch functions  with smart caching
  fetchTeamMembers: (teamId: string, token: string, forceRefresh?: boolean) => Promise<void>;
  fetchTeamTournaments: (teamId: string, token: string, forceRefresh?: boolean) => Promise<void>;
  fetchTeamMatches: (teamId: string, token: string, forceRefresh?: boolean) => Promise<void>;
  fetchJoinRequests: (teamId: string, token: string, forceRefresh?: boolean) => Promise<void>;
  
  // Update local state after mutations
  updateMemberBenchStatus: (teamId: string, userId: string, isBenched: boolean) => void;
  removeJoinRequest: (teamId: string, userId: string) => void;
  
  // Cache management
  invalidateTeamCache: (teamId: string) => void;
  invalidateAllCache: () => void;
  
  // Getters
  getTeamMembers: (teamId: string) => TeamMember[];
  getTeamTournaments: (teamId: string) => TeamTournament[];
  getTeamMatches: (teamId: string) => TeamMatch[];
  getJoinRequests: (teamId: string) => JoinRequest[];
}

const getInitialTeamCache = (): TeamDetailsCache => ({
  members: [],
  tournaments: [],
  matches: [],
  joinRequests: [],
  membersLoaded: false,
  tournamentsLoaded: false,
  matchesLoaded: false,
  joinRequestsLoaded: false,
  lastFetched: null,
});

export const useTeamDetailsStore = create<TeamDetailsStore>((set, get) => ({
  teamData: {},
  loading: {},
  
  // Fetch team members with smart caching
  fetchTeamMembers: async (teamId: string, token: string, forceRefresh = false) => {
    const state = get();
    const cache = state.teamData[teamId] || getInitialTeamCache();
    
    // Check if we should skip fetching
    if (!forceRefresh && cache.membersLoaded) {
      if (cache.lastFetched && Date.now() - cache.lastFetched < CACHE_TTL) {
        console.log("[TeamDetailsStore] Using cached members for team:", teamId);
        return;
      }
    }
    
    try {
      set((state) => ({
        loading: { ...state.loading, [teamId]: true },
      }));
      
      console.log("[TeamDetailsStore] Fetching members - teamId:", teamId, "forceRefresh:", forceRefresh);
      
      const response = await axios.get(`${BASE_URL}/team/${teamId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data?.success) {
        set((state) => ({
          teamData: {
            ...state.teamData,
            [teamId]: {
              ...(state.teamData[teamId] || getInitialTeamCache()),
              members: response.data.data,
              membersLoaded: true,
              lastFetched: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("[TeamDetailsStore] Error fetching members:", error);
    } finally {
      set((state) => ({
        loading: { ...state.loading, [teamId]: false },
      }));
    }
  },
  
  // Fetch team tournaments with smart caching
  fetchTeamTournaments: async (teamId: string, token: string, forceRefresh = false) => {
    const state = get();
    const cache = state.teamData[teamId] || getInitialTeamCache();
    
    if (!forceRefresh && cache.tournamentsLoaded) {
      if (cache.lastFetched && Date.now() - cache.lastFetched < CACHE_TTL) {
        console.log("[TeamDetailsStore] Using cached tournaments for team:", teamId);
        return;
      }
    }
    
    try {
      set((state) => ({
        loading: { ...state.loading, [teamId]: true },
      }));
      
      console.log("[TeamDetailsStore] Fetching tournaments - teamId:", teamId, "forceRefresh:", forceRefresh);
      
      const response = await axios.get(`${BASE_URL}/team/${teamId}/tournaments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data?.success) {
        const tournaments = response.data.data.tournaments.map((item: any) => item.tournament);
        
        set((state) => ({
          teamData: {
            ...state.teamData,
            [teamId]: {
              ...(state.teamData[teamId] || getInitialTeamCache()),
              tournaments,
              tournamentsLoaded: true,
              lastFetched: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("[TeamDetailsStore] Error fetching tournaments:", error);
    } finally {
      set((state) => ({
        loading: { ...state.loading, [teamId]: false },
      }));
    }
  },
  
  // Fetch team matches with smart caching
  fetchTeamMatches: async (teamId: string, token: string, forceRefresh = false) => {
    const state = get();
    const cache = state.teamData[teamId] || getInitialTeamCache();
    
    if (!forceRefresh && cache.matchesLoaded) {
      if (cache.lastFetched && Date.now() - cache.lastFetched < CACHE_TTL) {
        console.log("[TeamDetailsStore] Using cached matches for team:", teamId);
        return;
      }
    }
    
    try {
      set((state) => ({
        loading: { ...state.loading, [teamId]: true },
      }));
      
      console.log("[TeamDetailsStore] Fetching matches - teamId:", teamId, "forceRefresh:", forceRefresh);
      
      const response = await axios.get(`${BASE_URL}/team/${teamId}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data?.success) {
        const matches = response.data.data.matches;
        
        set((state) => ({
          teamData: {
            ...state.teamData,
            [teamId]: {
              ...(state.teamData[teamId] || getInitialTeamCache()),
              matches,
              matchesLoaded: true,
              lastFetched: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("[TeamDetailsStore] Error fetching matches:", error);
    } finally {
      set((state) => ({
        loading: { ...state.loading, [teamId]: false },
      }));
    }
  },
  
  // Fetch join requests with smart caching
  fetchJoinRequests: async (teamId: string, token: string, forceRefresh = false) => {
    const state = get();
    const cache = state.teamData[teamId] || getInitialTeamCache();
    
    if (!forceRefresh && cache.joinRequestsLoaded) {
      if (cache.lastFetched && Date.now() - cache.lastFetched < CACHE_TTL) {
        console.log("[TeamDetailsStore] Using cached join requests for team:", teamId);
        return;
      }
    }
    
    try {
      set((state) => ({
        loading: { ...state.loading, [teamId]: true },
      }));
      
      console.log("[TeamDetailsStore] Fetching join requests - teamId:", teamId, "forceRefresh:", forceRefresh);
      
      const response = await axios.get(`${BASE_URL}/team/${teamId}/join-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = response.data;
      
      if (json.success) {
        const requestsData: JoinRequest[] = json.data;
        
        // Fetch user names for each request
        const requestsWithNames = await Promise.all(
          requestsData.map(async (req) => {
            try {
              const userRes = await axios.get(`${BASE_URL}/user/${req.userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const userJson = userRes.data;
              return {
                ...req,
                name: userJson.data?.name?.trim() || `User ${req.userId.slice(0, 5)}`,
              };
            } catch {
              return { ...req, name: `User ${req.userId.slice(0, 5)}` };
            }
          })
        );
        
        set((state) => ({
          teamData: {
            ...state.teamData,
            [teamId]: {
              ...(state.teamData[teamId] || getInitialTeamCache()),
              joinRequests: requestsWithNames,
              joinRequestsLoaded: true,
              lastFetched: Date.now(),
            },
          },
        }));
      }
    } catch (error) {
      console.error("[TeamDetailsStore] Error fetching join requests:", error);
    } finally {
      set((state) => ({
        loading: { ...state.loading, [teamId]: false },
      }));
    }
  },
  
  // Update member bench status locally (optimistic update)
  updateMemberBenchStatus: (teamId: string, userId: string, isBenched: boolean) => {
    set((state) => {
      const cache = state.teamData[teamId];
      if (!cache) return state;
      
      return {
        teamData: {
          ...state.teamData,
          [teamId]: {
            ...cache,
            members: cache.members.map((m) =>
              m.userId === userId ? { ...m, isBenched } : m
            ),
          },
        },
      };
    });
  },
  
  // Remove join request after approval/decline
  removeJoinRequest: (teamId: string, userId: string) => {
    set((state) => {
      const cache = state.teamData[teamId];
      if (!cache) return state;
      
      return {
        teamData: {
          ...state.teamData,
          [teamId]: {
            ...cache,
            joinRequests: cache.joinRequests.filter((r) => r.userId !== userId),
          },
        },
      };
    });
  },
  
  // Invalidate cache for specific team
  invalidateTeamCache: (teamId: string) => {
    console.log("[TeamDetailsStore] Invalidating cache for team:", teamId);
    set((state) => {
      const newTeamData = { ...state.teamData };
      if (newTeamData[teamId]) {
        newTeamData[teamId] = {
          ...newTeamData[teamId],
          membersLoaded: false,
          tournamentsLoaded: false,
          matchesLoaded: false,
          joinRequestsLoaded: false,
          lastFetched: null,
        };
      }
      return { teamData: newTeamData };
    });
  },
  
  // Invalidate all team caches
  invalidateAllCache: () => {
    console.log("[TeamDetailsStore] Invalidating all team caches");
    set({ teamData: {} });
  },
  
  // Getters
  getTeamMembers: (teamId: string) => {
    return get().teamData[teamId]?.members || [];
  },
  
  getTeamTournaments: (teamId: string) => {
    return get().teamData[teamId]?.tournaments || [];
  },
  
  getTeamMatches: (teamId: string) => {
    return get().teamData[teamId]?.matches || [];
  },
  
  getJoinRequests: (teamId: string) => {
    return get().teamData[teamId]?.joinRequests || [];
  },
}));
