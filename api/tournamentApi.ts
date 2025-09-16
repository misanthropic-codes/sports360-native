// api/tournamentApi.ts
import axios from "axios";

// Define the response type
export interface TournamentApiResponse {
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
}

// Base API URL
const BASE_URL = "https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/tournament";

// --------------------
// API CALLS
// --------------------

export const getTournamentById = async (
  id: string
): Promise<TournamentApiResponse | null> => {
  try {
    const res = await axios.get(`${BASE_URL}/get/${id}`);
    if (res.data?.data?.[0]) {
      return res.data.data[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return null;
  }
};

export const getTeamsByTournament = async (id: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/${id}/teams`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};
