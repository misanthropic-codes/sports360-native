import { useAuth } from "@/context/AuthContext";
import { usePlayerAnalyticsStore } from "@/store/playerAnalyticsStore";
import { useTeamStore } from "@/store/teamStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import BottomNavBar from "@/components/BottomNavBar";
import {
    Award,
    BookOpen,
    ChevronRight,
    PlusCircle,
    Shield,
    Target,
    Trophy,
    Users,
    X,
} from "lucide-react-native";

const CricketHomeScreen = () => {
  const { user, token } = useAuth();
  const { summary, isLoading, fetchAnalytics } = usePlayerAnalyticsStore();
  const { myTeams, fetchTeams } = useTeamStore();

  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  const name = user?.fullName ?? "Player";
  const role = user?.role?.toLowerCase() || "player";
  const type: string =
    Array.isArray(user?.domains) && user.domains.length > 0
      ? user.domains[0]
      : typeof user?.domains === "string"
      ? user.domains
      : "cricket";

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"teams" | "performance" | null>(
    null
  );

  useEffect(() => {
    if (token) fetchAnalytics(token);
    if (token && baseURL) fetchTeams(token, baseURL);
  }, [token]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  const winRate = summary?.winRate ?? 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * winRate) / 100;

  const openModal = (type: "teams" | "performance") => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const navigateToTeam = (teamId: string) => {
    router.push({
      pathname: "/team/ManageTeam/ManageTeam",
      params: { teamId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" translucent />

      {/* Header: Minimal Rounded Card */}
      <View className="px-4 pt-3 mb-2">
        <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-sm">
          {/* Left */}
          <View className="flex-row items-center flex-1">
            <View className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden mr-3">
              <Image
                className="w-full h-full"
                source={{
                  uri: `https://placehold.co/56x56/E2E8F0/4A5568?text=${name
                    .charAt(0)
                    .toUpperCase()}`,
                }}
              />
            </View>

            <View className="flex-1">
              <Text className="text-xs text-slate-500 font-semibold">
                Welcome back
              </Text>
              <Text className="text-lg font-extrabold text-slate-900">
                {name}
              </Text>
            </View>
          </View>

          {/* Profile */}
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="px-3 py-2 rounded-lg"
          >
            <Text className="text-blue-600 font-bold text-sm">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main scroll content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
      >
        {/* Performance Overview */}
        <Text className="text-slate-500 text-xs font-semibold mt-4 mb-2">
          PERFORMANCE OVERVIEW
        </Text>

        {/* Stats Row */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="bg-indigo-100 w-8 h-8 rounded-md items-center justify-center mb-2">
              <Target size={18} color="#6366F1" />
            </View>
            <Text className="text-2xl font-bold text-slate-900">
              {summary?.totalMatchesPlayed ?? 0}
            </Text>
            <Text className="text-xs font-medium text-slate-500">Matches</Text>
          </View>

          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <View className="bg-emerald-100 w-8 h-8 rounded-md items-center justify-center mb-2">
              <Award size={18} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-slate-900">
              {summary?.matchesWon ?? 0}
            </Text>
            <Text className="text-xs font-medium text-slate-500">Wins</Text>
          </View>
        </View>

        {/* Win Rate + Stats Card */}
        <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <View className="flex-row items-center">
            {/* Win Rate Circle */}
            <View className="items-center">
              <View className="w-24 h-24 mb-1">
                <Svg width={100} height={100}>
                  <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#10B981" />
                      <Stop offset="100%" stopColor="#059669" />
                    </LinearGradient>
                  </Defs>

                  <Circle
                    cx={50}
                    cy={50}
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth={8}
                    fill="none"
                  />

                  <Circle
                    cx={50}
                    cy={50}
                    r={radius}
                    stroke="url(#grad)"
                    strokeWidth={8}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="50,50"
                  />
                </Svg>

                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-xl font-extrabold text-emerald-500">
                    {winRate}%
                  </Text>
                </View>
              </View>

              <Text className="text-xs font-semibold text-slate-500">
                WIN RATE
              </Text>
            </View>

            {/* Stats */}
            <View className="flex-1 ml-6">
              <View className="mb-3">
                <Text className="text-xs text-slate-500 font-semibold mb-1">
                  TOTAL RUNS
                </Text>
                <Text className="text-xl font-bold text-slate-900">
                  {summary?.totalRuns ?? 0}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-xs text-slate-500 font-semibold mb-1">
                  TOTAL WICKETS
                </Text>
                <Text className="text-xl font-bold text-slate-900">
                  {summary?.totalWickets ?? 0}
                </Text>
              </View>

              <View>
                <Text className="text-xs text-slate-500 font-semibold mb-1">
                  AVG SCORE
                </Text>
                <Text className="text-xl font-bold text-amber-500">
                  {summary?.averageScore ?? 0}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => openModal("performance")}
            className="mt-4 pt-3 border-t border-slate-100 flex-row items-center justify-center"
          >
            <Text className="text-blue-600 font-semibold text-sm mr-1">
              View Full Stats
            </Text>
            <ChevronRight size={14} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* TEAMS SECTION */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs font-semibold text-slate-500">
              YOUR TEAMS
            </Text>

            {myTeams.length > 3 && (
              <TouchableOpacity
                onPress={() => openModal("teams")}
                className="flex-row items-center"
              >
                <Text className="text-xs text-blue-600 font-semibold mr-1">
                  See All
                </Text>
                <ChevronRight size={12} color="#6366F1" />
              </TouchableOpacity>
            )}
          </View>

          {myTeams.length > 0 ? (
            myTeams.slice(0, 3).map((team) => (
              <TouchableOpacity
                key={team.id}
                onPress={() => navigateToTeam(team.id)}
                className="bg-white rounded-xl p-4 flex-row items-center mb-3 shadow-sm"
              >
                <View className="bg-slate-100 w-12 h-12 rounded-lg items-center justify-center mr-3">
                  <Shield size={20} color="#6366F1" />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900">
                    {team.name}
                  </Text>

                  <View className="flex-row items-center mt-1">
                    <View
                      className={`w-2 h-2 rounded-full mr-1 ${
                        team.isActive ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    <Text
                      className={`text-xs font-semibold ${
                        team.isActive ? "text-emerald-500" : "text-amber-500"
                      }`}
                    >
                      {team.isActive ? "Active" : "Pending"}
                    </Text>
                  </View>
                </View>

                <ChevronRight size={18} color="#CBD5E1" />
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-xl p-6 items-center shadow-sm">
              <Users size={30} color="#CBD5E1" />
              <Text className="text-slate-400 mt-2 text-sm">No teams yet</Text>

              <TouchableOpacity
                onPress={() => router.push("/team/CreateTeam")}
                className="mt-2"
              >
                <Text className="text-blue-600 font-semibold text-sm">
                  Create or Join a Team
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* QUICK ACTIONS */}
        <View className="mb-10">
          <Text className="text-xs text-slate-500 font-semibold mb-3">
            QUICK ACTIONS
          </Text>

          <View className="flex-row justify-between mb-3">
            <TouchableOpacity
              onPress={() => router.push("/matches/MatchDetail")}
              className="w-[48%] bg-white rounded-xl p-4 shadow-sm"
            >
              <View className="bg-amber-100 w-10 h-10 rounded-lg items-center justify-center mb-3">
                <Trophy size={20} color="#F59E0B" />
              </View>

              <Text className="text-sm font-semibold text-slate-900 leading-5">
                Join{"\n"}Tournament
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/tournament/ViewTournament")}
              className="w-[48%] bg-white rounded-xl p-4 shadow-sm"
            >
              <View className="bg-blue-100 w-10 h-10 rounded-lg items-center justify-center mb-3">
                <Shield size={20} color="#2563EB" />
              </View>
              <Text className="text-sm font-semibold text-slate-900 leading-5">
                View{"\n"}Matches
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => router.push("/booking/Cricket-booking")}
              className="w-[48%] bg-white rounded-xl p-4 shadow-sm"
            >
              <View className="bg-emerald-100 w-10 h-10 rounded-lg items-center justify-center mb-3">
                <BookOpen size={20} color="#10B981" />
              </View>
              <Text className="text-sm font-semibold text-slate-900 leading-5">
                Book{"\n"}Grounds
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/team/CreateTeam")}
              className="w-[48%] bg-white rounded-xl p-4 shadow-sm"
            >
              <View className="bg-purple-100 w-10 h-10 rounded-lg items-center justify-center mb-3">
                <PlusCircle size={20} color="#9333EA" />
              </View>
              <Text className="text-sm font-semibold text-slate-900 leading-5">
                Create/Join{"\n"}Team
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVBAR (Matches MyTeamScreen Exactly) */}
      <BottomNavBar role={role} type={type} />

      {/* MODAL */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        style={{ margin: 0, justifyContent: "flex-end" }}
      >
        <View className="bg-white rounded-t-2xl p-6 max-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900">
              {modalType === "teams" ? "All Teams" : "Performance Stats"}
            </Text>

            <TouchableOpacity
              onPress={closeModal}
              className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Teams Modal */}
            {modalType === "teams" &&
              myTeams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  onPress={() => {
                    closeModal();
                    navigateToTeam(team.id);
                  }}
                  className="bg-slate-50 rounded-xl p-4 flex-row items-center mb-3"
                >
                  <View className="bg-white w-12 h-12 rounded-lg items-center justify-center mr-3 shadow-sm">
                    <Shield size={20} color="#6366F1" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900">
                      {team.name}
                    </Text>

                    <View className="flex-row items-center mt-1">
                      <View
                        className={`w-2 h-2 rounded-full mr-1 ${
                          team.isActive ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      <Text
                        className={`text-xs font-semibold ${
                          team.isActive ? "text-emerald-500" : "text-amber-500"
                        }`}
                      >
                        {team.isActive ? "Active" : "Pending"}
                      </Text>
                    </View>
                  </View>

                  <ChevronRight size={18} color="#CBD5E1" />
                </TouchableOpacity>
              ))}

            {/* Performance Modal */}
            {modalType === "performance" && summary && (
              <View className="bg-slate-50 rounded-xl p-4">
                {Object.entries(summary).map(([key, val], index) => (
                  <View
                    key={key}
                    className={`flex-row justify-between py-3 ${
                      index < Object.entries(summary).length - 1
                        ? "border-b border-slate-200"
                        : ""
                    }`}
                  >
                    <Text className="text-xs font-semibold text-slate-500 uppercase">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Text>

                    <Text className="text-sm font-bold text-slate-900">
                      {String(val)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CricketHomeScreen;
