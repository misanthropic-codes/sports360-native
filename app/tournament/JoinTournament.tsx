// app/JoinTournamentScreen.tsx
import {
    getTournamentById,
    joinTournament
} from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import { useTeamStore } from "@/store/teamStore";
import { router, useLocalSearchParams } from "expo-router";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Circle,
    Info,
    MapPin,
    Trophy,
    Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JoinTournamentScreen = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<any>(null);
  const [joining, setJoining] = useState(false);

  const { token, user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Use teamStore instead of local state for teams
  const { myTeams, fetchTeams } = useTeamStore();
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id || !token) return;
        setLoading(true);

        // Fetch tournament details
        const data = await getTournamentById(id, token);
        setTournament(data);

        // Fetch teams using teamStore (smart cached)
        if (token && baseURL) {
          await fetchTeams(token, baseURL);
        }
      } catch (error) {
        console.error("Error fetching tournament details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleJoinTournament = async () => {
    if (!id || !selectedTeam || !token) {
      return;
    }

    try {
      setJoining(true);

      await joinTournament(
        id,
        selectedTeam,
        "Our team is excited to join this tournament!",
        token
      );

      Alert.alert(
        "Success!",
        "Your join request has been sent to the tournament organizer.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error joining tournament:", error);
      Alert.alert("Error", "Failed to send join request. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-700 font-medium text-base">Loading tournament...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Trophy size={64} color="#EF4444" />
          <Text className="text-2xl font-bold text-gray-900 mt-6">Tournament Not Found</Text>
          <Text className="text-gray-600 text-center mt-3 text-base">
            The tournament you're looking for doesn't exist.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-8 bg-indigo-600 px-8 py-4 rounded-xl"
          >
            <Text className="text-white font-semibold text-base">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-gray-900">Join Tournament</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Tournament Card */}
        <View className="bg-white mx-6 mt-6 rounded-2xl border border-gray-200 overflow-hidden">
          {/* Tournament Header */}
          <View className="bg-indigo-600 px-6 py-8">
            <Text className="text-white text-2xl font-bold mb-2">
              {tournament?.name}
            </Text>
            <View className="bg-white px-4 py-2 rounded-lg self-start">
              <Text className="text-indigo-600 text-sm font-bold">
                {tournament?.status?.toUpperCase() || "UPCOMING"}
              </Text>
            </View>
          </View>

          {/* Tournament Details */}
          <View className="px-6 py-8">
            <View className="flex-row items-start mb-5">
              <View className="bg-indigo-100 p-3 rounded-xl mr-4">
                <MapPin size={20} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm font-medium mb-1">Location</Text>
                <Text className="text-gray-900 text-base font-semibold">
                  {tournament?.location || "To be announced"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-5">
              <View className="bg-indigo-100 p-3 rounded-xl mr-4">
                <Calendar size={20} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm font-medium mb-1">Duration</Text>
                <Text className="text-gray-900 text-base font-semibold">
                  {tournament?.startDate && new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' - '}
                  {tournament?.endDate && new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="bg-indigo-100 p-3 rounded-xl mr-4">
                <Users size={20} color="#4F46E5" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-sm font-medium mb-1">Team Size</Text>
                <Text className="text-gray-900 text-base font-semibold">
                  {tournament?.teamSize || "11"} players per team
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Select Team Section */}
        <View className="px-6 mt-8">
          <Text className="text-gray-900 text-lg font-bold mb-4">Select Your Team</Text>

          {myTeams.length > 0 ? (
            <View className="space-y-4">
              {myTeams.map((team) => {
                const isSelected = selectedTeam === team.id;
                return (
                  <TouchableOpacity
                    key={team.id}
                    onPress={() => setSelectedTeam(team.id)}
                    activeOpacity={0.7}
                    className={`flex-row items-center justify-between px-6 py-5 rounded-xl border-2 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <View className="flex-1">
                      <Text className={`text-lg font-bold ${isSelected ? "text-indigo-900" : "text-gray-900"}`}>
                        {team.name}
                      </Text>
                    </View>
                    {isSelected ? (
                      <CheckCircle2 size={28} color="#4F46E5" />
                    ) : (
                      <Circle size={28} color="#D1D5DB" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="bg-white border border-gray-200 rounded-xl p-8 items-center">
              <Users size={56} color="#9CA3AF" />
              <Text className="text-gray-900 font-bold text-lg mt-4">No Teams Available</Text>
              <Text className="text-gray-600 text-center mt-2 text-base leading-6">
                Create a team first to join tournaments
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/team/CreateTeam")}
                className="mt-6 bg-indigo-600 px-8 py-4 rounded-xl"
              >
                <Text className="text-white font-semibold text-base">Create Team</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info Message */}
        {selectedTeam && (
          <View className="mx-6 mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <View className="flex-row items-start">
              <Info size={20} color="#2563EB" style={{ marginTop: 2, marginRight: 12 }} />
              <Text className="text-blue-900 text-sm leading-6 flex-1">
                Your join request will be sent to the tournament organizer for approval.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-6">
        <TouchableOpacity
          disabled={!selectedTeam || joining || myTeams.length === 0}
          onPress={handleJoinTournament}
          activeOpacity={0.8}
          className={`py-5 rounded-xl ${
            selectedTeam && !joining ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          {joining ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-lg">Sending...</Text>
            </View>
          ) : (
            <Text className="text-center text-white font-bold text-lg">
              Join Tournament
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default JoinTournamentScreen;
