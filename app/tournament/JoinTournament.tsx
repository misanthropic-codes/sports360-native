// app/JoinTournamentScreen.tsx
import {
  getMyTeams,
  getTournamentById,
  joinTournament, // ✅ import new API
  Team,
} from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [joining, setJoining] = useState(false);

  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>(); // 👈 get id from URL

  // Fetch tournament + my teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id || !token) return;
        setLoading(true);

        const data = await getTournamentById(id, token);
        setTournament(data);

        // 🔹 fetch user's teams
        const teamsData = await getMyTeams(token);
        setTeams(teamsData || []);
      } catch (error) {
        console.error("Error fetching tournament details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // Handle Join Tournament
  const handleJoinTournament = async () => {
    if (!id || !selectedTeam || !token) return;

    try {
      setJoining(true);

      await joinTournament(
        id,
        selectedTeam,
        "Our team is excited to join this tournament. We have been preparing for months!",
        token
      );

      setShowTermsModal(false);
      Alert.alert("Success", "Request sent successfully 🎉");
    } catch (error) {
      console.error("Error joining tournament:", error);
      Alert.alert("Error", "Failed to send join request");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-gray-600">Loading Tournament...</Text>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-600 font-semibold">Tournament not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Tournament Info */}
        <View className="bg-blue-100 rounded-2xl p-5 mb-6 shadow">
          <Text className="text-2xl font-bold text-blue-800">
            {tournament?.name}
          </Text>
          <Text className="text-base text-gray-700 mt-2">
            📍 {tournament?.location}
          </Text>
          <Text className="text-base text-gray-700 mt-1">
            🗓 {tournament?.startDate} - {tournament?.endDate}
          </Text>
          <Text className="text-base text-gray-700 mt-1">
            📌 Status: {tournament?.status}
          </Text>
        </View>

        {/* Select Team */}
        <Text className="text-lg font-semibold text-blue-900 mb-3">
          Select Your Team
        </Text>
        {teams.length > 0 ? (
          teams.map((team) => (
            <TouchableOpacity
              key={team.id}
              className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${
                selectedTeam === team.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300"
              }`}
              onPress={() => setSelectedTeam(team.id)}
            >
              <Text className="text-base text-gray-800">{team.name}</Text>
              {selectedTeam === team.id ? (
                <Ionicons name="radio-button-on" size={22} color="#2563EB" />
              ) : (
                <Ionicons name="radio-button-off" size={22} color="gray" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-gray-500">No teams available</Text>
        )}
      </ScrollView>

      {/* Join Button */}
      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          disabled={!selectedTeam}
          onPress={() => setShowTermsModal(true)} // ✅ show modal
          className={`p-4 rounded-2xl ${
            selectedTeam ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <Text className="text-center text-white font-bold text-lg">
            Join Tournament
          </Text>
        </TouchableOpacity>
      </View>

      {/* Terms & Conditions Modal */}
      <Modal visible={showTermsModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-11/12 p-6 rounded-2xl shadow-lg">
            <Text className="text-lg font-bold text-blue-900 mb-3">
              Terms & Conditions
            </Text>
            <Text className="text-gray-700 mb-4">
              By joining this tournament, your team agrees to follow the
              tournament rules and fair play policies.
            </Text>

            <View className="flex-row justify-end mt-4 space-x-3">
              <TouchableOpacity
                onPress={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-xl"
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={joining}
                onPress={handleJoinTournament}
                className={`px-4 py-2 rounded-xl ${
                  joining ? "bg-gray-400" : "bg-blue-600"
                }`}
              >
                <Text className="text-white font-semibold">
                  {joining ? "Joining..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default JoinTournamentScreen;
