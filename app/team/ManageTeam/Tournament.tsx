import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

const BASE_URL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";

type Tournament = {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bannerImageUrl?: string;
  teamSize?: number;
  teamCount?: number;
  prizePool?: number;
  status?: string;
};

const Tournaments: React.FC = () => {
  const { teamId } = useLocalSearchParams();
  const { token } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[useEffect] teamId:", teamId, "token:", token);

    const fetchTournaments = async () => {
      console.log("[fetchTournaments] Starting fetch...");
      try {
        console.log(
          "[fetchTournaments] URL:",
          `${BASE_URL}/team/${teamId}/tournaments`
        );
        console.log("[fetchTournaments] Headers:", {
          Authorization: `Bearer ${token}`,
        });

        const response = await axios.get(
          `${BASE_URL}/team/${teamId}/tournaments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("[fetchTournaments] Response data:", response.data);

        const tournamentsData = response.data?.data?.tournaments || [];

        console.log("[fetchTournaments] Raw tournamentsData:", tournamentsData);

        const tournamentsList = tournamentsData.map(
          (item: any) => item.tournament
        );

        console.log(
          "[fetchTournaments] Parsed tournamentsList:",
          tournamentsList
        );

        setTournaments(tournamentsList);
      } catch (error: any) {
        console.error(
          "[fetchTournaments] Error fetching tournaments:",
          error.response || error
        );
        Alert.alert("Error", "Failed to fetch tournaments");
      } finally {
        console.log("[fetchTournaments] Finished fetching tournaments");
        setLoading(false);
      }
    };

    if (teamId && token) {
      console.log(
        "[useEffect] teamId and token found, calling fetchTournaments()"
      );
      fetchTournaments();
    } else {
      console.log("[useEffect] teamId or token missing");
      setLoading(false);
    }
  }, [teamId, token]);

  console.log("[Render] loading:", loading, "tournaments:", tournaments);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading tournaments...</Text>
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
            <Text className="text-lg font-bold">{tour.name}</Text>
            {tour.description && <Text>{tour.description}</Text>}
            {tour.location && <Text>📍 {tour.location}</Text>}
            {tour.startDate && (
              <Text>
                🗓 Start: {new Date(tour.startDate).toLocaleDateString()}
              </Text>
            )}
            {tour.endDate && (
              <Text>🗓 End: {new Date(tour.endDate).toLocaleDateString()}</Text>
            )}
            {tour.prizePool && <Text>🏆 Prize Pool: ₹{tour.prizePool}</Text>}
          </View>
        ))
      )}
    </View>
  );
};

export default Tournaments;
