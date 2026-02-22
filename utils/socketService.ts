
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    // Connect to the /score namespace
    const namespaceUrl = `${SOCKET_URL}/score`;
    console.log("Connecting to socket namespace:", namespaceUrl);
    
    this.socket = io(namespaceUrl, {
      transports: ["websocket"],
      // path: "/socket.io", // Default path is usually correct unless changed on server
    });

    this.socket.on("connect", () => {
      console.log("✅ WebSocket Connected to", SOCKET_URL);
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
    this.socket?.emit("subscribeToMatch", matchId);
  }

  unsubscribeFromMatch(matchId: string) {
    this.socket?.emit("unsubscribeFromMatch", matchId);
  }

  onScoreUpdate(callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on("scoreUpdate", callback);
  }

  offScoreUpdate() {
    this.socket?.off("scoreUpdate");
  }

  onSubscribed(callback: (data: any) => void) {
    this.socket?.on("subscribed", callback);
  }
}

export const socketService = new SocketService();
