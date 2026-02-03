/**
 * Centralized API Configuration
 * 
 * This file exports the base URL for all API calls.
 * The URL is read from the .env file (EXPO_PUBLIC_BASE_URL).
 * 
 * To change the API endpoint, update the .env file and restart the dev server.
 */

// Base URL from environment variable
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000';

// Full API base URL with /api/v1 prefix
export const API_BASE_URL = `${BASE_URL}/api/v1`;

// Export base URL without /api/v1 prefix for special cases
export const BASE_URL_WITHOUT_API = BASE_URL;
