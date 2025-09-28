// components/Tournament/ResultsTab.tsx
import {
  getMatchById,
  getTeamsByTournament,
  Match,
  Team,
} from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ResultsTab = () => {
  const { token } = useAuth(); // ✅ Get token from AuthContext

  const [match, setMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const matchId = "7866b1c5-68d6-42f5-8288-734a20b977ff"; // 🔹 hardcoded for now

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return; // ❌ Stop if no token

      try {
        setLoading(true);

        // 1. Fetch match
        const matchData = await getMatchById(matchId, token);
        setMatch(matchData);

        // 2. Fetch tournament teams
        if (matchData) {
          const teamsData = await getTeamsByTournament(
            matchData.tournamentId,
            token
          );
          setTeams(Array.isArray(teamsData) ? teamsData : []);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getTeamName = (teamId: string | null | undefined): string => {
    if (!teamId) return "TBD";
    const team = teams.find((t) => t.id === teamId);
    return team?.name || `Team ${teamId.substring(0, 8)}`;
  };

  const handleUpdateScore = () => {
    Alert.alert("Update Score", "Score update functionality coming soon!", [
      { text: "OK", style: "default" },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-700";
      case "in_progress":
        return "text-blue-700";
      case "scheduled":
        return "text-purple-700";
      default:
        return "text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "checkmark-circle";
      case "in_progress":
        return "play-circle";
      case "scheduled":
        return "time";
      default:
        return "help-circle";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="bg-white rounded-3xl shadow-lg p-6">
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text className="text-purple-700 font-bold mt-4 text-center">
            Loading results...
          </Text>
        </View>
      </View>
    );
  }

  if (!match) {
    return (
      <View className="flex-1 bg-gray-50 p-6 justify-center items-center">
        <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
          <Ionicons name="alert-circle-outline" size={64} color="#6B7280" />
          <Text className="text-gray-700 text-lg font-bold mt-4">
            No results available
          </Text>
          <Text className="text-gray-600 text-center mt-2 font-medium">
            Match data could not be loaded at this time
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Match Results
          </Text>
          <View className="h-1 w-16 bg-purple-600 rounded-full" />
        </View>

        {/* Match Card */}
        <View className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          {/* Match Header */}
          <View className="bg-purple-600 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white font-bold text-lg">
                  Match #{match.matchNumber}
                </Text>
                <Text className="text-white/90 text-sm font-medium">
                  {match.matchType.replace("_", " ").toUpperCase()}
                </Text>
              </View>
              <View className="bg-white/25 rounded-full px-4 py-2">
                <Text className="text-white font-bold text-sm">
                  Round {match.round}
                </Text>
              </View>
            </View>
          </View>

          {/* Match Details */}
          <View className="p-6">
            {/* Date & Time */}
            <View className="flex-row items-center mb-6">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-gray-600 text-sm font-medium">
                  Match Date
                </Text>
                <Text className="text-gray-900 font-semibold">
                  {new Date(match.matchTime).toLocaleDateString()} at{" "}
                  {new Date(match.matchTime).toLocaleTimeString()}
                </Text>
              </View>
            </View>

            {/* Teams & Scores */}
            <View className="mb-6">
              <Text className="text-gray-800 text-sm font-bold mb-4 uppercase tracking-wide">
                TEAMS & SCORES
              </Text>

              {/* Team A */}
              <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4 mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="bg-blue-500 rounded-full w-10 h-10 items-center justify-center mr-3">
                    <Text className="text-white font-bold">A</Text>
                  </View>
                  <Text className="text-gray-900 font-semibold flex-1">
                    {getTeamName(match.teamAId)}
                  </Text>
                </View>
                <View className="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <Text className="text-gray-900 font-bold text-lg">
                    {match.scoreA}
                  </Text>
                </View>
              </View>

              {/* VS Divider */}
              <View className="items-center my-2">
                <Text className="text-gray-400 font-bold">VS</Text>
              </View>

              {/* Team B */}
              <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4">
                <View className="flex-row items-center flex-1">
                  <View className="bg-red-500 rounded-full w-10 h-10 items-center justify-center mr-3">
                    <Text className="text-white font-bold">B</Text>
                  </View>
                  <Text className="text-gray-900 font-semibold flex-1">
                    {getTeamName(match.teamBId)}
                  </Text>
                </View>
                <View className="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <Text className="text-gray-900 font-bold text-lg">
                    {match.scoreB}
                  </Text>
                </View>
              </View>
            </View>

            {/* Winner Section */}
            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center">
                <View className="bg-green-600 rounded-full p-2 mr-3">
                  <Ionicons name="trophy-outline" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-green-700 font-bold text-sm uppercase tracking-wide">
                    WINNER
                  </Text>
                  <Text className="text-green-900 font-bold text-lg">
                    {match.winnerTeamId === match.teamAId
                      ? getTeamName(match.teamAId)
                      : getTeamName(match.teamBId)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional Info */}
            <View className="space-y-3 mb-6">
              <View className="flex-row items-center">
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#4B5563"
                />
                <Text className="text-gray-700 ml-2 text-sm font-semibold">
                  Result:
                </Text>
                <Text className="text-gray-900 font-bold ml-2">
                  {match.result}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons
                  name={getStatusIcon(match.status)}
                  size={18}
                  color="#4B5563"
                />
                <Text className="text-gray-700 ml-2 text-sm font-semibold">
                  Status:
                </Text>
                <Text
                  className={`font-bold ml-2 ${getStatusColor(match.status)}`}
                >
                  {match.status.replace("_", " ").toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Update Score Button */}
            <TouchableOpacity
              onPress={handleUpdateScore}
              className="bg-purple-600 rounded-2xl py-4 flex-row items-center justify-center shadow-lg"
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Update Score
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ResultsTab;
