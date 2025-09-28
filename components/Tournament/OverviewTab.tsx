// components/Tournament/OverviewTab.tsx
import { toProperCase } from "@/utils/caseHelpers";
import { getStatusInfo } from "@/utils/statusHelpers";
import {
  Calendar,
  Info,
  MapPin,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import StatCard from "../Ui/StatCard";
import InfoCard from "./InfoCard";

const OverviewTab = ({ tournament }: { tournament: any }) => {
  const statusInfo = getStatusInfo(tournament.status);

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {/* Header Stats */}
      <View className="flex-row justify-between mb-6">
        <StatCard
          label="Teams"
          value={tournament.teamCount}
          icon={<Users size={24} color="#3B82F6" />}
          color="#3B82F6"
          bgColor="#EFF6FF"
        />
        <StatCard
          label="Team Size"
          value={tournament.teamSize}
          icon={<UserPlus size={24} color="#8B5CF6" />}
          color="#8B5CF6"
          bgColor="#F5F3FF"
        />
        <StatCard
          label="Prize Pool"
          value={`₹${tournament.prizePool}`}
          icon={<Trophy size={24} color="#F59E0B" />}
          color="#F59E0B"
          bgColor="#FFFBEB"
        />
      </View>

      {/* Status */}
      <InfoCard
        title="Tournament Status"
        icon={<statusInfo.icon />}
        color={statusInfo.color}
        bgColor={statusInfo.bgColor}
      >
        <View className="bg-white/70 rounded-xl p-4">
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: statusInfo.color }}
          >
            {toProperCase(tournament.status)}
          </Text>
          <Text className="text-gray-600">Current tournament status</Text>
        </View>
      </InfoCard>

      {/* Schedule */}
      <InfoCard
        title="Schedule"
        icon={<Calendar />}
        color="#10B981"
        bgColor="#ECFDF5"
      >
        {/* Start Date */}
        <View className="bg-white/70 rounded-xl p-4 mb-3">
          <Text className="text-sm text-gray-500">Start Date</Text>
          <Text className="text-lg font-semibold">
            {new Date(tournament.startDate).toLocaleDateString()}
          </Text>
        </View>
        {/* End Date */}
        <View className="bg-white/70 rounded-xl p-4">
          <Text className="text-sm text-gray-500">End Date</Text>
          <Text className="text-lg font-semibold">
            {new Date(tournament.endDate).toLocaleDateString()}
          </Text>
        </View>
      </InfoCard>

      {/* Location */}
      <InfoCard
        title="Location"
        icon={<MapPin />}
        color="#EC4899"
        bgColor="#FDF2F8"
      >
        <Text className="text-lg font-semibold">
          {toProperCase(tournament.location)}
        </Text>
        <Text className="text-gray-600">Tournament venue</Text>
      </InfoCard>

      {/* Description */}
      <InfoCard
        title="About Tournament"
        icon={<Info />}
        color="#6366F1"
        bgColor="#EEF2FF"
      >
        <Text className="text-gray-700">{tournament.description}</Text>
      </InfoCard>
    </ScrollView>
  );
};

export default OverviewTab;
