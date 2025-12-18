import { getRoleColors, getThemeColors, Role } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to get theme colors based on current user's role
 * @returns Theme colors object with role-specific and common colors
 */
export const useThemeColors = () => {
  const { user } = useAuth();
  const role = (user?.role?.toLowerCase() || 'player') as Role;
  
  return getThemeColors(role);
};

/**
 * Custom hook to get only role-specific colors
 * @returns Role-specific color palette
 */
export const useRoleColors = () => {
  const { user } = useAuth();
  const role = (user?.role?.toLowerCase() || 'player') as Role;
  
  return getRoleColors(role);
};
