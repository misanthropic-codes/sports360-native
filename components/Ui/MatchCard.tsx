// components/MatchCard.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MatchCardProps {
  match: {
    id: string;
    team1: string;
    team2: string;
    date: string;
    time: string;
    venue?: string;
    status: "scheduled" | "ongoing" | "completed";
    score?: {
      team1: number;
      team2: number;
    };
  };
  onViewDetails: () => void;
  onUpdateScore?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onViewDetails,
  onUpdateScore,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-black">
              {match.team1}
            </Text>
            {match.score && (
              <Text className="text-lg font-bold text-purple-600">
                {match.score.team1}
              </Text>
            )}
          </View>
          <Text className="text-center text-gray-500 my-1">VS</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-black">
              {match.team2}
            </Text>
            {match.score && (
              <Text className="text-lg font-bold text-purple-600">
                {match.score.team2}
              </Text>
            )}
          </View>
        </View>
        <View
          className={`px-2 py-1 rounded ml-4 ${getStatusColor(match.status)}`}
        >
          <Text className="text-xs font-medium">{match.status}</Text>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-gray-600">
          {match.date} at {match.time}
        </Text>
        {match.venue && (
          <Text className="text-gray-600">Venue: {match.venue}</Text>
        )}
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={onViewDetails}
          className="bg-purple-600 px-3 py-2 rounded flex-1"
        >
          <Text className="text-white text-center font-medium">
            View Details
          </Text>
        </TouchableOpacity>

        {onUpdateScore && match.status !== "completed" && (
          <TouchableOpacity
            onPress={onUpdateScore}
            className="bg-green-600 px-3 py-2 rounded flex-1"
          >
            <Text className="text-white text-center font-medium">
              Update Score
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default MatchCard;
