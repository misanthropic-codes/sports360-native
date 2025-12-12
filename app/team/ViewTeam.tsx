import BottomNavBar from "@/components/BottomNavBar";
import Header from "@/components/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronDown, ChevronUp, MapPin, Trophy, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTeamDetailsStore } from "../../store/teamDetailsStore";
import { useTeamStore } from "../../store/teamStore";

const TeamScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { teamId } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<
    "members" | "tournaments" | "matches"
  >("members");
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Use teamDetailsStore instead of local state
  const {
    getTeamMembers,
    getTeamTournaments,
    getTeamMatches,
    fetchTeamMembers,
    fetchTeamTournaments,
    fetchTeamMatches,
    loading,
  } = useTeamDetailsStore();

  const { allTeams } = useTeamStore();
  const teamInfo = allTeams.find(t => t.id === teamId);

  const members = getTeamMembers(teamId as string);
  const tournaments = getTeamTournaments(teamId as string);
  const matches = getTeamMatches(teamId as string);
  const isLoading = loading[teamId as string] || false;

  const role = user?.role?.toLowerCase() || "organizer";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "cricket";

  // Fetch all team data with smart caching
  useEffect(() => {
    if (!user?.token || !teamId) return;

    fetchTeamMembers(teamId as string, user.token);
    fetchTeamTournaments(teamId as string, user.token);
    fetchTeamMatches(teamId as string, user.token);
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
      className={`flex-1 py-3.5 mx-1 rounded-xl flex-row justify-center items-center ${
        activeTab === tab ? "bg-emerald-600" : "bg-emerald-50"
      }`}
      style={
        activeTab === tab
          ? {
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }
          : {}
      }
    >
      {Icon && (
        <Icon
          size={18}
          color={activeTab === tab ? "white" : "#059669"}
          className="mr-2"
        />
      )}
      <Text
        className={`font-semibold text-sm ${
          activeTab === tab ? "text-white" : "text-emerald-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderMembers = () => (
    <View className="px-4 pb-32">
      {members.length === 0 ? (
        <View className="bg-white rounded-2xl p-8 items-center">
          <Users size={48} color="#94A3B8" />
          <Text className="text-slate-600 text-center mt-4 text-base">
            No members found
          </Text>
        </View>
      ) : (
        members.map((member) => {
          const isExpanded = expandedMemberId === member.userId;
          return (
            <View
              key={member.userId}
              className="bg-white rounded-2xl p-6 mb-4 border border-emerald-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Header */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 mr-3">
                  <Text className="text-slate-900 font-bold text-lg mb-1">
                    {member.fullName}
                  </Text>
                  <Text className="text-slate-500 text-sm">{member.email}</Text>
                </View>
                <View className="flex-row gap-2">
                  <View
                    className={`px-3 py-1.5 rounded-full ${
                      member.isActive ? "bg-emerald-100" : "bg-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        member.isActive ? "text-emerald-700" : "text-slate-600"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Role Badge */}
              <View className="flex-row gap-2 mb-4">
                <View
                  className={`px-4 py-2 rounded-lg ${
                    member.role.toLowerCase() === "captain"
                      ? "bg-amber-100 border border-amber-300"
                      : "bg-emerald-100 border border-emerald-300"
                  }`}
                >
                  <Text
                    className={`font-bold text-sm ${
                      member.role.toLowerCase() === "captain"
                        ? "text-amber-800"
                        : "text-emerald-800"
                    }`}
                  >
                    {member.role.toUpperCase()}
                  </Text>
                </View>
                {member.isBenched && (
                  <View className="px-4 py-2 rounded-lg bg-red-100 border border-red-300">
                    <Text className="font-bold text-sm text-red-800">
                      BENCHED
                    </Text>
                  </View>
                )}
              </View>

              {/* Expandable Player Stats */}
              <TouchableOpacity
                onPress={() =>
                  setExpandedMemberId(isExpanded ? null : member.userId)
                }
                className="flex-row items-center justify-between py-2 border-t border-slate-100"
              >
                <Text className="text-emerald-600 font-semibold text-sm">
                  {isExpanded ? "Hide" : "View"} Player Details
                </Text>
                {isExpanded ? (
                  <ChevronUp size={20} color="#10B981" />
                ) : (
                  <ChevronDown size={20} color="#10B981" />
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View className="mt-4 bg-slate-50 rounded-xl p-4">
                  <Text className="text-slate-900 font-semibold text-sm mb-3">
                    Player Profile
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row py-2">
                      <Text className="text-slate-600 font-medium text-sm w-32">
                        Position:
                      </Text>
                      <Text className="text-slate-900 text-sm flex-1 capitalize">
                        {member.playingPosition}
                      </Text>
                    </View>
                    <View className="flex-row py-2">
                      <Text className="text-slate-600 font-medium text-sm w-32">
                        Batting:
                      </Text>
                      <Text className="text-slate-900 text-sm flex-1 capitalize">
                        {member.battingStyle.replace("_", " ")}
                      </Text>
                    </View>
                    <View className="flex-row py-2">
                      <Text className="text-slate-600 font-medium text-sm w-32">
                        Bowling:
                      </Text>
                      <Text className="text-slate-900 text-sm flex-1 capitalize">
                        {member.bowlingStyle.replace(/_/g, " ")}
                      </Text>
                    </View>
                    {member.batsmanType && (
                      <View className="flex-row py-2">
                        <Text className="text-slate-600 font-medium text-sm w-32">
                          Type:
                        </Text>
                        <Text className="text-slate-900 text-sm flex-1 capitalize">
                          {member.batsmanType}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Join Date */}
                  <View className="border-t border-slate-200 pt-3 mt-3">
                    <Text className="text-slate-500 text-xs">
                      Joined{" "}
                      {member.joinedAt &&
                        new Date(member.joinedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );

  const renderTournaments = () => (
    <View className="px-4 pb-32">
      {tournaments.length === 0 ? (
        <View className="bg-white rounded-2xl p-8 items-center">
          <Trophy size={48} color="#94A3B8" />
          <Text className="text-slate-600 text-center mt-4 text-base">
            No tournaments joined yet
          </Text>
        </View>
      ) : (
        tournaments.map((tournament) => (
          <View
            key={tournament.id}
            className="bg-white rounded-2xl p-5 mb-4 border border-emerald-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-slate-900 font-bold text-lg mb-1">
                  {tournament.name}
                </Text>
                {tournament.location && (
                  <View className="flex-row items-center mt-1">
                    <MapPin size={14} color="#64748B" />
                    <Text className="text-slate-500 text-sm ml-1">
                      {tournament.location}
                    </Text>
                  </View>
                )}
              </View>
              <View className="bg-emerald-100 px-3 py-1.5 rounded-full">
                <Text className="text-emerald-700 text-xs font-bold uppercase">
                  {tournament.status || "Active"}
                </Text>
              </View>
            </View>

            {tournament.startDate && (
              <View className="flex-row items-center pt-3 border-t border-slate-100">
                <Calendar size={16} color="#10B981" />
                <Text className="text-slate-600 text-sm ml-2">
                  {new Date(tournament.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderMatches = () => (
    <View className="px-4 pb-32">
      {matches.length === 0 ? (
        <View className="bg-white rounded-2xl p-8 items-center">
          <Calendar size={48} color="#94A3B8" />
          <Text className="text-slate-600 text-center mt-4 text-base">
            No matches scheduled
          </Text>
        </View>
      ) : (
        matches.map((match) => (
          <View
            key={match.id}
            className="bg-white rounded-2xl p-5 mb-4 border border-emerald-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="mb-3">
              <Text className="text-slate-900 font-bold text-lg mb-1">
                vs {match.opponentTeamName || "TBD"}
              </Text>
              {match.result && (
                <View className="bg-emerald-50 px-3 py-1.5 rounded-lg mt-2 self-start">
                  <Text className="text-emerald-700 text-sm font-semibold">
                    Result: {match.result}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center pt-3 border-t border-slate-100">
              <Calendar size={16} color="#10B981" />
              <Text className="text-slate-600 text-sm ml-2">
                {new Date(match.matchTime).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      
      <Header
        type="title"
        title="Team Details"
        showBackButton
        onBackPress={() => router.back()}
      />

      {/* Team Info Header */}
      {teamInfo && (
        <View className="mx-4 mt-2 mb-4">
          <View
            className="bg-white rounded-2xl p-5 border border-emerald-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View className="bg-emerald-100 p-3 rounded-xl mr-3">
                <Users size={28} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-xl">
                  {teamInfo.name}
                </Text>
                {teamInfo.location && (
                  <Text className="text-slate-500 text-sm mt-0.5">
                    {teamInfo.location}
                  </Text>
                )}
              </View>
              <View className={`px-3 py-1.5 rounded-full ${teamInfo.isActive ? "bg-emerald-100" : "bg-slate-100"}`}>
                <Text className={`text-xs font-bold ${teamInfo.isActive ? "text-emerald-700" : "text-slate-600"}`}>
                  {teamInfo.isActive ? "Active" : "Pending"}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-around pt-4 border-t border-slate-100">
              <View className="items-center">
                <Text className="text-2xl font-bold text-emerald-600">
                  {members.length}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">Members</Text>
              </View>
              <View className="w-px h-10 bg-slate-200" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">
                  {tournaments.length}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  Tournaments
                </Text>
              </View>
              <View className="w-px h-10 bg-slate-200" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {matches.length}
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">Matches</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View className="px-4 pb-3">
        <View className="flex-row bg-white rounded-2xl p-2 shadow-sm">
          <TabButton label="Members" Icon={Users} tab="members" />
          <TabButton label="Tournaments" Icon={Trophy} tab="tournaments" />
          <TabButton label="Matches" Icon={Calendar} tab="matches" />
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-slate-600 mt-4 font-medium">Loading...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8 }}
        >
          {activeTab === "members" && renderMembers()}
          {activeTab === "tournaments" && renderTournaments()}
          {activeTab === "matches" && renderMatches()}
        </ScrollView>
      )}

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default TeamScreen;
