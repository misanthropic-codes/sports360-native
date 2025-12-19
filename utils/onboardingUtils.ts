import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'hasSeenOnboarding';

/**
 * Check if the user has completed onboarding
 * @returns Promise<boolean> - true if user has seen onboarding, false otherwise
 */
export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as complete
 * @returns Promise<void>
 */
export const setOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    console.log('Onboarding marked as complete');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
};

/**
 * Reset onboarding state (useful for testing)
 * @returns Promise<void>
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log('Onboarding state reset');
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
  }
};
