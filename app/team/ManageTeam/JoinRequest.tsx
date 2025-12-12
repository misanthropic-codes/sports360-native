import { useAuth } from "@/context/AuthContext";
import { useTeamDetailsStore } from "@/store/teamDetailsStore";
import { useLocalSearchParams } from "expo-router";
import { CheckCircle, Clock, User, XCircle } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const BASE_URL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";

const JoinRequests: React.FC = () => {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const { token } = useAuth();

  // Use teamDetailsStore instead of local state
  const {
    getJoinRequests,
    fetchJoinRequests,
    removeJoinRequest,
    loading,
  } = useTeamDetailsStore();

  const requests = getJoinRequests(teamId);
  const isLoading = loading[teamId] || false;
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch join requests with smart caching
  useEffect(() => {
    if (!teamId || !token) return;

    fetchJoinRequests(teamId, token); // Smart fetch - only if not cached
  }, [teamId, token]);

  const acceptRequest = async (memberId: string) => {
    try {
      if (!teamId) return;
      setProcessingId(memberId);

      // Optimistic update
      removeJoinRequest(teamId, memberId);

      const acceptUrl = `${BASE_URL}/team/${teamId}/join-requests/${memberId}/approve`;
      const res = await fetch(acceptUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (res.ok && json.success) {
        // ✅ Invalidate cache and force refresh to update UI
        const { invalidateTeamCache, fetchTeamMembers } = useTeamDetailsStore.getState();
        invalidateTeamCache(teamId);
        
        // Force refresh both members and join requests
        await Promise.all([
          fetchTeamMembers(teamId, token, true),
          fetchJoinRequests(teamId, token, true),
        ]);
        
        Alert.alert("Success", "Join request approved successfully!");
      } else {
        // Revert on error (refetch)
        await fetchJoinRequests(teamId, token, true);
        Alert.alert("Failed", json.message || "Could not approve request");
      }
    } catch (error) {
      console.error("Error approving join request:", error);
      // Revert on error (refetch)
      if (teamId) await fetchJoinRequests(teamId, token, true);
      Alert.alert("Error", "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const declineRequest = async (memberId: string) => {
    try {
      if (!teamId) return;
      setProcessingId(memberId);

      // Optimistic update
      removeJoinRequest(teamId, memberId);

      const declineUrl = `${BASE_URL}/team/${teamId}/join-requests/${memberId}/decline`;
      const res = await fetch(declineUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (res.ok && json.success) {
        // ✅ Invalidate cache and force refresh to update UI
        const { invalidateTeamCache, fetchTeamMembers } = useTeamDetailsStore.getState();
        invalidateTeamCache(teamId);
        
        // Force refresh both members and join requests
        await Promise.all([
          fetchTeamMembers(teamId, token, true),
          fetchJoinRequests(teamId, token, true),
        ]);
        
        Alert.alert("Request Declined", "Join request has been declined");
      } else {
        // Revert on error (refetch)
        await fetchJoinRequests(teamId, token, true);
        Alert.alert("Failed", json.message || "Could not decline request");
      }
    } catch (error) {
      console.error("Error declining join request:", error);
      // Revert on error (refetch)
      if (teamId) await fetchJoinRequests(teamId, token, true);
      Alert.alert("Error", "Failed to decline request");
    } finally {
      setProcessingId(null);
    }
  };

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
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
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
      {/* Header Stats */}
      <View className="bg-white rounded-2xl p-4 mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text className="text-2xl font-bold text-slate-900">
          {requests.length}
        </Text>
        <Text className="text-slate-500 text-sm mt-0.5">
          Pending {requests.length === 1 ? "Request" : "Requests"}
        </Text>
      </View>

      {/* Requests List */}
      {requests.map((req) => {
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
            }}
          >
            <View className="flex-row items-start">
              {/* Avatar */}
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
                <Text className="text-white font-bold text-base">
                  {getInitials(req.name || "User")}
                </Text>
              </View>

              {/* Request Info */}
              <View className="flex-1">
                <Text className="text-slate-900 font-semibold text-base mb-1">
                  {req.name || `User ${req.userId.slice(0, 8)}`}
                </Text>
                
                <View className="flex-row items-center mb-3">
                  <Clock size={14} color="#64748B" weight="bold" />
                  <Text className="text-slate-500 text-xs ml-1">
                    {getTimeAgo(req.requestedAt)}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => acceptRequest(req.userId)}
                    disabled={isProcessing}
                    className={`
                      flex-1 flex-row items-center justify-center py-2.5 px-4 rounded-lg
                      ${isProcessing ? "bg-gray-200" : "bg-green-500"}
                    `}
                    activeOpacity={0.7}
                  >
                    <CheckCircle 
                      size={18} 
                      weight="bold" 
                      color={isProcessing ? "#9CA3AF" : "#ffffff"} 
                    />
                    <Text className={`
                      ml-2 font-bold text-sm
                      ${isProcessing ? "text-gray-400" : "text-white"}
                    `}>
                      {isProcessing ? "Processing..." : "Accept"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => declineRequest(req.userId)}
                    disabled={isProcessing}
                    className={`
                      flex-1 flex-row items-center justify-center py-2.5 px-4 rounded-lg border
                      ${isProcessing ? "bg-gray-50 border-gray-200" : "bg-white border-red-300"}
                    `}
                    activeOpacity={0.7}
                  >
                    <XCircle 
                      size={18} 
                      weight="bold" 
                      color={isProcessing ? "#9CA3AF" : "#EF4444"} 
                    />
                    <Text className={`
                      ml-2 font-bold text-sm
                      ${isProcessing ? "text-gray-400" : "text-red-500"}
                    `}>
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
