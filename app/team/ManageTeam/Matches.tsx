import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

type Match = {
  id: string;
  tournamentName: string;
  matchType: string;
  teamAName?: string;
  teamBName?: string;
  opponentTeamName?: string;
  matchTime: string;
  status: string;
  scoreA?: string;
  scoreB?: string;
};

const Matches: React.FC = () => {
  const { token } = useAuth();
  const { teamId } = useLocalSearchParams();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://172.20.10.4:8080/api/v1";

  useEffect(() => {
    const fetchMatches = async () => {
      if (!teamId || !token) {
        console.log("[Matches] Missing teamId or token");
        Alert.alert("Error", "Missing team ID or authentication token");
        setLoading(false);
        return;
      }

      console.log("[Matches] Fetching matches for teamId:", teamId);

      try {
        const response = await axios.get(`${BASE_URL}/team/${teamId}/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("[Matches] Response data:", response.data);

        const matchesData = response.data?.data?.matches || [];
        console.log("[Matches] Parsed matches:", matchesData);

        setMatches(matchesData);
      } catch (error: any) {
        console.error(
          "[Matches] Error fetching matches:",
          error.response || error
        );
        Alert.alert("Error", "Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [teamId, token]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text>Loading matches...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View className="p-4">
        <Text className="text-center text-gray-500">No matches found.</Text>
      </View>
    );
  }

  return (
    <View className="space-y-2 p-4">
      {matches.map((match) => (
        <View key={match.id} className="p-4 bg-white rounded shadow">
          <Text className="text-lg font-bold">{match.tournamentName}</Text>
          <Text className="text-md">
            {match.teamAName || ""} VS{" "}
            {match.teamBName || match.opponentTeamName || ""}
          </Text>
          <Text className="text-gray-500">
            {new Date(match.matchTime).toLocaleDateString()} —{" "}
            {new Date(match.matchTime).toLocaleTimeString()}
          </Text>
          <Text>Status: {match.status}</Text>
          {match.scoreA && match.scoreB && (
            <Text>
              Score: {match.scoreA} - {match.scoreB}
            </Text>
          )}
          <Text>Match Type: {match.matchType}</Text>
        </View>
      ))}
    </View>
  );
};

export default Matches;
