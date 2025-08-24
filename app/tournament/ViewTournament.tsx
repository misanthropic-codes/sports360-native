import BottomNavBar from "@/components/BottomNavBar";
import CreateTournamentButton from "@/components/CreatTeamButton";
import FilterTabs from "@/components/FilterTabs2";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import TournamentCard from "@/components/TournmentCard";
import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StatusBar, View } from "react-native";

const tournamentsData = [
  {
    name: "Mumbai Premiere League",
    format: "T20 Format",
    status: "Active",
    teamCount: 16,
    matchCount: 5,
    revenue: "Rs 80K",
    dateRange: "March 10 - March 20",
  },
  {
    name: "Delhi Champions Trophy",
    format: "T20 Format",
    status: "Active",
    teamCount: 16,
    matchCount: 5,
    revenue: "Rs 80K",
    dateRange: "April 5 - April 15",
  },
  {
    name: "Kolkata Super Series",
    format: "One Day",
    status: "Completed",
    teamCount: 12,
    matchCount: 4,
    revenue: "Rs 60K",
    dateRange: "Feb 1 - Feb 10",
  },
  {
    name: "Chennai Cricket Carnival",
    format: "T10 Format",
    status: "Draft",
    teamCount: 8,
    matchCount: 3,
    revenue: "Rs 40K",
    dateRange: "May 20 - May 30",
  },
] as const;

const MyTournamentsScreen = () => {
  const tabs = ["All", "Active", "Draft", "Completed"];

  // 🔥 Set your theme color here: "indigo" | "purple"
  const themeColor: "purple" = "purple";

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
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
          onTabChange={(tab) => console.log(tab)}
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
          {tournamentsData.map((tournament, index) => (
            <TournamentCard
              key={index}
              {...tournament}
              onManagePress={() => console.log("Manage:", tournament.name)}
              color={themeColor}
            />
          ))}
        </View>

        {/* Spacer to prevent content from being hidden by the navbar */}
        <View className="h-24" />
      </ScrollView>

      <BottomNavBar role="player" type="cricket" />
    </SafeAreaView>
  );
};

export default MyTournamentsScreen;
