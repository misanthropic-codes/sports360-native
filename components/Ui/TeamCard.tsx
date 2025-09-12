// components/TeamCard.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    captain: string;
    members: number;
    status: "approved" | "pending";
  };
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onApprove,
  onReject,
  onViewDetails,
}) => {
  return (
    <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-black">{team.name}</Text>
          <Text className="text-gray-600">Captain: {team.captain}</Text>
          <Text className="text-gray-600">{team.members} members</Text>
        </View>
        <View
          className={`px-2 py-1 rounded ${
            team.status === "approved" ? "bg-green-100" : "bg-yellow-100"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              team.status === "approved" ? "text-green-800" : "text-yellow-800"
            }`}
          >
            {team.status}
          </Text>
        </View>
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

        {team.status === "pending" && onApprove && onReject && (
          <>
            <TouchableOpacity
              onPress={onApprove}
              className="bg-green-600 px-3 py-2 rounded flex-1"
            >
              <Text className="text-white text-center font-medium">
                Approve
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onReject}
              className="bg-red-600 px-3 py-2 rounded flex-1"
            >
              <Text className="text-white text-center font-medium">Reject</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default TeamCard;
