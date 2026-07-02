import axios from "axios";
import { create } from "zustand";
import { API_BASE_URL } from "../config/apiConfig";

const BASE_URL = API_BASE_URL;

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
  playerStatus?: string;
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
  message?: string;
  fullName?: string;
  name?: string;
}

function extractNameFromMessage(message?: string): string | undefined {
  if (!message) return undefined;
  const match = message.match(/I am ([^.]+)\./i);
  return match?.[1]?.trim();
}

function normalizeJoinRequest(raw: any): JoinRequest {
  const fullName =
    raw.fullName?.trim() ||
    raw.name?.trim() ||
    extractNameFromMessage(raw.message);

  return {
    userId: raw.userId,
    teamId: raw.teamId,
    status: raw.status,
    requestedAt: raw.requestedAt,
    message: raw.message,
    fullName,
    name: fullName,
  };
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
  teamData: Record<string, TeamDetailsCache>;
  loading: Record<string, boolean>;
  joinRequestsLoading: Record<string, boolean>;
  
  // Fetch functions  with smart caching
  fetchTeamMembers: (teamId: string, token: string, forceRefresh?: boolean) => Promise<void>;
  fetchTeamTournaments: (teamId: string, token: string, forceRefresh?: boolean) => Promise<void>;
  fetchTeamMatches: (teamId: string, token: string, forceRefresh?: boolean) => Promise<void>;
  fetchJoinRequests: (teamId: string, token: string, silent?: boolean) => Promise<void>;
  
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
  joinRequestsLoading: {},
  
  // Fetch team members with smart caching
  fetchTeamMembers: async (teamId: string, token: string, _forceRefresh = false) => {
    try {
      set((state) => ({
        loading: { ...state.loading, [teamId]: true },
      }));
      
      console.log("[TeamDetailsStore] Fetching members - teamId:", teamId);
      
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
  fetchTeamTournaments: async (teamId: string, token: string, _forceRefresh = false) => {
    try {
      set((state) => ({
        loading: { ...state.loading, [teamId]: true },
      }));
      
      console.log("[TeamDetailsStore] Fetching tournaments - teamId:", teamId);
      
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
  fetchTeamMatches: async (teamId: string, token: string, _forceRefresh = false) => {
    try {
      set((state) => ({
        loading: { ...state.loading, [teamId]: true },
      }));
      
      console.log("[TeamDetailsStore] Fetching matches - teamId:", teamId);
      
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
  fetchJoinRequests: async (teamId: string, token: string, silent = false) => {
    try {
      if (!silent) {
        set((state) => ({
          joinRequestsLoading: { ...state.joinRequestsLoading, [teamId]: true },
        }));
      }

      const response = await axios.get(`${BASE_URL}/team/${teamId}/join-requests`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: "pending" },
      });
      const json = response.data;

      if (json.success) {
        const requestsData: JoinRequest[] = (json.data || []).map(normalizeJoinRequest);

        set((state) => ({
          teamData: {
            ...state.teamData,
            [teamId]: {
              ...(state.teamData[teamId] || getInitialTeamCache()),
              joinRequests: requestsData,
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
        joinRequestsLoading: { ...state.joinRequestsLoading, [teamId]: false },
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
              m.userId === userId
                ? {
                    ...m,
                    isBenched,
                    playerStatus: isBenched ? "benched" : "active",
                  }
                : m
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
    set((state) => {
      const newTeamData = { ...state.teamData };
      delete newTeamData[teamId];
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
