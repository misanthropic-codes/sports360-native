// utils/errorHandler.ts
// Event emitter for handling API errors globally

export type ErrorType = "SESSION_EXPIRED" | "SERVER_ERROR" | "NETWORK_ERROR";

export interface ApiErrorEvent {
  type: ErrorType;
  message: string;
  statusCode?: number;
}

type ErrorListener = (event: ApiErrorEvent) => void;

class ErrorHandler {
  private listeners: ErrorListener[] = [];

  /**
   * Subscribe to error events
   */
  subscribe(listener: ErrorListener): () => void {
    console.log("➕ New listener subscribed");
    this.listeners.push(listener);
    console.log(`   Total listeners: ${this.listeners.length}`);
    
    // Return unsubscribe function
    return () => {
      console.log("➖ Listener unsubscribed");
      this.listeners = this.listeners.filter((l) => l !== listener);
      console.log(`   Total listeners: ${this.listeners.length}`);
    };
  }

  /**
   * Emit an error event to all subscribers
   */
  emit(event: ApiErrorEvent): void {
    console.log(`📡 errorHandler.emit() called with:`, event);
    console.log(`👥 Number of listeners: ${this.listeners.length}`);
    
    this.listeners.forEach((listener, index) => {
      try {
        console.log(`   Calling listener ${index + 1}...`);
        listener(event);
      } catch (error) {
        console.error("Error in error listener:", error);
      }
    });
  }

  /**
   * Handle 401 errors (session expired)
   */
  handleSessionExpired(): void {
    this.emit({
      type: "SESSION_EXPIRED",
      message: "Your session has expired. Please login again to continue.",
      statusCode: 401,
    });
  }

  /**
   * Handle 500+ errors (server errors)
   */
  handleServerError(statusCode: number, message?: string): void {
    this.emit({
      type: "SERVER_ERROR",
      message: message || "Server error occurred. Please try again later.",
      statusCode,
    });
  }

  /**
   * Handle network errors (offline, timeout, connection issues)
   */
  handleNetworkError(message?: string): void {
    this.emit({
      type: "NETWORK_ERROR",
      message: message || "Network connection failed. Please check your internet connection and try again.",
    });
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
