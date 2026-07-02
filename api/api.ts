import axios from "axios";
import { getStoredAuthToken } from "../utils/authToken";
import { errorHandler } from "../utils/errorHandler";

// Extend axios config to include metadata for timing
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}

const BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - logs all outgoing API calls
api.interceptors.request.use(
  async (config) => {
    const token = await getStoredAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log API request details
    console.log("\n🚀 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      params: config.params,
      data: config.data,
      timestamp: new Date().toISOString(),
    });

    // Add timestamp to config for response timing
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - logs all API responses
api.interceptors.response.use(
  (response) => {
    const duration = response.config.metadata
      ? Date.now() - response.config.metadata.startTime
      : 0;

    // Log successful API response
    console.log("✅ API Response:", {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      fullURL: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return response;
  },
  (error) => {
    const duration = error.config?.metadata
      ? Date.now() - error.config.metadata.startTime
      : 0;

    // Log API error response
    console.error("❌ API Error Response:", {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : "Unknown",
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    // Check for network errors first (no response from server)
    if (!error.response) {
      // Network error (offline, timeout, connection refused, etc.)
      const isTimeout = error.code === 'ECONNABORTED';
      const isNetworkError = error.message?.toLowerCase().includes('network error');
      const isConnectionRefused = error.message?.toLowerCase().includes('connection refused');
      
      if (isTimeout || isNetworkError || isConnectionRefused) {
        console.warn("📡 Network error detected - triggering error modal");
        errorHandler.handleNetworkError(error.message);
        console.log("✅ Called errorHandler.handleNetworkError()");
        return Promise.reject(error);
      }
    }
    
    // Handle specific HTTP error codes
    const statusCode = error.response?.status;
    const requestUrl = error.config?.url;

    console.log("🔍 Checking error status code:", statusCode, "url:", requestUrl);

    if (statusCode === 401) {
      console.warn("🔒 Unauthorized response - leaving session intact:", requestUrl);
    } else if (statusCode && statusCode >= 500) {
      // Server errors (500+)
      console.warn(`🔥 Server error (${statusCode}) - triggering error modal`);
      const errorMessage = error.response?.data?.message || error.message;
      errorHandler.handleServerError(statusCode, errorMessage);
      console.log("✅ Called errorHandler.handleServerError()");
    }

    return Promise.reject(error);
  }
);

export default api;
