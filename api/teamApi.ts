import api from "./api";

// ============================================
// INTERFACES
// ============================================

export interface Team {
  id: string;
  name: string;
  description: string;
  location: string;
  sport: string;
  teamType: string;
  teamSize: number;
  code: string;
  logoUrl: string;
  isActive?: boolean;
}

export interface CreateTeamPayload {
  name: string;
  description: string;
  location: string;
  sport: "cricket" | "marathon";
  teamType: string;
  teamSize: number;
  code: string;
  logoUrl?: string;
}

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
}

export interface TeamDetails {
  team: Team;
  players: TeamMember[];
  matches: any[];
  tournaments: any[];
}

export interface JoinRequest {
  userId: string;
  teamId: string;
  status: string;
  message?: string;
  requestedAt: string;
  name?: string;
}

export interface TournamentInvitation {
  tournament: {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    startDate: string;
    endDate: string;
    location: string;
    bannerImageUrl: string;
    teamSize: number;
    teamCount: number;
    prizePool: number;
    status: string;
    createdAt: string;
  };
  invitationDetails: {
    status: string;
    message: string | null;
    invitedAt: string;
    reviewedAt: string | null;
  };
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
// TEAM CRUD APIs
// ============================================

/**
 * Create Team
 * POST /team/create
 */
export const createTeam = async (
  data: CreateTeamPayload,
  token: string
): Promise<Team> => {
  const res = await api.post("/team/create", data, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * My Teams
 * GET /team/my-teams?sport=cricket
 */
export const getMyTeams = async (sport?: string, token?: string): Promise<Team[]> => {
  const params = sport ? { sport } : {};
  const res = await api.get("/team/my-teams", {
    params,
    ...withAuthHeaders(token || ""),
  });
  return res.data?.data || [];
};

/**
 * Team by ID
 * GET /team/:id
 */
export const getTeamById = async (id: string, token: string): Promise<Team> => {
  const res = await api.get(`/team/${id}`, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Team Details (players, matches, tournaments)
 * GET /team/:id/details
 */
export const getTeamDetails = async (
  id: string,
  token: string
): Promise<TeamDetails> => {
  const res = await api.get(`/team/${id}/details`, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Delete Team (captain)
 * DELETE /team/:id
 */
export const deleteTeam = async (id: string, token: string): Promise<any> => {
  const res = await api.delete(`/team/${id}`, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Browse Teams
 * GET /team/all?sport=cricket&search=mavericks
 */
export const getAllTeams = async (
  sport?: string,
  search?: string,
  token?: string
): Promise<Team[]> => {
  const params: any = {};
  if (sport) params.sport = sport;
  if (search) params.search = search;

  const res = await api.get("/team/all", {
    params,
    ...withAuthHeaders(token || ""),
  });
  return res.data?.data || [];
};

// ============================================
// TEAM MEMBER APIs
// ============================================

/**
 * Add Member (captain)
 * POST /team/:id/member
 */
export const addMember = async (
  teamId: string,
  data: any,
  token: string
): Promise<any> => {
  const res = await api.post(`/team/${teamId}/member`, data, withAuthHeaders(token));
  return res.data?.data || null;
};

/**
 * Remove Member (captain)
 * DELETE /team/:id/member/:memberId
 */
export const removeMember = async (
  teamId: string,
  memberId: string,
  token: string
): Promise<any> => {
  const res = await api.delete(
    `/team/${teamId}/member/${memberId}`,
    withAuthHeaders(token)
  );
  return res.data?.data || null;
};

/**
 * List Team Members
 * GET /team/:id/members
 */
export const getTeamMembers = async (
  teamId: string,
  token: string
): Promise<TeamMember[]> => {
  const res = await api.get(`/team/${teamId}/members`, withAuthHeaders(token));
  return res.data?.data || [];
};

// ============================================
// JOIN REQUEST APIs
// ============================================

/**
 * Request to Join a Team
 * POST /team/:id/request
 */
export const requestJoinTeam = async (
  teamId: string,
  message: string,
  token: string
): Promise<any> => {
  const res = await api.post(
    `/team/${teamId}/request`,
    { message },
    withAuthHeaders(token)
  );
  return res.data?.data || null;
};

/**
 * View Team Join Requests (captain)
 * GET /team/:id/join-requests?status=pending
 */
export const getJoinRequests = async (
  teamId: string,
  status?: string,
  token?: string
): Promise<JoinRequest[]> => {
  const params = status ? { status } : {};
  const res = await api.get(`/team/${teamId}/join-requests`, {
    params,
    ...withAuthHeaders(token || ""),
  });
  return res.data?.data || [];
};

/**
 * Approve Team Join Request (captain)
 * POST /team/:id/join-requests/:memberId/approve
 */
export const approveJoinRequest = async (
  teamId: string,
  memberId: string,
  token: string
): Promise<any> => {
  const res = await api.post(
    `/team/${teamId}/join-requests/${memberId}/approve`,
    {},
    withAuthHeaders(token)
  );
  return res.data?.data || null;
};

/**
 * Reject Team Join Request (captain)
 * POST /team/:id/join-requests/:memberId/reject
 */
export const rejectJoinRequest = async (
  teamId: string,
  memberId: string,
  token: string
): Promise<any> => {
  const res = await api.post(
    `/team/${teamId}/join-requests/${memberId}/reject`,
    {},
    withAuthHeaders(token)
  );
  return res.data?.data || null;
};

// ============================================
// TEAM ACTIVITY APIs
// ============================================

/**
 * Team Tournaments
 * GET /team/:id/tournaments
 */
export const getTeamTournaments = async (
  teamId: string,
  token: string
): Promise<any[]> => {
  const res = await api.get(`/team/${teamId}/tournaments`, withAuthHeaders(token));
  return res.data?.data?.tournaments || [];
};

/**
 * Team Matches
 * GET /team/:id/matches
 */
export const getTeamMatches = async (
  teamId: string,
  token: string
): Promise<any[]> => {
  const res = await api.get(`/team/${teamId}/matches`, withAuthHeaders(token));
  return res.data?.data?.matches || [];
};

/**
 * Players for a Match
 * GET /team/:teamId/matches/:matchId/players
 */
export const getMatchPlayers = async (
  teamId: string,
  matchId: string,
  token: string
): Promise<any> => {
  const res = await api.get(
    `/team/${teamId}/matches/${matchId}/players`,
    withAuthHeaders(token)
  );
  return res.data?.data || null;
};

// ============================================
// TOURNAMENT INVITATION APIs
// ============================================

/**
 * View Tournament Invitations (captain)
 * GET /team/:teamId/tournament-invitations?status=pending
 */
export const getTournamentInvitations = async (
  teamId: string,
  status?: string,
  token?: string
): Promise<TournamentInvitation[]> => {
  const res = await api.get(`/team/${teamId}/tournament-invitations`, {
    params: { status },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.data?.invitations || [];
};

/**
 * Respond to Tournament Invitation (captain)
 * PUT /team/:teamId/tournament-invitations/:tournamentId/respond
 */
export const respondToInvitation = async (
  teamId: string,
  tournamentId: string,
  action: "accept" | "reject",
  message?: string,
  token?: string
): Promise<any> => {
  const res = await api.put(
    `/team/${teamId}/tournament-invitations/${tournamentId}/respond`,
    { action, message },
    withAuthHeaders(token || "")
  );
  return res.data?.data || null;
};

export default {
  createTeam,
  getMyTeams,
  getTeamById,
  getTeamDetails,
  deleteTeam,
  getAllTeams,
  addMember,
  removeMember,
  getTeamMembers,
  requestJoinTeam,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getTeamTournaments,
  getTeamMatches,
  getMatchPlayers,
  getTournamentInvitations,
  respondToInvitation,
};
