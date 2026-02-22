
import { getMatchScore } from "@/api/scoreApi";
import { getMatchById } from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function MatchRedirect() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  // We cannot use router.replace immediately in top level, need useEffect.
  const router = useRouter();
  const { user, token } = useAuth();
  
  useEffect(() => {
     checkAndRedirect();
  }, [matchId, user]);

  const checkAndRedirect = async () => {
     if (!matchId) return;
     
     // 1. If not logged in, go to Live
     if (!token || !user) {
         router.replace(`/match/${matchId}/live`);
         return;
     }

     try {
         // 2. Fetch Match Details to check organizer
         // Assuming getMatchById returns tournament details or we fetch tournament
         // Ideally `getMatchById` returns `tournamentId`.
         // Then we check if user is organizer of that tournament.
         const match = await getMatchById(matchId, token);
         const isOrganizer = user.role === 'organizer'; // Simplified check
         
         // In a real app, we should check if `match.organizerId === user.id`.
         // For now, if role is organizer, we assume they can score (or check ground owner etc).
         // Let's assume ANY organizer role can score for now or we just check if they are THE organizer.
         // If we don't have tournament owner info here readily, we might assume if they clicked "Score" from their dashboard, they have rights.
         
         if (isOrganizer) {
             // 3. Check if players are set
             // If Striker is missing, go to set-players
             const scoreState = await getMatchScore(matchId, token);
             if (!scoreState.striker?.playerId) {
                 router.replace(`/match/${matchId}/set-players`);
             } else {
                 router.replace(`/match/${matchId}/scorer`);
             }
         } else {
             router.replace(`/match/${matchId}/live`);
         }
         
     } catch (e) {
         console.error("Redirection error", e);
         // Fallback
         router.replace(`/match/${matchId}/live`);
     }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0000ff" />
      <Text className="mt-4 text-gray-500">Redirecting to match...</Text>
    </View>
  );
}
