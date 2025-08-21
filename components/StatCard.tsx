import React from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color }) => {
  return (
    <View
      className={`flex-1 items-center justify-center p-4 rounded-xl mx-1 ${color}`}
    >
      <Text className="text-2xl font-bold text-white">{value}</Text>
      <Text className="text-sm text-white">{label}</Text>
    </View>
  );
};

export default StatCard;
