import LeaderboardScreen from "@/screens/LeaderboardScreen";
import ManageTournamentScreen from "@/screens/ManageTournament";
import MatchDetailsScreen from "@/screens/MatchDetailsScreen";
import TeamDetailsScreen from "@/screens/TeamDetailsScreen";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

const Stack = createStackNavigator();

export default function ManageTournamentStack() {
  return (
    <Stack.Navigator
      initialRouteName="ManageTournament"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ManageTournament"
        component={ManageTournamentScreen}
      />
      <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
      <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
}
