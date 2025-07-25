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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
