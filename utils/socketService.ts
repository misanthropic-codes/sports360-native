
import { MatchScoreState } from "@/api/scoreApi";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:8080";

export type ScoreEventType =
  | "BALL_UPDATE"
  | "UNDO_BALL"
  | "PLAYERS_SET"
  | "BOWLER_CHANGED"
  | "BATSMEN_SWAPPED"
  | "SCORE_RESET"
  | "INNINGS_COMPLETE"
  | "MATCH_COMPLETE";

export interface InningsCompletePayload {
  innings: 1 | 2;
  score: { runs: number; wickets: number };
  target: number;
}

export interface MatchCompletePayload {
  winner: string;
  winnerTeamId: string;
  margin: string;
  status: string;
}

export interface ScoreUpdateEvent {
  type: ScoreEventType;
  data: MatchScoreState | InningsCompletePayload | MatchCompletePayload;
}

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const namespaceUrl = `${SOCKET_URL}/score`;
    console.log("Connecting to socket namespace:", namespaceUrl);

    this.socket = io(namespaceUrl, {
      transports: ["websocket", "polling"], // fallback to polling if WS fails
    });

    this.socket.on("connect", () => {
      console.log("✅ WebSocket Connected to", namespaceUrl);
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ WebSocket Connection Error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("⚠️ WebSocket Disconnected:", reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToMatch(matchId: string) {
    if (!this.socket) this.connect();
    // API spec: emit { matchId } object, not bare string
    this.socket?.emit("subscribeToMatch", { matchId });
  }

  unsubscribeFromMatch(matchId: string) {
    // API spec: emit { matchId } object, not bare string
    this.socket?.emit("unsubscribeFromMatch", { matchId });
  }

  /**
   * Listen for all scoreUpdate events. Callback receives raw payload.
   */
  onScoreUpdate(callback: (payload: ScoreUpdateEvent) => void) {
    if (!this.socket) this.connect();
    this.socket?.on("scoreUpdate", callback);
  }

  offScoreUpdate() {
    this.socket?.off("scoreUpdate");
  }

  /**
   * Convenience: subscribe to a specific event type only.
   */
  onMatchEvent(
    type: ScoreEventType,
    callback: (data: ScoreUpdateEvent["data"]) => void
  ) {
    if (!this.socket) this.connect();
    this.socket?.on("scoreUpdate", (payload: ScoreUpdateEvent) => {
      if (payload.type === type) {
        callback(payload.data);
      }
    });
  }

  onSubscribed(callback: (data: any) => void) {
    this.socket?.on("subscribed", callback);
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
