// screens/ManageTournamentScreen.tsx
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Ui/Header";
import StatCard from "../components/Ui/StatCard";
import TabNavigation from "../components/Ui/TabNaviagtion";

interface TournamentApiResponse {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl: string;
  teamSize: number;
  teamCount: number;
  prizePool: number;
  status: string;
  createdAt: string;
}

const ManageTournamentScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>(); // ✅ get id from router
  const [tournament, setTournament] = useState<TournamentApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    console.log("Tournament ID from previous screen:", id);
    if (!id) return;

    const fetchTournament = async () => {
      const apiUrl = `https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/tournament/get/${id}`;
      console.log("Calling API:", apiUrl); // ✅ log the API URL

      try {
        const res = await axios.get(apiUrl);
        console.log("API Response:", res.data); // ✅ log the fetched data

        if (res.data?.data?.[0]) {
          setTournament(res.data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching tournament:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="text-gray-500 mt-3">Loading tournament...</Text>
      </View>
    );
  }

  if (!tournament) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-700">Tournament not found</Text>
      </View>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "teams", label: "Teams" },
    { id: "matches", label: "Matches" },
    { id: "results", label: "Results & Scores" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  // Handlers
  const handleEdit = () => console.log("Edit tournament:", tournament.id);
  const handleDelete = () => console.log("Delete tournament:", tournament.id);

  const renderOverview = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row mb-6">
        <StatCard label="Teams" value={tournament.teamCount} />
        <StatCard label="Team Size" value={tournament.teamSize} />
        <StatCard label="Prize Pool" value={`₹${tournament.prizePool}`} />
      </View>
      <View className="bg-white rounded-lg p-4 mb-4">
        <Text className="text-lg font-semibold text-black mb-3">DETAILS</Text>
        <Text className="text-gray-600">Status: {tournament.status}</Text>
        <Text className="text-gray-600">
          Start Date: {new Date(tournament.startDate).toDateString()}
        </Text>
        <Text className="text-gray-600">
          End Date: {new Date(tournament.endDate).toDateString()}
        </Text>
        <Text className="text-gray-600">Location: {tournament.location}</Text>
        <Text className="text-gray-600 mt-2">{tournament.description}</Text>
      </View>
    </View>
  );

  const renderTeams = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-white font-medium text-center">
          Add Team Manually
        </Text>
      </TouchableOpacity>
      <Text className="text-gray-500">No teams data yet</Text>
    </View>
  );

  const renderMatches = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-white font-medium text-center">
          Create Schedule
        </Text>
      </TouchableOpacity>
      <Text className="text-gray-500">No matches data yet</Text>
    </View>
  );

  const renderResults = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-gray-500">No results available</Text>
    </View>
  );

  const renderLeaderboard = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-white font-medium text-center">
          Export Rankings
        </Text>
      </TouchableOpacity>
      <Text className="text-gray-500">No leaderboard data yet</Text>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "teams":
        return renderTeams();
      case "matches":
        return renderMatches();
      case "results":
        return renderResults();
      case "leaderboard":
        return renderLeaderboard();
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />
      <Header
        tournamentName={tournament.name}
        status={tournament.status}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <ScrollView style={{ flex: 1 }}>{renderContent()}</ScrollView>
    </SafeAreaView>
  );
};

export default ManageTournamentScreen;
