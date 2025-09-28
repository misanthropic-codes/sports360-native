// components/LeaderboardItem.tsx
import React from "react";
import { Text, View } from "react-native";

interface LeaderboardItemProps {
  item: {
    position: number;
    teamName: string;
    matches: number;
    wins: number;
    losses: number;
    points: number;
  };
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ item }) => {
  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 border-yellow-300";
      case 2:
        return "bg-gray-100 border-gray-300";
      case 3:
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  return (
    <View
      className={`p-4 mb-2 rounded-lg border ${getPositionColor(item.position)}`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center mr-3">
            <Text className="text-white font-bold text-sm">
              {item.position}
            </Text>
          </View>
          <Text className="text-lg font-semibold text-black flex-1">
            {item.teamName}
          </Text>
        </View>
        <Text className="text-lg font-bold text-purple-600">
          {item.points} pts
        </Text>
      </View>

      <View className="flex-row justify-between mt-2 ml-11">
        <Text className="text-gray-600">Matches: {item.matches}</Text>
        <Text className="text-gray-600">Wins: {item.wins}</Text>
        <Text className="text-gray-600">Losses: {item.losses}</Text>
      </View>
    </View>
  );
};

export default LeaderboardItem;
