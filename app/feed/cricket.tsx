import { Cricket } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, Text, View } from "react-native";
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

const CricketScreen = ({ navigation }: { navigation?: any }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [featuredTournaments, setFeaturedTournaments] = useState<any[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();
  const role = "player";
  const type = "cricket";
  const filterTabs = ["All", "Upcoming", "Live", "Completed"];

  const categories = [
    {
      icon: <Cricket size={28} color="#4338CA" />,
      title: "Test Match",
      eventCount: 10,
      color: "#EEF2FF",
      notificationCount: 1,
      notificationColor: "#4F46E5",
    },
    {
      icon: <Cricket size={28} color="#7E22CE" weight="fill" />,
      title: "ODI Match",
      eventCount: 18,
      color: "#F5F3FF",
      notificationCount: 1,
      notificationColor: "#9333EA",
    },
  ];

  const categories2 = [
    {
      icon: <Cricket size={28} color="#BE123C" weight="fill" />,
      title: "T20 Match",
      eventCount: 30,
      color: "#FEF2F2",
      notificationCount: 2,
      notificationColor: "#DC2626",
    },
    {
      icon: <Cricket size={28} color="#16A34A" weight="fill" />,
      title: "Practice Match",
      eventCount: 15,
      color: "#F0FDF4",
      notificationCount: 3,
      notificationColor: "#16A34A",
    },
  ];

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournaments = await getAllTournaments(token);
        setFeaturedTournaments(tournaments.slice(0, 3));
        setUpcomingTournaments(tournaments.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, [token]);

  const renderSectionHeader = (title: string, viewAllRoute?: string) => (
    <View className="flex-row justify-between items-center px-6 mb-6 mx-2">
      <Text className="text-2xl font-semibold text-slate-800 tracking-tight">
        {title}
      </Text>
      {viewAllRoute && (
        <Text
          className="text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1.5 rounded-full"
          onPress={() => router.push(viewAllRoute)}
        >
          View All
        </Text>
      )}
    </View>
  );

  const renderSkeletonCard = (
    key: number,
    width: string = "w-80",
    height: string = "h-44"
  ) => (
    <View
      key={key}
      className={`${width} ${height} bg-white rounded-2xl border border-gray-50 overflow-hidden`}
      style={{
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      }}
    >
      <View className="animate-pulse">
        <View className="h-4 bg-gray-100 rounded-md mx-4 mt-4" />
        <View className="h-3 bg-gray-100 rounded-md mx-4 mt-3 w-3/4" />
        <View className="h-3 bg-gray-100 rounded-md mx-4 mt-2 w-1/2" />
        <View className="flex-row justify-between items-center mx-4 mt-6">
          <View className="h-8 w-20 bg-gray-100 rounded-lg" />
          <View className="h-8 w-16 bg-indigo-100 rounded-lg" />
        </View>
      </View>
    </View>
  );

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

      {/* Enhanced Header Section */}
      <View
        className="bg-white border-b border-gray-100"
        style={{
          elevation: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.03,
          shadowRadius: 3,
        }}
      >
        <TopNavBar
          title="Matches"
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
        className="flex-1 bg-slate-50"
      >
        {/* Featured Events Section - Enhanced */}
        <View className="mt-8">
          {renderSectionHeader("Featured Events", "/tournament/ViewTournament")}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: 24,
              paddingRight: 24,
              gap: 20,
            }}
            className="mb-4"
          >
            {loading
              ? [1, 2, 3].map((i) => renderSkeletonCard(i))
              : featuredTournaments.map((tournament) => (
                  <FeaturedEventCard
                    key={tournament.id}
                    date={new Date(tournament.startDate).toDateString()}
                    title={tournament.name}
                    description={tournament.description || "No description"}
                    location={tournament.location || "TBD"}
                    type={tournament.tournamentFormat || "TBA"}
                    onJoinPress={() =>
                      router.push(
                        `/tournament/JoinTournament?id=${tournament.id}`
                      )
                    }
                  />
                ))}
          </ScrollView>
        </View>

        {/* Categories Section - Enhanced */}
        <View className="mt-12">
          {renderSectionHeader("Match Categories")}
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
            {[...categories, ...categories2].map((cat) => (
              <CategoryCard key={cat.title} {...cat} />
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Events Section - Enhanced */}
        <View className="mt-12">
          {renderSectionHeader("Upcoming Events", "/tournament/ViewTournament")}
          <View className="px-6 space-y-4">
            {loading
              ? [1, 2, 3, 4, 5].map((i) => (
                  <View key={i} className="mb-4">
                    {renderSkeletonCard(i, "w-full", "h-28")}
                  </View>
                ))
              : upcomingTournaments.map((tournament, index) => (
                  <View
                    key={tournament.id}
                    className={`${index < upcomingTournaments.length - 1 ? "mb-4" : ""}`}
                  >
                    <UpcomingEventCard
                      title={tournament.name}
                      subtitle={tournament.description || "No description"}
                      status={tournament.status || "Upcoming"}
                      price={tournament.entryFee || "Free"}
                      date={new Date(tournament.startDate).toDateString()}
                      location={tournament.location || "TBD"}
                      participants={tournament.teams?.length || 0}
                    />
                  </View>
                ))}
          </View>
        </View>

        {/* Enhanced bottom spacing */}
        <View className="h-12" />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default CricketScreen;
