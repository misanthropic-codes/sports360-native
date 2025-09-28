// components/TournamentHeader.tsx
import React from "react";
import { Text, View } from "react-native";

interface TournamentHeaderProps {
  tournamentName: string;
  tournamentId: string;
}

const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  tournamentName,
  tournamentId,
}) => {
  return (
    <View className="mb-6">
      <View
        className="bg-white rounded-xl border border-gray-100 p-6"
        style={{ elevation: 0, shadowOpacity: 0 }}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {tournamentName || "Tournament"}
        </Text>
        <Text className="text-gray-600 text-base mb-4">
          Generate Fixtures & Schedule Matches
        </Text>

        <View className="flex-row items-center">
          <View className="w-3 h-3 bg-purple-600 rounded-full mr-3" />
          <Text className="text-sm text-gray-500">ID: {tournamentId}</Text>
        </View>
      </View>
    </View>
  );
};

export default TournamentHeader;
