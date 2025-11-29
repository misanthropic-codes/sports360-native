// components/Tournament/MatchesTab.tsx
import { deleteMatch, getTeamsByTournament, Team } from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { router } from "expo-router";
import {
    AlertTriangle,
    Calendar,
    Clock,
    FileText,
    Trash2,
    Trophy,
    Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  teamAId: string | null;
  teamBId: string | null;
  matchType: string;
  matchTime: string;
  status: string;
}

const MatchesTab = ({ tournamentId }: { tournamentId: string }) => {
  const { token, user } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deletingMatchId, setDeletingMatchId] = useState<string | null>(null);

  const handleCreateSchedule = () => {
    router.push(`/tournament/GenerateFixtures?id=${tournamentId}`);
  };

  // Function to get team name by ID
  const getTeamName = (teamId: string | null | undefined): string => {
    if (!teamId) return "TBD";
    if (!teams || !Array.isArray(teams))
      return `Team ${teamId.substring(0, 8)}`;

    const team = teams.find((t) => t.id === teamId);
    return team?.name || `Team ${teamId.substring(0, 8)}`;
  };

  // Function to get status color and text
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return { color: "bg-green-100 text-green-800", text: "Completed" };
      case "ongoing":
      case "live":
        return { color: "bg-blue-100 text-blue-800", text: "Live" };
      case "upcoming":
      case "scheduled":
        return { color: "bg-yellow-100 text-yellow-800", text: "Upcoming" };
      case "cancelled":
        return { color: "bg-red-100 text-red-800", text: "Cancelled" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: status };
    }
  };

  // Function to format match type
  const formatMatchType = (matchType: string): string => {
    return matchType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Function to handle match deletion
  const handleDeleteMatch = (matchId: string) => {
    if (user?.role !== "organizer") {
      Alert.alert("Unauthorized", "Only organizers can delete matches.");
      return;
    }

    Alert.alert(
      "Delete Match",
      "Are you sure you want to delete this match? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!token) {
                Alert.alert("Error", "You must be logged in to delete matches.");
                return;
              }

              setDeletingMatchId(matchId);

              await deleteMatch(tournamentId, matchId, token);

              // Remove match from local state
              setMatches((prevMatches) =>
                prevMatches.filter((match) => match.id !== matchId)
              );

              Alert.alert("Success", "Match deleted successfully");
            } catch (error: any) {
              console.error("Delete match error:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete match"
              );
            } finally {
              setDeletingMatchId(null);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return setError("User not authenticated");

      try {
        setLoading(true);
        setError("");

        const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

        // Fetch matches
        const matchesRes = await axios.get(
          `${baseURL}/api/v1/matches/tournament/${tournamentId}/fixtures`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const matchesData = matchesRes.data.fixtures || [];
        setMatches(matchesData);

        // Fetch teams using your existing API function
        try {
          const teamsData = await getTeamsByTournament(tournamentId, token);
          // getTeamsByTournament returns Team[] directly
          setTeams(Array.isArray(teamsData) ? teamsData : []);
        } catch (teamsError) {
          console.log("Could not fetch teams data:", teamsError);
          setTeams([]);
        }
      } catch (err: any) {
        console.log("Error fetching data:", err);
        setError("Failed to load matches");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, token]);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateOnly = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const statusInfo = getStatusInfo(item.status);
    const isDeleting = deletingMatchId === item.id;
    const isOrganizer = user?.role === "organizer";

    return (
      <View className="bg-white rounded-xl mx-4 mb-4 shadow-sm border border-gray-100">
        {/* Header */}
        <View className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 rounded-t-xl border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <Text className="font-semibold text-gray-800 text-sm">
                Round {item.round} • Match {item.matchNumber}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className={`px-2 py-1 rounded-full ${statusInfo.color}`}>
                <Text className="text-xs font-medium">{statusInfo.text}</Text>
              </View>
              {isOrganizer && (
                <TouchableOpacity
                  onPress={() => handleDeleteMatch(item.id)}
                  disabled={isDeleting}
                  className="ml-2 p-2 bg-red-50 rounded-lg active:bg-red-100"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Trash2 size={16} color="#EF4444" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text className="text-purple-600 font-medium text-xs mt-1">
            {formatMatchType(item.matchType)}
          </Text>
        </View>

        {/* Teams Section */}
        <View className="px-4 py-4">
          {/* Team A */}
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-600 font-bold text-sm">A</Text>
            </View>
            <Text className="font-semibold text-gray-800 text-base flex-1">
              {getTeamName(item.teamAId)}
            </Text>
          </View>

          {/* VS Divider */}
          <View className="flex-row items-center justify-center mb-3">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-gray-400 font-medium text-xs">VS</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Team B */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
              <Text className="text-red-600 font-bold text-sm">B</Text>
            </View>
            <Text className="font-semibold text-gray-800 text-base flex-1">
              {getTeamName(item.teamBId)}
            </Text>
          </View>
        </View>

        {/* Match Details Footer */}
        <View className="px-4 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" style={{ marginRight: 8 }} />
              <Text className="text-gray-600 text-sm">
                {formatDateOnly(item.matchTime)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={16} color="#6B7280" style={{ marginRight: 8 }} />
              <Text className="text-gray-600 text-sm font-medium">
                {formatTime(item.matchTime)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Create Schedule Button */}
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="bg-purple-600 px-6 py-4 rounded-xl flex-row items-center justify-center"
          onPress={handleCreateSchedule}
        >
          <Zap size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text className="text-white font-semibold text-base">
            Create Match Schedule
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6B46C1" />
            <Text className="text-gray-500 mt-3 text-sm">
              Loading matches...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-6">
            <AlertTriangle
              size={48}
              color="#EF4444"
              style={{ marginBottom: 16 }}
            />
            <Text className="text-red-500 text-center text-base mb-2">
              {error}
            </Text>
            <TouchableOpacity
              className="bg-red-100 px-4 py-2 rounded-lg"
              onPress={() => {
                setError("");
                setLoading(true);
                // Trigger refetch logic here
              }}
            >
              <Text className="text-red-600 font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : matches.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Trophy size={64} color="#6B7280" style={{ marginBottom: 16 }} />
            <Text className="text-gray-800 font-semibold text-lg mb-2">
              No Matches Yet
            </Text>
            <Text className="text-gray-500 text-center text-sm">
              Create a schedule to generate matches for this tournament
            </Text>
          </View>
        ) : (
          <>
            {/* Matches Count Header */}
            <View className="px-4 py-3 bg-white border-b border-gray-100">
              <View className="flex-row items-center">
                <FileText
                  size={16}
                  color="#374151"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-gray-700 font-medium text-sm">
                  {matches.length} Match{matches.length !== 1 ? "es" : ""}{" "}
                  Scheduled
                </Text>
              </View>
            </View>

            <FlatList
              data={matches}
              renderItem={renderMatch}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 16 }}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default MatchesTab;
