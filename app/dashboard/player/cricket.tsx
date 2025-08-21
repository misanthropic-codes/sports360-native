// screens/CricketHomeScreen.tsx

import { BookOpen, PlusCircle, Shield, Trophy } from "lucide-react-native";
import React from "react";
import { ScrollView, View } from "react-native";

import AppScreen from "@/components/AppScreen";
import ActivityCard from "../../../components/ActivityCard";
import BottomNavBar from "../../../components/BottomNavBar";
import Header from "../../../components/Header";
import QuickActionCard from "../../../components/QuickActionCard";
import SectionHeader from "../../../components/SectionHeader";
import StatCard from "../../../components/StatCard";

const CricketHomeScreen: React.FC = () => {
  return (
    <AppScreen>
      <Header name="Riya" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
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
          icon={Shield}
          title="City Tournament"
          subtitle="VS Delhi Riders"
          tag="Booked Free"
          date="12/03/26"
          time="10:00 AM"
          location="Sports Complex"
        />
        <ActivityCard
          icon={Shield}
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
          icon={Trophy}
          title="You won the match against Chennai Super Kings"
          timestamp="2 hours ago"
        />
        <ActivityCard
          icon={Trophy}
          title="New tournament Summer League 2024 registration open"
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

      <BottomNavBar activeScreen="Home" />
    </AppScreen>
  );
};

export default CricketHomeScreen;
