// services/tournamentApi.ts
import axios from "axios";

const BASE_URL = "https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/tournament";

export const getTournamentById = async (id: string) => {
  const res = await axios.get(`${BASE_URL}/get/${id}`);
  return res.data?.data?.[0] || null;
};

export const getTeamsByTournament = async (id: string) => {
  const res = await axios.get(`${BASE_URL}/get/${id}/teams`);
  return res.data;
};

export const deleteTournament = async (id: string, token: string) => {
  const res = await axios.delete(`${BASE_URL}/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
