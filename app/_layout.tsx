import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "../context/AuthContext";

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(root)";

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
    } else if (!user && !inAuthGroup) {
      router.replace("/(root)/login");
    }
  }, [user, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(root)/index" />
      <Stack.Screen name="(root)/login" />
      <Stack.Screen name="(root)/signup" />
      <Stack.Screen name="verifyScreen/index" />
      <Stack.Screen name="onboarding/choose-domain" />
      <Stack.Screen name="onboarding/player/cricket-form" />
      <Stack.Screen name="onboarding/player/marathon-form" />
      <Stack.Screen name="onboarding/organizer/cricket-form" />
      <Stack.Screen name="onboarding/organizer/marathon-form" />
      <Stack.Screen name="onboarding/ground-owner/cricket-form" />
      <Stack.Screen name="feed/cricket" />
      <Stack.Screen name="feed/marathon-feed" />
      <Stack.Screen name="booking/Marathon-booking" />
      <Stack.Screen name="booking/Cricket-booking" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="matches/MatchDetail" />
      <Stack.Screen name="team/Myteam" />
      <Stack.Screen name="team/CreateTeam" />
      <Stack.Screen name="ground_owner/Booking" />
      <Stack.Screen name="+not-found" />
    </Stack>
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
