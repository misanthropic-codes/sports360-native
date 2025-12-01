import { Cricket, Fire, TrendUp, Trophy } from "phosphor-react-native";
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
import CategoryCard from "../../components/CategoriesCard";
import FeaturedEventCard from "../../components/EventsCard";
import FilterTabs from "../../components/FilterTab";
import TopNavBar from "../../components/TopNavbar";
import UpcomingEventCard from "../../components/UpcomingEventCard";

import { router } from "expo-router";
import { getAllTournaments } from "../../api/tournamentApi";
import { useAuth } from "../../context/AuthContext";

interface Tournament {
  id: string;
  name: string;
  description?: string;
  location?: string;
  tournamentFormat?: string;
  status?: string;
  startDate: string;
  endDate?: string;
  entryFee?: number | string;
  teams?: any[];
  maxTeams?: number;
  organizerId?: string;
  imageUrl?: string;
}

const CricketScreen = ({ navigation }: { navigation?: any }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  
  const role = user?.role || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "team";
  
  const filterTabs = ["All", "Upcoming", "Live", "Completed"];

  // Fetch tournaments function
  const fetchTournaments = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const tournaments = await getAllTournaments(token);
      setAllTournaments(tournaments || []);
    } catch (err: any) {
      console.error("Error fetching tournaments:", err);
      setError(err.message || "Failed to load tournaments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Initial fetch
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    fetchTournaments(true);
  }, [fetchTournaments]);

  // Filter tournaments based on active tab
  const filteredTournaments = useMemo(() => {
    if (!allTournaments.length) return [];

    switch (activeTab) {
      case "Upcoming":
        return allTournaments.filter(
          (t) =>
            t.status?.toLowerCase() === "upcoming" ||
            t.status?.toLowerCase() === "scheduled" ||
            !t.status
        );
      case "Live":
        return allTournaments.filter(
          (t) =>
            t.status?.toLowerCase() === "ongoing" ||
            t.status?.toLowerCase() === "live"
        );
      case "Completed":
        return allTournaments.filter(
          (t) =>
            t.status?.toLowerCase() === "completed" ||
            t.status?.toLowerCase() === "finished"
        );
      case "All":
      default:
        return allTournaments;
    }
  }, [allTournaments, activeTab]);

  // Featured tournaments (first 3 from filtered)
  const featuredTournaments = useMemo(
    () => filteredTournaments.slice(0, 3),
    [filteredTournaments]
  );

  // Upcoming tournaments (first 6 from filtered)
  const upcomingTournaments = useMemo(
    () => filteredTournaments.slice(0, 6),
    [filteredTournaments]
  );

  // Dynamic category counts based on tournament format
  const categoryStats = useMemo(() => {
    const knockout = allTournaments.filter(
      (t) => t.tournamentFormat?.toLowerCase() === "knockout"
    ).length;
    const roundRobin = allTournaments.filter(
      (t) => t.tournamentFormat?.toLowerCase() === "round-robin"
    ).length;
    const league = allTournaments.filter(
      (t) => t.tournamentFormat?.toLowerCase() === "league"
    ).length;
    const other = allTournaments.length - knockout - roundRobin - league;

    return { knockout, roundRobin, league, other };
  }, [allTournaments]);

  const categories = useMemo(
    () =>
      [
        {
          icon: <Trophy size={28} color="#4338CA" weight="fill" />,
          title: "Knockout",
          eventCount: categoryStats.knockout,
          color: "#EEF2FF",
          notificationCount: categoryStats.knockout > 0 ? 1 : 0,
          notificationColor: "#4F46E5",
        },
        {
          icon: <Cricket size={28} color="#7E22CE" weight="fill" />,
          title: "Round Robin",
          eventCount: categoryStats.roundRobin,
          color: "#F5F3FF",
          notificationCount: categoryStats.roundRobin > 0 ? 1 : 0,
          notificationColor: "#9333EA",
        },
        {
          icon: <Fire size={28} color="#BE123C" weight="fill" />,
          title: "League",
          eventCount: categoryStats.league,
          color: "#FEF2F2",
          notificationCount: categoryStats.league > 0 ? 2 : 0,
          notificationColor: "#DC2626",
        },
        {
          icon: <TrendUp size={28} color="#16A34A" weight="fill" />,
          title: "Others",
          eventCount: categoryStats.other,
          color: "#F0FDF4",
          notificationCount: categoryStats.other > 0 ? 1 : 0,
          notificationColor: "#16A34A",
        },
      ].filter((cat) => cat.eventCount > 0), // Only show categories with events
    [categoryStats]
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
                  "Featured Events",
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
                    : featuredTournaments.map((tournament) => (
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
                          onJoinPress={() =>
                            router.push(
                              `/tournament/JoinTournament?id=${tournament.id}`
                            )
                          }
                        />
                      ))}
                </ScrollView>
              </View>
            )}

            {/* Categories Section with Dynamic Counts */}
            {categories.length > 0 && (
              <View className="mt-8">
                {renderSectionHeader("Tournament Formats")}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingLeft: 24,
                    paddingRight: 24,
                    gap: 12,
                  }}
                  className="mb-4"
                >
                  {categories.map((cat) => (
                    <CategoryCard key={cat.title} {...cat} />
                  ))}
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
                  {upcomingTournaments.map((tournament, index) => (
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
                        onJoinPress={() =>
                          router.push(
                            `/tournament/JoinTournament?id=${tournament.id}`
                          )
                        }
                      />
                    </View>
                  ))}
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
