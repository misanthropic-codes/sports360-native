import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import ErrorModal from "../components/ErrorModal";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { LOGIN_ROUTE, getDashboardPath } from "../utils/navigation";
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
          router.replace("/dashboard/ground_owner");
        } else if (domain) {
          router.replace(getDashboardPath(role, domain) as any);
        } else {
          router.replace("/onboarding/choose-domain");
        }
      }
    } else if (!user && !inAuthGroup && !inGuestMode && !segments[0]?.toString().includes('onboarding')) {
      router.replace(LOGIN_ROUTE);
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
    router.replace(LOGIN_ROUTE);
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          gestureEnabled: true,
        }}
      />

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
