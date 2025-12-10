import { getPlayerAnalytics } from "@/api/userApi";
import { useRouter } from "expo-router";
import { Edit, LogOut, Target, Trophy } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains) ? user.domains[0] : user?.domains || "cricket";

  // Handle edit profile click
  const handleEditProfile = () => {
    if (role === "organizer" || role === "organiser") {
      Alert.alert(
        "Coming Soon",
        "Edit profile feature for organizers will be live soon!",
        [{ text: "OK" }]
      );
    } else {
      router.push(`/edit-${type}` as any);
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Only fetch analytics for players
      if (!token || role === "organizer" || role === "organiser") {
        setLoadingAnalytics(false);
        return;
      }
      
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
  }, [token, role]);

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
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-3xl items-center shadow-lg">
          <View className="absolute top-4 right-4">
            <TouchableOpacity
              onPress={handleEditProfile}
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
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
          <Text className="text-white text-2xl font-bold mt-5 text-center">
            {user.fullName}
          </Text>
          <Text className="text-indigo-100 text-base mt-1">{user.email}</Text>
          <Text className="text-indigo-100 mt-1 capitalize text-sm font-medium">
            {user.role}
          </Text>
        </View>

        {/* Performance Stats - Only for Players */}
        {(role === "player" || role === "cricket" || role === "marathon") && !loadingAnalytics && analytics && (
          <View className="px-6 mt-6 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Performance Overview
            </Text>
            
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Matches</Text>
                  <Trophy size={18} color="#4F46E5" />
                </View>
                <Text className="text-gray-900 font-bold text-3xl">
                  {analytics.matches || 0}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Win Rate</Text>
                  <Target size={18} color="#10B981" />
                </View>
                <Text className="text-gray-900 font-bold text-3xl">
                  {Math.round((analytics.winRate || 0) * 100)}%
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Tournaments</Text>
                <Trophy size={18} color="#F59E0B" />
              </View>
              <Text className="text-gray-900 font-bold text-3xl">
                {analytics.tournaments || 0}
              </Text>
            </View>
          </View>
        )}

        {(role === "player" || role === "cricket" || role === "marathon") && loadingAnalytics && (
          <View className="px-6 mt-6 items-center">
            <ActivityIndicator size="small" color="#4F46E5" />
          </View>
        )}

        {/* Info Cards */}
        <View className="px-6 gap-4">
          <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <Text className="text-gray-500 text-sm font-medium mb-2">Phone</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {user.phone || "N/A"}
            </Text>
          </View>

          <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <Text className="text-gray-500 text-sm font-medium mb-3">Domains</Text>
            <View className="flex-row flex-wrap gap-2">
              {user.domains && user.domains.length > 0 ? (
                user.domains.map((domain, idx) => (
                  <Text
                    key={idx}
                    className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {domain}
                  </Text>
                ))
              ) : (
                <Text className="text-gray-400">No domains</Text>
              )}
            </View>
          </View>

          <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <Text className="text-gray-500 text-sm font-medium mb-2">Account Created</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {new Date(user.createdAt || "").toDateString()}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-8 px-6">
          <TouchableOpacity
            onPress={logout}
            className="flex-row items-center justify-center bg-red-500 py-4 rounded-2xl shadow-lg"
            activeOpacity={0.8}
          >
            <LogOut size={22} color="white" />
            <Text className="text-white text-lg font-bold ml-2">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
