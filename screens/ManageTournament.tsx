// screens/ManageTournamentScreen.tsx
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Ui/Header";
import StatCard from "../components/Ui/StatCard";
import TabNavigation from "../components/Ui/TabNaviagtion";

import {
  Calendar,
  Clock,
  Info,
  MapPin,
  Play,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react-native";
interface TournamentApiResponse {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl: string;
  teamSize: number;
  teamCount: number;
  prizePool: number;
  status: string;
  createdAt: string;
}

const toProperCase = (str: string) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const getStatusInfo = (status: string) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case "active":
    case "live":
      return { color: "#10B981", bgColor: "#ECFDF5", icon: Play };
    case "upcoming":
    case "scheduled":
      return { color: "#3B82F6", bgColor: "#EFF6FF", icon: Clock };
    case "completed":
    case "finished":
      return { color: "#8B5CF6", bgColor: "#F5F3FF", icon: Trophy };
    default:
      return { color: "#6B7280", bgColor: "#F9FAFB", icon: Info };
  }
};

interface InfoCardProps {
  title: string;
  icon: React.ReactElement<any>;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

const InfoCard = ({
  title,
  icon,
  color = "#6B7280",
  bgColor = "#F8FAFC",
  children,
}: InfoCardProps) => (
  <View
    className="bg-white rounded-2xl p-5 shadow-sm mb-4"
    style={{ backgroundColor: bgColor }}
  >
    <View className="flex-row items-center mb-3">
      {React.cloneElement(icon, { size: 22, color })}
      <Text className="ml-3 text-lg font-bold" style={{ color }}>
        {title}
      </Text>
    </View>
    {children}
  </View>
);

const ManageTournamentScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tournament, setTournament] = useState<TournamentApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Teams state
  const [teamsMessage, setTeamsMessage] = useState<string | null>(null);
  const [teamsLoading, setTeamsLoading] = useState(false);

  // Fetch tournament info
  useEffect(() => {
    console.log("Tournament ID from previous screen:", id);
    if (!id) return;

    const fetchTournament = async () => {
      const apiUrl = `https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/tournament/get/${id}`;
      console.log("Calling API:", apiUrl);

      try {
        const res = await axios.get(apiUrl);
        console.log("API Response:", res.data);

        if (res.data?.data?.[0]) {
          setTournament(res.data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching tournament:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  // Fetch teams data whenever the Teams tab is active
  useEffect(() => {
    if (activeTab !== "teams" || !id) return;

    const fetchTeams = async () => {
      setTeamsLoading(true);
      const teamsApiUrl = `https://bl90m45r-8080.inc1.devtunnels.ms/api/v1/tournament/get/${id}/teams`;
      console.log("Fetching teams from:", teamsApiUrl);

      try {
        const res = await axios.get(teamsApiUrl);
        console.log("Teams API Response:", res.data);

        // Display the exact message from backend
        if (res.data?.message) {
          setTeamsMessage(res.data.message);
        } else {
          setTeamsMessage("No message received from backend.");
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
        setTeamsMessage("Error fetching teams.");
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchTeams();
  }, [activeTab, id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="text-gray-500 mt-3">Loading tournament...</Text>
      </View>
    );
  }

  if (!tournament) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-700">Tournament not found</Text>
      </View>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "teams", label: "Teams" },
    { id: "matches", label: "Matches" },
    { id: "results", label: "Results & Scores" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  // Handlers
  const handleEdit = () => console.log("Edit tournament:", tournament.id);
  const handleDelete = () => console.log("Delete tournament:", tournament.id);

  const renderOverview = () => {
    const statusInfo = getStatusInfo(tournament.status);

    return (
      <ScrollView className="flex-1 bg-gray-50 p-4">
        {/* Header Stats Row */}
        <View className="flex-row justify-between mb-6">
          <StatCard
            label="Teams"
            value={tournament.teamCount}
            icon={<Users size={24} color="#3B82F6" />}
            color="#3B82F6"
            bgColor="#EFF6FF"
          />
          <StatCard
            label="Team Size"
            value={tournament.teamSize}
            icon={<UserPlus size={24} color="#8B5CF6" />}
            color="#8B5CF6"
            bgColor="#F5F3FF"
          />
          <StatCard
            label="Prize Pool"
            value={`₹${tournament.prizePool}`}
            icon={<Trophy size={24} color="#F59E0B" />}
            color="#F59E0B"
            bgColor="#FFFBEB"
          />
        </View>

        {/* Status Card */}
        <InfoCard
          title="Tournament Status"
          icon={<statusInfo.icon />}
          color={statusInfo.color}
          bgColor={statusInfo.bgColor}
        >
          <View className="bg-white/70 rounded-xl p-4">
            <Text
              className="text-2xl font-bold mb-1"
              style={{ color: statusInfo.color }}
            >
              {toProperCase(tournament.status)}
            </Text>
            <Text className="text-gray-600">Current tournament status</Text>
          </View>
        </InfoCard>

        {/* Schedule Card */}
        <InfoCard
          title="Schedule"
          icon={<Calendar />}
          color="#10B981"
          bgColor="#ECFDF5"
        >
          <View className="space-y-3">
            <View className="bg-white/70 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-gray-500 uppercase tracking-wide">
                    Start Date
                  </Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    {new Date(tournament.startDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </Text>
                </View>
                <Calendar size={20} color="#10B981" />
              </View>
            </View>

            <View className="bg-white/70 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-gray-500 uppercase tracking-wide">
                    End Date
                  </Text>
                  <Text className="text-lg font-semibold text-gray-900">
                    {new Date(tournament.endDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <Calendar size={20} color="#10B981" />
              </View>
            </View>
          </View>
        </InfoCard>

        {/* Location Card */}
        <InfoCard
          title="Location"
          icon={<MapPin />}
          color="#EC4899"
          bgColor="#FDF2F8"
        >
          <View className="bg-white/70 rounded-xl p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {toProperCase(tournament.location)}
            </Text>
            <Text className="text-gray-600">Tournament venue</Text>
          </View>
        </InfoCard>

        {/* Description Card */}
        <InfoCard
          title="About Tournament"
          icon={<Info />}
          color="#6366F1"
          bgColor="#EEF2FF"
        >
          <View className="bg-white/70 rounded-xl p-4">
            <Text className="text-gray-700 leading-6 text-base">
              {tournament.description}
            </Text>
          </View>
        </InfoCard>
      </ScrollView>
    );
  };

  const renderTeams = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-white font-medium text-center">
          Add Team Manually
        </Text>
      </TouchableOpacity>

      {teamsLoading ? (
        <View className="mt-4">
          <ActivityIndicator size="small" />
          <Text className="text-gray-500 mt-2">Loading teams...</Text>
        </View>
      ) : (
        <Text className="text-gray-700 mt-2">
          {teamsMessage || "No teams data yet."}
        </Text>
      )}
    </View>
  );

  const renderMatches = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-white font-medium text-center">
          Create Schedule
        </Text>
      </TouchableOpacity>
      <Text className="text-gray-500">No matches data yet</Text>
    </View>
  );

  const renderResults = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-gray-500">No results available</Text>
    </View>
  );

  const renderLeaderboard = () => (
    <View className="flex-1 bg-gray-50 p-4">
      <TouchableOpacity className="bg-purple-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-white font-medium text-center">
          Export Rankings
        </Text>
      </TouchableOpacity>
      <Text className="text-gray-500">No leaderboard data yet</Text>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "teams":
        return renderTeams();
      case "matches":
        return renderMatches();
      case "results":
        return renderResults();
      case "leaderboard":
        return renderLeaderboard();
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />
      <Header
        tournamentName={tournament.name}
        status={tournament.status}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <ScrollView style={{ flex: 1 }}>{renderContent()}</ScrollView>
    </SafeAreaView>
  );
};

export default ManageTournamentScreen;
