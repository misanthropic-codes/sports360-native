import { benchMember, unbenchMember } from "@/api/teamApi";
import { useAuth } from "@/context/AuthContext";
import { useTeamDetailsStore } from "@/store/teamDetailsStore";
import { useLocalSearchParams } from "expo-router";
import { CaretDown, CaretUp, Crown, DotsThreeVertical, User } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const TeamMembers: React.FC = () => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [benchingMemberId, setBenchingMemberId] = useState<string | null>(null);
  const { token, user } = useAuth();

  const params = useLocalSearchParams();
  const teamId = params.teamId as string;

  const {
    getTeamMembers,
    fetchTeamMembers,
    updateMemberBenchStatus,
    loading,
  } = useTeamDetailsStore();

  const members = getTeamMembers(teamId);
  const isLoading = loading[teamId] || false;

  useEffect(() => {
    if (!teamId || !token) return;
    fetchTeamMembers(teamId, token);
  }, [teamId, token]);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const capitalizeText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getRoleBadgeColor = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes("captain") || lowerRole.includes("leader")) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    if (lowerRole.includes("vice")) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const isCurrentUserCaptain = members.some(
    (m) => m.userId === user?.id && m.role.toLowerCase().includes("captain")
  );

  const handleBenchMember = (memberId: string, currentlyBenched: boolean) => {
    if (!isCurrentUserCaptain) {
      Alert.alert("Unauthorized", "Only team captains can bench/unbench members.");
      return;
    }

    const action = currentlyBenched ? "Unbench" : "Bench";
    Alert.alert(
      `${action} Member`,
      `Are you sure you want to ${action.toLowerCase()} this member?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action,
          style: currentlyBenched ? "default" : "destructive",
          onPress: async () => {
            try {
              if (!token || !teamId) {
                Alert.alert("Error", "Missing authentication or team information.");
                return;
              }

              setBenchingMemberId(memberId);
              setOpenMenuId(null);
              updateMemberBenchStatus(teamId, memberId, !currentlyBenched);

              if (currentlyBenched) {
                await unbenchMember(teamId, memberId, token);
              } else {
                await benchMember(teamId, memberId, token);
              }

              Alert.alert(
                "Success",
                `Member ${currentlyBenched ? "unbenched" : "benched"} successfully`
              );
            } catch (error: any) {
              console.error("Bench/Unbench error:", error);
              updateMemberBenchStatus(teamId, memberId, currentlyBenched);
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  `Failed to ${action.toLowerCase()} member`
              );
            } finally {
              setBenchingMemberId(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-slate-600 font-medium">Loading team members...</Text>
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-16">
        <View className="bg-slate-100 rounded-full p-8 mb-4">
          <User size={56} color="#94A3B8" weight="light" />
        </View>
        <Text className="text-xl font-bold text-slate-900 mb-2">
          No Team Members
        </Text>
        <Text className="text-slate-500 text-center px-8 leading-5">
          Your team doesn't have any members yet.{"\n"}Start inviting players to join!
        </Text>
      </View>
    );
  }

  const renderMember = ({ item: member }: { item: any }) => {
    const isMemberCaptain = member.role.toLowerCase().includes("captain") || 
                            member.role.toLowerCase().includes("leader");
    const isMenuOpen = openMenuId === member.userId;
    const isExpanded = expandedId === member.userId;
    const shouldShowMenu = isCurrentUserCaptain && !isMemberCaptain;

    return (
      <View className="px-4 mb-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setExpandedId(isExpanded ? null : member.userId)}
          className="bg-white rounded-2xl"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* Compact Header - Always Visible */}
          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                {/* Avatar */}
                <View 
                  className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3"
                >
                  <Text className="text-blue-600 font-bold text-base">
                    {getInitials(member.fullName)}
                  </Text>
                </View>

                {/* Name & Position */}
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-slate-900 font-bold text-base mr-2" numberOfLines={1}>
                      {member.fullName}
                    </Text>
                    {isMemberCaptain && (
                      <Crown size={16} weight="fill" color="#F59E0B" />
                    )}
                  </View>
                  <Text className="text-slate-500 text-sm mt-0.5">
                    {capitalizeText(member.playingPosition)}
                  </Text>
                </View>
              </View>

              {/* Status & Expand Icon */}
              <View className="flex-row items-center">
                <View
                  className={`px-2.5 py-1 rounded-full mr-2 ${
                    member.isActive ? "bg-emerald-100" : "bg-slate-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      member.isActive ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
                
                {isExpanded ? (
                  <CaretUp size={20} color="#64748B" weight="bold" />
                ) : (
                  <CaretDown size={20} color="#64748B" weight="bold" />
                )}
              </View>
            </View>

            {/* Badges Row */}
            <View className="flex-row items-center mt-3 flex-wrap">
              <View className={`px-3 py-1 rounded-full border mr-2 mb-1 ${getRoleBadgeColor(member.role)}`}>
                <Text className="text-xs font-bold uppercase tracking-wide">
                  {member.role}
                </Text>
              </View>
              {member.isBenched && (
                <View className="px-3 py-1 rounded-full bg-red-100 border border-red-300 mb-1">
                  <Text className="text-xs font-bold uppercase tracking-wide text-red-700">
                    BENCHED
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Expanded Details */}
          {isExpanded && (
            <View className="px-4 pb-4 pt-2 border-t border-slate-100">
              {/* Contact Info */}
              <View className="mb-3">
                <Text className="text-slate-500 text-sm mb-1">Email</Text>
                <Text className="text-slate-900 text-sm">{member.email}</Text>
              </View>

              {/* Player Profile */}
              <View className="bg-blue-50 rounded-xl p-3 mb-3">
                <Text className="text-blue-900 font-semibold text-sm mb-2">
                  Player Profile
                </Text>
                <View className="space-y-1">
                  <View className="flex-row mb-1.5">
                    <Text className="text-blue-700 font-medium text-xs w-28">
                      Position:
                    </Text>
                    <Text className="text-blue-900 text-xs flex-1">
                      {capitalizeText(member.playingPosition)}
                    </Text>
                  </View>
                  <View className="flex-row mb-1.5">
                    <Text className="text-blue-700 font-medium text-xs w-28">
                      Batting:
                    </Text>
                    <Text className="text-blue-900 text-xs flex-1">
                      {capitalizeText(member.battingStyle)}
                    </Text>
                  </View>
                  <View className="flex-row mb-1.5">
                    <Text className="text-blue-700 font-medium text-xs w-28">
                      Bowling:
                    </Text>
                    <Text className="text-blue-900 text-xs flex-1">
                      {capitalizeText(member.bowlingStyle)}
                    </Text>
                  </View>
                  {member.batsmanType && (
                    <View className="flex-row">
                      <Text className="text-blue-700 font-medium text-xs w-28">
                        Batsman Type:
                      </Text>
                      <Text className="text-blue-900 text-xs flex-1">
                        {capitalizeText(member.batsmanType)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Footer with Join Date and Actions */}
              <View className="flex-row justify-between items-center">
                <Text className="text-slate-500 text-xs">
                  Joined {new Date(member.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                {shouldShowMenu && (
                  <View style={{ position: "relative", zIndex: 9999 }}>
                    <TouchableOpacity 
                      onPress={() => setOpenMenuId(isMenuOpen ? null : member.userId)}
                      className="px-3 py-2 bg-slate-100 rounded-lg"
                      activeOpacity={0.7}
                      disabled={benchingMemberId === member.userId}
                    >
                      <DotsThreeVertical size={18} color="#64748B" weight="bold" />
                    </TouchableOpacity>
                    {isMenuOpen && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 40,
                          right: 0,
                          backgroundColor: "white",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          minWidth: 160,
                          zIndex: 10000,
                          elevation: 10,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => handleBenchMember(member.userId, member.isBenched || false)}
                          className="px-4 py-3"
                          activeOpacity={0.7}
                        >
                          <Text
                            className={`font-semibold text-sm ${
                              member.isBenched ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {member.isBenched ? "Unbench Member" : "Bench Member"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Stats */}
      <View className="px-4 pt-4 pb-3">
        <View className="bg-white rounded-2xl p-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-slate-900">
                {members.length}
              </Text>
              <Text className="text-slate-500 text-sm mt-0.5">
                Total Members
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-emerald-600">
                {members.filter(m => m.isActive).length}
              </Text>
              <Text className="text-slate-500 text-sm mt-0.5">
                Active
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Members List */}
      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.userId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

export default TeamMembers;
