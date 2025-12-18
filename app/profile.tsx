import { useRouter } from "expo-router";
import { Award, Calendar, Edit, LogOut, Mail, Phone, Target, Trophy, User } from "lucide-react-native";
import React, { useEffect } from "react";
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
import { useUserStore } from "../store/userStore";

const ProfileScreen = () => {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  
  const { analytics, analyticsLoading, fetchAnalytics } = useUserStore();

  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains) ? user.domains[0] : user?.domains || "cricket";

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
    if (token && role !== "organizer" && role !== "organiser") {
      fetchAnalytics(token);
    }
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
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Profile */}
        <View className="bg-white px-6 pt-6 pb-8">
          {/* Edit Button */}
          <TouchableOpacity
            onPress={handleEditProfile}
            className="absolute top-6 right-6 bg-slate-100 rounded-full p-2.5 z-10"
            activeOpacity={0.7}
          >
            <Edit size={18} color="#475569" />
          </TouchableOpacity>

          {/* Profile Image */}
          <View className="items-center mb-4">
            <View className="relative">
              <Image
                source={{
                  uri:
                    user.profilePicUrl && user.profilePicUrl.trim() !== ""
                      ? user.profilePicUrl
                      : "https://ui-avatars.com/api/?name=" + user.fullName,
                }}
                className="w-28 h-28 rounded-full border-4 border-slate-100"
              />
              <View className="absolute bottom-0 right-0 bg-emerald-500 w-7 h-7 rounded-full border-4 border-white" />
            </View>
          </View>

          {/* User Info */}
          <View className="items-center">
            <Text className="text-slate-900 text-2xl font-bold text-center mb-1">
              {user.fullName}
            </Text>
            <View className="bg-slate-100 px-3 py-1.5 rounded-full mb-3">
              <Text className="text-slate-700 text-sm font-semibold capitalize">
                {user.role}
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Stats - Only for Players */}
        {(role === "player" || role === "cricket" || role === "marathon") && !analyticsLoading && analytics && (
          <View className="px-6 mt-6">
            <View className="flex-row items-center mb-4">
              <Award size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-slate-900 ml-2">
                Performance Stats
              </Text>
            </View>
            
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100">
                <View className="flex-row items-center mb-2">
                  <View className="bg-blue-50 p-2 rounded-lg">
                    <Trophy size={18} color="#3B82F6" />
                  </View>
                </View>
                <Text className="text-slate-600 text-xs font-medium mb-1">Matches</Text>
                <Text className="text-slate-900 font-bold text-2xl">
                  {analytics.matches || 0}
                </Text>
              </View>

              <View className="flex-1 bg-white rounded-2xl p-4 border border-slate-100">
                <View className="flex-row items-center mb-2">
                  <View className="bg-emerald-50 p-2 rounded-lg">
                    <Target size={18} color="#10B981" />
                  </View>
                </View>
                <Text className="text-slate-600 text-xs font-medium mb-1">Win Rate</Text>
                <Text className="text-slate-900 font-bold text-2xl">
                  {Math.round((analytics.winRate || 0) * 100)}%
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-4 border border-slate-100">
              <View className="flex-row items-center mb-2">
                <View className="bg-amber-50 p-2 rounded-lg">
                  <Trophy size={18} color="#F59E0B" />
                </View>
              </View>
              <Text className="text-slate-600 text-xs font-medium mb-1">Tournaments</Text>
              <Text className="text-slate-900 font-bold text-2xl">
                {analytics.tournaments || 0}
              </Text>
            </View>
          </View>
        )}

        {(role === "player" || role === "cricket" || role === "marathon") && analyticsLoading && (
          <View className="px-6 mt-6 items-center py-8">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-slate-400 text-sm mt-2">Loading stats...</Text>
          </View>
        )}

        {/* Contact & Info Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center mb-4">
            <User size={20} color="#3B82F6" />
            <Text className="text-lg font-bold text-slate-900 ml-2">
              Account Info
            </Text>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* Email */}
            <View className="flex-row items-center p-4 border-b border-slate-100">
              <View className="bg-blue-50 p-2.5 rounded-lg mr-3">
                <Mail size={18} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-500 text-xs font-medium mb-0.5">Email</Text>
                <Text className="text-slate-900 text-sm font-semibold">{user.email}</Text>
              </View>
            </View>

            {/* Phone */}
            <View className="flex-row items-center p-4 border-b border-slate-100">
              <View className="bg-emerald-50 p-2.5 rounded-lg mr-3">
                <Phone size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-500 text-xs font-medium mb-0.5">Phone</Text>
                <Text className="text-slate-900 text-sm font-semibold">
                  {user.phone || "Not provided"}
                </Text>
              </View>
            </View>

            {/* Created Date */}
            <View className="flex-row items-center p-4">
              <View className="bg-purple-50 p-2.5 rounded-lg mr-3">
                <Calendar size={18} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-500 text-xs font-medium mb-0.5">Member Since</Text>
                <Text className="text-slate-900 text-sm font-semibold">
                  {new Date(user.createdAt || "").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Domains */}
          {user.domains && user.domains.length > 0 && (
            <View className="mt-4">
              <Text className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wider">
                Sports
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {user.domains.map((domain, idx) => (
                  <View
                    key={idx}
                    className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100"
                  >
                    <Text className="text-blue-700 text-sm font-semibold capitalize">
                      {domain}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View className="mt-8 px-6">
          <TouchableOpacity
            onPress={logout}
            className="flex-row items-center justify-center bg-red-500 py-4 rounded-2xl"
            activeOpacity={0.8}
            style={{
              shadowColor: "#EF4444",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <LogOut size={20} color="white" />
            <Text className="text-white text-base font-bold ml-2">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
