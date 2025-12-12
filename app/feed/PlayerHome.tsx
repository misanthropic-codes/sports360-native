import { useAuth } from "@/context/AuthContext";
import { usePlayerAnalyticsStore } from "@/store/playerAnalyticsStore";
import { useTeamStore } from "@/store/teamStore";
import { useTournamentStore } from "@/store/tournamentStore";
import { router } from "expo-router";
import {
    Activity,
    Award,
    Calendar,
    ChevronRight,
    Clock,
    MapPin,
    Minus,
    Star,
    Sun,
    Sunrise,
    Sunset,
    Target,
    Timer,
    TrendingDown,
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
    View,
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

  useEffect(() => {
    if (token) {
      fetchAnalytics(token);
      fetchTournaments(token);
    }
    if (token && baseURL) {
      fetchTeams(token, baseURL);
    }
  }, [token, baseURL]);

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

  // Playing Pattern Analysis
  const playingPattern = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    
    const completedMatches = matches.filter(m => m.result);
    if (completedMatches.length < 3) return null;
    
    // Analyze day of week
    const dayCount: { [key: string]: number } = {};
    const timeSlotCount: { [key: string]: number } = { morning: 0, afternoon: 0, evening: 0 };
    
    completedMatches.forEach(m => {
      const date = new Date(m.matchTime);
      const day = date.getDay();
      const hour = date.getHours();
      
      // Count weekend vs weekday
      const isWeekend = day === 0 || day === 6;
      dayCount[isWeekend ? 'weekend' : 'weekday'] = (dayCount[isWeekend ? 'weekend' : 'weekday'] || 0) + 1;
      
      // Count time slots
      if (hour < 12) timeSlotCount.morning++;
      else if (hour < 17) timeSlotCount.afternoon++;
      else timeSlotCount.evening++;
    });
    
    const totalCompleted = completedMatches.length;
    const weekendPercent = ((dayCount.weekend || 0) / totalCompleted) * 100;
    const mostActiveTime = Object.entries(timeSlotCount).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    
    if (weekendPercent >= 70) {
      return { type: 'weekend', icon: 'sun', text: 'Weekend Warrior! 🌅', detail: `${Math.round(weekendPercent)}% matches on Sat-Sun`, time: mostActiveTime };
    }
    
    if (mostActiveTime === 'morning') {
      return { type: 'morning', icon: 'sunrise', text: 'Early Bird! 🌞', detail: 'Best in morning matches', time: mostActiveTime };
    }
    
    if (mostActiveTime === 'evening') {
      return { type: 'evening', icon: 'sunset', text: 'Evening Expert 🌆', detail: 'Peak in evening games', time: mostActiveTime };
    }
    
    return { type: 'afternoon', icon: 'sun', text: 'Afternoon Ace ☀️', detail: 'Strongest in afternoon', time: mostActiveTime };
  }, [matches]);

  // Round Performance Analysis
  const roundPerformance = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    
    const roundStats: { [key: number]: { wins: number; total: number } } = {};
    
    matches.filter(m => m.result).forEach(m => {
      const round = m.round || 1;
      if (!roundStats[round]) roundStats[round] = { wins: 0, total: 0 };
      roundStats[round].total++;
      if (m.result === 'won') roundStats[round].wins++;
    });
    
    // Find best performing round
    let bestRound = 1;
    let bestWinRate = 0;
    
    Object.entries(roundStats).forEach(([round, stats]) => {
      const winRate = (stats.wins / stats.total) * 100;
      if (winRate > bestWinRate && stats.total >= 2) {
        bestWinRate = winRate;
        bestRound = parseInt(round);
      }
    });
    
    if (bestWinRate >= 70 && bestRound >= 3) {
      return {
        round: bestRound,
        winRate: Math.round(bestWinRate),
        text: bestRound >= 4 ? 'Finals Pro! 🏆' : 'Knockout Star! 💪',
        detail: `${Math.round(bestWinRate)}% win rate in Round ${bestRound}+`
      };
    }
    
    return null;
  }, [matches]);

  // Recent Form (Last 5 matches)
  const recentForm = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    
    const now = new Date();
    const recentMatches = matches
      .filter(m => new Date(m.matchTime) < now && m.result)
      .sort((a, b) => new Date(b.matchTime).getTime() - new Date(a.matchTime).getTime())
      .slice(0, 5);
    
    if (recentMatches.length < 3) return null;
    
    const wins = recentMatches.filter(m => m.result === 'won').length;
    const winRate = (wins / recentMatches.length) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendText = '';
    
    if (winRate >= 60) {
      trend = 'up';
      trendText = 'On Fire! 🔥';
    } else if (winRate <= 40) {
      trend = 'down';
      trendText = 'Keep Fighting! 💪';
    } else {
      trendText = 'Steady Form 📊';
    }
    
    return {
      matches: recentMatches.map(m => m.result === 'won' ? 'W' : m.result === 'lost' ? 'L' : 'D'),
      wins,
      total: recentMatches.length,
      winRate: Math.round(winRate),
      trend,
      trendText
    };
  }, [matches]);

  // Achievement Progress
  const achievements = useMemo(() => {
    if (!summary) return [];
    
    const achievements = [];
    
    // Century Maker
    if (summary.totalRuns && summary.totalRuns < 100) {
      achievements.push({
        id: 'century',
        name: 'Century Maker',
        current: summary.totalRuns,
        target: 100,
        unit: 'runs',
        icon: 'target',
        color: '#3B82F6',
        progress: (summary.totalRuns / 100) * 100
      });
    }
    
    // 5-Star Fielder
    if (summary.totalCatches && summary.totalCatches < 10) {
      achievements.push({
        id: 'fielder',
        name: '5-Star Fielder',
        current: summary.totalCatches,
        target: 10,
        unit: 'catches',
        icon: 'hand',
        color: '#10B981',
        progress: (summary.totalCatches / 10) * 100
      });
    }
    
    // Wicket Taker
    if (summary.totalWickets && summary.totalWickets < 15) {
      achievements.push({
        id: 'bowler',
        name: 'Wicket Master',
        current: summary.totalWickets,
        target: 15,
        unit: 'wickets',
        icon: 'zap',
        color: '#8B5CF6',
        progress: (summary.totalWickets / 15) * 100
      });
    }
    
    // Match Winner
    if (summary.matchesWon && summary.matchesWon < 20) {
      achievements.push({
        id: 'winner',
        name: 'Match Winner',
        current: summary.matchesWon,
        target: 20,
        unit: 'wins',
        icon: 'trophy',
        color: '#F59E0B',
        progress: (summary.matchesWon / 20) * 100
      });
    }
    
    return achievements.slice(0, 2); // Show top 2
  }, [summary]);

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

  const nextMatch = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    const now = new Date();
    const upcoming = matches
      .filter(m => new Date(m.matchTime) > now)
      .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime());
    return upcoming[0] || null;
  }, [matches]);

  const recentMatches = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    const now = new Date();
    return matches
      .filter(m => new Date(m.matchTime) < now && m.result)
      .sort((a, b) => new Date(b.matchTime).getTime() - new Date(a.matchTime).getTime())
      .slice(0, 3);
  }, [matches]);

  const upcomingMatches = useMemo(() => {
    if (!matches || matches.length === 0) return [];
    const now = new Date();
    return matches
      .filter(m => new Date(m.matchTime) > now)
      .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime())
      .slice(0, 5);
  }, [matches]);

  const tournamentOpportunities = useMemo(() => {
    if (!tournaments || tournaments.length === 0) return [];
    const playerTeamIds = myTeams.map(t => t.id);
    return tournaments
      .filter(t => {
        const isUpcoming = t.status?.toLowerCase() === "upcoming" || t.status?.toLowerCase() === "scheduled";
        const notJoined = !t.teams?.some((teamId: string) => playerTeamIds.includes(teamId));
        return isUpcoming && notJoined;
      })
      .sort((a, b) => {
        const aTeams = a.teams?.length || 0;
        const bTeams = b.teams?.length || 0;
        if (aTeams !== bTeams) return bTeams - aTeams;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 4);
  }, [tournaments, myTeams]);

  const activeTeams = useMemo(() => {
    return myTeams.filter(t => t.isActive).slice(0, 4);
  }, [myTeams]);

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

  const getAchievementIcon = (iconName: string, color: string) => {
    switch(iconName) {
      case 'target': return <Target size={24} color={color} />;
      case 'hand': return <Award size={24} color={color} />;
      case 'zap': return <Zap size={24} color={color} />;
      case 'trophy': return <Trophy size={24} color={color} />;
      default: return <Award size={24} color={color} />;
    }
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

  const getPatternIcon = (type: string) => {
    switch(type) {
      case 'sunrise': return <Sunrise size={20} color="#6366F1" />;
      case 'sun': return <Sun size={20} color="#6366F1" />;
      case 'sunset': return <Sunset size={20} color="#6366F1" />;
      default: return <Sun size={20} color="#6366F1" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp size={16} color="#10B981" />;
      case 'down': return <TrendingDown size={16} color="#EF4444" />;
      default: return <Minus size={16} color="#64748B" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

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
          <TouchableOpacity onPress={() => router.push("/profile")} className="px-3 py-2 rounded-lg">
            <Text className="text-blue-600 font-bold text-sm">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} tintColor="#3B82F6" />
        }
      >
        {/* Performance Streak */}
        {performanceStreak.count >= 3 && (
          <View className="mt-4 mx-4 bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-amber-100 p-2 rounded-full mr-3">
                  <Zap size={24} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-amber-900 font-bold text-lg">
                    {performanceStreak.count} {performanceStreak.type === "won" ? "Win" : "Match"} Streak
                  </Text>
                  <Text className="text-amber-700 text-sm">Keep the momentum going!</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Playing Pattern Insight */}
        {playingPattern && (
          <View className="mt-4 mx-4 bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
            <View className="flex-row items-center">
              <View className="bg-indigo-100 p-2 rounded-full mr-3">
                {getPatternIcon(playingPattern.icon)}
              </View>
              <View className="flex-1">
                <Text className="text-indigo-900 font-bold text-base">{playingPattern.text}</Text>
                <Text className="text-indigo-700 text-sm">{playingPattern.detail}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Round Performance Highlight */}
        {roundPerformance && (
          <View className="mt-4 mx-4 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <View className="flex-row items-center">
              <View className="bg-emerald-100 p-2 rounded-full mr-3">
                <Trophy size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-emerald-900 font-bold text-base">{roundPerformance.text}</Text>
                <Text className="text-emerald-700 text-sm">{roundPerformance.detail}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Form */}
        {recentForm && (
          <View className="mt-4 mx-4">
            <View className="flex-row items-center mb-3">
              <Activity size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Recent Form</Text>
            </View>
            
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  {getTrendIcon(recentForm.trend)}
                  <Text className={`font-bold text-base ml-2 ${
                    recentForm.trend === 'up' ? 'text-emerald-600' : 
                    recentForm.trend === 'down' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {recentForm.trendText}
                  </Text>
                </View>
                <Text className="text-slate-600 text-sm">
                  {recentForm.wins}W / {recentForm.total}M
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                {recentForm.matches.map((result, idx) => (
                  <View key={idx} className={`flex-1 mx-1 py-2 rounded-lg ${
                    result === 'W' ? 'bg-emerald-100' : result === 'L' ? 'bg-red-100' : 'bg-slate-100'
                  }`}>
                    <Text className={`text-center font-bold ${
                      result === 'W' ? 'text-emerald-600' : result === 'L' ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {result}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Achievement Progress */}
        {achievements.length > 0 && (
          <View className="mt-6 mx-4">
            <View className="flex-row items-center mb-3">
              <Award size={20} color="#F59E0B" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Achievement Progress</Text>
            </View>
            
            {achievements.map(achievement => (
              <View key={achievement.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border-l-4" style={{ borderLeftColor: achievement.color }}>
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <View className="mr-3 bg-slate-50 p-2 rounded-full">
                      {getAchievementIcon(achievement.icon, achievement.color)}
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold text-base">{achievement.name}</Text>
                      <Text className="text-slate-600 text-sm">
                        {achievement.current}/{achievement.target} {achievement.unit}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-blue-600 font-bold">{Math.round(achievement.progress)}%</Text>
                </View>
                
                <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <View
                    className="h-full"
                    style={{ width: `${Math.min(achievement.progress, 100)}%`, backgroundColor: achievement.color }}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Next Match Countdown */}
        {nextMatch && (
          <View className="mt-4 mx-4">
            <View className="flex-row items-center mb-3">
              <Timer size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-slate-900 ml-2">Next Match</Text>
            </View>
            
            <TouchableOpacity
              className="bg-blue-50 rounded-2xl p-5 border border-blue-100"
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="bg-blue-100 rounded-xl p-3 mb-4">
                <Text className="text-blue-700 text-xs font-semibold mb-1">STARTS IN</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-blue-900 text-4xl font-bold">
                    {getTimeUntilMatch(nextMatch.matchTime).value}
                  </Text>
                  <Text className="text-blue-800 text-lg font-semibold ml-2">
                    {getTimeUntilMatch(nextMatch.matchTime).unit}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <View className="bg-blue-100 px-4 py-2 rounded-full">
                  <Text className="text-blue-700 font-bold text-sm">Round {nextMatch.round}</Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={14} color="#1E40AF" />
                  <Text className="text-blue-900 text-sm ml-1">
                    {new Date(nextMatch.matchTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>

              <Text className="text-blue-900 font-bold text-xl mb-2">vs Opponent Team</Text>
              <Text className="text-blue-700 text-sm">
                {new Date(nextMatch.matchTime).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Matches */}
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

                <Text className="text-slate-900 font-bold text-base mb-1">vs Opponent Team</Text>
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

        {/* Trending Tournaments */}
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
                    {index === 0 && (
                      <View className="absolute top-2 right-2 bg-amber-500 px-2 py-1 rounded-full flex-row items-center z-10">
                        <Star size={10} color="#FFF" fill="#FFF" />
                        <Text className="text-white text-xs font-bold ml-1">TRENDING</Text>
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

        {/* Your Teams */}
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
              <TouchableOpacity onPress={() => router.push("/team/CreateTeam")} className="mt-3">
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
