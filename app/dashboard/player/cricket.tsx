import AppScreen from "@/components/AppScreen";
import { useAuth } from "@/context/AuthContext";
import { usePlayerAnalyticsStore } from "@/store/playerAnalyticsStore";
import { Team, useTeamStore } from "@/store/teamStore";
import { router } from "expo-router";
import { BookOpen, PlusCircle, Shield, Trophy, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ModalComponent from "react-native-modal";
import Svg, { Circle } from "react-native-svg";
import ActivityCard from "../../../components/ActivityCard";
import BottomNavBar from "../../../components/BottomNavBar";
import Header from "../../../components/Header";
import QuickActionCard from "../../../components/QuickActionCard";
import SectionHeader from "../../../components/SectionHeader";
import StatCard from "../../../components/StatCard";

const CricketHomeScreen = () => {
  const { user, token } = useAuth();
  const { summary, isLoading, fetchAnalytics } = usePlayerAnalyticsStore();

  const { myTeams, fetchTeams } = useTeamStore(); // ✅ Zustand store for teams
  const name = user?.fullName ?? "Player";

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"teams" | "performance" | null>(
    null
  );

  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

  // Fetch analytics and myTeams
  useEffect(() => {
    if (token) fetchAnalytics(token);
    if (token && baseURL) fetchTeams(token, baseURL);
  }, [token]);

  if (isLoading) {
    return (
      <AppScreen
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </AppScreen>
    );
  }

  // 🏆 Win rate values
  const winRate = summary?.winRate ?? 0;
  const strokeDasharray = 2 * Math.PI * 45;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * winRate) / 100;

  const openModal = (type: "teams" | "performance") => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  return (
    <AppScreen
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <Header
        type="welcome"
        name={name}
        avatarUrl={`https://placehold.co/40x40/E2E8F0/4A5568?text=${name.charAt(0)}`}
        onProfilePress={() => router.push("/profile")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* 📊 Top Stats */}
        <View className="flex-row justify-between mt-2">
          <StatCard
            value={summary?.totalMatchesPlayed?.toString() ?? "0"}
            label="Matches"
            color="bg-blue-400"
          />
          <StatCard
            value={summary?.matchesWon?.toString() ?? "0"}
            label="Wins"
            color="bg-green-400"
          />
          <StatCard
            value={summary?.averageScore?.toString() ?? "0"}
            label="Avg Score"
            color="bg-red-400"
          />
        </View>

        {/* 🏆 Win Rate */}
        <SectionHeader title="Win Rate" />
        <View style={{ alignItems: "center", marginVertical: 16 }}>
          <View style={{ width: 120, height: 120 }}>
            <Svg width={120} height={120}>
              <Circle
                cx={60}
                cy={60}
                r={45}
                stroke="#E5E7EB"
                strokeWidth={10}
                fill="none"
              />
              <Circle
                cx={60}
                cy={60}
                r={45}
                stroke="#22C55E"
                strokeWidth={10}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin="60,60"
              />
            </Svg>
            <View
              style={StyleSheet.absoluteFill}
              className="items-center justify-center"
            >
              <Text className="text-xl font-bold text-green-700">
                {winRate}%
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Win Rate</Text>
            </View>
          </View>
        </View>

        {/* 🏏 Performance Overview */}
        <View className="flex-row items-center justify-between px-2 mt-6 mb-2">
          <SectionHeader title="Performance Overview" />
          <TouchableOpacity onPress={() => openModal("performance")}>
            <Text className="text-red-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>
        {summary ? (
          <View className="bg-gray-100 rounded-2xl p-4 mx-2 mb-4">
            <Text className="text-gray-700 text-sm mb-1">
              <Text className="font-semibold">Total Runs:</Text>{" "}
              {summary.totalRuns ?? 0}
            </Text>
            <Text className="text-gray-700 text-sm mb-1">
              <Text className="font-semibold">Total Wickets:</Text>{" "}
              {summary.totalWickets ?? 0}
            </Text>
            <Text className="text-gray-700 text-sm">
              <Text className="font-semibold">Matches Played:</Text>{" "}
              {summary.totalMatchesPlayed ?? 0}
            </Text>
          </View>
        ) : (
          <Text className="text-center text-gray-400 mt-4">
            No performance data available.
          </Text>
        )}

        {/* 👥 Teams Section */}
        <View className="flex-row items-center justify-between px-2 mt-6 mb-2">
          <SectionHeader title="Your Teams" />
          <TouchableOpacity onPress={() => openModal("teams")}>
            <Text className="text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>
        {myTeams.length > 0 ? (
          myTeams
            .slice(0, 2)
            .map((team: Team) => (
              <ActivityCard
                key={team.id}
                layoutType="simple"
                icon={<Shield size={20} color="white" />}
                description={`${team.name}`}
                timestamp={team.isActive ? "Active" : "Pending"}
              />
            ))
        ) : (
          <Text className="text-center text-gray-400 my-2">
            You haven’t joined any teams yet.
          </Text>
        )}

        {/* ⚡ Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View className="flex-row justify-between mb-4">
          <QuickActionCard
            icon={Trophy}
            label="Join Tournament"
            onPress={() => router.push("/matches/MatchDetail")}
          />
          <QuickActionCard
            icon={Shield}
            label="View Matches"
            onPress={() => router.push("/tournament/ViewTournament")}
          />
        </View>

        <View className="flex-row justify-between">
          <QuickActionCard
            icon={BookOpen}
            label="Book Grounds"
            onPress={() => router.push("/booking/Cricket-booking")}
          />
          <QuickActionCard
            icon={PlusCircle}
            label="Create / Join Team"
            onPress={() => router.push("/team/CreateTeam")}
          />
        </View>
      </ScrollView>

      <BottomNavBar role="player" type="cricket" />

      {/* 🔽 Popup Modal */}
      <ModalComponent
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        style={{ margin: 0, justifyContent: "flex-end" }}
      >
        <View className="bg-white rounded-t-3xl p-5 max-h-[70%]">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold">
              {modalType === "teams" ? "Your Teams" : "Full Performance Stats"}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <X size={22} color="gray" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {modalType === "teams" &&
              myTeams.map((team: Team) => (
                <View key={team.id} className="bg-gray-100 rounded-xl p-3 mb-2">
                  <Text className="font-semibold text-gray-800">
                    {team.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {team.isActive ? "Active" : "Pending"}
                  </Text>
                </View>
              ))}

            {modalType === "performance" && summary && (
              <View className="bg-gray-50 rounded-xl p-3">
                {Object.entries(summary).map(([key, value]) => (
                  <View
                    key={key}
                    className="flex-row justify-between border-b border-gray-200 py-1"
                  >
                    <Text className="capitalize text-gray-600">{key}</Text>
                    <Text className="font-semibold text-gray-800">
                      {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </ModalComponent>
    </AppScreen>
  );
};

export default CricketHomeScreen;
