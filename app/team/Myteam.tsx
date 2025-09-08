import axios from "axios";
import { PersonStanding, Trophy } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";
import ActivityCard from "../../components/ActivityCard";
import BottomNavBar from "../../components/BottomNavBar";
import CreateTournamentButton from "../../components/CreatTeamButton";
import Header from "../../components/Header";
import SectionTitle from "../../components/SectiontitleM";
import StatPillBar from "../../components/StatPillBar";
import TeamCard from "../../components/TeamCard";
import { useAuth } from "../../context/AuthContext"; // ✅ use your AuthContext

type MyTeamScreenProps = {
  navigation: any;
};

type Team = {
  id: string;
  name: string;
  description: string;
  location: string;
  logoUrl: string;
  isActive: boolean;
};

const MyTeamScreen: React.FC<MyTeamScreenProps> = ({ navigation }) => {
  const { user } = useAuth(); // ✅ Get user from context
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const fetchTeams = async () => {
    try {
      setLoading(true);

      const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
      if (!baseURL) {
        console.error("Base URL not found in .env");
        Alert.alert("Error", "Base URL not configured.");
        return;
      }

      if (!user || !user.token) {
        Alert.alert("Error", "You must be logged in to view teams.");
        return;
      }

      console.log(`Fetching teams from: ${baseURL}/api/v1/team`);
      const response = await axios.get(`${baseURL}/api/v1/team`, {
        headers: {
          Authorization: `Bearer ${user.token}`, // ✅ token from context
        },
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        setTeams(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
        Alert.alert("Error", "Failed to load teams.");
      }
    } catch (error: any) {
      console.error(
        "❌ Error fetching teams:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to fetch teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [user?.token]); // ✅ refetch when token changes

  // ✅ Get role and domain (as type) dynamically from context
  const role = user?.role || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "team";

  console.log("🔑 AuthContext values:", { role, type });

  const recentActivities = [
    {
      icon: <PersonStanding size={24} color="#3B82F6" />,
      description: "Delhi Warriors won against Kolkata Knights",
      timestamp: "2 hours ago",
    },
    {
      icon: <Trophy size={24} color="#3B82F6" />,
      description: "New player joined Mumbai Tigers",
      timestamp: "1 day ago",
    },
    {
      icon: <Trophy size={24} color="#3B82F6" />,
      description: "Match scheduled for Delhi Warriors",
      timestamp: "1 day ago",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50"
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <Header
        type="title"
        title="My Team"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {auth.user?.role?.toLowerCase() === "player" && (
          <CreateTournamentButton
            title="Create Team"
            onPress={() => router.push("/team/CreateTeam")}
          />
        )}

        <StatPillBar />

        <SectionTitle title="My Team" />

        {loading ? (
          <View className="p-4">
            <SectionTitle title="Loading teams..." />
          </View>
        ) : teams.length > 0 ? (
          teams.map((team) => (
            <TeamCard
              key={team.id}
              teamName={team.name}
              status={team.isActive ? "Active" : "Pending"}
              stats={[
                { value: "11", label: "players" },
                { value: "0", label: "matches" },
                { value: "0%", label: "winning rate" },
              ]}
              onManage={() => console.log(`Manage ${team.name}`)}
            />
          ))
        ) : (
          <View className="p-4">
            <SectionTitle title="No teams found" />
          </View>
        )}

        <SectionTitle
          title="Recent Activity"
          showViewAll
          onViewAllPress={() => console.log("View All Activity")}
        />

        {recentActivities.map((activity, index) => (
          <ActivityCard
            key={index}
            layoutType="simple"
            icon={activity.icon}
            description={activity.description}
            timestamp={activity.timestamp}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ Passing role + type dynamically */}
      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default MyTeamScreen;
