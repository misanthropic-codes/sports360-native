import { useAuth } from "@/context/AuthContext";
import { useTeamDetailsStore } from "@/store/teamDetailsStore";
import { useLocalSearchParams } from "expo-router";
import { CalendarBlank, CaretDown, CaretUp, MapPin, Trophy as TrophyIcon, Users } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

const Tournaments: React.FC = () => {
  const { teamId } = useLocalSearchParams();
  const { token } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    getTeamTournaments,
    fetchTeamTournaments,
    loading,
  } = useTeamDetailsStore();

  const tournaments = getTeamTournaments(teamId as string);
  const isLoading = loading[teamId as string] || false;

  useEffect(() => {
    if (!teamId || !token) return;
    fetchTeamTournaments(teamId as string, token);
  }, [teamId, token]);

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes("completed") || lowerStatus.includes("finished")) {
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
        label: "Completed"
      };
    }
    if (lowerStatus.includes("live") || lowerStatus.includes("ongoing")) {
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
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
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-slate-600 font-medium">Loading tournaments...</Text>
      </View>
    );
  }

  if (tournaments.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-16">
        <View className="bg-slate-100 rounded-full p-8 mb-4">
          <TrophyIcon size={56} color="#94A3B8" weight="light" />
        </View>
        <Text className="text-xl font-bold text-slate-900 mb-2">
          No Tournaments
        </Text>
        <Text className="text-slate-500 text-center px-8 leading-5">
          Your team hasn't joined any tournaments yet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 px-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
    >
      {/* Header Stats */}
      <View className="px-4 pt-4 pb-3">
        <View className="bg-white rounded-2xl p-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-slate-900">
                {tournaments.length}
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Total
              </Text>
            </View>
            <View className="w-px h-8 bg-slate-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-emerald-600">
                {tournaments.filter(t => {
                  const status = t.status?.toLowerCase() || "";
                  return status.includes("live") || status.includes("ongoing");
                }).length}
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Ongoing
              </Text>
            </View>
            <View className="w-px h-8 bg-slate-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {tournaments.filter(t => {
                  const status = t.status?.toLowerCase() || "";
                  return !status.includes("live") && !status.includes("ongoing") && !status.includes("completed") && !status.includes("finished");
                }).length}
              </Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Upcoming
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tournaments List */}
      {tournaments.map((tour) => {
        const statusBadge = getStatusBadge(tour.status);
        const isExpanded = expandedId === tour.id;
        
        return (
          <TouchableOpacity
            key={tour.id}
            activeOpacity={0.7}
            onPress={() => setExpandedId(isExpanded ? null : tour.id)}
            className="bg-white rounded-2xl mb-3 overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Gradient Header */}
            <View 
              className="px-4 py-3"
              style={{
                backgroundColor: statusBadge?.label === "Ongoing" ? "#10B981" : 
                               statusBadge?.label === "Completed" ? "#64748B" : "#3B82F6"
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
                    {tour.name}
                  </Text>
                  {tour.location && (
                    <View className="flex-row items-center mt-1">
                      <MapPin size={12} color="#FFFFFF" weight="fill" />
                      <Text className="text-white/90 text-xs ml-1" numberOfLines={1}>
                        {tour.location}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Expand Icon */}
                <View className="bg-white/20 rounded-full p-1.5">
                  {isExpanded ? (
                    <CaretUp size={18} color="#FFFFFF" weight="bold" />
                  ) : (
                    <CaretDown size={18} color="#FFFFFF" weight="bold" />
                  )}
                </View>
              </View>

              {/* Status Badge */}
              {statusBadge && (
                <View className="mt-2">
                  <View className="bg-white/20 px-3 py-1 rounded-full self-start">
                    <Text className="text-white text-xs font-bold uppercase">
                      {statusBadge.label}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Collapsed Quick Info */}
            {!isExpanded && (tour.startDate || tour.prizePool) && (
              <View className="px-4 py-3 flex-row items-center justify-between border-t border-slate-100">
                {tour.startDate && (
                  <View className="flex-1 mr-2">
                    <Text className="text-slate-500 text-xs mb-0.5">Start Date</Text>
                    <Text className="text-slate-900 text-sm font-semibold">
                      {formatDate(tour.startDate)}
                    </Text>
                  </View>
                )}
                {tour.prizePool && (
                  <View className="flex-1">
                    <Text className="text-slate-500 text-xs mb-0.5">Prize Pool</Text>
                    <Text className="text-amber-600 text-sm font-bold">
                      ₹{tour.prizePool.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Expanded Details */}
            {isExpanded && (
              <View className="px-4 py-3">
                {/* Description */}
                {tour.description && (
                  <View className="mb-3">
                    <Text className="text-slate-500 text-xs font-semibold mb-1.5 uppercase">
                      About
                    </Text>
                    <Text className="text-slate-700 text-sm leading-5">
                      {tour.description}
                    </Text>
                  </View>
                )}

                {/* Info Grid */}
                <View className="space-y-3 mb-3">
                  {/* Date Range */}
                  {(tour.startDate || tour.endDate) && (
                    <View className="bg-blue-50 rounded-xl p-3">
                      <View className="flex-row items-center mb-1.5">
                        <View className="bg-blue-500 p-1.5 rounded-lg mr-2">
                          <CalendarBlank size={14} color="#FFFFFF" weight="bold" />
                        </View>
                        <Text className="text-blue-900 text-xs font-bold uppercase">
                          Tournament Dates
                        </Text>
                      </View>
                      <Text className="text-blue-900 text-sm font-semibold ml-9">
                        {formatDate(tour.startDate)}
                        {tour.endDate && ` → ${formatDate(tour.endDate)}`}
                      </Text>
                    </View>
                  )}

                  {/* Prize Pool */}
                  {tour.prizePool && (
                    <View className="bg-amber-50 rounded-xl p-3">
                      <View className="flex-row items-center mb-1.5">
                        <View className="bg-amber-500 p-1.5 rounded-lg mr-2">
                          <TrophyIcon size={14} color="#FFFFFF" weight="fill" />
                        </View>
                        <Text className="text-amber-900 text-xs font-bold uppercase">
                          Prize Pool
                        </Text>
                      </View>
                      <Text className="text-amber-900 text-lg font-bold ml-9">
                        ₹{tour.prizePool.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Stats Row */}
                {(tour.teamSize || tour.teamCount) && (
                  <View className="flex-row gap-3">
                    {tour.teamSize && (
                      <View className="flex-1 bg-slate-50 rounded-xl p-3">
                        <View className="flex-row items-center mb-2">
                          <View className="bg-slate-200 p-1 rounded-lg mr-1.5">
                            <Users size={12} color="#475569" weight="bold" />
                          </View>
                          <Text className="text-slate-600 text-xs font-bold uppercase">
                            Team Size
                          </Text>
                        </View>
                        <Text className="text-slate-900 font-extrabold text-xl">
                          {tour.teamSize}
                        </Text>
                        <Text className="text-slate-500 text-xs mt-0.5">
                          Players per team
                        </Text>
                      </View>
                    )}

                    {tour.teamCount && (
                      <View className="flex-1 bg-slate-50 rounded-xl p-3">
                        <View className="flex-row items-center mb-2">
                          <View className="bg-slate-200 p-1 rounded-lg mr-1.5">
                            <Users size={12} color="#475569" weight="bold" />
                          </View>
                          <Text className="text-slate-600 text-xs font-bold uppercase">
                            Total Teams
                          </Text>
                        </View>
                        <Text className="text-slate-900 font-extrabold text-xl">
                          {tour.teamCount}
                        </Text>
                        <Text className="text-slate-500 text-xs mt-0.5">
                          Registered teams
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default Tournaments;
