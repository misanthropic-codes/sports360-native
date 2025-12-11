import { useRouter } from "expo-router";
import { Sparkles, TrendingUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavBar from "../../components/BottomNavBar";
import VenueCard from "../../components/Card";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import { useAuth } from "../../context/AuthContext";
import { useGroundStore } from "../../store/groundStore";

const GroundBookingScreen = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Use existing groundStore instead of local state
  const {
    grounds,
    groundsLoading,
    fetchGrounds,
    setSelectedGround,
  } = useGroundStore();

  const role = user?.role || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "team";

  // Fetch grounds with smart caching
  useEffect(() => {
    if (!token) return;
    
    // Smart fetch - only fetches if not cached
    fetchGrounds(token);
  }, [token]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    if (!token) return;
    
    setRefreshing(true);
    await fetchGrounds(token, true); // Force refresh
    setRefreshing(false);
  };

  if (groundsLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-gray-600 font-medium">Loading grounds...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header
        name="BookGrounds"
        title="Book Grounds"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Hero Section */}
        <View className="bg-blue-600 pt-6 pb-8 px-4">
          <View className="mb-4">
            <Text className="text-white text-3xl font-bold mb-2">
              Find Your Perfect
            </Text>
            <Text className="text-white text-3xl font-bold">
              Ground
            </Text>
          </View>

          {/* Search Bar */}
          <View className="-mb-6">
            <SearchBar placeholder="Search grounds, locations..." />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 pt-10 pb-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push("/booking/MyBookings" as any)}
              className="flex-1 bg-white rounded-2xl p-4 border border-blue-100"
              activeOpacity={0.7}
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="bg-blue-50 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Sparkles size={20} color="#3B82F6" />
              </View>
              <Text className="text-slate-900 font-bold text-base mb-1">
                My Bookings
              </Text>
              <Text className="text-slate-500 text-xs">
                View your reservations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/booking/BrowseGrounds" as any)}
              className="flex-1 bg-white rounded-2xl p-4 border border-emerald-100"
              activeOpacity={0.7}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="bg-emerald-50 w-12 h-12 rounded-full items-center justify-center mb-3">
                <TrendingUp size={20} color="#10B981" />
              </View>
              <Text className="text-slate-900 font-bold text-base mb-1">
                Browse All
              </Text>
              <Text className="text-slate-500 text-xs">
                Explore more grounds
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grounds Section */}
        <View className="px-4 mt-2 mb-2">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-slate-900 text-2xl font-bold">
                Featured Grounds
              </Text>
              <Text className="text-slate-500 text-sm mt-1">
                {grounds.length} grounds available
              </Text>
            </View>
          </View>
        </View>

        {/* Grounds List */}
        {grounds.length > 0 ? (
          <View className="pb-6">
            {grounds.map((ground) => (
              <VenueCard
                key={ground.id}
                ground={ground}
                onBookNowPress={() => {
                  setSelectedGround(ground);
                  router.push(`booking/GroundDetails?groundId=${ground.id}` as any);
                }}
              />
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="bg-slate-100 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">🏟️</Text>
            </View>
            <Text className="text-slate-900 text-xl font-bold mb-2 text-center">
              No Grounds Available
            </Text>
            <Text className="text-slate-500 text-center mb-6 leading-6">
              We couldn't find any grounds at the moment. Try browsing or check back later!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/booking/BrowseGrounds" as any)}
              className="bg-blue-600 px-8 py-4 rounded-xl"
              activeOpacity={0.8}
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Text className="text-white font-bold text-base">Browse All Grounds</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Bottom Spacing for Nav Bar */}
        <View className="h-24" />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default GroundBookingScreen;
