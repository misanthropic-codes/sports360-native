import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { Crown, DotsThreeVertical, User } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type Member = {
  userId: string;
  role: string;
  name: string;
};

const BASE_URL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";

const TeamMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const params = useLocalSearchParams();
  const teamId = params.teamId as string;

  useEffect(() => {
    if (!teamId) return;

    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/team/${teamId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status === 200 && res.data.success) {
          const membersData: Member[] = res.data.data.map((member: any) => ({
            userId: member.userId,
            role: member.role,
            name: member.name || "Unknown",
          }));
          setMembers(membersData);
        }
      } catch (err) {
        console.error("Failed to fetch team members", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [token, teamId]);

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

  if (loading) {
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
      {members.map((member) => {
        const isCaptain = member.role.toLowerCase().includes("captain") || 
                         member.role.toLowerCase().includes("leader");
        
        return (
          <View
            key={member.userId}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <View className="flex-row items-center">
              {/* Avatar */}
              <View 
                className={`
                  w-12 h-12 rounded-full items-center justify-center mr-4
                  ${isCaptain ? "bg-amber-500" : "bg-indigo-500"}
                `}
              >
                <Text className="text-white font-bold text-base">
                  {getInitials(member.name)}
                </Text>
              </View>

              {/* Member Info */}
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-900 font-semibold text-base mr-2">
                    {member.name}
                  </Text>
                  {isCaptain && (
                    <Crown size={18} weight="fill" color="#F59E0B" />
                  )}
                </View>
                
                <View className={`
                  self-start px-3 py-1 rounded-full border
                  ${getRoleBadgeColor(member.role)}
                `}>
                  <Text className="text-xs font-bold uppercase tracking-wide">
                    {member.role}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity 
                className="p-2 bg-gray-50 rounded-lg"
                activeOpacity={0.7}
              >
                <DotsThreeVertical size={20} color="#6B7280" weight="bold" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default TeamMembers;
