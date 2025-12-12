import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/context/AuthContext";
import { useOrganizerStore } from "@/store/organizerAnalyticsStore";
import { useOrganizerTournamentStore } from "@/store/organizerTournamentStore";
import { router } from "expo-router";
import {
    Activity,
    AlertCircle,
    Award,
    Calendar,
    DollarSign,
    Plus,
    Star,
    Timer,
    TrendingUp,
    Trophy,
    Users
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrganizerHome = () => {
  const { user, token } = useAuth();
  
  const { summary, tournaments: analyticsTournaments, fetchAnalytics } = useOrganizerStore();
  const { tournaments, fetchOrganizerTournaments, loading } = useOrganizerTournamentStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTournament, setExpandedTournament] = useState<string | null>(null);
  
  const name = user?.fullName ?? "Organizer";
  const role = "organizer";
  const type = Array.isArray(user?.domains) && user.domains.length > 0
    ? user.domains[0]
    : typeof user?.domains === "string"
    ? user.domains
    : "cricket";

  // Initial fetch - Uses /organizer-profile/tournament API
  useEffect(() => {
    if (token) {
      fetchAnalytics(token);
      fetchOrganizerTournaments(token);
    }
  }, [token]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    if (!token) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAnalytics(token),
        fetchOrganizerTournaments(token, true),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  // Next tournament starting soon
  const nextTournament = useMemo(() => {
    if (!tournaments || tournaments.length === 0) return null;
    
    const now = new Date();
    const upcoming = tournaments
      .filter(t => t.status?.toLowerCase() === "upcoming" && new Date(t.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    return upcoming[0] || null;
  }, [tournaments]);

  // Pending actions - high priority
  const urgentActions = useMemo(() => {
    if (!tournaments || tournaments.length === 0) return [];
    
    const now = new Date();
    const actions: Array<{
      id: string;
      tournamentName: string;
      urgency: "high" | "medium";
      action: string;
      description: string;
      tournamentId: string;
      daysUntilStart?: number;
    }> = [];

    tournaments.forEach(t => {
      const daysUntilStart = Math.floor(
        (new Date(t.startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (t.status === "draft") {
        actions.push({
          id: `draft-${t.id}`,
          tournamentName: t.name,
          urgency: "medium",
          action: "Complete Draft",
          description: "This tournament is still in draft mode",
          tournamentId: t.id,
          daysUntilStart,
        });
      }

      if (t.status === "upcoming" && daysUntilStart <= 3 && daysUntilStart >= 0) {
        actions.push({
          id: `soon-${t.id}`,
          tournamentName: t.name,
          urgency: "high",
          action: "Review Setup",
          description: `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? "s" : ""}`,
          tournamentId: t.id,
          daysUntilStart,
        });
      }

      if (t.status === "upcoming" && t.teamCount < 4) {
        actions.push({
          id: `teams-${t.id}`,
          tournamentName: t.name,
          urgency: "medium",
          action: "Promote Registration",
          description: `Only ${t.teamCount} teams registered`,
          tournamentId: t.id,
          daysUntilStart,
        });
      }
    });

    return actions.sort((a, b) => {
      if (a.urgency === "high" && b.urgency !== "high") return -1;
      if (b.urgency === "high" && a.urgency !== "high") return 1;
      return (a.daysUntilStart || 999) - (b.daysUntilStart || 999);
    }).slice(0, 3);
  }, [tournaments]);

  // Recent registrations and activity
  const recentActivity = useMemo(() => {
    if (!analyticsTournaments || analyticsTournaments.length === 0) return [];
    
    const activities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: Date;
      icon: string;
      tournamentId: string;
      value?: number;
    }> = [];

    analyticsTournaments.slice(0, 10).forEach(t => {
      if (t.registrations > 0) {
        activities.push({
          id: `reg-${t.tournamentId}`,
          type: "registration",
          description: `${t.tournamentName}`,
          timestamp: new Date(t.startDate),
          icon: "users",
          tournamentId: t.tournamentId,
          value: t.registrations,
        });
      }

      if (t.totalRatings > 0) {
        activities.push({
          id: `rating-${t.tournamentId}`,
          type: "rating",
          description: `${t.tournamentName}`,
          timestamp: new Date(t.endDate || t.startDate),
          icon: "star",
          tournamentId: t.tournamentId,
          value: t.rating,
        });
      }

      if (t.revenue > 5000) {
        activities.push({
          id: `revenue-${t.tournamentId}`,
          type: "revenue",
          description: `${t.tournamentName}`,
          timestamp: new Date(t.startDate),
          icon: "dollar",
          tournamentId: t.tournamentId,
          value: t.revenue,
        });
      }
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }, [analyticsTournaments]);

  // Live/Active tournaments
  const activeTournaments = useMemo(() => {
    if (!tournaments || tournaments.length === 0) return [];
    
    return tournaments.filter(
      t => t.status?.toLowerCase() === "upcoming"
    ).slice(0, 3);
  }, [tournaments]);

  // Top performing tournament (by revenue or rating)
  const topPerformer = useMemo(() => {
    if (!analyticsTournaments || analyticsTournaments.length === 0) return null;
    
    return analyticsTournaments
      .filter(t => t.revenue > 0 || t.rating > 0)
      .sort((a, b) => (b.revenue + b.rating * 1000) - (a.revenue + a.rating * 1000))[0] || null;
  }, [analyticsTournaments]);

  // Achievement/Milestone indicator
  const recentAchievement = useMemo(() => {
    if (!summary) return null;
    
    if (summary.totalTournamentsCreated >= 10) {
      return { text: "Expert Organizer", icon: "award", description: `${summary.totalTournamentsCreated}+ tournaments` };
    }
    if (summary.totalTournamentsCreated >= 5) {
      return { text: "Rising Star", icon: "star", description: `${summary.totalTournamentsCreated} tournaments` };
    }
    return null;
  }, [summary]);

  const getTimeUntil = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return { value: diffDays, unit: "days" };
    if (diffHours > 0) return { value: diffHours, unit: "hours" };
    return { value: 0, unit: "soon" };
  };

  const pendingActionsCount = urgentActions.length;
  const activeTournamentsCount = summary?.activeTournaments || 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View className="px-4 pt-3 pb-4 bg-white">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden mr-3">
              <Image
                className="w-full h-full"
                source={{
                  uri: `https://placehold.co/48x48/E2E8F0/4A5568?text=${name.charAt(0).toUpperCase()}`,
                }}
              />
            </View>
            <View>
              <Text className="text-xs text-slate-500 font-semibold">Tournament Manager</Text>
              <Text className="text-lg font-extrabold text-slate-900">{name}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="px-3 py-2 rounded-lg"
          >
            <Text className="text-purple-600 font-bold text-sm">Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Quick stats bar */}
        <View className="flex-row mt-3 -mx-1">
          <View className="flex-1 mx-1 bg-purple-50 rounded-lg p-2">
            <Text className="text-purple-600 font-bold text-lg">{activeTournamentsCount}</Text>
            <Text className="text-purple-600 text-xs">Active</Text>
          </View>
          <View className="flex-1 mx-1 bg-orange-50 rounded-lg p-2">
            <Text className="text-orange-600 font-bold text-lg">{pendingActionsCount}</Text>
            <Text className="text-orange-600 text-xs">Pending</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#9333EA"]}
            tintColor="#9333EA"
          />
        }
      >
        {/* Achievement Banner */}
        {recentAchievement && (
          <View className="mt-4 mx-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4">
            <View className="flex-row items-center">
              <View className="bg-white/20 p-2 rounded-full mr-3">
                <Award size={24} color="#FFF" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">{recentAchievement.text} 🎉</Text>
                <Text className="text-white/90 text-sm">{recentAchievement.description}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Next Tournament Countdown */}
        {nextTournament && (
          <View className="mt-4 mx-4">
            <View className="flex-row items-center mb-3">
              <Timer size={20} color="#9333EA" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Next Tournament</Text>
            </View>
            
            <TouchableOpacity
              onPress={() => router.push(`/tournament/ManageTournament?id=${nextTournament.id}` as any)}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 shadow-lg"
              style={{
                shadowColor: "#9333EA",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="bg-white/20 rounded-xl p-3 mb-4">
                <Text className="text-white/80 text-xs font-semibold mb-1">STARTS IN</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-white text-4xl font-bold">
                    {getTimeUntil(nextTournament.startDate).value}
                  </Text>
                  <Text className="text-white/90 text-lg font-semibold ml-2">
                    {getTimeUntil(nextTournament.startDate).unit}
                  </Text>
                </View>
              </View>

              <Text className="text-white font-bold text-xl mb-2">{nextTournament.name}</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Users size={16} color="#FFF" />
                  <Text className="text-white/90 text-sm ml-1">{nextTournament.teamCount} teams</Text>
                </View>
                <View className="flex-row items-center">
                  <DollarSign size={16} color="#FFF" />
                  <Text className="text-white/90 text-sm">₹{nextTournament.prizePool}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Top Performer Highlight */}
        {topPerformer && (
          <View className="mt-4 mx-4">
            <View className="flex-row items-center mb-3">
              <TrendingUp size={20} color="#10B981" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Top Performer</Text>
            </View>
            
            <View className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-4 border-2 border-emerald-200">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-slate-900 font-bold text-lg flex-1 pr-2">{topPerformer.tournamentName}</Text>
                <View className="bg-emerald-500 p-2 rounded-full">
                  <Star size={16} color="#FFF" fill="#FFF" />
                </View>
              </View>
              
              <View className="flex-row items-center justify-around">
                <View className="items-center">
                  <Text className="text-emerald-600 font-bold text-2xl">₹{topPerformer.revenue}</Text>
                  <Text className="text-slate-600 text-xs">Revenue</Text>
                </View>
                <View className="w-px h-12 bg-slate-300" />
                <View className="items-center">
                  <Text className="text-amber-600 font-bold text-2xl">{topPerformer.rating.toFixed(1)}★</Text>
                  <Text className="text-slate-600 text-xs">Rating</Text>
                </View>
                <View className="w-px h-12 bg-slate-300" />
                <View className="items-center">
                  <Text className="text-blue-600 font-bold text-2xl">{topPerformer.registrations}</Text>
                  <Text className="text-slate-600 text-xs">Teams</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Urgent Actions */}
        {urgentActions.length > 0 && (
          <View className="mt-6 px-4">
            <View className="flex-row items-center mb-3">
              <AlertCircle size={20} color="#F97316" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Needs Attention</Text>
            </View>

            {urgentActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => router.push(`/tournament/ManageTournament?id=${action.tournamentId}` as any)}
                className={`rounded-xl p-4 mb-3 ${
                  action.urgency === "high" 
                    ? "bg-red-50 border-2 border-red-200" 
                    : "bg-orange-50 border-2 border-orange-200"
                }`}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-slate-900 font-bold text-base mb-1">
                      {action.tournamentName}
                    </Text>
                    <Text className={`text-sm ${
                      action.urgency === "high" ? "text-red-600" : "text-orange-600"
                    }`}>
                      {action.description}
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      action.urgency === "high" ? "bg-red-100" : "bg-orange-100"
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${
                      action.urgency === "high" ? "text-red-600" : "text-orange-600"
                    }`}>
                      {action.urgency === "high" ? "URGENT" : "TODO"}
                    </Text>
                  </View>
                </View>
                <Text className={`text-sm font-semibold ${
                  action.urgency === "high" ? "text-red-700" : "text-orange-700"
                }`}>
                  → {action.action}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Activity Feed */}
        {recentActivity.length > 0 && (
          <View className="mt-6 px-4">
            <View className="flex-row items-center mb-3">
              <Activity size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Recent Activity</Text>
            </View>

            {recentActivity.map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                onPress={() => setExpandedTournament(expandedTournament === activity.id ? null : activity.id)}
                className="flex-row mb-3"
              >
                <View className="items-center mr-3">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${
                    activity.type === "registration" ? "bg-blue-100" :
                    activity.type === "rating" ? "bg-amber-100" :
                    "bg-emerald-100"
                  }`}>
                    {activity.icon === "users" && <Users size={18} color="#3B82F6" />}
                    {activity.icon === "star" && <Star size={18} color="#F59E0B" />}
                    {activity.icon === "dollar" && <DollarSign size={18} color="#10B981" />}
                  </View>
                  {index < recentActivity.length - 1 && (
                    <View className="w-0.5 h-8 bg-slate-200 mt-1" />
                  )}
                </View>
                <View className="flex-1 bg-white rounded-xl p-3 shadow-sm">
                  <Text className="text-slate-900 font-semibold text-sm">{activity.description}</Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-slate-400 text-xs">
                      {activity.timestamp.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${
                      activity.type === "registration" ? "bg-blue-50" :
                      activity.type === "rating" ? "bg-amber-50" :
                      "bg-emerald-50"
                    }`}>
                      <Text className={`text-xs font-bold ${
                        activity.type === "registration" ? "text-blue-600" :
                        activity.type === "rating" ? "text-amber-600" :
                        "text-emerald-600"
                      }`}>
                        {activity.type === "registration" ? `${activity.value} teams` :
                         activity.type === "rating" ? `${activity.value}★` :
                         `₹${activity.value}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <View className="mt-6 px-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Trophy size={20} color="#9333EA" />
                <Text className="text-lg font-bold text-slate-900 ml-2">My Tournaments</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/tournament/MyTournaments")}>
                <Text className="text-purple-600 font-semibold text-sm">View All</Text>
              </TouchableOpacity>
            </View>

            {activeTournaments.map((tournament) => (
              <TouchableOpacity
                key={tournament.id}
                onPress={() => router.push(`/tournament/ManageTournament?id=${tournament.id}` as any)}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-slate-900 font-bold text-base flex-1">
                    {tournament.name}
                  </Text>
                  <View className="bg-purple-100 px-2 py-1 rounded-full">
                    <Text className="text-purple-600 font-semibold text-xs">
                      {tournament.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-2">
                  <Calendar size={14} color="#64748B" />
                  <Text className="text-slate-600 text-sm ml-1">
                    {new Date(tournament.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Users size={14} color="#64748B" />
                    <Text className="text-slate-600 text-sm ml-1">
                      {tournament.teamCount} teams
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <DollarSign size={14} color="#10B981" />
                    <Text className="text-emerald-600 font-semibold text-sm">
                      ₹{tournament.prizePool}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty state */}
        {urgentActions.length === 0 && activeTournaments.length === 0 && (
          <View className="mt-12 px-4 items-center">
            <Trophy size={60} color="#CBD5E1" />
            <Text className="text-slate-400 mt-4 text-lg font-semibold">All Caught Up!</Text>
            <Text className="text-slate-400 text-sm text-center mt-2">
              No pending actions. Create a tournament to get started.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/tournament/createTournament")}
              className="mt-6 bg-purple-600 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-bold">Create Tournament</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/tournament/createTournament")}
        className="absolute bottom-24 right-6 bg-purple-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: "#9333EA",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default OrganizerHome;
