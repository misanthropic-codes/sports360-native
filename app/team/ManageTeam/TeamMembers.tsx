import { benchMember, unbenchMember } from "@/api/teamApi";
import { useAuth } from "@/context/AuthContext";
import { useTeamDetailsStore } from "@/store/teamDetailsStore";
import { useLocalSearchParams } from "expo-router";
import { Crown, DotsThreeVertical, User } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";

const TeamMembers: React.FC = () => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [benchingMemberId, setBenchingMemberId] = useState<string | null>(null);
  const { token, user } = useAuth();

  const params = useLocalSearchParams();
  const teamId = params.teamId as string;

  // Use teamDetailsStore instead of local state
  const {
    getTeamMembers,
    fetchTeamMembers,
    updateMemberBenchStatus,
    loading,
  } = useTeamDetailsStore();

  const members = getTeamMembers(teamId);
  const isLoading = loading[teamId] || false;

  // Fetch members with smart caching
  useEffect(() => {
    if (!teamId || !token) return;
    
    fetchTeamMembers(teamId, token); // Smart fetch - only if not cached
  }, [teamId, token]);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes("captain") || lowerRole.includes("leader")) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    if (lowerRole.includes("vice")) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Check if current user is captain
  const isCurrentUserCaptain = members.some(
    (m) => m.userId === user?.id && m.role.toLowerCase().includes("captain")
  );

  // Handle bench/unbench member with optimistic update
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

              // Optimistic update
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
              // Revert optimistic update on error
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
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600 font-medium">Loading team members...</Text>
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-16">
        <View className="bg-gray-100 rounded-full p-6 mb-4">
          <User size={48} color="#9CA3AF" weight="light" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          No Team Members
        </Text>
        <Text className="text-gray-500 text-center px-8">
          Your team doesn't have any members yet. Start inviting players to join!
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-3">
      {/* Header Stats */}
      <View className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-2">
        <Text className="text-indigo-900 font-bold text-lg">
          {members.length} {members.length === 1 ? "Member" : "Members"}
        </Text>
        <Text className="text-indigo-600 text-sm">
          Active team roster
        </Text>
      </View>

      {/* Members List */}
      {members.map((member, index) => {
        // Check if THIS member is a captain
        const isMemberCaptain = member.role.toLowerCase().includes("captain") || 
                         member.role.toLowerCase().includes("leader");
        const isMenuOpen = openMenuId === member.userId;
        // Show menu only if: current user is captain AND this member is NOT a captain
        const shouldShowMenu = isCurrentUserCaptain && !isMemberCaptain;
        
        return (
          <View
            key={member.userId}
            style={{
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: isMenuOpen ? 999 : 2,
              zIndex: isMenuOpen ? 9999 : members.length - index,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-900 font-bold text-lg mr-2">
                    {member.fullName}
                  </Text>
                  {isMemberCaptain && (
                    <Crown size={20} weight="fill" color="#F59E0B" />
                  )}
                </View>
                <Text className="text-gray-600 text-sm">{member.email}</Text>
              </View>
              
              <View
                className={`px-3 py-1 rounded-full ${
                  member.isActive ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    member.isActive ? "text-green-700" : "text-gray-600"
                  }`}
                >
                  {member.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>

            {/* Role Badge and Benched Badge */}
            <View className="mb-3 flex-row">
              <View className={`
                self-start px-3 py-1 rounded-full border
                ${getRoleBadgeColor(member.role)}
              `}>
                <Text className="text-xs font-bold uppercase tracking-wide">
                  {member.role}
                </Text>
              </View>
              {member.isBenched && (
                <View 
                  className="ml-2 px-3 py-1 rounded-full bg-red-100 border border-red-300"
                >
                  <Text className="text-xs font-bold uppercase tracking-wide text-red-700">
                    BENCHED
                  </Text>
                </View>
              )}
            </View>

            {/* Player Profile */}
            <View className="bg-indigo-50 rounded-lg p-3 mb-3">
              <Text className="text-indigo-900 font-semibold text-sm mb-2">
                Player Profile
              </Text>
              <View className="space-y-1">
                <View className="flex-row mb-1">
                  <Text className="text-indigo-700 font-medium text-xs w-28">
                    Position:
                  </Text>
                  <Text className="text-indigo-900 text-xs flex-1 capitalize">
                    {member.playingPosition}
                  </Text>
                </View>
                <View className="flex-row mb-1">
                  <Text className="text-indigo-700 font-medium text-xs w-28">
                    Batting:
                  </Text>
                  <Text className="text-indigo-900 text-xs flex-1 capitalize">
                    {member.battingStyle.replace("_", " ")}
                  </Text>
                </View>
                <View className="flex-row mb-1">
                  <Text className="text-indigo-700 font-medium text-xs w-28">
                    Bowling:
                  </Text>
                  <Text className="text-indigo-900 text-xs flex-1 capitalize">
                    {member.bowlingStyle.replace(/_/g, " ")}
                  </Text>
                </View>
                {member.batsmanType && (
                  <View className="flex-row">
                    <Text className="text-indigo-700 font-medium text-xs w-28">
                      Batsman Type:
                    </Text>
                    <Text className="text-indigo-900 text-xs flex-1 capitalize">
                      {member.batsmanType}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Footer with Join Date and Actions */}
            <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
              <Text className="text-gray-500 text-xs">
                Joined {new Date(member.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              {shouldShowMenu && (
                <View style={{ position: "relative", zIndex: 1000 }}>
                  <TouchableOpacity 
                    onPress={() => {
                      console.log("🎯 Menu clicked for:", member.fullName);
                      setOpenMenuId(openMenuId === member.userId ? null : member.userId);
                    }}
                    style={{
                      padding: 8,
                      backgroundColor: "#F9FAFB",
                      borderRadius: 8,
                    }}
                    activeOpacity={0.7}
                    disabled={benchingMemberId === member.userId}
                  >
                    <DotsThreeVertical size={20} color="#6B7280" weight="bold" />
                  </TouchableOpacity>
                  {openMenuId === member.userId && (
                    <View
                      style={{
                        position: "absolute",
                        top: 40,
                        right: 0,
                        backgroundColor: "white",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        minWidth: 160,
                        zIndex: 2000,
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          handleBenchMember(member.userId, member.isBenched || false);
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: member.isBenched ? "#16a34a" : "#dc2626",
                          }}
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
        );
      })}
    </View>
  );
};

export default TeamMembers;
