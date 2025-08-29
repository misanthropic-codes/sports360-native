import { BookOpen, PlusCircle, Shield, Trophy } from "lucide-react-native";
import React from "react";
import { Platform, ScrollView, StatusBar, View } from "react-native";

import AppScreen from "@/components/AppScreen";
import { useAuth } from "@/context/AuthContext"; // ✅ import context
import ActivityCard from "../../../components/ActivityCard";
import BottomNavBar from "../../../components/BottomNavBar";
import Header from "../../../components/Header";
import QuickActionCard from "../../../components/QuickActionCard";
import SectionHeader from "../../../components/SectionHeader";
import StatCard from "../../../components/StatCard";

const CricketHomeScreen: React.FC = () => {
  const { user } = useAuth(); // ✅ get logged in user
  const name = user?.fullName || "Player"; // fallback if no user

  return (
    <AppScreen
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <Header
        type="welcome"
        name={name} // ✅ dynamic name from context
        avatarUrl={`https://placehold.co/40x40/E2E8F0/4A5568?text=${name.charAt(
          0
        )}`}
        onNotificationPress={() => console.log("Notifications clicked")}
        onProfilePress={() => console.log("Profile clicked")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
      >
        {/* Stats Section */}
        <View className="flex-row justify-between mt-2">
          <StatCard value="12" label="Matches" color="bg-blue-400" />
          <StatCard value="6" label="Wins" color="bg-green-400" />
          <StatCard value="159" label="Avg Score" color="bg-red-400" />
        </View>

        {/* Upcoming Activity Section */}
        <SectionHeader title="Upcoming Activity" />
        <ActivityCard
          layoutType="detailed"
          icon={<Shield size={20} color="white" />}
          title="City Tournament"
          subtitle="VS Delhi Riders"
          tag="Booked Free"
          date="12/03/26"
          time="10:00 AM"
          location="Sports Complex"
        />
        <ActivityCard
          layoutType="detailed"
          icon={<Shield size={20} color="white" />}
          title="Practice Match"
          subtitle="VS Punjabi Munde"
          tag="Booked Free"
          date="12/03/26"
          time="10:00 AM"
          location="Ground no.5"
        />

        {/* Recent Activity Section */}
        <SectionHeader title="Recent Activity" />
        <ActivityCard
          layoutType="simple"
          icon={<Trophy size={20} color="gold" />}
          description="You won the match against Chennai Super Kings"
          timestamp="2 hours ago"
        />
        <ActivityCard
          layoutType="simple"
          icon={<Trophy size={20} color="gold" />}
          description="New tournament Summer League 2024 registration open"
          timestamp="1 day ago"
        />

        {/* Quick Actions Section */}
        <SectionHeader title="Quick Actions" />
        <View className="flex-row justify-between mb-4">
          <QuickActionCard icon={Trophy} label="Join Tournaments" />
          <QuickActionCard icon={Shield} label="View Matches" />
        </View>
        <View className="flex-row justify-between">
          <QuickActionCard icon={BookOpen} label="Book Grounds" />
          <QuickActionCard icon={PlusCircle} label="Create / Join Team" />
        </View>
      </ScrollView>

      <BottomNavBar role="player" type="cricket" />
    </AppScreen>
  );
};

export default CricketHomeScreen;
