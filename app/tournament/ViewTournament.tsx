import { getAllTournaments } from "@/api/tournamentApi";
import BottomNavBar from "@/components/BottomNavBar";
import CreateTournamentButton from "@/components/CreatTeamButton";
import FilterTabs from "@/components/FilterTabs2";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import TournamentCard from "@/components/TournmentCard";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { Calendar, CheckCircle, Edit } from "lucide-react-native";
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

  const auth = useAuth();
  const token = auth.token;
  const role = auth.user?.role?.toLowerCase() as "organizer" | "player";

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const tabLogos = {
    All: <Calendar />,
    Upcoming: <Calendar />,
    Draft: <Edit />,
    Completed: <CheckCircle />,
  };

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await getAllTournaments(token);
      setTournaments(data);
      setFilteredTournaments(data);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Unified filter function that applies both tab and search filters
  const filterTournaments = (tab: string, query: string) => {
    let filtered = tournaments;

    // Apply tab filter
    if (tab !== "All") {
      filtered = filtered.filter(
        (t) => t.status?.toLowerCase() === tab.toLowerCase()
      );
    }

    // Apply search filter
    if (query.trim()) {
      filtered = filtered.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredTournaments(filtered);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    filterTournaments(tab, searchQuery);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterTournaments(activeTab, text);
  };

  // Direct route instead of modal
  const handleManagePress = (id: string) => {
    if (role === "organizer") {
      router.push(`/tournament/ManageTournament?id=${id}`);
    } else if (role === "player") {
      router.push(`/tournament/JoinTournament?id=${id}`);
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
        <SearchBar 
          placeholder="Search tournaments..." 
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <FilterTabs
          tabs={tabs}
          onTabChange={handleTabChange}
          color={themeColor}
          logos={tabLogos as Record<string, any>}
        />

        {role === "organizer" && (
          <CreateTournamentButton
        title="Create Tournament"
        onPress={() => router.push("/tournament/createTournament")}
        color={themeColor}
          />
        )}

        <View className="mt-2">
          {loading ? (
        <ActivityIndicator size="large" color="#6D28D9" className="mt-4" />
          ) : filteredTournaments.length > 0 ? (
        filteredTournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            id={tournament.id}
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
            matchCount={0}
            revenue={`₹ ${tournament.prizePool}`}
            dateRange={`${new Date(
          tournament.startDate
            ).toLocaleDateString()} - ${new Date(
          tournament.endDate
            ).toLocaleDateString()}`}
            onManagePress={handleManagePress}
            color={themeColor}
            role={role}
          />
        ))
          ) : (
        <Text className="text-center text-gray-500 mt-4">
          No tournaments found
        </Text>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      <BottomNavBar role={role} type="cricket" />
    </SafeAreaView>
  );
};

export default MyTournamentsScreen;
