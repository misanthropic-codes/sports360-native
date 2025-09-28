// components/Header.tsx
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  tournamentName: string;
  status: string;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean; // ✅ new prop for loading state
}

const Header: React.FC<HeaderProps> = ({
  tournamentName,
  status,
  onEdit,
  onDelete,
  deleting = false,
}) => {
  // Format status to be more readable
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Get status color based on status value
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("active") || lowerStatus.includes("ongoing")) {
      return "text-green-600";
    } else if (
      lowerStatus.includes("completed") ||
      lowerStatus.includes("finished")
    ) {
      return "text-blue-600";
    } else if (
      lowerStatus.includes("cancelled") ||
      lowerStatus.includes("inactive")
    ) {
      return "text-red-600";
    } else if (
      lowerStatus.includes("pending") ||
      lowerStatus.includes("upcoming")
    ) {
      return "text-orange-600";
    }
    return "text-gray-600";
  };

  return (
    <View className="bg-white px-6 py-5 border-b border-gray-200 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            MANAGE TOURNAMENT
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onEdit}
            disabled={deleting} // ✅ disable while deleting
            className={`px-5 py-2.5 rounded-lg shadow-sm ${
              deleting ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
            }`}
          >
            <Text className="text-white font-semibold text-sm">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            disabled={deleting} // ✅ disable while deleting
            className={`px-5 py-2.5 rounded-lg shadow-sm flex-row items-center justify-center ${
              deleting ? "bg-red-400" : "bg-red-600 active:bg-red-700"
            }`}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-sm">Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="space-y-2">
        <Text className="text-xl font-bold text-gray-900" numberOfLines={2}>
          {tournamentName}
        </Text>
        <View className="flex-row items-center">
          <View className={`px-3 py-1.5 rounded-full bg-gray-100`}>
            <Text className={`text-sm font-semibold ${getStatusColor(status)}`}>
              {formatStatus(status)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Header;
