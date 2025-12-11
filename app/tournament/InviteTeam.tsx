import { useAuth } from "@/context/AuthContext";
import { Tournament, useTournamentStore } from "@/store/tournamentStore";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api/api";

const InviteTeamScreen = () => {
  const { teamId } = useLocalSearchParams();
  const { token } = useAuth();

  // Use tournament store for cached data
  const { 
    tournaments: allTournaments, 
    loading, 
    fetchTournaments,
    invalidateCache 
  } = useTournamentStore();

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch tournaments on mount (with smart caching)
  useEffect(() => {
    if (token) {
      fetchTournaments(token);
    }
  }, [token]);

  // Filter for active/upcoming tournaments
  const tournaments = useMemo(() => {
    return allTournaments.filter(
      (t: Tournament) => 
        t.status?.toLowerCase() === "upcoming" || 
        t.status?.toLowerCase() === "draft"
    );
  }, [allTournaments]);

  const handleInvite = async () => {
    if (!selectedTournamentId) {
      Alert.alert("Validation Error", "Please select a tournament");
      return;
    }

    if (!teamId) {
      Alert.alert("Error", "Team ID is missing");
      return;
    }

    setSubmitting(true);

    try {
      const payload = message.trim() ? { message: message.trim() } : {};

      const response = await api.post(
        `/tournament/${selectedTournamentId}/invite-team/${teamId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        Alert.alert(
          "Success",
          "Team invitation sent successfully!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("❌ Error inviting team:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to send invitation";
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTournament = tournaments.find(
    (t) => t.id === selectedTournamentId
  );

  return (
    <SafeAreaView className="flex-1 bg-purple-50" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3e8ff" />

      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-2"
        >
          <ArrowLeft size={24} color="#6b21a8" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-purple-800 flex-1">
          Invite Team to Tournament
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#6b21a8" />
              <Text className="text-purple-600 mt-4">Loading tournaments...</Text>
            </View>
          ) : tournaments.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl shadow-sm">
              <Text className="text-purple-800 text-center text-lg">
                No active tournaments available
              </Text>
              <Text className="text-purple-600 text-center mt-2">
                Create a tournament first to invite teams
              </Text>
            </View>
          ) : (
            <>
              {/* Tournament Selection */}
              <View className="mb-6">
                <Text className="text-purple-800 font-semibold text-base mb-2">
                  Select Tournament *
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDropdown(!showDropdown)}
                  className="bg-white border-2 border-purple-200 rounded-xl p-4 flex-row justify-between items-center"
                >
                  <Text
                    className={
                      selectedTournament
                        ? "text-purple-800 font-medium"
                        : "text-purple-400"
                    }
                  >
                    {selectedTournament?.name || "Select a tournament"}
                  </Text>
                  <Text className="text-purple-600 text-lg">▼</Text>
                </TouchableOpacity>

                {/* Dropdown List */}
                {showDropdown && (
                  <View className="bg-white border-2 border-purple-200 rounded-xl mt-2 overflow-hidden shadow-lg">
                    <ScrollView className="max-h-60">
                      {tournaments.map((tournament) => (
                        <TouchableOpacity
                          key={tournament.id}
                          onPress={() => {
                            setSelectedTournamentId(tournament.id);
                            setShowDropdown(false);
                          }}
                          className={`p-4 border-b border-purple-100 ${
                            selectedTournamentId === tournament.id
                              ? "bg-purple-100"
                              : ""
                          }`}
                        >
                          <Text className="text-purple-800 font-semibold text-base">
                            {tournament.name}
                          </Text>
                          <Text className="text-purple-600 text-sm mt-1">
                            {tournament.startDate && new Date(tournament.startDate).toLocaleDateString()}{" "}
                            {tournament.endDate && `- ${new Date(tournament.endDate).toLocaleDateString()}`}
                          </Text>
                          <Text className="text-purple-500 text-xs mt-1 capitalize">
                            Status: {tournament.status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Invitation Message */}
              <View className="mb-6">
                <Text className="text-purple-800 font-semibold text-base mb-2">
                  Invitation Message (Optional)
                </Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Add a personal message to the team..."
                  placeholderTextColor="#c084fc"
                  multiline
                  numberOfLines={6}
                  className="bg-white border-2 border-purple-200 rounded-xl p-4 text-purple-800 text-base"
                  style={{ textAlignVertical: "top", minHeight: 120 }}
                />
                <Text className="text-purple-500 text-xs mt-2">
                  {message.length}/500 characters
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleInvite}
                disabled={submitting || !selectedTournamentId}
                className={`py-4 rounded-2xl flex-row justify-center items-center shadow-lg ${
                  submitting || !selectedTournamentId
                    ? "bg-purple-300"
                    : "bg-purple-600"
                }`}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Send size={20} color="#ffffff" className="mr-2" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Send Invitation
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InviteTeamScreen;
