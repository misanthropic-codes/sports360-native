import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "../global.css";

/**
 * AuthScreen Component
 * This is the initial screen a user sees, prompting them to log in or sign up.
 * It's designed to be used with Expo Router for navigation.
 */
export default function AuthScreen() {
  // Expo Router's useRouter hook is used for navigation.
  // It's the recommended way to navigate in Expo Router apps.
  const router = useRouter();

  const handleLogin = () => {
    console.log("Log In button pressed");
    // Navigate to the login screen. Ensure you have a 'login.tsx' file
    // in your app directory structure. For example: app/login.tsx
    router.push("/(root)/login");
  };

  const handleSignUp = () => {
    console.log("Sign Up button pressed");

    router.push("/(root)/signup");
  };

  return (
    // Use SafeAreaView to avoid content from being obscured by notches or status bars.
    <SafeAreaView className="flex-1 bg-primary">
      {/* Set the status bar content to light to be visible on the blue background */}
      <StatusBar barStyle="light-content" />

      {/* Main container to center content vertically and horizontally */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo and Tagline Section */}
        <View className="items-center mb-20">
          <Text className="text-white font-rubikExtraBold text-5xl">
            Sports360
          </Text>
          <Text className="text-white font-rubikMedium text-lg mt-2">
            Your Team. Your Turf.
          </Text>
        </View>

        {/* Buttons Section */}
        <View className="w-full items-center">
          {/* Log In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-white w-full max-w-xs py-4 rounded-full items-center justify-center shadow-lg mb-5"
            activeOpacity={0.8}
          >
            <Text className="text-primary font-rubikSemiBold text-base">
              Log In
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="border-2 border-white w-full max-w-xs py-4 rounded-full items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-rubikSemiBold text-base">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
