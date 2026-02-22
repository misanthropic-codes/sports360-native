

import api from "./api";
import { getTeamMembers } from "./teamApi";
import { getMatchById } from "./tournamentApi";

// Helper to add token to headers
const withAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type DeliveryType = "normal" | "wide" | "no_ball" | "bye" | "leg_bye" | "wicket";
export type WicketType = "bowled" | "caught" | "lbw" | "run_out" | "stumped" | "hit_wicket" | "retired_hurt" | "other";

export interface UpdateBallPayload {
  matchId: string;
  tournamentId: string;
  runs: number;
  deliveryType: DeliveryType;
  batsmanId: string;    // Striker
  bowlerId: string;
  currentOver: number;
  currentBall: number;  // 0-5 (or more if extras)
  wicketType?: WicketType;
  isFour?: boolean;
  isSix?: boolean;
  outBatsmanId?: string;
  commentary?: string;
}

export interface SetPlayersPayload {
  matchId: string;
  tournamentId: string;
  strikerId: string;
  strikerName?: string;
  nonStrikerId: string;
  nonStrikerName?: string;
  bowlerId: string;
  bowlerName?: string;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissalType?: string;
  bowlerName?: string;
}

export interface BowlerScore {
  playerId: string;
  playerName: string;
  overs: number;
  runs: number;
  wickets: number;
}

export interface InningsState {
  runs: number;
  wickets: number;
  overs: number;
  teamId: string;
}

export interface MatchScoreState {
  matchId: string;
  tournamentId: string;
  battingTeamId: string;
  bowlingTeamId: string;
  currentInnings: 1 | 2;
  innings1Complete: boolean;
  innings2Complete: boolean;
  matchComplete: boolean;
  
  totalRuns: number;
  totalWickets: number;
  totalOvers: number; // e.g. 7.3
  
  target?: number;
  maxOvers?: number;

  striker: PlayerScore;
  nonStriker: PlayerScore;
  currentBowler: BowlerScore;
  
  lastBalls: Array<{
    runs: number;
    deliveryType: DeliveryType;
    commentary?: string;
    timestamp?: string;
  }>;
  
  innings1?: InningsState;
  innings2?: InningsState;
  
  result?: {
    winner: string;
    winnerTeamId: string;
    margin: string;
    status: string;
  };
}

export interface DismissedBatsman {
    batsmanId: string;
    batsmanName: string;
    runs: number;
    balls: number;
    dismissalType: string;
    bowlerId: string;
    bowlerName: string;
    over: number;
    dismissedAt: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Endpoints                                 */
/* -------------------------------------------------------------------------- */

/**
 * Record a single ball delivery
 */
export const updateBallScore = async (
  payload: UpdateBallPayload, 
  token: string
): Promise<MatchScoreState> => {
  const res = await api.post(
    "/score/update-ball", 
    payload, 
    withAuthHeaders(token)
  );
  return res.data; // Assuming response structure matches MatchScoreState directly or is wrapped
};

/**
 * Set current players (Striker, Non-Striker, Bowler)
 */
export const setCurrentPlayers = async (
  payload: SetPlayersPayload,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.post(
    "/score/set-players",
    payload,
    withAuthHeaders(token)
  );
  return res.data;
};

/**
 * Get current score state (Public)
 */
export const getMatchScore = async (
  matchId: string,
  token?: string | null // Optional token, though endpoint is public
): Promise<MatchScoreState> => {
  const config = token ? withAuthHeaders(token) : {};
  const res = await api.get(`/score/${matchId}`, config);
  return res.data; 
};

/**
 * Get dismissed batsmen list
 */
export const getDismissedBatsmen = async (
  matchId: string,
  token?: string | null
): Promise<{ dismissedBatsmen: DismissedBatsman[] }> => {
  const config = token ? withAuthHeaders(token) : {};
  const res = await api.get(`/score/${matchId}/dismissed-batsmen`, config);
  return res.data;
};

/**
 * Reset last ball (Undo)
 */
export const resetLastBall = async (
  matchId: string,
  tournamentId: string,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.delete(
    `/score/reset-last-ball/${matchId}/${tournamentId}`,
    withAuthHeaders(token)
  );
  return res.data;
};

/**
 * Reset entire match score
 */
export const resetMatchScore = async (
  matchId: string,
  tournamentId: string,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.delete(
    `/score/reset-match/${matchId}/${tournamentId}`,
    withAuthHeaders(token)
  );
  return res.data;
};


/**
 * Get playing XI (or full squad) for both teams
 * Fallback implementation since detailed endpoint might not exist
 */
export const getPlayingXI = async (
  matchId: string,
  token?: string | null
) => {
   if (!token) throw new Error("No token provided");
   
   // 1. Get Match Details to find Team IDs
   const match = await getMatchById(matchId, token);
   if (!match) throw new Error("Match not found");

   // 2. Fetch Members for both teams
   const [membersA, membersB] = await Promise.all([
       getTeamMembers(match.teamAId, token),
       getTeamMembers(match.teamBId, token)
   ]);

   // 3. Map to expected structure
   const mapToPlayer = (m: any) => ({
       playerId: m.userId,
       playerName: m.fullName || m.email || "Unknown Player",
       role: m.role,
       isCaptain: m.role === 'captain',
       isWicketKeeper: false
   });

   return {
       teamA: {
           teamId: match.teamAId,
           teamName: match.teamA?.name || "Team A",
           playingXI: membersA.map(mapToPlayer)
       },
       teamB: {
           teamId: match.teamBId,
           teamName: match.teamB?.name || "Team B",
           playingXI: membersB.map(mapToPlayer)
       }
   };
}
