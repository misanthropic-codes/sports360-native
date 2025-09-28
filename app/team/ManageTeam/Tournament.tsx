import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

const BASE_URL = "http://172.20.10.4:8080/api/v1";

type Tournament = {
  id: string;
  name: string;
};

const Tournaments: React.FC = () => {
  const { teamId } = useLocalSearchParams();
  const { token } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/team/${teamId}/tournaments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTournaments(response.data.tournaments || []);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to fetch tournaments");
      } finally {
        setLoading(false);
      }
    };

    if (teamId && token) {
      fetchTournaments();
    }
  }, [teamId, token]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="space-y-2 p-4">
      {tournaments.length === 0 ? (
        <Text className="text-lg text-center">No tournaments found</Text>
      ) : (
        tournaments.map((tour) => (
          <View key={tour.id} className="p-4 bg-white rounded shadow">
            <Text className="text-lg">{tour.name}</Text>
          </View>
        ))
      )}
    </View>
  );
};

export default Tournaments;
