import React from 'react';
import WelcomeScreen from '../../components/onboarding/WelcomeScreen';
import '../global.css';

/**
 * Initial Auth Screen
 * This is the main entry screen that shows the welcome screen with
 * Sign Up, Log In, and Continue as Guest options.
 */
export default function AuthScreen() {
  return <WelcomeScreen />;
}
