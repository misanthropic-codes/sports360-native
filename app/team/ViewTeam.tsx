import { benchMember, unbenchMember } from "@/api/teamApi";
import BottomNavBar from "@/components/BottomNavBar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, MoreVertical, Trophy, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTeamDetailsStore } from "../../store/teamDetailsStore";

const TeamScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { teamId } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<
    "members" | "tournaments" | "matches"
  >("members");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [benchingMemberId, setBenchingMemberId] = useState<string | null>(null);

  // Use teamDetailsStore instead of local state
  const {
    getTeamMembers,
    getTeamTournaments,
    getTeamMatches,
    fetchTeamMembers,
    fetchTeamTournaments,
    fetchTeamMatches,
    updateMemberBenchStatus,
    loading,
  } = useTeamDetailsStore();

  const members = getTeamMembers(teamId as string);
  const tournaments = getTeamTournaments(teamId as string);
  const matches = getTeamMatches(teamId as string);
  const isLoading = loading[teamId as string] || false;

  // Fetch all team data with smart caching
  useEffect(() => {
    if (!user?.token || !teamId) return;

    // Smart fetch - only fetches if not cached
    fetchTeamMembers(teamId as string, user.token);
    fetchTeamTournaments(teamId as string, user.token);
    fetchTeamMatches(teamId as string, user.token);
  }, [teamId, user?.token]);

  const TabButton = ({
    label,
    Icon,
    tab,
  }: {
    label: string;
    Icon?: React.ComponentType<any>;
    tab: typeof activeTab;
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      className={`flex-1 py-3 mx-1 rounded-lg flex-row justify-center items-center ${
        activeTab === tab ? "bg-purple-600" : "bg-purple-100"
      }`}
    >
      {Icon && (
        <Icon
          size={20}
          color={activeTab === tab ? "white" : "#6b21a8"}
          className="mr-2"
        />
      )}
      <Text
        className={`font-semibold ${activeTab === tab ? "text-white" : "text-purple-800"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Check if current user is captain
  const isCaptain = members.some(
    (m) => m.userId === user?.id && m.role.toLowerCase() === "captain"
  );

  // Debug logging
  useEffect(() => {
    console.log("🔍 Captain Check Debug:");
    console.log("  Current User ID:", user?.id);
    console.log("  Is Captain:", isCaptain);
    console.log("  Members:", members.map(m => ({ 
      userId: m.userId, 
      role: m.role, 
      name: m.fullName 
    })));
  }, [isCaptain, members, user?.id]);

  // Handle bench/unbench member with optimistic update
  const handleBenchMember = (memberId: string, currentlyBenched: boolean) => {
    if (!isCaptain) {
      Alert.alert("Unauthorized", "Only team captains can bench/unbench members.");
      return;
    }

    const action = currentlyBenched ? "Unbench" : "Bench";
    Alert.alert(
      `${action} Member`,
      `Are you sure you want to ${action.toLowerCase()} this member?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: currentlyBenched ? "default" : "destructive",
          onPress: async () => {
            try {
              if (!user?.token || !teamId) {
                Alert.alert("Error", "Missing authentication or team information.");
                return;
              }

              setBenchingMemberId(memberId);
              setOpenMenuId(null);

              // Optimistic update
              updateMemberBenchStatus(teamId as string, memberId, !currentlyBenched);

              if (currentlyBenched) {
                await unbenchMember(
                  teamId as string,
                  memberId,
                  user.token
                );
              } else {
                await benchMember(
                  teamId as string,
                  memberId,
                  user.token
                );
              }

              Alert.alert(
                "Success",
                `Member ${currentlyBenched ? "unbenched" : "benched"} successfully`
              );
            } catch (error: any) {
              console.error("Bench/Unbench error:", error);
              // Revert optimistic update on error
              updateMemberBenchStatus(teamId as string, memberId, currentlyBenched);
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  `Failed to ${action.toLowerCase()} member`
              );
            } finally {
              setBenchingMemberId(null);
            }
          },
        },
      ]
    );
  };

  const renderMembers = () => (
    <FlatList
      data={members}
      keyExtractor={(item) => item.userId}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 150 }}
      renderItem={({ item }) => {
        const isProcessing = benchingMemberId === item.userId;
        const showMenu = openMenuId === item.userId;

        return (
          <View className="bg-white rounded-xl p-5 mb-4 shadow-md border border-purple-200">
            {/* Header with Name, Status, and Menu */}
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-purple-900 font-bold text-xl mb-1">
                  {item.fullName}
                </Text>
                <Text className="text-purple-600 text-sm">{item.email}</Text>
              </View>
              <View className="flex-row items-start">
                <View
                  className={`px-3 py-1 rounded-full ${
                    item.isActive ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      item.isActive ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
                {/* Three-Dot Menu - Captain Only */}
                {isCaptain && (
                  <View style={{ marginLeft: 8, zIndex: 1000 }}>
                    <TouchableOpacity
                      onPress={() => {
                        console.log("🎯 Three-dot menu CLICKED for:", item.fullName);
                        console.log("Current showMenu state:", showMenu);
                        setOpenMenuId(showMenu ? null : item.userId);
                      }}
                      style={{
                        padding: 8,
                        backgroundColor: "#f3e8ff",
                        borderRadius: 8,
                        elevation: 2,
                      }}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      <MoreVertical size={20} color="#6b21a8" />
                    </TouchableOpacity>
                    {showMenu && (
                      <View
                        style={{
                          position: "absolute",
                          top: 48,
                          right: 0,
                          backgroundColor: "white",
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#e5e7eb",
                          minWidth: 160,
                          zIndex: 2000,
                          elevation: 5,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            console.log("Bench/Unbench option clicked");
                            handleBenchMember(item.userId, item.isBenched || false);
                          }}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "500",
                              color: item.isBenched ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {item.isBenched ? "Unbench Member" : "Bench Member"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Role Badge and Benched Badge */}
            <View className="mb-3 flex-row gap-2">
              <View
                className={`px-4 py-2 rounded-lg ${
                  item.role.toLowerCase() === "captain"
                    ? "bg-amber-100 border border-amber-300"
                    : "bg-purple-100 border border-purple-300"
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    item.role.toLowerCase() === "captain"
                      ? "text-amber-800"
                      : "text-purple-800"
                  }`}
                >
                  {item.role.toUpperCase()}
                </Text>
              </View>
              {item.isBenched && (
                <View className="px-4 py-2 rounded-lg bg-red-100 border border-red-300">
                  <Text className="font-bold text-sm text-red-800">
                    BENCHED
                  </Text>
                </View>
              )}
            </View>

            {/* Player Stats */}
            <View className="bg-purple-50 rounded-lg p-3 mb-3">
              <Text className="text-purple-900 font-semibold text-sm mb-2">
                Player Profile
              </Text>
              <View className="space-y-1">
                <View className="flex-row">
                  <Text className="text-purple-700 font-medium text-sm w-32">
                    Position:
                  </Text>
                  <Text className="text-purple-900 text-sm flex-1 capitalize">
                    {item.playingPosition}
                  </Text>
                </View>
                <View className="flex-row">
                  <Text className="text-purple-700 font-medium text-sm w-32">
                    Batting Style:
                  </Text>
                  <Text className="text-purple-900 text-sm flex-1 capitalize">
                    {item.battingStyle.replace("_", " ")}
                  </Text>
                </View>
                <View className="flex-row">
                  <Text className="text-purple-700 font-medium text-sm w-32">
                    Bowling Style:
                  </Text>
                  <Text className="text-purple-900 text-sm flex-1 capitalize">
                    {item.bowlingStyle.replace(/_/g, " ")}
                  </Text>
                </View>
                {item.batsmanType && (
                  <View className="flex-row">
                    <Text className="text-purple-700 font-medium text-sm w-32">
                      Batsman Type:
                    </Text>
                    <Text className="text-purple-900 text-sm flex-1 capitalize">
                      {item.batsmanType}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Join Date */}
            <View className="border-t border-purple-100 pt-3">
              <Text className="text-purple-600 text-xs">
              Joined{" "}
              {item.joinedAt && new Date(item.joinedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            </View>
          </View>
        );
      }}
    />
  );

  const renderTournaments = () => (
    <FlatList
      data={tournaments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 150 }}
      renderItem={({ item }) => (
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-purple-100">
          <Text className="text-purple-800 font-bold text-lg">{item.name}</Text>
          <Text className="text-purple-700">
            Start Date: {new Date(item.startDate || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      )}
    />
  );

  const renderMatches = () => (
    <FlatList
      data={matches}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 150 }}
      renderItem={({ item }) => (
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-purple-100">
          <Text className="text-purple-800 font-bold text-lg">
            Opponent: {item.opponentTeamName || "Unknown"}
          </Text>
          <Text className="text-purple-700">
            Date: {new Date(item.matchTime).toLocaleString()}
          </Text>
          {item.result && (
            <Text className="text-purple-700">Result: {item.result}</Text>
          )}
        </View>
      )}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-purple-50">
      {/* Tabs */}
      <View className="flex-row p-2 bg-white shadow-md rounded-xl mx-4 my-4">
        <TabButton label="Members" Icon={Users} tab="members" />
        <TabButton label="Tournaments" Icon={Trophy} tab="tournaments" />
        <TabButton label="Matches" Icon={Calendar} tab="matches" />
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6b21a8" />
        </View>
      ) : (
        <>
          {activeTab === "members" && renderMembers()}
          {activeTab === "tournaments" && renderTournaments()}
          {activeTab === "matches" && renderMatches()}
        </>
      )}

      {/* Bottom Button */}
      <View className="bg-white p-4 border-t border-purple-200 mb-4">
        <TouchableOpacity
          onPress={() => router.push(`/tournament/InviteTeam?teamId=${teamId}`)}
          className="bg-purple-600 py-4 rounded-2xl shadow-lg"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-lg">
            Invite Team for Tournament
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar role="player" type="cricket" />
    </SafeAreaView>
  );
};

export default TeamScreen;
