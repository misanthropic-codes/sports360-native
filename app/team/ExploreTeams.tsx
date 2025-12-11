import { useRouter } from "expo-router";
import { Search, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNavBar from "../../components/BottomNavBar";
import Header from "../../components/Header";
import TeamCard from "../../components/TeamCard";
import { useAuth } from "../../context/AuthContext";
import { useTeamStore } from "../../store/teamStore";

const ExploreTeamsScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const { allTeams, loading, fetchTeams } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [teamsToShow, setTeamsToShow] = useState(8); // Initially show 8 teams

  const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
  const role = user?.role?.toLowerCase() || "organizer";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "cricket";

  // Pull-to-refresh handler
  const onRefresh = async () => {
    if (!user?.token || !baseURL) return;
    
    setRefreshing(true);
    try {
      await fetchTeams(user.token, baseURL);
    } catch (error) {
      console.error("Error refreshing teams:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch teams with smart caching on mount
  useEffect(() => {
    if (user?.token && baseURL) {
      fetchTeams(user.token, baseURL); // Smart fetch - only if not cached
    }
  }, []);

  // Filter teams based on search query
  const filteredTeams = allTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        title="Explore Teams"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]} // Android - emerald color for organizer
            tintColor="#10B981" // iOS
          />
        }
      >
        {/* Search Bar */}
        <View className="px-4 pt-4 pb-2">
          <View className="bg-white rounded-xl p-4 flex-row items-center border border-emerald-200">
            <Search size={20} color="#10B981" />
            <TextInput
              className="flex-1 ml-3 text-slate-900 text-base"
              placeholder="Search teams..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text className="text-emerald-600 font-semibold">Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Header */}
        <View className="px-4 py-3">
          <View className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-around">
              <View className="items-center">
                <Text className="text-3xl font-bold text-emerald-600">
                  {filteredTeams.length}
                </Text>
                <Text className="text-slate-500 text-xs mt-1">
                  {searchQuery ? "Results" : "Total Teams"}
                </Text>
              </View>
              <View className="w-px h-10 bg-slate-200" />
              <View className="items-center">
                <Text className="text-3xl font-bold text-blue-600">
                  {filteredTeams.filter(t => t.isActive).length}
                </Text>
                <Text className="text-slate-500 text-xs mt-1">
                  Active
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Teams List */}
        {loading ? (
          <View className="p-4 flex justify-center items-center py-12">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="mt-4 text-slate-600 font-medium">Loading teams...</Text>
          </View>
        ) : filteredTeams.length > 0 ? (
          <>
            {filteredTeams.slice(0, teamsToShow).map((team) => (
              <TeamCard
                key={`explore-${team.id}`}
                context="viewTeam"
                teamName={team.name}
                status={team.isActive ? "Active" : "Pending"}
                stats={[
                  { value: (team as any).teamSize || "11", label: "capacity" },
                  { value: team.location || "N/A", label: "location" },
                  { value: "0", label: "tournaments" },
                ]}
                onView={() =>
                  router.push({
                    pathname: "/team/ViewTeam",
                    params: { teamId: team.id },
                  })
                }
                onInvite={() =>
                  router.push({
                    pathname: "/tournament/InviteTeam",
                    params: { teamId: team.id },
                  })
                }
              />
            ))}
            
            {/* Load More button */}
            {teamsToShow < filteredTeams.length && (
              <View className="px-4 py-2 pb-4">
                <TouchableOpacity
                  onPress={() => setTeamsToShow(prev => prev + 8)}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Users size={20} color="#10B981" />
                  <Text className="text-emerald-600 font-semibold text-sm ml-2">
                    Load More Teams ({filteredTeams.length - teamsToShow} remaining)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View className="p-4 items-center justify-center py-16">
            <View className="bg-slate-100 rounded-full p-8 mb-4">
              <Users size={56} color="#94A3B8" />
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2">
              {searchQuery ? "No teams found" : "No teams available"}
            </Text>
            <Text className="text-slate-500 text-center px-8 leading-5">
              {searchQuery 
                ? `No teams match "${searchQuery}"`
                : "There are no teams registered yet"}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="mt-4 bg-emerald-100 px-6 py-3 rounded-xl"
              >
                <Text className="text-emerald-700 font-semibold">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default ExploreTeamsScreen;
