// components/Tournament/TeamsTab.tsx
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Team {
  id: string;
  name: string;
  description: string;
  location: string;
  sport: string;
  teamType: string;
  teamSize: number;
  code: string;
  logoUrl: string;
}

const TeamsTab = ({
  teamsMessage,
  teamsLoading,
  teamsData,
}: {
  teamsMessage: string | null;
  teamsLoading: boolean;
  teamsData: Team[];
}) => {
  const renderTeam = ({ item }: { item: Team }) => (
    <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm">
      <Image
        source={{ uri: item.logoUrl }}
        className="w-16 h-16 rounded-lg mr-4"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-600">
          {item.sport} • {item.teamType}
        </Text>
        <Text className="text-sm text-gray-500">
          {item.location} | {item.teamSize} players
        </Text>
        <Text className="text-xs text-gray-400 mt-1">Code: {item.code}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-white text-center font-medium">
          Add Team Manually
        </Text>
      </TouchableOpacity>

      {teamsLoading ? (
        <View className="mt-4 items-center">
          <ActivityIndicator size="small" />
          <Text className="text-gray-500 mt-2">Loading teams...</Text>
        </View>
      ) : teamsData && teamsData.length > 0 ? (
        <>
          <Text className="text-gray-700 mb-3 font-medium">{teamsMessage}</Text>
          <FlatList
            data={teamsData}
            keyExtractor={(item) => item.id}
            renderItem={renderTeam}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <Text className="text-gray-700 mt-2">
          {teamsMessage || "No teams data yet."}
        </Text>
      )}
    </View>
  );
};

export default TeamsTab;
