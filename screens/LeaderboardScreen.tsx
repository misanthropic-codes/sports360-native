// screens/LeaderboardScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import LeaderboardItem from "../components/Ui/LeaderboardItem";

const LeaderboardScreen = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState("teams");

  const mockLeaderboard = [
    {
      position: 1,
      teamName: "Thunder Bolts",
      matches: 3,
      wins: 3,
      losses: 0,
      points: 9,
    },
    {
      position: 2,
      teamName: "Ice Warriors",
      matches: 3,
      wins: 2,
      losses: 1,
      points: 6,
    },
    {
      position: 3,
      teamName: "Fire Dragons",
      matches: 2,
      wins: 1,
      losses: 1,
      points: 3,
    },
    {
      position: 4,
      teamName: "Lightning Strikes",
      matches: 2,
      wins: 0,
      losses: 2,
      points: 0,
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-purple-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Leaderboard</Text>
          <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-medium">Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-white border-b border-gray-200">
        <View className="flex-row p-4">
          <TouchableOpacity
            onPress={() => setFilter("teams")}
            className={`flex-1 py-2 px-4 rounded-lg mr-2 ${
              filter === "teams" ? "bg-purple-600" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                filter === "teams" ? "text-white" : "text-gray-700"
              }`}
            >
              By Teams
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("players")}
            className={`flex-1 py-2 px-4 rounded-lg ml-2 ${
              filter === "players" ? "bg-purple-600" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                filter === "players" ? "text-white" : "text-gray-700"
              }`}
            >
              By Players
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {mockLeaderboard.map((item) => (
          <LeaderboardItem key={item.position} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

export default LeaderboardScreen;
