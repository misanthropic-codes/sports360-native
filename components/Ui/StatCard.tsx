// components/StatCard.tsx
import React from "react";
import { Text, View, ViewStyle } from "react-native";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = "#8B5CF6", // Default purple color
  bgColor = "#F8FAFC", // Default light background
  style,
}) => {
  return (
    <View
      className="bg-white rounded-2xl p-4 shadow-sm flex-1 mx-1"
      style={[{ backgroundColor: bgColor }, style]}
    >
      <View className="items-center justify-center">
        {/* Icon */}
        {icon && <View className="mb-2">{icon}</View>}

        {/* Value */}
        <Text
          className="text-2xl font-bold mb-1 text-center"
          style={{ color }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>

        {/* Label */}
        <Text className="text-gray-600 text-sm text-center">{label}</Text>
      </View>
    </View>
  );
};

export default StatCard;
