
import { isMemberBenched } from "../utils/teamMemberUtils";
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
export type WicketType = "bowled" | "caught" | "lbw" | "run_out" | "stumped" | "hit_wicket";

export interface UpdateBallPayload {
  matchId: string;
  tournamentId: string;
  runs: number;
  deliveryType: DeliveryType;
  batsmanId: string;       // Current striker UUID
  bowlerId: string;
  currentOver: number;     // Completed overs count
  currentBall: number;     // 0–5, legal balls in current over
  wicketType?: WicketType;
  isFour?: boolean;
  isSix?: boolean;
  outBatsmanId?: string;   // Only for run_out (if non-striker dismissed)
  commentary?: string;
}

export interface SetPlayersPayload {
  matchId: string;
  tournamentId: string;
  strikerId: string;
  strikerName: string;
  nonStrikerId: string;
  nonStrikerName: string;
  bowlerId: string;
  bowlerName: string;
  maxOvers?: number;       // 1–50, defaults to 20
}

export interface ChangeBowlerPayload {
  matchId: string;
  tournamentId: string;
  bowlerId: string;
  bowlerName: string;
}

export interface SwapBatsmenPayload {
  matchId: string;
  tournamentId: string;
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
  balls: number;  // Legal balls bowled in current over
}

export interface InningsState {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  teamId: string;
}

export interface LastBall {
  runs: number;
  deliveryType: DeliveryType;
  wicketType: WicketType | null;
  batsmanId: string;
  bowlerId: string;
  outBatsmanId: string | null;
  commentary?: string;
  timestamp?: string;
  isLegalDelivery: boolean;
  strikerSwapped: boolean;
}

export interface MatchResult {
  winner: string;
  winnerTeamId: string;
  margin: string;
  status: string;
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
  totalOvers: number;    // e.g. 7.3 (for display)
  currentOver: number;   // integer completed overs
  currentBall: number;   // 0–5 legal balls in current over

  target: number | null;
  maxOvers: number;

  striker: PlayerScore;
  nonStriker: PlayerScore;
  currentBowler: BowlerScore;

  lastBalls: LastBall[];

  innings1: InningsState | null;
  innings2: InningsState | null;

  result: MatchResult | null;
  updatedAt?: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Endpoints                                 */
/* -------------------------------------------------------------------------- */

/**
 * Record a single ball delivery
 * POST /score/ball
 */
export const updateBallScore = async (
  payload: UpdateBallPayload,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.post("/score/ball", payload, withAuthHeaders(token));
  return res.data;
};

/**
 * Set current players (Striker, Non-Striker, Bowler)
 * Must call before first ball, after every wicket, and after innings change.
 * POST /score/set-players
 */
export const setCurrentPlayers = async (
  payload: SetPlayersPayload,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.post("/score/set-players", payload, withAuthHeaders(token));
  return res.data;
};

/**
 * Change bowler (required after each over ends)
 * POST /score/change-bowler
 */
export const changeBowler = async (
  payload: ChangeBowlerPayload,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.post("/score/change-bowler", payload, withAuthHeaders(token));
  return res.data;
};

/**
 * Manually swap striker ↔ non-striker
 * POST /score/swap-batsmen
 */
export const swapBatsmen = async (
  payload: SwapBatsmenPayload,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.post("/score/swap-batsmen", payload, withAuthHeaders(token));
  return res.data;
};

/**
 * Get current score state (Public)
 * GET /score/:matchId
 */
export const getMatchScore = async (
  matchId: string,
  token?: string | null
): Promise<MatchScoreState | null> => {
  try {
    const config = {
      ...(token ? withAuthHeaders(token) : {}),
      skipGlobalErrorHandler: true,
    };
    const res = await api.get(`/score/${matchId}`, config);
    if (res.data?.score === null) return null;
    return res.data;
  } catch {
    return null;
  }
};

/**
 * Get dismissed batsmen UUIDs (plain array)
 * GET /score/:matchId/dismissed
 */
export const getDismissedBatsmen = async (
  matchId: string,
  token?: string | null
): Promise<string[]> => {
  const config = token ? withAuthHeaders(token) : {};
  const res = await api.get(`/score/${matchId}/dismissed`, config);
  return res.data || [];
};

/**
 * Undo last ball — reverses stats, dismissed list, strike position
 * POST /score/reset-ball/:matchId
 */
export const resetLastBall = async (
  matchId: string,
  tournamentId: string,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.post(
    `/score/reset-ball/${matchId}`,
    { tournamentId },
    withAuthHeaders(token)
  );
  return res.data;
};

/**
 * Reset entire match score to initial state
 * POST /score/reset/:matchId
 */
export const resetMatchScore = async (
  matchId: string,
  tournamentId: string,
  token: string
): Promise<MatchScoreState> => {
  const res = await api.post(
    `/score/reset/${matchId}`,
    { tournamentId },
    withAuthHeaders(token)
  );
  return res.data;
};


/**
 * Get playing XI for both teams in a match.
 * Combines GET /matches/:id + GET /team/:teamId/members for both teams.
 * Filters out benched players.
 */
export const getPlayingXI = async (
  matchId: string,
  token?: string | null
) => {
  if (!token) throw new Error("No token provided");

  // 1. Get Match Details to find Team IDs
  const match = await getMatchById(matchId, token);
  if (!match) throw new Error("Match not found");

  // 2. Fetch Members for both teams in parallel
  const [membersA, membersB] = await Promise.all([
    getTeamMembers(match.teamAId, token),
    getTeamMembers(match.teamBId, token),
  ]);

  // 3. Map to expected structure, filtering out benched players
  const mapToPlayer = (m: any) => ({
    playerId: m.userId,
    playerName: m.fullName || m.email || "Unknown Player",
    role: m.role,
    isCaptain: m.role === "captain",
    isWicketKeeper: false,
    isBenched: isMemberBenched(m),
  });

  return {
    teamA: {
      teamId: match.teamAId,
      teamName: match.teamA?.name || "Team A",
      playingXI: membersA.map(mapToPlayer).filter((p) => !p.isBenched),
    },
    teamB: {
      teamId: match.teamBId,
      teamName: match.teamB?.name || "Team B",
      playingXI: membersB.map(mapToPlayer).filter((p) => !p.isBenched),
    },
  };
};
