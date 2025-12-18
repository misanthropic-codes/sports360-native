import BottomNavBar from "@/components/BottomNavBar";
import CreateTournamentButton from "@/components/CreatTeamButton";
import FilterTabs from "@/components/FilterTabs2";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import TournamentCard from "@/components/TournmentCard";
import { useAuth } from "@/context/AuthContext";
import { useOrganizerTournamentStore } from "@/store/organizerTournamentStore";
import { useTournamentStore } from "@/store/tournamentStore";
import { router } from "expo-router";
import { Calendar, CheckCircle, Edit } from "lucide-react-native";
import React, { useEffect, useState } from "react";

import {
    ActivityIndicator,
    FlatList,
    StatusBar,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Role = "admin" | "player" | "organizer"; // ✅ New type

const MyTournamentsScreen = () => {
  const tabs = ["All", "Upcoming", "Draft", "Completed"];
  const themeColor: "purple" = "purple";

  const auth = useAuth();
  const token = auth.token;
  const role = auth.user?.role?.toLowerCase() as Role;
  const isOrganizer = role === "organizer";

  // Use role-based tournament store
  const playerTournamentStore = useTournamentStore();
  const organizerTournamentStore = useOrganizerTournamentStore();
  
  // Use appropriate store based on role
  const tournaments = isOrganizer 
    ? organizerTournamentStore.tournaments 
    : playerTournamentStore.tournaments;
  
  const loading = isOrganizer
    ? organizerTournamentStore.loading
    : playerTournamentStore.loading;
  
  const fetchTournaments = isOrganizer
    ? (token: string) => organizerTournamentStore.fetchOrganizerTournaments(token)
    : (token: string) => playerTournamentStore.fetchTournaments(token);

  const [filteredTournaments, setFilteredTournaments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const tabLogos = {
    All: <Calendar />,
    Upcoming: <Calendar />,
    Draft: <Edit />,
    Completed: <CheckCircle />,
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

  // Fetch tournaments on mount with smart caching
  useEffect(() => {
    if (token) {
      fetchTournaments(token);
    }
  }, [token]);

  // Update filtered tournaments when store data changes
  useEffect(() => {
    setFilteredTournaments(tournaments);
    filterTournaments(activeTab, searchQuery);
  }, [tournaments]);

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

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6D28D9" />
        </View>
      ) : (
        <FlatList
          data={filteredTournaments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TournamentCard
              id={item.id}
              name={item.name}
              format={`Team Size: ${item.teamSize}`}
              status={
                item.status === "upcoming"
                  ? "Active"
                  : item.status === "draft"
                    ? "Draft"
                    : "Completed"
              }
              teamCount={item.teamCount}
              matchCount={0}
              revenue={`₹ ${item.prizePool}`}
              dateRange={`${new Date(
                item.startDate
              ).toLocaleDateString()} - ${new Date(
                item.endDate
              ).toLocaleDateString()}`}
              onManagePress={handleManagePress}
              color={themeColor}
              role={role}
            />
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-4">
              No tournaments found
            </Text>
          }
        />
      )}

      <BottomNavBar role={role} type="cricket" />
    </SafeAreaView>
  );
};

export default MyTournamentsScreen;
