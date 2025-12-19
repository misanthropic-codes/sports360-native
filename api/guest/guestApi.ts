import api from '../api';

/**
 * Guest API Service
 * Handles all public endpoint calls for unauthenticated users
 */

// TEAMS
export const getAllTeams = async (params?: {
  sport?: string;
  location?: string;
  teamType?: string;
}) => {
  const response = await api.get('/public/teams', { params });
  return response.data;
};

export const getTeamById = async (id: string) => {
  const response = await api.get(`/public/teams/${id}`);
  return response.data;
};

export const getTeamDetails = async (id: string) => {
  const response = await api.get(`/public/teams/${id}/details`);
  return response.data;
};

// TOURNAMENTS
export const getAllTournaments = async (params?: {
  status?: 'upcoming' | 'ongoing' | 'completed';
}) => {
  const response = await api.get('/public/tournaments', { params });
  return response.data;
};

export const getTournamentById = async (id: string) => {
  const response = await api.get(`/public/tournaments/${id}`);
  return response.data;
};

export const getFeaturedTournaments = async () => {
  const response = await api.get('/public/tournaments/featured/upcoming');
  return response.data;
};

// GROUNDS
export const getAllGrounds = async (params?: {
  location?: string;
  groundType?: string;
}) => {
  const response = await api.get('/public/grounds', { params });
  return response.data;
};

export const getGroundById = async (id: string) => {
  const response = await api.get(`/public/grounds/${id}`);
  return response.data;
};

// STATISTICS
export const getPlatformStats = async () => {
  const response = await api.get('/public/stats');
  return response.data;
};
