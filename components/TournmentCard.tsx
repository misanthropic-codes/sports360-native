import { Calendar, Trophy } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Status = "Active" | "Draft" | "Completed";
type ThemeColor = "indigo" | "purple";
type Role = "admin" | "player" | "organizer"; // ✅ Updated to include organizer

interface TournamentCardProps {
  id: string;
  name: string;
  format: string;
  status: Status;
  teamCount: number;
  matchCount: number;
  revenue: string;
  dateRange: string;
  color?: ThemeColor;
  role?: Role; // ✅ New prop
  onManagePress?: (id: string) => void; // ✅ Pass ID to parent callback
}

const statusColors: Record<Status, { bg: string; text: string }> = {
  Active: { bg: "bg-green-100", text: "text-green-800" },
  Draft: { bg: "bg-yellow-100", text: "text-yellow-800" },
  Completed: { bg: "bg-gray-100", text: "text-gray-800" },
};

const TournamentCard: React.FC<TournamentCardProps> = ({
  id,
  name,
  format,
  status,
  teamCount,
  matchCount,
  revenue,
  dateRange,
  color = "indigo",
  role = "admin", // default is admin
  onManagePress,
}) => {
  const colors = statusColors[status];

  const themeBg = color === "indigo" ? "bg-indigo-100" : "bg-[#EBDCF9]";
  const themeIcon = color === "indigo" ? "#4F46E5" : "#510EB0";
  const themeButton = color === "indigo" ? "bg-indigo-600" : "bg-[#510EB0]";

  return (
    <View className="bg-white rounded-2xl p-3 mx-4 mb-3 shadow-sm shadow-gray-200">
      {/* Top Row */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1 mr-2">
          <View
            className={`w-12 h-12 ${themeBg} rounded-xl items-center justify-center mr-4`}
          >
            <Trophy color={themeIcon} size={28} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
              {name}
            </Text>
            <Text className="text-sm text-gray-500">{format}</Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${colors.bg}`}>
          <Text className={`text-xs font-semibold ${colors.text}`}>
            {status}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-around my-3">
        <View className="items-center">
          <Text className="text-xl font-bold text-gray-800">{teamCount}</Text>
          <Text className="text-sm text-gray-500">Teams</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-gray-800">{matchCount}</Text>
          <Text className="text-sm text-gray-500">Matches</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-green-600">{revenue}</Text>
          <Text className="text-sm text-gray-500">Revenue</Text>
        </View>
      </View>

      {/* Footer Row */}
      <View className="border-t border-gray-100 pt-3 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Calendar color="#6B7280" size={16} />
          <Text className="text-sm text-gray-600 ml-2">{dateRange}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (onManagePress) onManagePress(id);
            else console.log("Tournament ID:", id);
          }}
          className={`${themeButton} px-6 py-2 rounded-full`}
        >
          <Text className="text-white font-semibold">
            {role === "player" ? "Join" : "Manage"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TournamentCard;
