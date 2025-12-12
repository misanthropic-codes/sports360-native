import { useAuth } from "@/context/AuthContext";
import { usePlayerAnalyticsStore } from "@/store/playerAnalyticsStore";
import { useTeamStore } from "@/store/teamStore";
import { useTournamentStore } from "@/store/tournamentStore";
import { router } from "expo-router";
import {
    Activity,
    Calendar,
    ChevronRight,
    Clock,
    MapPin,
    Star,
    Target,
    Timer,
    TrendingUp,
    Trophy,
    Users,
    Zap
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "../../components/BottomNavBar";

const PlayerHome = () => {
  const { user, token } = useAuth();
  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  
  const { summary, matches, fetchAnalytics, isLoading: analyticsLoading } = usePlayerAnalyticsStore();
  const { myTeams, fetchTeams, loading: teamsLoading } = useTeamStore();
  const { tournaments, fetchTournaments, loading: tournamentsLoading } = useTournamentStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  
  const name = user?.fullName ?? "Player";
  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains) && user.domains.length > 0
    ? user.domains[0]
    : typeof user?.domains === "string"
    ? user.domains
    : "cricket";

  // Initial fetch using player-specific /tournaments API
  useEffect(() => {
    if (token) {
      fetchAnalytics(token);
      fetchTournaments(token);
    }
    if (token && baseURL) {
      fetchTeams(token, baseURL);
    }
  }, [token, baseURL]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    if (!token) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAnalytics(token, true),
        fetchTournaments(token, true),
        baseURL ? fetchTeams(token, baseURL, true) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [token, baseURL]);

  // Next match (most imminent)
  const nextMatch = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    
    const now = new Date();
    const upcoming = matches
      .filter(m => new Date(m.matchTime) > now)
      .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime());
    
    return upcoming[0] || null;
  }, [matches]);

  // Recent completed matches (last 3)
  const recentMatches = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    
    const now = new Date();
    return matches
      .filter(m => new Date(m.matchTime) < now && m.result)
      .sort((a, b) => new Date(b.matchTime).getTime() - new Date(a.matchTime).getTime())
      .slice(0, 3);
  }, [matches]);

  // Upcoming matches (next 5)
  const upcomingMatches = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    
    const now = new Date();
    return matches
      .filter(m => new Date(m.matchTime) > now)
      .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
      .slice(0, 5);
  }, [matches]);

  // Tournament opportunities (trending/popular)
  const tournamentOpportunities = useMemo(() => {
    if (!tournaments || tournaments.length === 0) return [];
    
    const playerTeamIds = myTeams.map(t => t.id);
    
    return tournaments
      .filter(t => {
        const isUpcoming = t.status?.toLowerCase() === "upcoming" || 
                          t.status?.toLowerCase() === "scheduled";
        const notJoined = !t.teams?.some((teamId: string) => playerTeamIds.includes(teamId));
        return isUpcoming && notJoined;
      })
      .sort((a, b) => {
        // Sort by team count (popularity) and proximity to start date
        const aTeams = a.teams?.length || 0;
        const bTeams = b.teams?.length || 0;
        if (aTeams !== bTeams) return bTeams - aTeams;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 4);
  }, [tournaments, myTeams]);

  // Active teams with recent activity
  const activeTeams = useMemo(() => {
    return myTeams.filter(t => t.isActive).slice(0, 4);
  }, [myTeams]);

  // Performance streak
  const performanceStreak = useMemo(() => {
    if (!matches || matches.length === 0) return { type: "none", count: 0 };
    
    const now = new Date();
    const completed = matches
      .filter(m => new Date(m.matchTime) < now && m.result)
      .sort((a, b) => new Date(b.matchTime).getTime() - new Date(a.matchTime).getTime());
    
    if (completed.length === 0) return { type: "none", count: 0 };
    
    let streak = 0;
    const firstResult = completed[0].result;
    
    for (const match of completed) {
      if (match.result === firstResult) {
        streak++;
      } else {
        break;
      }
    }
    
    return { type: firstResult, count: streak };
  }, [matches]);

  // Time until next match
  const getTimeUntilMatch = (matchTime: string) => {
    const now = new Date();
    const target = new Date(matchTime);
    const diffMs = target.getTime() - now.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { value: days, unit: "days" };
    if (hours > 0) return { value: hours, unit: "hours" };
    return { value: minutes, unit: "mins" };
  };

  const getTimeUntil = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h`;
    return "Soon";
  };

  const formatPrice = (price: number | string | undefined): string => {
    if (!price || price === 0 || price === "0") return "Free";
    if (typeof price === "number") return `₹${price}`;
    return price;
  };

  const getMatchResultColor = (result: string) => {
    if (result === "won") return "text-emerald-600";
    if (result === "lost") return "text-red-600";
    return "text-slate-600";
  };

  const getMatchResultBg = (result: string) => {
    if (result === "won") return "bg-emerald-50";
    if (result === "lost") return "bg-red-50";
    return "bg-slate-50";
  };

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
              <Text className="text-xs text-slate-500 font-semibold">Welcome back,</Text>
              <Text className="text-lg font-extrabold text-slate-900">{name}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="px-3 py-2 rounded-lg"
          >
            <Text className="text-blue-600 font-bold text-sm">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Performance Streak Banner */}
        {performanceStreak.count >= 3 && (
          <View className="mt-4 mx-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-white/20 p-2 rounded-full mr-3">
                  <Zap size={24} color="#FFF" fill="#FFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    {performanceStreak.count} {performanceStreak.type === "won" ? "Win" : "Match"} Streak! 🔥
                  </Text>
                  <Text className="text-white/90 text-sm">Keep the momentum going!</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Next Match Countdown - Big Featured Card */}
        {nextMatch && (
          <View className="mt-4 mx-4">
            <View className="flex-row items-center mb-3">
              <Timer size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Next Match</Text>
            </View>
            
            <TouchableOpacity
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 shadow-lg"
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {/* Countdown Timer */}
              <View className="bg-white/20 rounded-xl p-3 mb-4">
                <Text className="text-white/80 text-xs font-semibold mb-1">STARTS IN</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-white text-4xl font-bold">
                    {getTimeUntilMatch(nextMatch.matchTime).value}
                  </Text>
                  <Text className="text-white/90 text-lg font-semibold ml-2">
                    {getTimeUntilMatch(nextMatch.matchTime).unit}
                  </Text>
                </View>
              </View>

              {/* Match Details */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-white/20 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold text-sm">Round {nextMatch.round}</Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={14} color="#FFF" />
                  <Text className="text-white text-sm ml-1">
                    {new Date(nextMatch.matchTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>

              <Text className="text-white font-bold text-xl mb-2">vs Opponent Team</Text>
              <Text className="text-white/90 text-sm">
                {new Date(nextMatch.matchTime).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Match Results - Interactive Cards */}
        {recentMatches.length > 0 && (
          <View className="mt-6 px-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Activity size={20} color="#64748B" />
                <Text className="text-lg font-bold text-slate-900 ml-2">Recent Performance</Text>
              </View>
            </View>

            {recentMatches.map((match, index) => (
              <TouchableOpacity
                key={match.matchId}
                onPress={() => setExpandedMatch(expandedMatch === match.matchId ? null : match.matchId)}
                className={`mb-3 rounded-xl overflow-hidden ${getMatchResultBg(match.result || "")}`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="bg-white p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold text-base mb-1">
                        vs Opponent Team
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        {new Date(match.matchTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} • Round {match.round}
                      </Text>
                    </View>
                    <View
                      className={`px-4 py-2 rounded-full ${
                        match.result === "won"
                          ? "bg-emerald-100"
                          : match.result === "lost"
                          ? "bg-red-100"
                          : "bg-slate-100"
                      }`}
                    >
                      <Text
                        className={`font-bold text-sm ${getMatchResultColor(match.result || "")}`}
                      >
                        {match.result?.toUpperCase() || "DRAW"}
                      </Text>
                    </View>
                  </View>
                  
                  {expandedMatch === match.matchId && (
                    <View className="mt-3 pt-3 border-t border-slate-100">
                      <Text className="text-slate-600 text-sm">
                        Tap to view full match details
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Matches Section */}
        <View className="mt-6 px-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Calendar size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Schedule</Text>
            </View>
          </View>

          {upcomingMatches.length > 0 ? (
            upcomingMatches.slice(0, 3).map((match, index) => (
              <TouchableOpacity
                key={match.matchId}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="bg-blue-50 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 font-semibold text-xs">
                      {new Date(match.matchTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock size={12} color="#64748B" />
                    <Text className="text-slate-500 text-xs ml-1">
                      {new Date(match.matchTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>

                <Text className="text-slate-900 font-bold text-base mb-1">
                  vs Opponent Team
                </Text>
                <Text className="text-slate-600 text-sm">Round {match.round}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-xl p-6 items-center">
              <Target size={40} color="#CBD5E1" />
              <Text className="text-slate-400 mt-2 text-sm">No upcoming matches</Text>
            </View>
          )}
        </View>

        {/* Trending Tournaments - Popular by participation */}
        <View className="mt-6 px-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <TrendingUp size={20} color="#F59E0B" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Trending Now</Text>
            </View>
            {tournamentOpportunities.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/tournament/ViewTournament")}>
                <View className="flex-row items-center">
                  <Text className="text-blue-600 font-semibold text-sm">View All</Text>
                  <ChevronRight size={16} color="#3B82F6" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {tournamentOpportunities.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
              {tournamentOpportunities.map((tournament, index) => {
                const popularity = (tournament.teams?.length || 0) / (tournament.maxTeams || 1);
                return (
                  <View
                    key={tournament.id}
                    className="bg-white rounded-xl p-4 mr-3 w-72 shadow-sm"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    {/* Trending Badge */}
                    {index === 0 && (
                      <View className="absolute top-2 right-2 bg-amber-500 px-2 py-1 rounded-full flex-row items-center z-10">
                        <Star size={10} color="#FFF" fill="#FFF" />
                        <Text className="text-white text-xs font-bold ml-1">HOT</Text>
                      </View>
                    )}

                    <Text className="text-slate-900 font-bold text-base mb-2 pr-12" numberOfLines={1}>
                      {tournament.name}
                    </Text>

                    <View className="flex-row items-center mb-2">
                      <Calendar size={14} color="#64748B" />
                      <Text className="text-slate-600 text-sm ml-1">
                        Starts in {getTimeUntil(tournament.startDate)}
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-3">
                      <MapPin size={14} color="#64748B" />
                      <Text className="text-slate-600 text-sm ml-1" numberOfLines={1}>
                        {tournament.location || "TBD"}
                      </Text>
                    </View>

                    {/* Popularity Bar */}
                    <View className="mb-3">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-slate-500 text-xs">Popularity</Text>
                        <Text className="text-slate-600 text-xs font-semibold">
                          {tournament.teams?.length || 0}/{tournament.maxTeams || "∞"}
                        </Text>
                      </View>
                      <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <View
                          className={`h-full ${
                            popularity > 0.7 ? "bg-emerald-500" : popularity > 0.4 ? "bg-amber-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(popularity * 100, 100)}%` }}
                        />
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <View className="bg-amber-50 px-3 py-1 rounded-full">
                        <Text className="text-amber-600 font-semibold text-xs">
                          {formatPrice(tournament.entryFee)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => router.push(`/tournament/JoinTournament?id=${tournament.id}` as any)}
                      className="bg-blue-600 py-2 rounded-lg"
                    >
                      <Text className="text-white font-bold text-sm text-center">Join Now</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View className="bg-white rounded-xl p-6 items-center">
              <Trophy size={40} color="#CBD5E1" />
              <Text className="text-slate-400 mt-2 text-sm">No tournaments available</Text>
            </View>
          )}
        </View>

        {/* Active Teams with Quick Actions */}
        <View className="mt-6 px-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Users size={20} color="#10B981" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Your Teams</Text>
            </View>
            {myTeams.length > 4 && (
              <TouchableOpacity onPress={() => router.push("/team/Myteam")}>
                <View className="flex-row items-center">
                  <Text className="text-blue-600 font-semibold text-sm">View All</Text>
                  <ChevronRight size={16} color="#3B82F6" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {activeTeams.length > 0 ? (
            activeTeams.map((team) => (
              <TouchableOpacity
                key={team.id}
                onPress={() => router.push({
                  pathname: "/team/ManageTeam/ManageTeam",
                  params: { teamId: team.id },
                })}
                className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="bg-slate-100 w-12 h-12 rounded-lg items-center justify-center mr-3">
                  <Users size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-semibold text-sm">{team.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 rounded-full mr-1 bg-emerald-500" />
                    <Text className="text-xs font-semibold text-emerald-500">Active</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#CBD5E1" />
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-xl p-6 items-center">
              <Users size={40} color="#CBD5E1" />
              <Text className="text-slate-400 mt-2 text-sm">No teams yet</Text>
              <TouchableOpacity
                onPress={() => router.push("/team/CreateTeam")}
                className="mt-3"
              >
                <Text className="text-blue-600 font-semibold text-sm">Create a Team</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default PlayerHome;
