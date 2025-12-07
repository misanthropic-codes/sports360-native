import api from "./api";

// ============================================
// INTERFACES
// ============================================

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  domains: string[];
  role?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CricketProfile {
  id: string;
  playingPosition: "batsman" | "bowler" | "wicket_keeper" | "allrounder";
  bowlingStyle?: "right_arm_fast" | "right_arm_medium" | "right_arm_spin" | "left_arm_fast" | "left_arm_spin" | "left_arm_medium";
  battingStyle: "right_handed" | "left_handed";
  experienceLevel: "beginner" | "intermediate" | "professional";
  location: string;
  bio?: string;
  availableForTeamSelection: boolean;
  availableForCaptain: boolean;
  receiveTournamentNotifications: boolean;
  batsmanType?: string;
}

export interface MarathonProfile {
  id: string;
  runnerType: "5K" | "10K" | "HALF_MARATHON" | "FULL_MARATHON" | "ULTRA_MARATHON";
  experienceLevel: "beginner" | "intermediate" | "professional";
  runningStyle: "FOREFOOT" | "MIDFOOT" | "REARFOOT";
  bestTime?: string;
  preferredDistance: string;
  location: string;
  bio?: string;
  availableForTeamSelection: boolean;
  availableForCaptain: boolean;
  receiveTournamentNotifications: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  status: string;
  sport?: string;
  startDate?: string;
  endDate?: string;
}

export interface Match {
  matchId: string;
  matchTime: string;
  status: string;
  teamAId?: string;
  teamBId?: string;
  scoreA?: number;
  scoreB?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface PlayerAnalytics {
  matches: number;
  tournaments: number;
  winRate: number;
  totalWins?: number;
  totalLosses?: number;
  goalsScored?: number;
  assists?: number;
}

// ============================================
// HELPER
// ============================================

const withAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ============================================
// PROFILE APIs
// ============================================

/**
 * Get user profile
 * GET /user/profile
 */
export const getUserProfile = async (token: string): Promise<UserProfile> => {
  const res = await api.get("/user/profile", withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Create/Update Cricket Profile
 * POST /user/cricket-profile
 */
export const createCricketProfile = async (
  data: Partial<CricketProfile>,
  token: string
): Promise<CricketProfile> => {
  const res = await api.post("/user/cricket-profile", data, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Create/Update Marathon Profile
 * POST /user/marathon-profile
 */
export const createMarathonProfile = async (
  data: Partial<MarathonProfile>,
  token: string
): Promise<MarathonProfile> => {
  const res = await api.post("/user/marathon-profile", data, withAuthHeaders(token));
  return res.data?.data || null;
};

// ============================================
// HISTORY & ANALYTICS APIs
// ============================================

/**
 * Get My Tournaments
 * GET /user/tournaments?sport=cricket&status=completed
 */
export const getUserTournaments = async (
  sport?: string,
  status?: string,
  token?: string
): Promise<Tournament[]> => {
  const params: any = {};
  if (sport) params.sport = sport;
  if (status) params.status = status;

  const res = await api.get("/user/tournaments", {
    params,
    ...withAuthHeaders(token || ""),
  });
  return res.data?.data || [];
};

/**
 * Get Matches for a Tournament
 * GET /user/tournaments/:tournamentId/matches
 */
export const getTournamentMatches = async (
  tournamentId: string,
  token: string
): Promise<Match[]> => {
  const res = await api.get(
    `/user/tournaments/${tournamentId}/matches`,
    withAuthHeaders(token)
  );
  return res.data?.data || [];
};

/**
 * Get Team Members for a Match
 * GET /user/matches/:matchId/team
 */
export const getMatchTeam = async (
  matchId: string,
  token: string
): Promise<TeamMember[]> => {
  const res = await api.get(`/user/matches/${matchId}/team`, withAuthHeaders(token));
  return res.data?.data || [];
};

/**
 * Player Analytics
 * GET /user/analytics?analyticsType=overall&startDate=2025-01-01&endDate=2025-12-31
 */
export const getPlayerAnalytics = async (
  analyticsType: string = "overall",
  startDate?: string,
  endDate?: string,
  token?: string
): Promise<PlayerAnalytics> => {
  const params: any = { analyticsType };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const res = await api.get("/user/analytics", {
    params,
    ...withAuthHeaders(token || ""),
  });
  return res.data?.data || {};
};

export default {
  getUserProfile,
  createCricketProfile,
  createMarathonProfile,
  getUserTournaments,
  getTournamentMatches,
  getMatchTeam,
  getPlayerAnalytics,
};
