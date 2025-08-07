// screens/RunningHomeScreen.tsx

import { Map, Search, Users } from "lucide-react-native";
import React from "react";
import { ScrollView, View } from "react-native";

// Import reusable components
import ActivityCard from "../../components/ActivityCard";
import AppScreen from "../../components/AppScreen";
import BottomNavBar from "../../components/BottomNavBar";
import Header from "../../components/Header";
import QuickActionCard from "../../components/QuickActionCard";
import SectionHeader from "../../components/SectionHeader";
import StatCard from "../../components/StatCard";

const RunningHomeScreen: React.FC = () => {
  return (
    <AppScreen>
      <Header name="Riya" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Stats Section */}
        <View className="flex-row justify-between mt-2">
          <StatCard value="12" label="Marathons" color="bg-blue-400" />
          <StatCard value="267.5" label="Avg Pace" color="bg-green-400" />
          <StatCard value="159" label="Total Kms" color="bg-red-400" />
        </View>

        {/* Upcoming Activity Section */}
        <SectionHeader title="Upcoming Activity" />
        <ActivityCard
          icon={Users}
          title="Mumbai Marathon"
          subtitle="Full Marathon - 42 kms"
          tag="Full Marathon"
          date="10/05/26"
          time="06:00 AM"
          location="Marine Drive"
        />
        <ActivityCard
          icon={Users}
          title="Delhi Half Marathon"
          subtitle="Half Marathon - 21 kms"
          tag="Registration Open"
          date="12/03/26"
          time="07:00 AM"
          location="Ground no.5"
        />

        {/* Recent Activity Section */}
        <SectionHeader title="Recent Activity" />
        <ActivityCard
          icon={Users}
          title="City Sprint Challenge race report now available"
          timestamp="2 hours ago"
        />
        <ActivityCard
          icon={Users}
          title="Register for Bangalore Marathon 2024"
          timestamp="1 day ago"
        />

        {/* Quick Actions Section */}
        <SectionHeader title="Quick Actions" />
        <View className="flex-row justify-between mb-4">
          <QuickActionCard icon={Users} label="Join Marathons" />
          <QuickActionCard icon={Map} label="View Races" />
        </View>
        <View className="flex-row justify-between">
          <QuickActionCard icon={Search} label="Find Tracks" />
          <QuickActionCard icon={Users} label="Running Groups" />
        </View>
      </ScrollView>

      <BottomNavBar activeScreen="Home" />
    </AppScreen>
  );
};

export default RunningHomeScreen;
