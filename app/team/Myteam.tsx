import { useRouter } from "expo-router";
import { Calendar, Trophy } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import axios from "axios";
import ActivityCard from "../../components/ActivityCard";
import BottomNavBar from "../../components/BottomNavBar";
import CreateTeamButton from "../../components/CreatTeamButton";
import Header from "../../components/Header";
import SectionTitle from "../../components/SectiontitleM";
import StatPillBar from "../../components/StatPillBar";
import TeamCard from "../../components/TeamCard";
import { useAuth } from "../../context/AuthContext";
import { useTeamStore } from "../../store/teamStore";

type ActivityItem = {
  icon: React.ReactNode;
  description: string;
  timestamp: string;
  date: Date;
};

const MyTeamScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const { myTeams, allTeams, loading, fetchTeams, addToMyTeams } =
    useTeamStore();

  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [teamStats, setTeamStats] = useState<Record<string, {
    playerCount: number;
    matchCount: number;
  }>>({});

  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "team";

  useEffect(() => {
    if (user?.token && baseURL) fetchTeams(user.token, baseURL);
  }, [user?.token]);

  // Calculate team statistics
  const myTeamsCount = myTeams.length;
  const activeCount = myTeams.filter((team) => team.isActive === true).length;
  const pendingCount = myTeams.filter((team) => team.isActive === false).length;

  // Fetch team statistics (members and matches count)
  const fetchTeamStats = async () => {
    if (!user?.token || !baseURL || myTeams.length === 0) return;

    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const stats: Record<string, { playerCount: number; matchCount: number }> = {};

      // Fetch stats for each team
      await Promise.all(
        myTeams.map(async (team) => {
          try {
            const [membersRes, matchesRes] = await Promise.all([
              axios.get(`${baseURL}/api/v1/team/${team.id}/members`, { headers }),
              axios.get(`${baseURL}/api/v1/team/${team.id}/matches`, { headers }),
            ]);

            stats[team.id] = {
              playerCount: membersRes.data?.data?.length || 0,
              matchCount: matchesRes.data?.data?.matches?.length || 0,
            };
          } catch (err) {
            console.error(`Error fetching stats for team ${team.id}:`, err);
            stats[team.id] = { playerCount: 0, matchCount: 0 };
          }
        })
      );

      setTeamStats(stats);
    } catch (err) {
      console.error("Error fetching team stats:", err);
    }
  };

  const handleJoinTeam = (teamId: string, teamName: string) => {
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

              // ✅ Update Zustand store instead of refetching
              addToMyTeams(
                allTeams.find((t) => t.id === teamId) || {
                  id: teamId,
                  name: teamName,
                  description: "",
                  location: "",
                  logoUrl: "",
                  isActive: false,
                }
              );
            } else {
              Alert.alert(
                "Error",
                res.data?.message || "Failed to send join request."
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

  const filteredAllTeams =
    role === "player"
      ? allTeams.filter(
          (team) => !myTeams.some((myTeam) => myTeam.id === team.id)
        )
      : allTeams;

  // Fetch recent activity from user's teams
  const fetchRecentActivity = async () => {
    if (!user?.token || !baseURL || myTeams.length === 0) {
      setRecentActivities([]);
      return;
    }

    setActivityLoading(true);
    try {
      const activities: ActivityItem[] = [];
      const headers = { Authorization: `Bearer ${user.token}` };

      // Fetch matches and tournaments for each team
      for (const team of myTeams.slice(0, 3)) { // Limit to first 3 teams for performance
        try {
          // Fetch team matches
          const matchesRes = await axios.get(
            `${baseURL}/api/v1/team/${team.id}/matches`,
            { headers }
          );
          if (matchesRes.data?.success) {
            const matches = matchesRes.data.data.matches || [];
            matches.slice(0, 3).forEach((match: any) => {
              const matchDate = new Date(match.matchTime);
              const icon = <Calendar size={24} color="#3B82F6" />;
              let description = `Match scheduled for ${team.name}`;
              
              if (match.opponentTeamName) {
                description = `${team.name} vs ${match.opponentTeamName}`;
              }
              
              if (match.result) {
                description = `${team.name} ${match.result} against ${match.opponentTeamName || 'opponent'}`;
              }

              activities.push({
                icon,
                description,
                timestamp: getRelativeTime(matchDate),
                date: matchDate,
              });
            });
          }

          // Fetch team tournaments
          const tournamentsRes = await axios.get(
            `${baseURL}/api/v1/team/${team.id}/tournaments`,
            { headers }
          );
          if (tournamentsRes.data?.success) {
            const tournaments = tournamentsRes.data.data.tournaments || [];
            tournaments.slice(0, 2).forEach((item: any) => {
              const tournament = item.tournament;
              const tournamentDate = new Date(tournament.startDate);
              activities.push({
                icon: <Trophy size={24} color="#3B82F6" />,
                description: `${team.name} joined ${tournament.name}`,
                timestamp: getRelativeTime(tournamentDate),
                date: tournamentDate,
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching activity for team ${team.id}:`, err);
        }
      }

      // Sort by date (most recent first) and limit to 10 items
      activities.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentActivities(activities.slice(0, 10));
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      setRecentActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // Helper function to get relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Fetch recent activity when teams are loaded
  useEffect(() => {
    if (!loading && myTeams.length > 0) {
      fetchRecentActivity();
    }
  }, [myTeams, loading]);

  // Fetch team stats when teams are loaded
  useEffect(() => {
    if (!loading && myTeams.length > 0) {
      fetchTeamStats();
    }
  }, [myTeams, loading]);

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

        <StatPillBar
          myTeamsCount={myTeamsCount}
          activeCount={activeCount}
          pendingCount={pendingCount}
        />

        {/* My Teams */}
        {role === "player" && (
          <>
            <SectionTitle title="My Teams" />
            {loading ? (
              <View className="p-4 flex justify-center items-center">
                <ActivityIndicator size="large" color="#4CAF50" />
              </View>
            ) : myTeams.length > 0 ? (
              myTeams.map((team) => {
                const stats = teamStats[team.id];
                const playerCount = stats?.playerCount || 0;
                const matchCount = stats?.matchCount || 0;
                const teamCapacity = (team as any).teamSize || 11; // Get team size from team object
                
                return (
                  <TeamCard
                    key={`my-${team.id}`}
                    context="myTeam"
                    teamName={team.name}
                    status={team.isActive ? "Active" : "Pending"}
                    stats={[
                      { value: `${playerCount}/${teamCapacity}`, label: "players" },
                      { value: matchCount.toString(), label: "matches" },
                      { value: teamCapacity.toString(), label: "capacity" },
                    ]}
                    onManage={() =>
                      router.push({
                        pathname: "/team/ManageTeam/ManageTeam",
                        params: { teamId: team.id },
                      })
                    }
                  />
                );
              })
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
              context={
                role === "organiser" || role === "organizer"
                  ? "viewTeam"
                  : "allTeam"
              }
              teamName={team.name}
              status={team.isActive ? "Active" : "Pending"}
              stats={[
                { value: "11", label: "players" },
                { value: "0", label: "matches" },
                { value: "0%", label: "winning rate" },
              ]}
              onView={() =>
                router.push({
                  pathname: "/team/ViewTeam",
                  params: { teamId: team.id },
                })
              }
              onJoin={
                role === "player"
                  ? () => handleJoinTeam(team.id, team.name)
                  : undefined
              }
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
          showViewAll={recentActivities.length > 0}
          onViewAllPress={() => console.log("View All Activity")}
        />
        {activityLoading ? (
          <View className="p-4 flex justify-center items-center">
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <ActivityCard
              key={index}
              layoutType="simple"
              icon={activity.icon}
              description={activity.description}
              timestamp={activity.timestamp}
            />
          ))
        ) : (
          <View className="p-4">
            <SectionTitle title="No recent activity" />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default MyTeamScreen;
