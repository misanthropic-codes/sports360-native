import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View className="flex-row justify-between items-center mt-6 mb-4">
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
      <TouchableOpacity></TouchableOpacity>
    </View>
  );
};

export default SectionHeader;
