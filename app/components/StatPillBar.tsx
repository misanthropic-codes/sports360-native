import React from "react";
import { Text, View } from "react-native";

interface StatPillProps {
  count: number;
  label: string;
  colorClass: string;
}

const StatPill: React.FC<StatPillProps> = ({ count, label, colorClass }) => (
  <View
    className={`flex-1 items-center justify-center rounded-lg p-3 ${colorClass}`}
  >
    <Text className="text-white font-bold text-2xl">{count}</Text>
    <Text className="text-white text-sm">{label}</Text>
  </View>
);

const StatPillBar: React.FC = () => {
  return (
    <View className="flex-row items-center justify-between mx-4 gap-3">
      <StatPill count={3} label="My teams" colorClass="bg-green-400" />
      <StatPill count={2} label="Active" colorClass="bg-sky-400" />
      <StatPill count={5} label="Pending" colorClass="bg-red-400" />
    </View>
  );
};

export default StatPillBar;
