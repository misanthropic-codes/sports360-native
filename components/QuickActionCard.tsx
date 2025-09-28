import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickActionCardProps {
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress?: () => void; // 👈 new prop for press action
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: IconComponent,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress} // 👈 handle press here
      className="aspect-square flex-1 bg-white rounded-xl items-center justify-center m-1 p-2 shadow-sm"
    >
      <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mb-2">
        {IconComponent && <IconComponent size={28} color="#4A5568" />}
      </View>
      <Text className="text-xs font-semibold text-center text-gray-700">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default QuickActionCard;
