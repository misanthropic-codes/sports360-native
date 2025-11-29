import BottomNavBar from "@/components/BottomNavBar";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Trophy, Users } from "lucide-react-native";
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

type Member = {
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  isActive: boolean;
  addedAt: string;
  addedBy: string;
  updatedAt: string;
  updatedBy: string;
  removedAt: string | null;
  removedBy: string | null;
  fullName: string;
  email: string;
  profilePicUrl: string | null;
  playingPosition: string;
  battingStyle: string;
  bowlingStyle: string;
  batsmanType: string | null;
};

type Tournament = {
  id: string;
  name: string;
  startDate: string;
};

type Match = {
  id: string;
  opponentTeam: string;
  date: string;
  result?: string | null;
};

const TeamScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { teamId } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<
    "members" | "tournaments" | "matches"
  >("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const baseURL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";

  const fetchTeamData = async () => {
    if (!user?.token || !teamId) return;

    setLoading(true);
    const headers = { Authorization: `Bearer ${user.token}` };

    try {
      // Members
      const membersRes = await axios.get(`${baseURL}/team/${teamId}/members`, {
        headers,
      });
      if (membersRes.data?.success) setMembers(membersRes.data.data);

      // Tournaments
      const tournamentsRes = await axios.get(
        `${baseURL}/team/${teamId}/tournaments`,
        { headers }
      );
      if (tournamentsRes.data?.success) {
        const tournamentData = tournamentsRes.data.data.tournaments.map(
          (item: any) => item.tournament
        );
        setTournaments(tournamentData);
      }

      // Matches
      const matchesRes = await axios.get(`${baseURL}/team/${teamId}/matches`, {
        headers,
      });
      if (matchesRes.data?.success) {
        const matchesData = matchesRes.data.data.matches.map((m: any) => ({
          id: m.id,
          opponentTeam: m.opponentTeamName || "Unknown",
          date: m.matchTime,
          result: m.result,
        }));
        setMatches(matchesData);
      }
    } catch (err: any) {
      console.error("❌ Error fetching team data:", err.response?.data || err);
      Alert.alert("Error", "Could not fetch team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
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

  const renderMembers = () => (
    <FlatList
      data={members}
      keyExtractor={(item) => item.userId}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 150 }}
      renderItem={({ item }) => (
        <View className="bg-white rounded-xl p-5 mb-4 shadow-md border border-purple-200">
          {/* Header with Name and Status */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-purple-900 font-bold text-xl mb-1">
                {item.fullName}
              </Text>
              <Text className="text-purple-600 text-sm">{item.email}</Text>
            </View>
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
          </View>

          {/* Role Badge */}
          <View className="mb-3">
            <View
              className={`self-start px-4 py-2 rounded-lg ${
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
              Joined {new Date(item.joinedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      )}
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
            Start Date: {new Date(item.startDate).toLocaleDateString()}
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
            Opponent: {item.opponentTeam}
          </Text>
          <Text className="text-purple-700">
            Date: {new Date(item.date).toLocaleString()}
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
      {loading ? (
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
