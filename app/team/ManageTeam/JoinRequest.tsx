import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams } from "expo-router";
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

  useEffect(() => {
    if (!teamId || !token) {
      console.log("❌ Missing teamId or token");
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
        console.error("❌ Error fetching join requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [teamId, token]);

  const acceptRequest = async (memberId: string) => {
    try {
      if (!teamId) return;

      const acceptUrl = `${BASE_URL}/team/${teamId}/join-requests/${memberId}/approve`;
      const res = await fetch(acceptUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setRequests((prev) => prev.filter((req) => req.userId !== memberId));
        Alert.alert("✅ Success", "Join request approved!");
      } else {
        Alert.alert("❌ Failed", json.message || "Could not approve request");
      }
    } catch (error) {
      console.error("❌ Error approving join request:", error);
      Alert.alert("❌ Error", "Failed to approve request");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-gray-600">Loading Join Requests...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white space-y-4">
      <Text className="text-xl font-bold text-gray-900">
        {teamName} - Join Requests
      </Text>

      {requests.length === 0 ? (
        <Text className="text-gray-500">No pending join requests.</Text>
      ) : (
        requests.map((req, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center p-4 bg-gray-100 rounded-lg"
          >
            <Text className="text-lg font-medium text-gray-900">
              {req.name}
            </Text>
            <TouchableOpacity
              onPress={() => acceptRequest(req.userId)}
              className="px-4 py-2 bg-indigo-600 rounded-lg"
            >
              <Text className="text-white font-semibold">Accept</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

export default JoinRequests;
