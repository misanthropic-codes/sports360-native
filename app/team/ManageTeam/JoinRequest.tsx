import { approveJoinRequest, rejectJoinRequest } from "@/api/teamApi";
import { useAuth } from "@/context/AuthContext";
import { JoinRequest, useTeamDetailsStore } from "@/store/teamDetailsStore";
import { useLocalSearchParams } from "expo-router";
import { CheckCircle, Clock, User, XCircle } from "phosphor-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function getDisplayName(req: JoinRequest): string {
  return req.fullName || req.name || "Unknown Player";
}

const JoinRequests: React.FC = () => {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const { token } = useAuth();
  const resolvedTeamId = Array.isArray(teamId) ? teamId[0] : teamId;

  const requests = useTeamDetailsStore(
    (state) => state.teamData[resolvedTeamId ?? ""]?.joinRequests ?? []
  );
  const joinRequestsLoaded = useTeamDetailsStore(
    (state) => state.teamData[resolvedTeamId ?? ""]?.joinRequestsLoaded ?? false
  );
  const joinRequestsLoading = useTeamDetailsStore(
    (state) => state.joinRequestsLoading[resolvedTeamId ?? ""] ?? false
  );
  const fetchJoinRequests = useTeamDetailsStore((state) => state.fetchJoinRequests);
  const removeJoinRequest = useTeamDetailsStore((state) => state.removeJoinRequest);
  const fetchTeamMembers = useTeamDetailsStore((state) => state.fetchTeamMembers);

  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedTeamId || !token) return;
    fetchJoinRequests(resolvedTeamId, token);
  }, [resolvedTeamId, token, fetchJoinRequests]);

  const handleApprove = useCallback(
    async (memberId: string) => {
      if (!resolvedTeamId || !token) return;

      setProcessingId(memberId);
      try {
        await approveJoinRequest(resolvedTeamId, memberId, token);
        removeJoinRequest(resolvedTeamId, memberId);
        fetchTeamMembers(resolvedTeamId, token).catch(() => {});
        fetchJoinRequests(resolvedTeamId, token, true).catch(() => {});
        Alert.alert("Success", "Join request approved successfully!");
      } catch (error: any) {
        console.error("Error approving join request:", error);
        Alert.alert(
          "Failed",
          error?.response?.data?.message || "Could not approve request"
        );
        fetchJoinRequests(resolvedTeamId, token, true).catch(() => {});
      } finally {
        setProcessingId(null);
      }
    },
    [resolvedTeamId, token, removeJoinRequest, fetchTeamMembers, fetchJoinRequests]
  );

  const handleReject = useCallback(
    async (memberId: string) => {
      if (!resolvedTeamId || !token) return;

      setProcessingId(memberId);
      try {
        await rejectJoinRequest(resolvedTeamId, memberId, token);
        removeJoinRequest(resolvedTeamId, memberId);
        Alert.alert("Request Declined", "Join request has been declined");
      } catch (error: any) {
        console.error("Error declining join request:", error);
        Alert.alert(
          "Failed",
          error?.response?.data?.message || "Could not decline request"
        );
        fetchJoinRequests(resolvedTeamId, token, true).catch(() => {});
      } finally {
        setProcessingId(null);
      }
    },
    [resolvedTeamId, token, removeJoinRequest, fetchJoinRequests]
  );

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (joinRequestsLoading && !joinRequestsLoaded) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600 font-medium">Loading join requests...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-16">
        <View className="bg-gray-100 rounded-full p-6 mb-4">
          <User size={48} color="#9CA3AF" weight="light" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          No Pending Requests
        </Text>
        <Text className="text-gray-500 text-center px-8">
          There are no pending join requests at the moment
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
      <View
        className="bg-white rounded-2xl p-4 mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text className="text-2xl font-bold text-slate-900">{requests.length}</Text>
        <Text className="text-slate-500 text-sm mt-0.5">
          Pending {requests.length === 1 ? "Request" : "Requests"}
        </Text>
      </View>

      {requests.map((req) => {
        const displayName = getDisplayName(req);
        const isProcessing = processingId === req.userId;

        return (
          <View
            key={req.userId}
            className="bg-white rounded-2xl p-4 mb-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
                <Text className="text-white font-bold text-base">
                  {getInitials(displayName)}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-slate-900 font-semibold text-base mb-1">
                  {displayName}
                </Text>

                {req.message ? (
                  <Text className="text-slate-600 text-sm mb-2" numberOfLines={2}>
                    {req.message}
                  </Text>
                ) : null}

                <View className="flex-row items-center mb-3">
                  <Clock size={14} color="#64748B" weight="bold" />
                  <Text className="text-slate-500 text-xs ml-1">
                    {getTimeAgo(req.requestedAt)}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleApprove(req.userId)}
                    disabled={isProcessing}
                    className={`flex-1 flex-row items-center justify-center py-2.5 px-4 rounded-lg ${
                      isProcessing ? "bg-gray-200" : "bg-green-500"
                    }`}
                    activeOpacity={0.7}
                  >
                    <CheckCircle
                      size={18}
                      weight="bold"
                      color={isProcessing ? "#9CA3AF" : "#ffffff"}
                    />
                    <Text
                      className={`ml-2 font-bold text-sm ${
                        isProcessing ? "text-gray-400" : "text-white"
                      }`}
                    >
                      {isProcessing ? "Processing..." : "Accept"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleReject(req.userId)}
                    disabled={isProcessing}
                    className={`flex-1 flex-row items-center justify-center py-2.5 px-4 rounded-lg border ${
                      isProcessing
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-red-300"
                    }`}
                    activeOpacity={0.7}
                  >
                    <XCircle
                      size={18}
                      weight="bold"
                      color={isProcessing ? "#9CA3AF" : "#EF4444"}
                    />
                    <Text
                      className={`ml-2 font-bold text-sm ${
                        isProcessing ? "text-gray-400" : "text-red-500"
                      }`}
                    >
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default JoinRequests;
