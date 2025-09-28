import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type Member = {
  userId: string;
  role: string;
  name: string;
};

// 🚀 Base URL hardcoded
const BASE_URL = "http://172.20.10.4:8080/api/v1";

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="space-y-2 p-4">
      {members.map((member) => (
        <View
          key={member.userId}
          className="flex-row justify-between p-4 bg-white rounded shadow"
        >
          <Text className="text-lg">{member.name}</Text>
          <Text className="text-gray-500">{member.role}</Text>
        </View>
      ))}
    </View>
  );
};

export default TeamMembers;
