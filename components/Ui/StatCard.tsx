// components/StatCard.tsx
import React from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200 flex-1 mx-1">
      <Text className="text-2xl font-bold text-purple-600 mb-1">{value}</Text>
      <Text className="text-gray-600 text-sm">{label}</Text>
    </View>
  );
};

export default StatCard;
