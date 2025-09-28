// components/MatchCard.tsx
import { Match, Team } from "@/api/tournamentApi";
import React from "react";
import { Text, View } from "react-native";

interface MatchCardProps {
  match: Match;
  matchNumber: number;
  teams: Team[];
}

const MatchCard: React.FC<MatchCardProps> = ({ match, matchNumber, teams }) => {
  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
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
              className={`px-3 py-1 rounded-full ${getStatusColor(match.status)}`}
            >
              <Text className="font-medium text-sm capitalize">
                {match.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MatchCard;
