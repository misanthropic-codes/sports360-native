import { Cricket } from "phosphor-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNavBar from "../../components/BottomNavBar";
import FeaturedEventCard from "../../components/EventsCard";
import FilterTabs from "../../components/FilterTab";
import TopNavBar from "../../components/TopNavbar";
import UpcomingEventCard from "../../components/UpcomingEventCard";

import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Tournament, useTournamentStore } from "../../store/tournamentStore";

const CricketScreen = ({ navigation }: { navigation?: any }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const { user, token } = useAuth();
  
  // Use tournamentStore instead of local state
  const { 
    tournaments: allTournaments, 
    loading, 
    error, 
    fetchTournaments 
  } = useTournamentStore();
  
  const role = user?.role || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "team";
  
  const filterTabs = ["All", "Upcoming", "Live", "Completed"];

  // Initial fetch with smart caching
  useEffect(() => {
    if (token) {
      fetchTournaments(token); // Smart fetch - only if not cached
    }
  }, [token]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    if (!token) return;
    
    try {
      setRefreshing(true);
      await fetchTournaments(token, true); // Force refresh
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  // Get button configuration based on user role and tournament ownership
  const getButtonConfig = useCallback((tournament: Tournament) => {
    if (role === "organizer") {
      if (tournament.organizerId === user?.id) {
        return {
          text: "Manage Now",
          onPress: () => router.push(`/tournament/ManageTournament?id=${tournament.id}` as any),
        };
      }
      return {
        text: "View Details",
        onPress: () => router.push(`/tournament/ViewTournament?id=${tournament.id}` as any),
      };
    }
    return {
      text: "Join Now",
      onPress: () => router.push(`/tournament/JoinTournament?id=${tournament.id}` as any),
    };
  }, [role, user?.id]);

  // Filter user's own tournaments if organizer
  const userTournaments = useMemo(() => {
    if (role !== "organizer" || !user?.id) return [];
    return allTournaments.filter((t) => t.organizerId === user.id);
  }, [allTournaments, role, user?.id]);

  // Get ongoing tournaments for organizer
  const ongoingUserTournaments = useMemo(() => {
    return userTournaments.filter(
      (t) =>
        t.status?.toLowerCase() === "ongoing" ||
        t.status?.toLowerCase() === "live"
    );
  }, [userTournaments]);

  // Filter tournaments based on active tab
  const filteredTournaments = useMemo(() => {
    if (!allTournaments.length) return [];

    let filtered: Tournament[];
    switch (activeTab) {
      case "Upcoming":
        filtered = allTournaments.filter(
          (t) =>
            t.status?.toLowerCase() === "upcoming" ||
            t.status?.toLowerCase() === "scheduled" ||
            !t.status
        );
        break;
      case "Live":
        filtered = allTournaments.filter(
          (t) =>
            t.status?.toLowerCase() === "ongoing" ||
            t.status?.toLowerCase() === "live"
        );
        break;
      case "Completed":
        filtered = allTournaments.filter(
          (t) =>
            t.status?.toLowerCase() === "completed" ||
            t.status?.toLowerCase() === "finished"
        );
        break;
      case "All":
      default:
        filtered = allTournaments;
        break;
    }

    // For organizers, prioritize their own tournaments
    if (role === "organizer" && user?.id) {
      const ownTournaments = filtered.filter((t) => t.organizerId === user.id);
      const otherTournaments = filtered.filter((t) => t.organizerId !== user.id);
      return [...ownTournaments, ...otherTournaments];
    }

    return filtered;
  }, [allTournaments, activeTab, role, user?.id]);

  // Featured tournaments - show ongoing tournaments for organizers, otherwise first 3
  const featuredTournaments = useMemo(() => {
    if (role === "organizer" && ongoingUserTournaments.length > 0) {
      return ongoingUserTournaments.slice(0, 3);
    }
    return filteredTournaments.slice(0, 3);
  }, [filteredTournaments, role, ongoingUserTournaments]);

  // Upcoming tournaments (first 6 from filtered)
  const upcomingTournaments = useMemo(
    () => filteredTournaments.slice(0, 6),
    [filteredTournaments]
  );



  const renderSectionHeader = useCallback(
    (title: string, viewAllRoute?: string) => (
      <View className="flex-row justify-between items-center px-6 mb-6">
        <Text className="text-2xl font-bold text-slate-800 tracking-tight">
          {title}
        </Text>
        {viewAllRoute && (
          <TouchableOpacity
            onPress={() => router.push(viewAllRoute as any)}
            className="bg-indigo-600 px-4 py-2 rounded-full"
            style={{
              shadowColor: "#4F46E5",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-white font-semibold text-sm">View All</Text>
          </TouchableOpacity>
        )}
      </View>
    ),
    []
  );

  const renderSkeletonCard = (
    key: number,
    width: string = "w-80",
    height: string = "h-44"
  ) => (
    <View
      key={key}
      className={`${width} ${height} bg-white rounded-2xl overflow-hidden`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="animate-pulse p-4">
        <View className="h-5 bg-gray-200 rounded-md w-3/4 mb-3" />
        <View className="h-4 bg-gray-100 rounded-md w-full mb-2" />
        <View className="h-4 bg-gray-100 rounded-md w-2/3 mb-4" />
        <View className="flex-row justify-between items-center mt-4">
          <View className="h-9 w-24 bg-gray-200 rounded-lg" />
          <View className="h-9 w-20 bg-indigo-200 rounded-lg" />
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="items-center justify-center py-16 px-6">
      <View
        className="bg-white rounded-full p-6 mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Cricket size={48} color="#94A3B8" weight="fill" />
      </View>
      <Text className="text-xl font-bold text-slate-800 mb-2">
        No {activeTab !== "All" ? activeTab : ""} Tournaments
      </Text>
      <Text className="text-slate-500 text-center mb-6">
        {activeTab === "All"
          ? "There are no tournaments available at the moment."
          : `No ${activeTab.toLowerCase()} tournaments found. Try a different filter.`}
      </Text>
      <TouchableOpacity
        onPress={onRefresh}
        className="bg-indigo-600 px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View className="items-center justify-center py-16 px-6">
      <View className="bg-red-50 rounded-full p-6 mb-4">
        <Cricket size={48} color="#EF4444" weight="fill" />
      </View>
      <Text className="text-xl font-bold text-slate-800 mb-2">
        Oops! Something went wrong
      </Text>
      <Text className="text-slate-500 text-center mb-6">{error}</Text>
      <TouchableOpacity
        onPress={onRefresh}
        className="bg-indigo-600 px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const formatPrice = (price: number | string | undefined): string => {
    if (!price || price === 0 || price === "0") return "Free";
    if (typeof price === "number") return `₹${price}`;
    return price;
  };

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

      {/* Enhanced Header Section with Gradient */}
      <View
        className="bg-white"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <TopNavBar
          title="Cricket Matches"
          showBackButton
          onBackPress={() => navigation?.goBack?.()}
        />
        <View className="px-4 pb-5 pt-1">
          <FilterTabs
            tabs={filterTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130,
        }}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
      >
        {error ? (
          renderErrorState()
        ) : (
          <>
            {/* Featured Events Section */}
            {featuredTournaments.length > 0 && (
              <View className="mt-8">
                {renderSectionHeader(
                  role === "organizer" && ongoingUserTournaments.length > 0
                    ? "My Ongoing Tournaments"
                    : "Featured Events",
                  "/tournament/ViewTournament"
                )}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    gap: 16,
                  }}
                  className="mb-4"
                >
                  {loading
                    ? [1, 2, 3].map((i) => renderSkeletonCard(i, "w-80", "h-52"))
                    : featuredTournaments.map((tournament) => {
                        const buttonConfig = getButtonConfig(tournament);
                        return (
                          <FeaturedEventCard
                            key={tournament.id}
                            date={new Date(tournament.startDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )}
                            title={tournament.name}
                            description={
                              tournament.description ||
                              `${tournament.tournamentFormat || "Tournament"} • ${
                                tournament.teams?.length || 0
                              }/${tournament.maxTeams || "∞"} teams`
                            }
                            location={tournament.location || "Location TBD"}
                            type={tournament.tournamentFormat || "Format TBA"}
                            buttonText={buttonConfig.text}
                            onJoinPress={buttonConfig.onPress}
                          />
                        );
                      })}
                </ScrollView>
              </View>
            )}



            {/* All Events Section */}
            <View className="mt-8">
              {renderSectionHeader(
                activeTab === "All" ? "All Events" : `${activeTab} Events`,
                "/tournament/ViewTournament"
              )}
              
              {loading ? (
                <View className="px-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View key={i} className="mb-4">
                      {renderSkeletonCard(i, "w-full", "h-32")}
                    </View>
                  ))}
                </View>
              ) : upcomingTournaments.length === 0 ? (
                renderEmptyState()
              ) : (
                <View className="px-6">
                  {upcomingTournaments.map((tournament, index) => {
                    const buttonConfig = getButtonConfig(tournament);
                    return (
                      <View
                        key={tournament.id}
                        className={`${
                          index < upcomingTournaments.length - 1 ? "mb-4" : ""
                        }`}
                      >
                        <UpcomingEventCard
                          title={tournament.name}
                          subtitle={
                            tournament.description ||
                            `${tournament.tournamentFormat || "Tournament"} Format`
                          }
                          status={tournament.status || "Upcoming"}
                          price={formatPrice(tournament.entryFee)}
                          date={new Date(tournament.startDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                          location={tournament.location || "Location TBD"}
                          participants={tournament.teams?.length || 0}
                          buttonText={buttonConfig.text}
                          onJoinPress={buttonConfig.onPress}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Enhanced bottom spacing */}
            <View className="h-12" />
          </>
        )}
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default CricketScreen;
