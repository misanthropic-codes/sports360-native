// components/Header.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  tournamentName: string;
  status: string;
  onEdit: () => void;
  onDelete: () => void;
}

const Header: React.FC<HeaderProps> = ({
  tournamentName,
  status,
  onEdit,
  onDelete,
}) => {
  return (
    <View className="bg-white px-6 py-4 border-b border-gray-200">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-2xl font-bold text-black">MANAGE TOURNAMENT</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={onEdit}
            className="bg-purple-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            className="bg-purple-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-xl font-semibold text-black mb-1">
        {tournamentName}
      </Text>
      <Text className="text-gray-600">{status}</Text>
    </View>
  );
};

export default Header;
