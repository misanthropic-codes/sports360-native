import api from "./api"; // Axios instance with token interceptor

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
}

export interface JoinRequest {
  teamId: string;
  tournamentId: string;
  status: string;
  message: string;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  team: Team;
}

// 🔹 Fetch join requests for a tournament
export const fetchJoinRequests = async (tournamentId: string) => {
  const res = await api.get(`/tournament/${tournamentId}/join-requests`);
  return res.data?.data || [];
};

// 🔹 Accept / Reject join request
export const reviewJoinRequest = async (
  tournamentId: string,
  teamId: string,
  action: "accept" | "reject"
) => {
  const status = action === "accept" ? "approved" : "rejected";
  const res = await api.put(
    `/tournament/${tournamentId}/join-requests/${teamId}/review`,
    { status }
  );
  return res.data;
};
