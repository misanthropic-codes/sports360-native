import React from "react";
import { Text, View } from "react-native";

const tournaments: string[] = [
  "Summer Cup 2025",
  "National Championship",
  "Intercollege League",
];

const Tournaments: React.FC = () => {
  return (
    <View className="space-y-2">
      {tournaments.map((tour, index) => (
        <View key={index} className="p-4 bg-white rounded shadow">
          <Text className="text-lg">{tour}</Text>
        </View>
      ))}
    </View>
  );
};

export default Tournaments;
