
import { create } from "zustand";
import {
    getDismissedBatsmen,
    getMatchScore,
    MatchScoreState,
} from "../api/scoreApi";
import { InningsCompletePayload, MatchCompletePayload, ScoreEventType } from "../utils/socketService";

interface MatchStore {
  matchData: MatchScoreState | null;
  dismissedBatsmen: string[];           // UUIDs of dismissed players
  prevOver: number;                     // track over changes for over-end detection
  loading: boolean;
  error: string | null;

  // Actions
  fetchMatchData: (matchId: string, token?: string | null) => Promise<void>;
  fetchDismissedBatsmen: (matchId: string, token?: string | null) => Promise<void>;
  updateMatchData: (data: MatchScoreState) => void;
  handleSocketEvent: (
    type: ScoreEventType,
    data: MatchScoreState | InningsCompletePayload | MatchCompletePayload
  ) => void;
  resetMatchData: () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matchData: null,
  dismissedBatsmen: [],
  prevOver: 0,
  loading: false,
  error: null,

  fetchMatchData: async (matchId: string, token?: string | null) => {
    try {
      set({ loading: true, error: null });
      const data = await getMatchScore(matchId, token);
      if (data) {
        set({ matchData: data, prevOver: data.currentOver, loading: false });
      } else {
        set({ matchData: null, loading: false });
      }
    } catch (error: any) {
      console.error("[MatchStore] Error fetching match score:", error);
      set({ error: error.message || "Failed to load match score", loading: false });
    }
  },

  fetchDismissedBatsmen: async (matchId: string, token?: string | null) => {
    try {
      const dismissed = await getDismissedBatsmen(matchId, token);
      set({ dismissedBatsmen: dismissed });
    } catch (error: any) {
      console.error("[MatchStore] Error fetching dismissed batsmen:", error);
    }
  },

  updateMatchData: (data: MatchScoreState) => {
    const prev = get().matchData;
    set({
      matchData: data,
      prevOver: prev?.currentOver ?? data.currentOver,
    });
  },

  handleSocketEvent: (
    type: ScoreEventType,
    data: MatchScoreState | InningsCompletePayload | MatchCompletePayload
  ) => {
    const prevOver = get().matchData?.currentOver ?? 0;

    switch (type) {
      case "BALL_UPDATE":
      case "UNDO_BALL":
      case "PLAYERS_SET":
      case "BOWLER_CHANGED":
      case "BATSMEN_SWAPPED":
      case "SCORE_RESET":
        // All these return full MatchScoreState
        set({ matchData: data as MatchScoreState, prevOver });
        break;
      case "INNINGS_COMPLETE":
        // data = { innings, score, target } — re-fetch for full state
        break;
      case "MATCH_COMPLETE":
        // data = { winner, winnerTeamId, margin, status } — re-fetch for full state
        break;
      default:
        break;
    }
  },

  resetMatchData: () => {
    set({ matchData: null, dismissedBatsmen: [], prevOver: 0, error: null, loading: false });
  },
}));
