import { useAuth } from "@/context/AuthContext";
import { useTeamDetailsStore } from "@/store/teamDetailsStore";
import { useLocalSearchParams } from "expo-router";
import { Calendar, Clipboard, Trophy } from "phosphor-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const Matches: React.FC = () => {
  const { token } = useAuth();
  const { teamId } = useLocalSearchParams();

  // Use teamDetailsStore instead of local state
  const {
    getTeamMatches,
    fetchTeamMatches,
    loading,
  } = useTeamDetailsStore();

  const matches = getTeamMatches(teamId as string);
  const isLoading = loading[teamId as string] || false;

  // Fetch matches with smart caching
  useEffect(() => {
    if (!teamId || !token) return;

    fetchTeamMatches(teamId as string, token); // Smart fetch - only if not cached
  }, [teamId, token]);

  const getStatusBadge = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus.includes("completed") || lowerStatus.includes("finished")) {
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        label: "Completed"
      };
    }
    if (lowerStatus.includes("live") || lowerStatus.includes("ongoing")) {
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        label: "Live"
      };
    }
    return {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      label: "Upcoming"
    };
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      })}`;
    }
    
    if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      })}`;
    }
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600 font-medium">Loading matches...</Text>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-16">
        <View className="bg-gray-100 rounded-full p-6 mb-4">
          <Clipboard size={48} color="#9CA3AF" weight="light" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          No Matches Found
        </Text>
        <Text className="text-gray-500 text-center px-8">
          Your team doesn't have any scheduled matches yet
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-3">
      {/* Header */}
      <View className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-2">
        <Text className="text-indigo-900 font-bold text-lg">
          {matches.length} {matches.length === 1 ? "Match" : "Matches"}
        </Text>
        <Text className="text-indigo-600 text-sm">
          Scheduled and completed matches
        </Text>
      </View>

      {/* Matches List */}
      {matches.map((match) => {
        const statusBadge = getStatusBadge(match.status);
        const isCompleted = match.status.toLowerCase().includes("completed") || 
                           match.status.toLowerCase().includes("finished");
        
        return (
          <View
            key={match.id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            {/* Tournament Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <Trophy size={16} color="#6366F1" weight="bold" />
                <Text className="text-gray-900 font-bold text-base ml-2 flex-1" numberOfLines={1}>
                  {match.tournamentName}
                </Text>
              </View>
              
              <View className={`
                px-3 py-1 rounded-full border
                ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}
              `}>
                <Text className="text-xs font-bold uppercase tracking-wide">
                  {statusBadge.label}
                </Text>
              </View>
            </View>

            {/* Match Details */}
            <View className="bg-gray-50 rounded-lg p-4 mb-3">
              {/* Teams */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 font-semibold text-base flex-1" numberOfLines={1}>
                  {match.teamAName || "Team A"}
                </Text>
                <Text className="text-gray-500 font-bold mx-3">VS</Text>
                <Text className="text-gray-900 font-semibold text-base flex-1 text-right" numberOfLines={1}>
                  {match.teamBName || match.opponentTeamName || "Team B"}
                </Text>
              </View>

              {/* Score */}
              {isCompleted && match.scoreA && match.scoreB && (
                <View className="flex-row items-center justify-center mt-2 pt-2 border-t border-gray-200">
                  <Text className="text-indigo-600 font-bold text-2xl">
                    {match.scoreA}
                  </Text>
                  <Text className="text-gray-400 font-bold text-lg mx-4">-</Text>
                  <Text className="text-indigo-600 font-bold text-2xl">
                    {match.scoreB}
                  </Text>
                </View>
              )}
            </View>

            {/* Match Info */}
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Calendar size={16} color="#6B7280" weight="bold" />
                <Text className="text-gray-600 text-sm ml-2">
                  {formatMatchDate(match.matchTime)}
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="bg-gray-200 px-2 py-1 rounded">
                  <Text className="text-gray-700 text-xs font-medium">
                    {match.matchType}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Matches;
