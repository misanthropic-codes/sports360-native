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

// Random name generator
const randomNames = [
  "Alex",
  "Sam",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Jamie",
  "Dakota",
  "Cameron",
];
const getRandomName = (userId: string) => {
  const index = userId.charCodeAt(0) % randomNames.length;
  return randomNames[index] + "_" + userId.slice(0, 4);
};

type Member = {
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  isActive: boolean;
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
        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-purple-100">
          <Text className="text-purple-800 font-bold text-lg">
            Name: {getRandomName(item.userId)}
          </Text>
          <Text className="text-purple-700">Role: {item.role}</Text>
          <Text className="text-purple-700">
            Status: {item.isActive ? "Active" : "Inactive"}
          </Text>
          <Text className="text-purple-700">
            Joined At: {new Date(item.joinedAt).toLocaleString()}
          </Text>
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
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-purple-200">
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
    </SafeAreaView>
  );
};

export default TeamScreen;
