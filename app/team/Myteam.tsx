// MyTeamScreen.tsx
import axios from "axios";
import { useRouter } from "expo-router";
import { PersonStanding, Trophy } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActivityCard from "../../components/ActivityCard";
import BottomNavBar from "../../components/BottomNavBar";
import CreateTeamButton from "../../components/CreatTeamButton";
import Header from "../../components/Header";
import SectionTitle from "../../components/SectiontitleM";
import StatPillBar from "../../components/StatPillBar";
import TeamCard from "../../components/TeamCard";
import { useAuth } from "../../context/AuthContext";

type Team = {
  id: string;
  name: string;
  description: string;
  location: string;
  logoUrl: string;
  isActive: boolean;
};

const MyTeamScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

  const fetchTeams = async () => {
    if (!baseURL) {
      Alert.alert("Error", "Base URL not configured.");
      return;
    }
    if (!user?.token) {
      Alert.alert("Error", "You must be logged in to view teams.");
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${user.token}` };

      const [myRes, allRes] = await Promise.all([
        axios.get(`${baseURL}/api/v1/team/my-teams`, { headers }),
        axios.get(`${baseURL}/api/v1/team/all`, { headers }),
      ]);

      setMyTeams(myRes.data?.data || []);
      setAllTeams(allRes.data?.data || []);
    } catch (error: any) {
      console.error("❌ Error fetching teams:", error.response?.data || error);
      Alert.alert("Error", "Failed to fetch teams.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: string, teamName: string) => {
    if (!user?.token || !baseURL) return;

    Alert.alert("Join Team", `Do you want to join ${teamName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Join",
        onPress: async () => {
          try {
            const headers = { Authorization: `Bearer ${user.token}` };
            const res = await axios.post(
              `${baseURL}/api/v1/team/${teamId}/request`,
              {},
              { headers }
            );

            if (res.data?.success) {
              Alert.alert(
                "✅ Request Sent",
                `You requested to join ${teamName}`
              );
              fetchTeams();
            } else {
              Alert.alert(
                "Error",
                res.data?.message || "Failed to send request."
              );
            }
          } catch (err: any) {
            console.error("❌ Error joining team:", err.response?.data || err);
            Alert.alert("Error", "Could not send join request.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchTeams();
  }, [user?.token]);

  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "team";

  const filteredAllTeams = allTeams.filter(
    (team) => !myTeams.some((myTeam) => myTeam.id === team.id)
  );

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
        onBackPress={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {role === "player" && (
          <CreateTeamButton
            title="Create Team"
            onPress={() => router.push("/team/CreateTeam")}
          />
        )}

        <StatPillBar />

        {/* My Teams */}
        {role === "player" && (
          <>
            <SectionTitle title="My Teams" />
            {loading ? (
              <View className="p-4 flex justify-center items-center">
                <ActivityIndicator size="large" color="#4CAF50" />
              </View>
            ) : myTeams.length > 0 ? (
              myTeams.map((team) => (
                <TeamCard
                  key={`my-${team.id}`}
                  context="myTeam"
                  teamName={team.name}
                  status={team.isActive ? "Active" : "Pending"}
                  stats={[
                    { value: "11", label: "players" },
                    { value: "0", label: "matches" },
                    { value: "0%", label: "winning rate" },
                  ]}
                  onManage={() =>
                    router.push({
                      pathname: "/team/ManageTeam/ManageTeam",
                      params: { teamId: team.id },
                    })
                  }
                />
              ))
            ) : (
              <View className="p-4">
                <SectionTitle title="No teams found" />
              </View>
            )}
          </>
        )}

        {/* All Teams */}
        <SectionTitle title="All Teams" />
        {loading ? (
          <View className="p-4 flex justify-center items-center">
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : filteredAllTeams.length > 0 ? (
          filteredAllTeams.map((team) => (
            <TeamCard
              key={`all-${team.id}`}
              context={role === "organiser" ? "viewTeam" : "allTeam"}
              teamName={team.name}
              status={team.isActive ? "Active" : "Pending"}
              stats={[
                { value: "11", label: "players" },
                { value: "0", label: "matches" },
                { value: "0%", label: "winning rate" },
              ]}
              {...(role === "player"
                ? { onJoin: () => handleJoinTeam(team.id, team.name) }
                : {
                    onView: () =>
                      router.push({
                        pathname: "/team/ViewTeam/ViewTeam",
                        params: { teamId: team.id },
                      }),
                  })}
            />
          ))
        ) : (
          <View className="p-4">
            <SectionTitle title="No teams available" />
          </View>
        )}

        {/* Recent Activity */}
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

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default MyTeamScreen;
