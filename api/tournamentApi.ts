// src/api/tournamentApi.ts
import axios from "axios";

const BASE_URL = "https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/tournament";
const GROUND_URL =
  "https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/ground-owner";
const MATCHES_URL = "https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/matches";

export interface Team {
  id: string;
  name: string;
  avatar?: string;
}

export interface Ground {
  id: string;
  name: string;
  location?: string;
}

export interface GenerateFixturePayload {
  tournamentId: string;
  tournamentFormat: "knockout" | "round-robin";
  teamIds: string[];
  groundId: string;
  startDate: string;
  matchDurationMinutes: number;
  restTimeBetweenMatches: number;
  randomizeTeams: boolean;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  teamAId: string;
  teamBId: string;
  playerAId?: string | null;
  playerBId?: string | null;
  winnerTeamId?: string | null;
  winnerPlayerId?: string | null;
  isBye: boolean;
  matchMode: string;
  groundId?: string | null;
  matchType: string;
  matchTime: string;
  status: string;
  scoreA?: number | null;
  scoreB?: number | null;
  result?: string | null;
  createdAt: string;
  updatedAt: string;
  // Additional fields for UI display (populated separately)
  teamA?: Team;
  teamB?: Team;
  ground?: Ground;
  startTime?: string;
  endTime?: string;
}

export const getTournamentById = async (id: string) => {
  const res = await axios.get(`${BASE_URL}/get/${id}`);
  return res.data?.data?.[0] || null;
};

// ✅ Fixed version: return res.data directly
export const getTeamsByTournament = async (id: string): Promise<Team[]> => {
  const res = await axios.get(`${BASE_URL}/get/${id}/teams`);
  return res.data;
};

export const getGrounds = async (): Promise<Ground[]> => {
  const res = await axios.get(`${GROUND_URL}/all-grounds`);
  return res.data?.data || [];
};

export const generateFixtures = async (
  payload: GenerateFixturePayload
): Promise<Match[]> => {
  const res = await axios.post(`${MATCHES_URL}/generate-fixtures`, payload);
  return res.data?.fixtures || [];
};

// Updated deleteTournament to send auth token in headers
export const deleteTournament = async (id: string, token: string) => {
  const res = await axios.delete(`${BASE_URL}/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
