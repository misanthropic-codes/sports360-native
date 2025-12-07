import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { CheckCircle, Clock, User, XCircle } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Request = {
  userId: string;
  teamId: string;
  status: string;
  requestedAt: string;
  name?: string;
};

const BASE_URL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";

const JoinRequests: React.FC = () => {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const { token } = useAuth();

  const [requests, setRequests] = useState<Request[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId || !token) {
      console.log("Missing teamId or token");
      return;
    }

    const fetchRequests = async () => {
      try {
        setLoading(true);

        const joinRequestsUrl = `${BASE_URL}/team/${teamId}/join-requests`;
        const res = await fetch(joinRequestsUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (json.status === 200 && json.success) {
          const requestsData: Request[] = json.data;

          const requestsWithNames = await Promise.all(
            requestsData.map(async (req) => {
              const userUrl = `${BASE_URL}/user/${req.userId}`;
              const userRes = await fetch(userUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const userJson = await userRes.json();
              return {
                ...req,
                name:
                  userJson.data?.name?.trim() && userJson.data?.name !== ""
                    ? userJson.data.name
                    : "User " + req.userId.slice(0, 5),
              };
            })
          );

          setRequests(requestsWithNames);
        }

        const teamUrl = `${BASE_URL}/team/${teamId}`;
        const teamRes = await fetch(teamUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const teamJson = await teamRes.json();
        setTeamName(teamJson.data?.name || "Unnamed Team");
      } catch (error) {
        console.error("Error fetching join requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [teamId, token]);

  const acceptRequest = async (memberId: string) => {
    try {
      if (!teamId) return;
      setProcessingId(memberId);

      const acceptUrl = `${BASE_URL}/team/${teamId}/join-requests/${memberId}/approve`;
      const res = await fetch(acceptUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setRequests((prev) => prev.filter((req) => req.userId !== memberId));
        Alert.alert("Success", "Join request approved successfully!");
      } else {
        Alert.alert("Failed", json.message || "Could not approve request");
      }
    } catch (error) {
      console.error("Error approving join request:", error);
      Alert.alert("Error", "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const declineRequest = async (memberId: string) => {
    try {
      if (!teamId) return;
      setProcessingId(memberId);

      // Note: Adjust endpoint if your API has a different decline endpoint
      const declineUrl = `${BASE_URL}/team/${teamId}/join-requests/${memberId}/decline`;
      const res = await fetch(declineUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setRequests((prev) => prev.filter((req) => req.userId !== memberId));
        Alert.alert("Request Declined", "Join request has been declined");
      } else {
        Alert.alert("Failed", json.message || "Could not decline request");
      }
    } catch (error) {
      console.error("Error declining join request:", error);
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

  if (loading) {
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
    <View className="space-y-3">
      {/* Header */}
      <View className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-2">
        <Text className="text-indigo-900 font-bold text-lg">
          {requests.length} Pending {requests.length === 1 ? "Request" : "Requests"}
        </Text>
        <Text className="text-indigo-600 text-sm">
          Review and approve new members
        </Text>
      </View>

      {/* Requests List */}
      {requests.map((req) => {
        const isProcessing = processingId === req.userId;
        
        return (
          <View
            key={req.userId}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <View className="flex-row items-start">
              {/* Avatar */}
              <View className="w-12 h-12 rounded-full bg-indigo-500 items-center justify-center mr-4">
                <Text className="text-white font-bold text-base">
                  {getInitials(req.name || "U")}
                </Text>
              </View>

              {/* Request Info */}
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base mb-1">
                  {req.name}
                </Text>
                
                <View className="flex-row items-center mb-3">
                  <Clock size={14} color="#6B7280" weight="bold" />
                  <Text className="text-gray-500 text-xs ml-1">
                    {getTimeAgo(req.requestedAt)}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-2">
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
    </View>
  );
};

export default JoinRequests;
