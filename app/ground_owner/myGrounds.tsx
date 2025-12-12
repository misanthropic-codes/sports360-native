import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { Ground, useGroundStore } from "@/store/groundStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MyGroundsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  
  // Use groundStore instead of local state
  const { 
    grounds, 
    groundsLoading, 
    fetchGrounds 
  } = useGroundStore();
  
  const [refreshing, setRefreshing] = useState(false);

  // Fetch grounds with smart caching
  useEffect(() => {
    if (token) {
      fetchGrounds(token); // Smart fetch - only if not cached
    }
  }, [token]);

  const onRefresh = async () => {
    if (!token) return;
    
    setRefreshing(true);
    await fetchGrounds(token, true); // Force refresh
    setRefreshing(false);
  };

  const renderGroundItem = ({ item }: { item: Ground }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
      activeOpacity={0.9}
      onPress={() => {
        // Navigate to ground details if needed
        // router.push(`/ground_owner/GroundDetail?id=${item.id}`);
      }}
    >
      <View className="flex-row p-4">
        {/* Ground Image */}
        <Image
          source={{
            uri:
              item.imageUrls?.split(",")[0] ||
              "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
          }}
          className="w-24 h-24 rounded-xl bg-gray-200"
        />

        {/* Ground Info */}
        <View className="flex-1 ml-4 justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-900 numberOfLines={1}">
              {item.groundOwnerName}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {item.primaryLocation}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="bg-green-50 px-3 py-1 rounded-full">
              <Text className="text-green-700 font-semibold text-xs capitalize">
                {item.groundType.replace("_", " ")}
              </Text>
            </View>
            <Text className="text-blue-600 font-bold text-base">
              ₹{item.pricePerHour}/hr
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Info */}
      <View className="bg-gray-50 px-4 py-3 flex-row justify-between items-center border-t border-gray-100">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-1 capitalize">
            {item.bookingFrequency}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons
            name={item.isActive ? "checkmark-circle" : "close-circle"}
            size={16}
            color={item.isActive ? "#16a34a" : "#dc2626"}
          />
          <Text
            className={`text-xs ml-1 font-medium ${
              item.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (groundsLoading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">My Grounds</Text>
        <Text className="text-gray-500 text-sm mt-1">
          Manage your registered grounds
        </Text>
      </View>

      <FlatList
        data={grounds}
        keyExtractor={(item) => item.id}
        renderItem={renderGroundItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-16 h-16 bg-gray-100 rounded-full justify-center items-center mb-4">
              <Ionicons name="map-outline" size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-900 font-bold text-lg">
              No grounds found
            </Text>
            <Text className="text-gray-500 text-center mt-2 px-10">
              You haven't registered any grounds yet.
            </Text>
          </View>
        }
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}
