import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
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
  const { token, user } = useAuth();

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");

  // Teams state
  const [teamsMessage, setTeamsMessage] = useState<string | null>(null);
  const [teamsData, setTeamsData] = useState<any[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Fetch tournament details
  useEffect(() => {
    if (!id) return;
    getTournamentById(id)
      .then(setTournament)
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch teams when "teams" tab is active
  useEffect(() => {
    if (activeTab === "teams" && id) {
      setTeamsLoading(true);
      getTeamsByTournament(id)
        .then((res) => {
          setTeamsMessage(res?.message || "");
          setTeamsData(res?.data || []); // ✅ store array
        })
        .catch(() => {
          setTeamsMessage("Error fetching teams.");
          setTeamsData([]);
        })
        .finally(() => setTeamsLoading(false));
    }
  }, [activeTab, id]);

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
              await deleteTournament(id, token);
              Alert.alert("Success", "Tournament deleted successfully");
              router.push("/tournament/ViewTournament");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete tournament"
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
            teamsData={teamsData} // ✅ pass actual array
          />
        );
      case "matches":
        return <MatchesTab />;
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
        onEdit={() => {}}
        onDelete={handleDelete}
      />
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {renderContent()}
    </SafeAreaView>
  );
};

export default ManageTournamentScreen;
