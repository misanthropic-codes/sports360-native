
import { getMatchScore } from "@/api/scoreApi";
import { getMatchById } from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function MatchRedirect() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    checkAndRedirect();
  }, [matchId, user]);

  const checkAndRedirect = async () => {
    if (!matchId) return;

    // 1. Non-authenticated users → live view
    if (!token || !user) {
      router.replace(`/match/${matchId}/live`);
      return;
    }

    try {
      // 2. Fetch match to determine organizer
      await getMatchById(matchId, token); // just checking it exists
      const isOrganizer = user.role === "organizer";

      if (isOrganizer) {
        // 3. Check if players are already set (score state exists)
        const scoreState = await getMatchScore(matchId, token);

        if (!scoreState || !scoreState.striker?.playerId) {
          // No score yet, or scorer not set → set players first
          router.replace(`/match/${matchId}/set-players`);
        } else {
          router.replace(`/match/${matchId}/scorer`);
        }
      } else {
        router.replace(`/match/${matchId}/live`);
      }
    } catch (e) {
      console.error("Redirection error", e);
      router.replace(`/match/${matchId}/live`);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#7C3AED" />
      <Text className="mt-4 text-gray-400">Redirecting…</Text>
    </View>
  );
}
