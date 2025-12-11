import { useAuth } from "@/context/AuthContext";
import { useTeamDetailsStore } from "@/store/teamDetailsStore";
import { useLocalSearchParams } from "expo-router";
import { CalendarBlank, MapPin, Trophy as TrophyIcon, Users } from "phosphor-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const Tournaments: React.FC = () => {
  const { teamId } = useLocalSearchParams();
  const { token } = useAuth();

  // Use teamDetailsStore instead of local state
  const {
    getTeamTournaments,
    fetchTeamTournaments,
    loading,
  } = useTeamDetailsStore();

  const tournaments = getTeamTournaments(teamId as string);
  const isLoading = loading[teamId as string] || false;

  // Fetch tournaments with smart caching
  useEffect(() => {
    if (!teamId || !token) return;

    fetchTeamTournaments(teamId as string, token); // Smart fetch - only if not cached
  }, [teamId, token]);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes("completed") || lowerStatus.includes("finished")) {
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        label: "Completed"
      };
    }
    if (lowerStatus.includes("live") || lowerStatus.includes("ongoing")) {
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        label: "Ongoing"
      };
    }
    return {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      label: "Upcoming"
    };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600 font-medium">Loading tournaments...</Text>
      </View>
    );
  }

  if (tournaments.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-16">
        <View className="bg-gray-100 rounded-full p-6 mb-4">
          <TrophyIcon size={48} color="#9CA3AF" weight="light" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          No Tournaments
        </Text>
        <Text className="text-gray-500 text-center px-8">
          Your team hasn't joined any tournaments yet
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-3">
      {/* Header */}
      <View className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-2">
        <Text className="text-indigo-900 font-bold text-lg">
          {tournaments.length} {tournaments.length === 1 ? "Tournament" : "Tournaments"}
        </Text>
        <Text className="text-indigo-600 text-sm">
          Active and completed tournaments
        </Text>
      </View>

      {/* Tournaments List */}
      {tournaments.map((tour) => {
        const statusBadge = getStatusBadge(tour.status);
        
        return (
          <View
            key={tour.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Tournament Header */}
            <View className="p-5">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                  <Text className="text-gray-900 font-bold text-lg mb-1">
                    {tour.name}
                  </Text>
                  {tour.description && (
                    <Text className="text-gray-600 text-sm" numberOfLines={2}>
                      {tour.description}
                    </Text>
                  )}
                </View>
                
                {statusBadge && (
                  <View className={`
                    px-3 py-1 rounded-full border
                    ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}
                  `}>
                    <Text className="text-xs font-bold uppercase tracking-wide">
                      {statusBadge.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Tournament Details */}
              <View className="space-y-2 mt-3">
                {/* Location */}
                {tour.location && (
                  <View className="flex-row items-center">
                    <View className="bg-indigo-100 p-1.5 rounded-lg mr-2">
                      <MapPin size={14} color="#4F46E5" weight="bold" />
                    </View>
                    <Text className="text-gray-700 text-sm flex-1" numberOfLines={1}>
                      {tour.location}
                    </Text>
                  </View>
                )}

                {/* Date Range */}
                {(tour.startDate || tour.endDate) && (
                  <View className="flex-row items-center">
                    <View className="bg-indigo-100 p-1.5 rounded-lg mr-2">
                      <CalendarBlank size={14} color="#4F46E5" weight="bold" />
                    </View>
                    <Text className="text-gray-700 text-sm">
                      {formatDate(tour.startDate)}
                      {tour.endDate && ` - ${formatDate(tour.endDate)}`}
                    </Text>
                  </View>
                )}

                {/* Prize Pool */}
                {tour.prizePool && (
                  <View className="flex-row items-center">
                    <View className="bg-amber-100 p-1.5 rounded-lg mr-2">
                      <TrophyIcon size={14} color="#F59E0B" weight="fill" />
                    </View>
                    <Text className="text-gray-700 text-sm font-semibold">
                      Prize Pool: ₹{tour.prizePool.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stats Bar */}
              {(tour.teamSize || tour.teamCount) && (
                <View className="flex-row mt-4 space-x-3">
                  {tour.teamSize && (
                    <View className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-500 text-xs font-medium">
                          TEAM SIZE
                        </Text>
                        <Users size={16} color="#6B7280" weight="bold" />
                      </View>
                      <Text className="text-gray-900 font-bold text-lg mt-1">
                        {tour.teamSize}
                      </Text>
                    </View>
                  )}

                  {tour.teamCount && (
                    <View className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-gray-500 text-xs font-medium">
                          TEAMS
                        </Text>
                        <Users size={16} color="#6B7280" weight="bold" />
                      </View>
                      <Text className="text-gray-900 font-bold text-lg mt-1">
                        {tour.teamCount}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Tournaments;
