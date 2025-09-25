// components/Tournament/TeamsTab.tsx
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Team {
  id: string;
  name: string;
  description: string;
  location: string;
  sport: string;
  teamType: string;
  teamSize: number;
  code: string;
  logoUrl: string;
}

interface JoinRequest {
  teamId: string;
  tournamentId: string;
  status: string;
  message: string;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  team: Team;
}

const TeamsTab = ({
  teamsMessage,
  teamsLoading,
  teamsData,
}: {
  teamsMessage: string | null;
  teamsLoading: boolean;
  teamsData: Team[];
}) => {
  const { token } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    fetchJoinRequests();
  }, []);

  const fetchJoinRequests = async () => {
    try {
      setLoadingRequests(true);
      const url = `https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/tournament/${id}/join-requests`;
      console.log("📡 Fetching join requests from:", url);

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Join requests response:", res.data);

      // ✅ store only the array from res.data.data
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("❌ Error fetching join requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRequestAction = async (
    teamId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const status = action === "accept" ? "approved" : "rejected";
      const url = `https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/tournament/${id}/join-requests/${teamId}/review`;
      console.log(`📡 Sending ${action} request to:`, url);

      const res = await axios.put(
        url,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Request action response:", res.data); // <-- log response

      Alert.alert("Success", `Request ${action}ed successfully.`);
      setRequests((prev) => prev.filter((req) => req.teamId !== teamId));
    } catch (err) {
      console.error(`❌ Error ${action}ing request:`, err);
      Alert.alert("Error", `Failed to ${action} request.`);
    }
  };

  const renderTeam = ({ item }: { item: Team }) => (
    <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm">
      <Image
        source={{ uri: item.logoUrl }}
        className="w-16 h-16 rounded-lg mr-4"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-600">
          {item.sport} • {item.teamType}
        </Text>
        <Text className="text-sm text-gray-500">
          {item.location} | {item.teamSize} players
        </Text>
        <Text className="text-xs text-gray-400 mt-1">Code: {item.code}</Text>
      </View>
    </View>
  );

  const renderRequest = ({ item }: { item: JoinRequest }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: item.team.logoUrl }}
          className="w-14 h-14 rounded-lg mr-3"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {item.team.name}
          </Text>
          <Text className="text-sm text-gray-600">
            {item.team.sport} • {item.team.teamType}
          </Text>
          <Text className="text-sm text-gray-500">
            {item.team.location} | {item.team.teamSize} players
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            Requested At: {new Date(item.requestedAt).toLocaleString()}
          </Text>
        </View>
      </View>
      <Text className="text-sm text-gray-700 mb-3">{item.message}</Text>
      <View className="flex-row justify-end space-x-3">
        <TouchableOpacity
          onPress={() => handleRequestAction(item.teamId, "accept")}
          className="bg-green-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRequestAction(item.teamId, "reject")}
          className="bg-red-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-white text-center font-medium">
          Add Team Manually
        </Text>
      </TouchableOpacity>

      {/* Join Requests */}
      <Text className="text-gray-800 text-base font-semibold mb-2">
        Join Requests
      </Text>
      {loadingRequests ? (
        <View className="items-center mb-4">
          <ActivityIndicator size="small" />
          <Text className="text-gray-500 mt-2">Loading join requests...</Text>
        </View>
      ) : requests.length > 0 ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.teamId}
          renderItem={renderRequest}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text className="text-gray-600 mb-4">No join requests.</Text>
      )}

      {/* Teams */}
      {teamsLoading ? (
        <View className="mt-4 items-center">
          <ActivityIndicator size="small" />
          <Text className="text-gray-500 mt-2">Loading teams...</Text>
        </View>
      ) : teamsData && teamsData.length > 0 ? (
        <>
          <Text className="text-gray-800 text-base font-semibold mb-2">
            Teams
          </Text>
          <FlatList
            data={teamsData}
            keyExtractor={(item) => item.id}
            renderItem={renderTeam}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <Text className="text-gray-700 mt-2">
          {teamsMessage || "No teams data yet."}
        </Text>
      )}
    </View>
  );
};

export default TeamsTab;
