// components/Tournament/LeaderboardTab.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const LeaderboardTab = () => (
  <View className="flex-1 bg-gray-50 p-4">
    <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
      <Text className="text-white font-medium text-center">
        Export Rankings
      </Text>
    </TouchableOpacity>
    <Text className="text-gray-500">No leaderboard data yet</Text>
  </View>
);

export default LeaderboardTab;
