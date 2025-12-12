import BottomNavBar from "@/components/BottomNavBar";
import CreateTournamentButton from "@/components/CreatTeamButton";
import FilterTabs from "@/components/FilterTabs2";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import TournamentCard from "@/components/TournmentCard";
import { useAuth } from "@/context/AuthContext";
import { useOrganizerTournamentStore } from "@/store/organizerTournamentStore";
import { router } from "expo-router";
import { Calendar, CheckCircle, Edit } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Role = "admin" | "player" | "organizer";

const MyTournamentsScreen = () => {
  const tabs = ["All", "Upcoming", "Draft", "Completed"];
  const themeColor: "purple" = "purple";

  const auth = useAuth();
  const token = auth.token;
  const role = auth.user?.role?.toLowerCase() as Role;
  const type = Array.isArray(auth.user?.domains)
    ? auth.user.domains.join(", ")
    : auth.user?.domains || "cricket";

  // Use organizer tournament store for caching
  const { tournaments, loading, fetchOrganizerTournaments } =
    useOrganizerTournamentStore();

  const [filteredTournaments, setFilteredTournaments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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

  // Pull-to-refresh handler
  const onRefresh = async () => {
    if (!token) return;

    setRefreshing(true);
    try {
      await fetchOrganizerTournaments(token, true); // Force refresh
    } catch (error) {
      console.error("Error refreshing tournaments:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Direct route to manage tournament
  const handleManagePress = (id: string) => {
    router.push(`/tournament/ManageTournament?id=${id}`);
  };

  // Fetch tournaments on mount with smart caching
  useEffect(() => {
    if (token) {
      fetchOrganizerTournaments(token);
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
        onBackPress={() => router.back()}
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

      <CreateTournamentButton
        title="Create Tournament"
        onPress={() => router.push("/tournament/createTournament")}
        color={themeColor}
      />

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6D28D9" />
        </View>
      ) : (
        <FlatList
          data={filteredTournaments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6D28D9"]} // Android
              tintColor="#6D28D9" // iOS
            />
          }
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
            <View className="p-4 items-center justify-center py-12">
              <Text className="text-slate-400 text-base">
                No tournaments found
              </Text>
              <Text className="text-slate-400 text-sm mt-1">
                Create a tournament to get started
              </Text>
            </View>
          }
        />
      )}

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default MyTournamentsScreen;
