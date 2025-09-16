// components/ui/StatHeader.jsx
import React from "react";
import { Text, View } from "react-native";

const StatHeader = ({ title, subtitle }) => {
  return (
    <View className="w-full flex flex-row justify-between items-center px-4 py-3 bg-gray-900 rounded-2xl shadow-md mb-4">
      <View>
        <Text className="text-lg font-bold text-white">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-400">{subtitle}</Text>}
      </View>
      <Text className="text-sm text-gray-300">Stats</Text>
    </View>
  );
};

export default StatHeader;
