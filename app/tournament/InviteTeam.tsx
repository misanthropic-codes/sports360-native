import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useOrganizerTournamentStore } from "@/store/organizerTournamentStore";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar, MapPin, Send, Trophy } from "lucide-react-native";
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

  // Use organizer tournament store (only organizers can invite teams)
  const { 
    tournaments: allTournaments, 
    loading, 
    fetchOrganizerTournaments,
  } = useOrganizerTournamentStore();

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch organizer's tournaments on mount (with smart caching)
  useEffect(() => {
    if (token) {
      fetchOrganizerTournaments(token);
    }
  }, [token]);

  // Filter for active/upcoming tournaments
  const tournaments = useMemo(() => {
    return allTournaments.filter(
      (t) => 
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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      <Header
        type="title"
        title="Invite Team"
        showBackButton
        onBackPress={() => router.back()}
      />

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
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="text-slate-600 mt-4 font-medium">Loading tournaments...</Text>
            </View>
          ) : tournaments.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center border border-emerald-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="bg-emerald-50 p-4 rounded-full mb-4">
                <Trophy size={48} color="#10B981" />
              </View>
              <Text className="text-slate-900 font-bold text-lg text-center mb-2">
                No Active Tournaments
              </Text>
              <Text className="text-slate-600 text-center text-sm leading-5">
                Create a tournament first to invite teams
              </Text>
            </View>
          ) : (
            <>
              {/* Tournament Selection */}
              <View className="mb-6">
                <Text className="text-slate-900 font-bold text-base mb-3">
                  Select Tournament *
                </Text>
                
                {/* Tournament Cards */}
                <View className="gap-4">
                  {tournaments.map((tournament) => {
                    const isSelected = selectedTournamentId === tournament.id;
                    return (
                      <TouchableOpacity
                        key={tournament.id}
                        onPress={() => setSelectedTournamentId(tournament.id)}
                        activeOpacity={0.7}
                        className={`bg-white rounded-2xl p-6 border-2 ${
                          isSelected ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                        }`}
                        style={{
                          shadowColor: isSelected ? "#10B981" : "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isSelected ? 0.15 : 0.05,
                          shadowRadius: 8,
                          elevation: isSelected ? 4 : 2,
                          minHeight: 120,
                        }}
                      >
                        {/* Tournament Header */}
                        <View className="flex-row items-start justify-between mb-4">
                          <View className="flex-1 mr-4">
                            <Text 
                              className={`font-bold text-lg mb-2 ${
                                isSelected ? "text-emerald-900" : "text-slate-900"
                              }`}
                              numberOfLines={2}
                            >
                              {tournament.name}
                            </Text>
                            {tournament.location && (
                              <View className="flex-row items-center mt-1">
                                <MapPin size={16} color={isSelected ? "#059669" : "#64748B"} />
                                <Text 
                                  className={`text-sm ml-2 flex-1 ${
                                    isSelected ? "text-emerald-700" : "text-slate-500"
                                  }`}
                                  numberOfLines={1}
                                >
                                  {tournament.location}
                                </Text>
                              </View>
                            )}
                          </View>
                          
                          {/* Selection Indicator */}
                          <View className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
                            isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                          }`}>
                            {isSelected && (
                              <View className="w-2.5 h-2.5 rounded-full bg-white" />
                            )}
                          </View>
                        </View>

                        {/* Tournament Info */}
                        <View className="flex-row gap-3 pt-4 border-t border-slate-100">
                          {/* Date Range */}
                          {tournament.startDate && (
                            <View className="flex-1 flex-row items-center">
                              <Calendar size={18} color={isSelected ? "#10B981" : "#64748B"} />
                              <Text 
                                className={`text-sm ml-2 flex-1 ${
                                  isSelected ? "text-emerald-700 font-medium" : "text-slate-600"
                                }`}
                                numberOfLines={2}
                              >
                                {new Date(tournament.startDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                                {tournament.endDate && ` - ${new Date(tournament.endDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}`}
                              </Text>
                            </View>
                          )}

                          {/* Status Badge */}
                          <View className={`px-4 py-1.5 rounded-full ${
                            isSelected ? "bg-emerald-200" : "bg-slate-100"
                          }`}>
                            <Text className={`text-xs font-bold uppercase ${
                              isSelected ? "text-emerald-800" : "text-slate-600"
                            }`}>
                              {tournament.status}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Invitation Message */}
              <View className="mb-6">
                <Text className="text-slate-900 font-bold text-base mb-3">
                  Invitation Message (Optional)
                </Text>
                <View className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Add a personal message to the team..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={6}
                    className="p-4 text-slate-900 text-base"
                    style={{ textAlignVertical: "top", minHeight: 140 }}
                    maxLength={500}
                  />
                  <View className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                    <Text className="text-slate-500 text-xs">
                      {message.length}/500 characters
                    </Text>
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleInvite}
                disabled={submitting || !selectedTournamentId}
                className={`py-5 rounded-2xl flex-row justify-center items-center ${
                  submitting || !selectedTournamentId
                    ? "bg-slate-300"
                    : "bg-emerald-600"
                }`}
                style={
                  !submitting && selectedTournamentId
                    ? {
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 6,
                      }
                    : {}
                }
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Send size={22} color="#ffffff" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Send Invitation
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {!selectedTournamentId && (
                <Text className="text-slate-500 text-center text-sm mt-3">
                  Select a tournament to continue
                </Text>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InviteTeamScreen;
