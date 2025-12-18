/**
 * Centralized Color Scheme
 * 
 * This file contains all color definitions organized by user role.
 * Use these colors throughout the app for consistent theming.
 */

// Role-based color schemes
export const roleColors = {
  player: {
    primary: '#2563EB',      // Blue-600
    primaryLight: '#3B82F6', // Blue-500
    primaryDark: '#1D4ED8',  // Blue-700
    background: '#EFF6FF',   // Blue-50
    backgroundLight: '#DBEAFE', // Blue-100
    text: '#1E40AF',         // Blue-800
    accent: '#60A5FA',       // Blue-400
    border: '#BFDBFE',       // Blue-200
  },
  organizer: {
    primary: '#7C3AED',      // Purple-600
    primaryLight: '#8B5CF6', // Purple-500
    primaryDark: '#6D28D9',  // Purple-700
    background: '#F3E8FF',   // Purple-50
    backgroundLight: '#E9D5FF', // Purple-100
    text: '#5B21B6',         // Purple-800
    accent: '#A78BFA',       // Purple-400
    border: '#DDD6FE',       // Purple-200
  },
  ground_owner: {
    primary: '#15803d',      // Green-700
    primaryLight: '#16a34a', // Green-600
    primaryDark: '#166534',  // Green-800
    background: '#f0fdf4',   // Green-50
    backgroundLight: '#dcfce7', // Green-100
    text: '#14532d',         // Green-900
    accent: '#22c55e',       // Green-500
    border: '#bbf7d0',       // Green-200
  },
} as const;

// Common/shared colors (role-independent)
export const commonColors = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Gray scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic colors
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',
  
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',
} as const;

// Type for role names
export type Role = 'player' | 'organizer' | 'ground_owner';

/**
 * Get theme colors for a specific role
 * @param role - The user role ('player', 'organizer', or 'ground_owner')
 * @returns Combined role-specific and common colors
 */
export const getThemeColors = (role: Role) => {
  return {
    ...roleColors[role],
    ...commonColors,
  };
};

/**
 * Get just the role-specific colors
 * @param role - The user role
 * @returns Role-specific color palette
 */
export const getRoleColors = (role: Role) => {
  return roleColors[role];
};

// Export individual color palettes for direct import
export const playerColors = roleColors.player;
export const organizerColors = roleColors.organizer;
export const groundOwnerColors = roleColors.ground_owner;
