import { Users } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TeamStat {
  value: string;
  label: string;
}

interface TeamCardProps {
  teamName: string;
  status: "Active" | "Pending";
  invitationFrom?: string;
  stats?: TeamStat[];
  context?: "myTeam" | "allTeam" | "invitation" | "viewTeam"; // added viewTeam
  onManage?: () => void;
  onJoin?: () => void;
  onView?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  teamName,
  status,
  invitationFrom,
  stats,
  context = "allTeam",
  onManage,
  onJoin,
  onView,
  onAccept,
  onDecline,
}) => {
  const isPending = status === "Pending";

  const StatusBadge: React.FC = () => (
    <View
      className={`px-3 py-1 rounded-full ${
        isPending ? "bg-red-100" : "bg-green-100"
      }`}
    >
      <Text
        className={`font-bold text-xs ${
          isPending ? "text-red-600" : "text-green-600"
        }`}
      >
        {status}
      </Text>
    </View>
  );

  return (
    <View className="bg-white rounded-2xl p-4 mx-4 my-2 border border-slate-200 shadow-sm">
      {/* Header */}
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <View className="bg-blue-100 p-3 rounded-lg mr-3">
            <Users size={24} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-lg font-bold text-slate-800">{teamName}</Text>
            {context === "invitation" && invitationFrom && (
              <Text className="text-xs text-slate-500">{invitationFrom}</Text>
            )}
          </View>
        </View>
        <StatusBadge />
      </View>

      {/* Stats */}
      {!isPending && stats && context !== "invitation" && (
        <View className="flex-row justify-around my-4">
          {stats.map((stat) => (
            <View key={stat.label} className="items-center">
              <Text className="font-bold text-blue-500">{stat.value}</Text>
              <Text className="text-sm text-slate-500">{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View className="mt-4">
        {context === "invitation" && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onAccept}
              className="flex-1 bg-green-500 py-3 rounded-lg items-center"
            >
              <Text className="text-white font-bold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDecline}
              className="flex-1 bg-red-500 py-3 rounded-lg items-center"
            >
              <Text className="text-white font-bold">Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {context === "myTeam" && onManage && (
          <TouchableOpacity
            onPress={onManage}
            className="bg-blue-500 w-full py-3 rounded-lg items-center"
          >
            <Text className="text-white font-bold">Manage Team</Text>
          </TouchableOpacity>
        )}

        {context === "allTeam" && onJoin && (
          <TouchableOpacity
            onPress={onJoin}
            className="bg-indigo-500 w-full py-3 rounded-lg items-center"
          >
            <Text className="text-white font-bold">Join Team</Text>
          </TouchableOpacity>
        )}

        {context === "viewTeam" && onView && (
          <TouchableOpacity
            onPress={onView}
            className="bg-gray-500 w-full py-3 rounded-lg items-center"
          >
            <Text className="text-white font-bold">View Team</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TeamCard;
