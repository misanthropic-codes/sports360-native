import BottomNavBar from "@/components/BottomNavBar";
import CreateTournamentButton from "@/components/CreatTeamButton";
import FilterTabs from "@/components/FilterTabs2";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import TournamentCard from "@/components/TournmentCard";
import { useAuth } from "@/context/AuthContext"; // 👈 import AuthContext
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyTournamentsScreen = () => {
  const tabs = ["All", "Upcoming", "Draft", "Completed"];
  const themeColor: "purple" = "purple";

  const { token } = useAuth(); // 👈 get token from AuthContext
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
  // Fetch tournaments from backend
  const fetchTournaments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/tournament/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || [];
      setTournaments(data);
      setFilteredTournaments(data); // default show all
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "All") {
      setFilteredTournaments(tournaments);
    } else {
      setFilteredTournaments(
        tournaments.filter((t) => t.status?.toLowerCase() === tab.toLowerCase())
      );
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50"
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <Header
        title="My Tournaments"
        showBackButton={true}
        onBackPress={() => console.log("Back button pressed")}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SearchBar placeholder="Search..." />

        {/* Filter Tabs */}
        <FilterTabs
          tabs={tabs}
          onTabChange={handleTabChange}
          color={themeColor}
        />

        {/* Create Tournament Button */}
        <CreateTournamentButton
          title="Create Tournament"
          onPress={() => router.push("/tournament/createTournament")}
          color={themeColor}
        />

        {/* Tournament Cards */}
        <View className="mt-2">
          {loading ? (
            <ActivityIndicator size="large" color="#6D28D9" className="mt-4" />
          ) : filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                name={tournament.name}
                format={`Team Size: ${tournament.teamSize}`}
                status={
                  tournament.status === "upcoming"
                    ? "Active"
                    : tournament.status === "draft"
                      ? "Draft"
                      : "Completed"
                }
                teamCount={tournament.teamCount}
                matchCount={0} // backend doesn’t provide match count
                revenue={`₹ ${tournament.prizePool}`}
                dateRange={`${new Date(tournament.startDate).toLocaleDateString()} - ${new Date(
                  tournament.endDate
                ).toLocaleDateString()}`}
                onManagePress={() => console.log("Manage:", tournament.name)}
                color={themeColor}
              />
            ))
          ) : (
            <Text className="text-center text-gray-500 mt-4">
              No tournaments found
            </Text>
          )}
        </View>

        {/* Spacer */}
        <View className="h-24" />
      </ScrollView>

      <BottomNavBar role="player" type="cricket" />
    </SafeAreaView>
  );
};

export default MyTournamentsScreen;
