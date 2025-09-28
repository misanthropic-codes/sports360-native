import api from "./api";

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
  teamA?: Team;
  teamB?: Team;
  ground?: Ground;
  startTime?: string;
  endTime?: string;
}

// Helper to add token to headers
const withAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// 🔹 Tournament APIs
export const getAllTournaments = async (token: string) => {
  const res = await api.get("/tournament/all", withAuthHeaders(token));
  return res.data?.data || [];
};

export const getTournamentById = async (id: string, token: string) => {
  const res = await api.get(`/tournament/get/${id}`, withAuthHeaders(token));
  return res.data?.data?.[0] || null;
};

export const getTeamsByTournament = async (
  id: string,
  token: string
): Promise<Team[]> => {
  const res = await api.get(
    `/tournament/get/${id}/teams`,
    withAuthHeaders(token)
  );
  return res.data;
};

export const getMyTeams = async (token: string): Promise<Team[]> => {
  const res = await api.get("/team/my-teams", withAuthHeaders(token));
  return res.data?.data || [];
};

export const deleteTournament = async (id: string, token: string) => {
  const res = await api.delete(
    `/tournament/delete/${id}`,
    withAuthHeaders(token)
  );
  return res.data;
};

export const joinTournament = async (
  id: string,
  teamId: string,
  message: string,
  token: string
) => {
  const body = { teamId, message };
  try {
    const res = await api.post(
      `/tournament/${id}/join`,
      body,
      withAuthHeaders(token)
    );
    return res.data;
  } catch (error: any) {
    console.error(
      "❌ [joinTournament] Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// 🔹 Ground API
export const getGrounds = async (token: string): Promise<Ground[]> => {
  const res = await api.get(
    "/ground-owner/all-grounds",
    withAuthHeaders(token)
  );
  return res.data?.data || [];
};

// 🔹 Matches API
export const generateFixtures = async (
  payload: GenerateFixturePayload,
  token: string
): Promise<Match[]> => {
  const res = await api.post(
    "/matches/generate-fixtures",
    payload,
    withAuthHeaders(token)
  );
  return res.data?.fixtures || [];
};

export const getMatchById = async (
  id: string,
  token: string
): Promise<Match | null> => {
  const res = await api.get(`/matches/${id}`, withAuthHeaders(token));
  return res.data?.match || null;
};
