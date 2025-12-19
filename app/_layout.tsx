import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import ErrorModal from "../components/ErrorModal";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ApiErrorEvent, errorHandler } from "../utils/errorHandler";
import { hasSeenOnboarding } from "../utils/onboardingUtils";
import "./global.css";

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user, logout } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [errorEvent, setErrorEvent] = useState<ApiErrorEvent | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      const hasCompleted = await hasSeenOnboarding();
      setIsCheckingOnboarding(false);

      // If user hasn't seen onboarding and not in onboarding flow, redirect to splash
      if (!hasCompleted && !segments[0]?.toString().includes('onboarding')) {
        router.replace('/onboarding/splash');
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    // Skip navigation logic while checking onboarding
    if (isCheckingOnboarding) return;

    const inAuthGroup = segments[0] === "(root)";
    const inGuestMode = segments[0] === "guest";

    if (user && inAuthGroup) {
      const role = user.role;
      const domain = user.domains?.[0]; // first domain or selected domain

      if (role) {
        if (role === "ground_owner") {
          // Ground owner goes to dashboard even without a domain
          router.replace(`/dashboard/${role}`);
        } else if (domain) {
          router.replace(`/dashboard/${role}/${domain}` as any);
        } else {
          router.replace("/onboarding/choose-domain");
        }
      }
    } else if (!user && !inAuthGroup && !inGuestMode && !segments[0]?.toString().includes('onboarding')) {
      router.replace("/(root)/login");
    }
  }, [user, segments, isCheckingOnboarding]);

  // Subscribe to error events
  useEffect(() => {
    console.log("🎧 Subscribing to error events...");
    const unsubscribe = errorHandler.subscribe((event) => {
      console.log("📢 Error event received in _layout:", event);
      setErrorEvent(event);
    });

    return () => {
      console.log("🔕 Unsubscribing from error events");
      unsubscribe();
    };
  }, []);

  const handleDismissError = () => {
    setErrorEvent(null);
  };

  const handleLogout = async () => {
    setErrorEvent(null);
    await logout();
    router.replace("/(root)/login");
  };

  return (
    <>
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'none', // Disable transitions for instant navigation
        gestureEnabled: true, // Enable swipe back gestures
      }}>
        <Stack.Screen name="onboarding/splash" />
        <Stack.Screen name="onboarding/slides" />
        <Stack.Screen name="onboarding/welcome" />
        <Stack.Screen name="guest/dashboard" />
        <Stack.Screen name="guest/teams" />
        <Stack.Screen name="guest/tournaments" />
        <Stack.Screen name="guest/grounds" />
        <Stack.Screen name="(root)/index" />
        <Stack.Screen name="(root)/login" />
        <Stack.Screen 
          name="(root)/signup" 
          options={{
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        />
        <Stack.Screen name="verifyScreen/index" />
        <Stack.Screen name="onboarding/choose-domain" />
        <Stack.Screen name="onboarding/player/cricket-form" />
        <Stack.Screen name="onboarding/player/marathon-form" />
        <Stack.Screen name="onboarding/organizer/cricket-form" />
        <Stack.Screen name="onboarding/organizer/marathon-form" />
        <Stack.Screen name="onboarding/ground-owner/cricket-form" />
        <Stack.Screen name="feed/cricket" />
        <Stack.Screen name="feed/marathon-feed" />
        <Stack.Screen name="booking/Cricket-booking" />
        <Stack.Screen name="booking/Marathon-booking" />
        <Stack.Screen name="booking/GroundDetails" />
        <Stack.Screen name="booking/CreateBooking" />
        <Stack.Screen name="booking/MyBookings" />
        <Stack.Screen name="booking/ViewAllBookings" />
        <Stack.Screen name="booking/BrowseGrounds" />
        <Stack.Screen name="team/Myteam" />
        <Stack.Screen name="team/CreateTeam" />
        <Stack.Screen name="tournament/ViewTournament" />
        <Stack.Screen name="dashboard/player/cricket" />
        <Stack.Screen name="dashboard/player/marathon" />
        <Stack.Screen name="dashboard/organizer/cricket" />
        <Stack.Screen name="dashboard/organizer/marathon" />
        <Stack.Screen name="dashboard/ground_owner" />
        <Stack.Screen name="profile" />
      </Stack>

      {/* Global Error Modal */}
      {errorEvent && (
        <>
          {console.log("🎨 Rendering ErrorModal with event:", errorEvent)}
          <ErrorModal
            visible={true}
            type={errorEvent.type}
            message={errorEvent.message}
            onDismiss={handleDismissError}
            onLogout={handleLogout}
          />
        </>
      )}
    </>
  );
};

export default function RootLayout() {
  const [loaded] = useFonts({
    "rubik-regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "rubik-medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "rubik-bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "rubik-extrabold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "rubik-semibold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    "rubik-light": require("../assets/fonts/Rubik-Light.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <InitialLayout />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
