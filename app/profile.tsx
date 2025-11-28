import { getPlayerAnalytics } from "@/api/userApi";
import { useRouter } from "expo-router";
import { Edit, LogOut, Target, Trophy } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = () => {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const type = Array.isArray(user?.domains) ? user.domains[0] : user?.domains || "cricket";

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      
      try {
        const data = await getPlayerAnalytics("overall", undefined, undefined, token);
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500 text-lg">No user data found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50"
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-indigo-600 pt-12 pb-8 px-6 rounded-b-3xl items-center shadow">
          <View className="absolute top-4 right-4">
            <TouchableOpacity
              onPress={() => router.push(`/edit-${type}` as any)}
              className="bg-white/20 rounded-full p-3"
              activeOpacity={0.7}
            >
              <Edit size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Image
            source={{
              uri:
                user.profilePicUrl && user.profilePicUrl.trim() !== ""
                  ? user.profilePicUrl
                  : "https://ui-avatars.com/api/?name=" + user.fullName,
            }}
            className="w-28 h-28 rounded-full border-4 border-white"
          />
          <Text className="text-white text-2xl font-bold mt-4 text-center">
            {user.fullName}
          </Text>
          <Text className="text-indigo-100 text-base">{user.email}</Text>
          <Text className="text-indigo-100 mt-1 capitalize text-sm">
            {user.role}
          </Text>
        </View>

        {/* Performance Stats */}
        {!loadingAnalytics && analytics && (
          <View className="px-6 mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Performance Overview
            </Text>
            
            <View className="flex-row space-x-3 mb-3">
              <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-xs font-medium">MATCHES</Text>
                  <Trophy size={16} color="#4F46E5" />
                </View>
                <Text className="text-gray-900 font-bold text-2xl">
                  {analytics.matches || 0}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-500 text-xs font-medium">WIN RATE</Text>
                  <Target size={16} color="#10B981" />
                </View>
                <Text className="text-gray-900 font-bold text-2xl">
                  {Math.round((analytics.winRate || 0) * 100)}%
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-500 text-xs font-medium">TOURNAMENTS</Text>
                <Trophy size={16} color="#F59E0B" />
              </View>
              <Text className="text-gray-900 font-bold text-2xl">
                {analytics.tournaments || 0}
              </Text>
            </View>
          </View>
        )}

        {loadingAnalytics && (
          <View className="px-6 mt-6 items-center">
            <ActivityIndicator size="small" color="#4F46E5" />
          </View>
        )}

        {/* Info Cards */}
        <View className="px-6 mt-6 space-y-5">
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="text-gray-500 text-sm">Phone</Text>
            <Text className="text-lg font-semibold mt-1">
              {user.phone || "N/A"}
            </Text>
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="text-gray-500 text-sm">Domains</Text>
            <View className="flex-row flex-wrap mt-2">
              {user.domains && user.domains.length > 0 ? (
                user.domains.map((domain, idx) => (
                  <Text
                    key={idx}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full mr-2 mb-2 text-sm"
                  >
                    {domain}
                  </Text>
                ))
              ) : (
                <Text className="text-gray-400 mt-1">No domains</Text>
              )}
            </View>
          </View>

          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="text-gray-500 text-sm">Account Created</Text>
            <Text className="text-lg font-semibold mt-1">
              {new Date(user.createdAt || "").toDateString()}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-10 px-6">
          <TouchableOpacity
            onPress={logout}
            className="flex-row items-center justify-center bg-red-500 py-4 rounded-2xl shadow"
            activeOpacity={0.8}
          >
            <LogOut size={22} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
