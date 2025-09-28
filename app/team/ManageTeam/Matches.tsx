import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

type Match = {
  vs: string;
  date: string;
  time: string;
};

const Matches: React.FC = () => {
  const { token } = useAuth(); // ✅ get auth token
  const { teamId } = useLocalSearchParams(); // ✅ get teamId from local search params
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://172.20.10.4:8080/api/v1";

  useEffect(() => {
    const fetchMatches = async () => {
      if (!teamId || !token) {
        Alert.alert("Error", "Missing team ID or authentication token");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/team/${teamId}/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMatches(response.data.matches || []);
      } catch (error) {
        console.error("Error fetching matches:", error);
        Alert.alert("Error", "Failed to fetch matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [teamId, token]);

  if (loading) {
    return <ActivityIndicator size="large" color="#1D4ED8" />;
  }

  if (matches.length === 0) {
    return (
      <View className="p-4">
        <Text className="text-center text-gray-500">No matches found.</Text>
      </View>
    );
  }

  return (
    <View className="space-y-2">
      {matches.map((match, index) => (
        <View
          key={index}
          className="flex-row justify-between p-4 bg-white rounded shadow"
        >
          <Text className="text-lg">VS {match.vs}</Text>
          <Text className="text-gray-500">
            {match.date} — {match.time}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default Matches;
