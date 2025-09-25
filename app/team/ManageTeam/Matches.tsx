import React from "react";
import { Text, View } from "react-native";

type Match = {
  vs: string;
  date: string;
  time: string;
};

const matches: Match[] = [
  { vs: "Team Alpha", date: "2025-10-01", time: "5:00 PM" },
  { vs: "Team Bravo", date: "2025-10-05", time: "3:00 PM" },
];

const Matches: React.FC = () => {
  return (
    <View className="space-y-2">
      {matches.map((match, index) => (
        <View
          key={index}
          className="flex-row justify-between p-4 bg-white rounded shadow"
        >
          <Text className="text-lg">VS {match.vs}</Text>
          <Text className="text-gray-500">
            {match.date} — {match.time}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default Matches;
