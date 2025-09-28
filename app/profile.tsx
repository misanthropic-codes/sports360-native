import { LogOut } from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = ({ navigation }: { navigation?: any }) => {
  const { user, logout } = useAuth();

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
