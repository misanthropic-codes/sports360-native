import React from "react";
import { View, Text } from "react-native";

interface StatItem {
  value: string | number;
  label: string;
}

interface StatsBarProps {
  stats: StatItem[];
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <View className="flex-row justify-around items-center px-4 py-3">
      {stats.map((stat, index) => (
        <View key={`${stat.label}-${index}`} className="items-center">
          <Text className="text-xl font-bold text-slate-800">{stat.value}</Text>
          <Text className="text-sm text-slate-500">{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default StatsBar;
