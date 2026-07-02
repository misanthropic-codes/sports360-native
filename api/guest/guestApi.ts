import api from '../api';

const silentRequest = { skipGlobalErrorHandler: true as const };

/**
 * Guest API Service
 * Handles all public endpoint calls for unauthenticated users.
 * Uses silentRequest so failures are handled locally, not via global modals.
 */

// TEAMS
export const getAllTeams = async (params?: {
  sport?: string;
  location?: string;
  teamType?: string;
}) => {
  const response = await api.get('/public/teams', { params, ...silentRequest });
  return response.data;
};

export const getTeamById = async (id: string) => {
  const response = await api.get(`/public/teams/${id}`, silentRequest);
  return response.data;
};

export const getTeamDetails = async (id: string) => {
  const response = await api.get(`/public/teams/${id}/details`, silentRequest);
  return response.data;
};

// TOURNAMENTS
export const getAllTournaments = async (params?: {
  status?: 'upcoming' | 'ongoing' | 'completed';
}) => {
  const response = await api.get('/public/tournaments', { params, ...silentRequest });
  return response.data;
};

export const getTournamentById = async (id: string) => {
  const response = await api.get(`/public/tournaments/${id}`, silentRequest);
  return response.data;
};

export const getFeaturedTournaments = async () => {
  const response = await api.get('/public/tournaments/featured/upcoming', silentRequest);
  return response.data;
};

// GROUNDS
export const getAllGrounds = async (params?: {
  location?: string;
  groundType?: string;
}) => {
  const response = await api.get('/public/grounds', { params, ...silentRequest });
  return response.data;
};

export const getGroundById = async (id: string) => {
  const response = await api.get(`/public/grounds/${id}`, silentRequest);
  return response.data;
};

// STATISTICS
export const getPlatformStats = async () => {
  const response = await api.get('/public/stats', silentRequest);
  return response.data;
};

// MATCHES
/**
 * Get all live (ongoing) matches — public, no auth required
 * GET /matches/live
 * Returns empty array on failure so dashboards can render without blocking.
 */
export const getLiveMatches = async () => {
  try {
    const response = await api.get('/matches/live', silentRequest);
    return response.data?.matches || [];
  } catch (error) {
    console.warn('[guestApi] Failed to load live matches:', error);
    return [];
  }
};
