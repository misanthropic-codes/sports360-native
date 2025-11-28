import type { TournamentInvitation } from "@/api/teamApi";
import { getTournamentInvitations, respondToInvitation } from "@/api/teamApi";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { Calendar, Check, MapPin, Trophy, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TournamentInvitations() {
  const { teamId } = useLocalSearchParams();
  const { token } = useAuth();

  const [invitations, setInvitations] = useState<TournamentInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const fetchInvitations = async () => {
    if (!teamId || !token) {
      setLoading(false);
      return;
    }

    console.log("🔍 Fetching invitations for teamId:", teamId);

    try {
      const data = await getTournamentInvitations(
        teamId as string,
        "pending",
        token
      );
      console.log("✅ Tournament Invitations API Response:", data);
      console.log("✅ Is Array?", Array.isArray(data));
      console.log("✅ Length:", data?.length);
      setInvitations(data);
    } catch (error) {
      console.error("❌ Failed to fetch invitations:", error);
      setInvitations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [teamId, token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvitations();
  };

  const handleRespond = async (
    tournamentId: string,
    action: "accept" | "reject"
  ) => {
    if (!teamId || !token) return;

    const actionText = action === "accept" ? "Accept" : "Reject";

    Alert.alert(
      `${actionText} Invitation`,
      `Are you sure you want to ${action} this tournament invitation?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: actionText,
          style: action === "accept" ? "default" : "destructive",
          onPress: async () => {
            setRespondingTo(tournamentId);
            try {
              await respondToInvitation(
                teamId as string,
                tournamentId,
                action,
                undefined,
                token
              );

              // Remove from list
              setInvitations(
                invitations.filter((inv) => inv.tournament.id !== tournamentId)
              );

              Alert.alert(
                "Success",
                `Invitation ${action}ed successfully!`
              );
            } catch (error: any) {
              console.error("Failed to respond to invitation:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  `Failed to ${action} invitation`
              );
            } finally {
              setRespondingTo(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="py-8 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-3 text-gray-600">Loading invitations...</Text>
      </View>
    );
  }

  if (invitations.length === 0) {
    return (
      <View className="py-12 items-center">
        <Trophy size={56} color="#CBD5E1" />
        <Text className="text-gray-400 mt-4 text-center text-base">
          No pending tournament invitations
        </Text>
        <Text className="text-gray-400 text-sm text-center mt-2">
          You'll see invitations from tournament organizers here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      nestedScrollEnabled={true}
    >
      <View className="space-y-4">
        {Array.isArray(invitations) && invitations.map((invitation) => (
          <View
            key={invitation.tournament.id}
            className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm"
          >
            {/* Tournament Header */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 mr-3">
                <Text className="text-xl font-bold text-gray-900 mb-1">
                  {invitation.tournament.name}
                </Text>
                <Text className="text-gray-600 text-sm mb-3">
                  {invitation.tournament.description}
                </Text>

                {/* Status Badge */}
                <View className="bg-blue-50 px-3 py-1.5 rounded-full self-start">
                  <Text className="text-blue-700 text-xs font-semibold uppercase">
                    {invitation.invitationDetails.status}
                  </Text>
                </View>
              </View>

              <View className="bg-indigo-100 rounded-full p-3">
                <Trophy size={24} color="#4F46E5" />
              </View>
            </View>

            {/* Tournament Details Grid */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row flex-wrap gap-3">
                {/* Location */}
                <View className="flex-row items-center flex-1 min-w-[45%]">
                  <MapPin size={16} color="#6B7280" />
                  <View className="ml-2">
                    <Text className="text-gray-500 text-xs">Location</Text>
                    <Text className="text-gray-900 font-semibold text-sm">
                      {invitation.tournament.location}
                    </Text>
                  </View>
                </View>

                {/* Prize Pool */}
                <View className="flex-row items-center flex-1 min-w-[45%]">
                  <Text className="text-lg">💰</Text>
                  <View className="ml-2">
                    <Text className="text-gray-500 text-xs">Prize Pool</Text>
                    <Text className="text-gray-900 font-semibold text-sm">
                      ₹{invitation.tournament.prizePool.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Team Size */}
                <View className="flex-row items-center flex-1 min-w-[45%]">
                  <Text className="text-lg">👥</Text>
                  <View className="ml-2">
                    <Text className="text-gray-500 text-xs">Team Size</Text>
                    <Text className="text-gray-900 font-semibold text-sm">
                      {invitation.tournament.teamSize} players
                    </Text>
                  </View>
                </View>

                {/* Total Teams */}
                <View className="flex-row items-center flex-1 min-w-[45%]">
                  <Text className="text-lg">🏆</Text>
                  <View className="ml-2">
                    <Text className="text-gray-500 text-xs">Total Teams</Text>
                    <Text className="text-gray-900 font-semibold text-sm">
                      {invitation.tournament.teamCount} teams
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tournament Dates */}
            <View className="flex-row items-center mb-3 pb-3 border-b border-gray-100">
              <Calendar size={16} color="#6B7280" />
              <View className="ml-2 flex-1">
                <Text className="text-gray-500 text-xs">Tournament Dates</Text>
                <Text className="text-gray-900 text-sm">
                  {new Date(invitation.tournament.startDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(invitation.tournament.endDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>

            {/* Invited Date */}
            {invitation.invitationDetails.invitedAt && (
              <View className="flex-row items-center mb-3">
                <Calendar size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-2">
                  Invited on{" "}
                  {new Date(invitation.invitationDetails.invitedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}

            {/* Message */}
            {invitation.invitationDetails.message && (
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-500 text-xs font-medium mb-1">
                  MESSAGE FROM ORGANIZER
                </Text>
                <Text className="text-gray-800 text-sm leading-5">
                  {invitation.invitationDetails.message}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row space-x-3 mt-2">
              <TouchableOpacity
                onPress={() => handleRespond(invitation.tournament.id, "accept")}
                disabled={respondingTo === invitation.tournament.id}
                className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center ${
                  respondingTo === invitation.tournament.id
                    ? "bg-gray-300"
                    : "bg-green-600"
                }`}
              >
                {respondingTo === invitation.tournament.id ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Check size={18} color="#ffffff" />
                    <Text className="text-white font-bold text-sm ml-2">
                      Accept Invitation
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRespond(invitation.tournament.id, "reject")}
                disabled={respondingTo === invitation.tournament.id}
                className={`flex-1 py-3.5 rounded-xl flex-row items-center justify-center border-2 ${
                  respondingTo === invitation.tournament.id
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white border-red-200"
                }`}
              >
                {respondingTo === invitation.tournament.id ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <>
                    <X size={18} color="#EF4444" />
                    <Text className="text-red-600 font-bold text-sm ml-2">
                      Reject
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
