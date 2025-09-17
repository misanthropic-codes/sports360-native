import BottomNavBar from "@/components/BottomNavBar";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Type definitions
interface TournamentCardProps {
  title: string;
  subtitle: string;
  teams: string;
  matches: string;
  prize: string;
  bgColor: string;
  iconColor: string;
}

interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
}

interface RegistrationCardProps {
  title: string;
  subtitle: string;
}

interface MatchCardProps {
  team1: string;
  team2: string;
  team1Logo: string;
  team2Logo: string;
  status?: string;
}

// Stats Cards Component
const StatsCards: React.FC = () => {
  return (
    <View className="flex-row px-4 py-3 space-x-3">
      <View className="flex-1 bg-green-100 rounded-2xl p-4">
        <Text className="text-green-800 text-2xl font-bold">12</Text>
        <Text className="text-green-700 text-sm font-medium">Matches Won</Text>
      </View>
      <View className="flex-1 bg-blue-100 rounded-2xl p-4">
        <Text className="text-blue-800 text-2xl font-bold">84</Text>
        <Text className="text-blue-700 text-sm font-medium">Matches Played</Text>
      </View>
      <View className="flex-1 bg-red-100 rounded-2xl p-4">
        <Text className="text-red-800 text-2xl font-bold">17</Text>
        <Text className="text-red-700 text-sm font-medium">Matches Lost</Text>
      </View>
    </View>
  );
};

// Tournament Card Component
const TournamentCard: React.FC<TournamentCardProps> = ({
  title,
  subtitle,
  teams,
  matches,
  prize,
  bgColor,
  iconColor,
}) => {
  return (
    <View className={`mx-4 mb-4 ${bgColor} rounded-2xl p-4`}>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className={`w-8 h-8 ${iconColor} rounded-lg items-center justify-center mr-3`}
          >
            <MaterialCommunityIcons name="trophy" size={18} color="white" />
          </View>
          <View>
            <Text className="text-gray-900 font-semibold text-base">{title}</Text>
            <Text className="text-gray-600 text-sm">{subtitle}</Text>
          </View>
        </View>
        <View className="bg-green-500 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-medium">LIVE</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <View className="items-center">
          <Text className="text-gray-900 text-xl font-bold">{teams}</Text>
          <Text className="text-gray-600 text-xs">Teams</Text>
        </View>
        <View className="items-center">
          <Text className="text-gray-900 text-xl font-bold">{matches}</Text>
          <Text className="text-gray-600 text-xs">Matches</Text>
        </View>
        <View className="items-center">
          <Text className="text-gray-900 text-xl font-bold">{prize}</Text>
          <Text className="text-gray-600 text-xs">Prize Pool</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-600 text-sm">Closes 05 : March 05</Text>
        <TouchableOpacity className="bg-purple-600 px-6 py-2 rounded-full">
          <Text className="text-white font-medium">Join now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Section Header Component
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showViewAll = true,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Text className="text-gray-900 font-semibold text-lg">{title}</Text>
      {showViewAll && (
        <TouchableOpacity>
          <Text className="text-purple-600 font-medium">View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Registration Card Component
const RegistrationCard: React.FC<RegistrationCardProps> = ({
  title,
  subtitle,
}) => {
  return (
    <View className="mx-4 mb-3 bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-purple-600 rounded-lg items-center justify-center mr-3">
          <Text className="text-white font-bold">RC</Text>
        </View>
        <View>
          <Text className="text-gray-900 font-semibold text-base">{title}</Text>
          <Text className="text-gray-500 text-sm">{subtitle}</Text>
        </View>
      </View>
      <View className="bg-yellow-400 px-3 py-1 rounded-full">
        <Text className="text-gray-900 text-xs font-medium">Pending</Text>
      </View>
    </View>
  );
};

// Match Card Component
const MatchCard: React.FC<MatchCardProps> = ({
  team1,
  team2,
  team1Logo,
  team2Logo,
  status,
}) => {
  return (
    <View className="mx-4 mb-3 bg-white border border-gray-200 rounded-2xl p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-2">
            <Text className="text-white font-bold text-xs">{team1Logo}</Text>
          </View>
          <Text className="text-gray-900 font-medium mr-4">{team1}</Text>
          <Text className="text-gray-500 text-lg">vs</Text>
          <Text className="text-gray-900 font-medium ml-4">{team2}</Text>
          <View className="w-8 h-8 bg-red-600 rounded-full items-center justify-center ml-2">
            <Text className="text-white font-bold text-xs">{team2Logo}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-gray-500 text-sm">Today at 7:00 PM</Text>
        <TouchableOpacity className="bg-purple-600 px-4 py-2 rounded-full">
          <Text className="text-white font-medium text-sm">Join now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Revenue Summary Component
const RevenueSummary: React.FC = () => {
  return (
    <View className="px-4 py-3">
      <Text className="text-gray-900 font-semibold text-lg mb-4">
        Revenue Summary
      </Text>
      <View className="flex-row space-x-3 mb-4">
        <View className="flex-1 bg-blue-500 rounded-2xl p-4">
          <Text className="text-white text-sm font-medium">This Month</Text>
          <Text className="text-white text-2xl font-bold">Rs 2.5 L</Text>
        </View>
        <View className="flex-1 bg-green-500 rounded-2xl p-4">
          <Text className="text-white text-sm font-medium">Total Earned</Text>
          <Text className="text-white text-2xl font-bold">Rs 8.5 L</Text>
        </View>
      </View>

      <View className="space-y-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-700 font-medium">Mumbai Premier League</Text>
          <Text className="text-gray-900 font-semibold">Rs 80,000/-</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-700 font-medium">Mumbai Premier League</Text>
          <Text className="text-gray-900 font-semibold">Rs 80,000/-</Text>
        </View>
      </View>
    </View>
  );
};

// Main Dashboard Component
const CricketDashboard: React.FC = () => {
  const { user } = useAuth();
  const name = user?.fullName || "Player";

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : {},
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <Header
        type="welcome"
        name={name}
        avatarUrl={`https://placehold.co/40x40/E2E8F0/4A5568?text=${name.charAt(0)}`}
        onNotificationPress={() => console.log("Notifications clicked")}
        onProfilePress={() => router.push("/profile")}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <StatsCards />

        <SectionHeader title="Tournament Overview" />
        <TournamentCard
          title="Mumbai Premier League"
          subtitle="Premier cricket tournament"
          teams="16"
          matches="5"
          prize="Rs 80K"
          bgColor="bg-purple-50"
          iconColor="bg-purple-600"
        />
        <TournamentCard
          title="Mumbai Premier League"
          subtitle="Premier cricket tournament"
          teams="16"
          matches="5"
          prize="Rs 80K"
          bgColor="bg-purple-50"
          iconColor="bg-purple-600"
        />

        <SectionHeader title="Recent Registrations" />
        <RegistrationCard title="Royal Challengers" subtitle="Mumbai Premier League" />
        <RegistrationCard title="Royal Challengers" subtitle="Mumbai Premier League" />
        <RegistrationCard title="Royal Challengers" subtitle="Mumbai Premier League" />

        <SectionHeader title="Upcoming Matches" />
        <MatchCard team1="Mumbai Indians" team2="Chennai Super" team1Logo="MI" team2Logo="CS" />
        <MatchCard team1="Delhi Capitals" team2="Royal Challengers" team1Logo="DC" team2Logo="RC" />

        <RevenueSummary />

        <View className="h-6" />
      </ScrollView>

      <BottomNavBar role="organizer" type="cricket" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
});

export default CricketDashboard;
