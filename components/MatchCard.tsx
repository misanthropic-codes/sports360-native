import { Match, Team, updateMatchStatus } from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

interface MatchCardProps {
  match: Match;
  matchNumber: number;
  teams: Team[];
  onRefresh?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, matchNumber, teams, onRefresh }) => {
  const { token } = useAuth();
  const [status, setStatus] = useState(match.status);
  const [loading, setLoading] = useState(false);

  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);

  const handleUpdateStatus = async (newStatus: "ongoing" | "completed") => {
    if (!token) return;
    try {
      setLoading(true);
      await updateMatchStatus(match.id, match.tournamentId, newStatus, token);
      setStatus(newStatus);
      if (onRefresh) onRefresh();
      Alert.alert("Success", `Match is now ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status", error);
      Alert.alert("Error", "Failed to update match status");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case "scheduled":
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "ongoing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const { date, time } = formatDateTime(match.matchTime);

  return (
    <View
      className="bg-white rounded-xl border border-gray-100 mb-4 overflow-hidden"
      style={{ elevation: 0, shadowOpacity: 0 }}
    >
      {/* Header */}
      <View className="bg-purple-600 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-bold text-lg">
            Match {matchNumber}
          </Text>
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white font-medium text-sm">
              Round {match.round}
            </Text>
          </View>
        </View>
      </View>

      {/* Match Details */}
      <View className="p-4">
        {/* Teams */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 items-center">
            <View className="bg-purple-50 w-12 h-12 rounded-full items-center justify-center mb-2">
              <Text className="text-purple-600 font-bold text-lg">
                {teamA?.name?.charAt(0) || "A"}
              </Text>
            </View>
            <Text className="font-semibold text-gray-800 text-center">
              {teamA?.name || "Team A"}
            </Text>
          </View>

          <View className="mx-4 items-center">
            <Text className="text-purple-600 font-bold text-xl">VS</Text>
          </View>

          <View className="flex-1 items-center">
            <View className="bg-purple-50 w-12 h-12 rounded-full items-center justify-center mb-2">
              <Text className="text-purple-600 font-bold text-lg">
                {teamB?.name?.charAt(0) || "B"}
              </Text>
            </View>
            <Text className="font-semibold text-gray-800 text-center">
              {teamB?.name || "Team B"}
            </Text>
          </View>
        </View>

        {/* Match Info */}
        <View className="border-t border-gray-100 pt-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-purple-600 rounded-full mr-2" />
              <Text className="text-gray-600 font-medium">Match Type:</Text>
            </View>
            <Text className="font-semibold text-gray-800 capitalize">
              {match.matchType}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-purple-600 rounded-full mr-2" />
              <Text className="text-gray-600 font-medium">Date & Time:</Text>
            </View>
            <View className="items-end">
              <Text className="font-semibold text-gray-800">{date}</Text>
              <Text className="text-sm text-gray-600">{time}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-purple-600 rounded-full mr-2" />
              <Text className="text-gray-600 font-medium">Status:</Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(status)}`}
            >
              <Text className="font-medium text-sm capitalize">
                {status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Organizer Actions */}
      <View className="p-4 border-t border-gray-100 bg-gray-50 flex-col gap-2">
        {loading ? (
             <ActivityIndicator color="#7C3AED" />
        ) : (
             <>
                {(status.toLowerCase() === 'scheduled' || status.toLowerCase() === 'upcoming') && (
                    <TouchableOpacity
                        onPress={() => handleUpdateStatus('ongoing')}
                        className="bg-purple-600 rounded-lg py-3 flex-row justify-center items-center shadow-sm active:bg-purple-700"
                    >
                        <Text className="text-white font-bold text-base">Start Match</Text>
                    </TouchableOpacity>
                )}

                {status.toLowerCase() === 'ongoing' && (
                    <>
                        <TouchableOpacity
                            onPress={() => router.push(`/match/${match.id}`)}
                            className="bg-green-600 rounded-lg py-3 flex-row justify-center items-center shadow-sm active:bg-green-700 mb-2"
                        >
                            <Text className="text-white font-bold text-base">Start Live Updates</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={() => Alert.alert(
                                "Complete Match", 
                                "Are you sure you want to mark this match as completed?", 
                                [
                                    { text: "Cancel", style: "cancel"},
                                    { text: "Yes, Complete", onPress: () => handleUpdateStatus('completed'), style: 'destructive' }
                                ]
                            )}
                            className="bg-gray-200 rounded-lg py-3 flex-row justify-center items-center shadow-sm active:bg-gray-300"
                        >
                            <Text className="text-gray-800 font-bold text-base">Complete Match</Text>
                        </TouchableOpacity>
                    </>
                )}
                
                {status.toLowerCase() === 'completed' && (
                     <View className="items-center py-2">
                        <Text className="text-green-600 font-bold">Match Completed</Text>
                     </View>
                )}
             </>
        )}
      </View>
    </View>
  );
};

export default MatchCard;
