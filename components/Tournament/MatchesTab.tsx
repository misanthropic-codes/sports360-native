// components/Tournament/MatchesTab.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const MatchesTab = () => (
  <View className="flex-1 bg-gray-50 p-4">
    <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
      <Text className="text-white font-medium text-center">Create Schedule</Text>
    </TouchableOpacity>
    <Text className="text-gray-500">No matches data yet</Text>
  </View>
);

export default MatchesTab;
