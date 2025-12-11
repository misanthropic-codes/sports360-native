import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
} from "react-native";
import Header from "../components/Ui/Header";
import TabNavigation from "../components/Ui/TabNaviagtion";

import {
    deleteTournament,
    getTeamsByTournament,
    getTournamentById,
} from "../api/tournamentApi";

import LeaderboardTab from "../components/Tournament/Leaderboard";
import MatchesTab from "../components/Tournament/MatchesTab";
import OverviewTab from "../components/Tournament/OverviewTab";
import ResultsTab from "../components/Tournament/ResultsTab";
import TeamsTab from "../components/Tournament/TeamsTab";

import { useAuth } from "../context/AuthContext";

const ManageTournamentScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth(); // grab token

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  // Teams state
  const [teamsMessage, setTeamsMessage] = useState<string | null>(null);
  const [teamsData, setTeamsData] = useState<any[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // 🔹 Log token on component mount
  useEffect(() => {
    console.log("Auth token on mount:", token);
  }, [token]);

  // Fetch tournament details
  const fetchTournamentData = async () => {
    if (!id || !token) return;
    try {
      const data = await getTournamentById(id, token);
      setTournament(data);
    } catch (error) {
      console.error("Error fetching tournament:", error);
    }
  };

  // Fetch teams data
  const fetchTeamsData = async () => {
    if (!id || !token) return;
    setTeamsLoading(true);
    try {
      const teams = await getTeamsByTournament(id, token);
      setTeamsMessage("");
      setTeamsData(teams || []);
    } catch (error) {
      setTeamsMessage("Error fetching teams.");
      setTeamsData([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!id || !token) return;
    fetchTournamentData().finally(() => setLoading(false));
  }, [id, token]);

  // Fetch teams when "teams" tab is active
  useEffect(() => {
    if (activeTab === "teams" && id && token) {
      fetchTeamsData();
    }
  }, [activeTab, id]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTournamentData();
      if (activeTab === "teams") {
        await fetchTeamsData();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = () => {
    if (user?.role !== "organizer") {
      Alert.alert("Unauthorized", "Only organizers can delete tournaments.");
      return;
    }

    Alert.alert(
      "Delete Tournament",
      "Are you sure you want to delete this tournament?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!id || !token) return;

              // 🔹 Log the token right before sending the API request
              console.log("Token being sent to deleteTournament:", token);

              const res = await deleteTournament(id, token); // ✅ token passed here
              console.log("Delete response:", res);

              Alert.alert(
                "Success",
                res.message || "Tournament deleted successfully"
              );

              router.push("/tournament/MyTournaments");
            } catch (error: any) {
              console.log("Delete error:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete tournament"
              );
            }
          },
        },
      ]
    );
  };

  if (loading) return <ActivityIndicator size="large" />;
  if (!tournament) return <Text>No tournament found</Text>;

  const tabs = [
    { id: "overview", label: "Overview", icon: "information-circle-outline" },
    { id: "teams", label: "Teams", icon: "people-outline" },
    { id: "matches", label: "Matches", icon: "calendar-outline" },
    { id: "results", label: "Results", icon: "stats-chart-outline" },
    { id: "leaderboard", label: "Leaderboard", icon: "trophy-outline" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab tournament={tournament} />;
      case "teams":
        return (
          <TeamsTab
            teamsMessage={teamsMessage}
            teamsLoading={teamsLoading}
            teamsData={teamsData}
          />
        );
      case "matches":
        return <MatchesTab tournamentId={id}  />;
      case "results":
        return <ResultsTab />;
      case "leaderboard":
        return <LeaderboardTab />;
      default:
        return <OverviewTab tournament={tournament} />;
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
      <Header
        tournamentName={tournament.name}
        status={tournament.status}
        onEdit={() => {
          if (user?.role !== "organizer") {
            Alert.alert("Unauthorized", "Only organizers can edit tournaments.");
            return;
          }
          router.push({
            pathname: "/tournament/editTournament" as any,
            params: { tournamentId: id },
          });
        }}
        onDelete={handleDelete}
      />
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6D28D9"]} // Android
            tintColor="#6D28D9" // iOS
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageTournamentScreen;
