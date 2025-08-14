import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
  const [loaded] = useFonts({
    "rubik-regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "rubik-medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "rubik-bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "rubik-extrabold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "rubik-semibold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    "rubik-light": require("../assets/fonts/Rubik-Light.ttf"),
  });

  if (!loaded) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(root)/login" />
        <Stack.Screen name="(root)/signup" />
        <Stack.Screen name="verifyScreen/index" />
        <Stack.Screen name="onboarding/choose-domain" />
        <Stack.Screen name="onboarding/player/cricket-form" />
        <Stack.Screen name="onboarding/player/marathon-form" />
        <Stack.Screen name="onboarding/organizer/cricket-form" />
        <Stack.Screen name="onboarding/organizer/marathon-form" />
        <Stack.Screen name="onboarding/ground-owner/cricket-form" />
        <Stack.Screen name="feed/cricket-feed" />
        <Stack.Screen name="feed/marathon-feed" />
        <Stack.Screen name="booking/Marathon-booking" />
        <Stack.Screen name="booking/Cricket-booking" />

        <Stack.Screen name="matches/MatchDetail" />
        <Stack.Screen name="team/Myteam" />
        <Stack.Screen name="team/CreateTeam" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
