import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { GroundAnalytics, useGroundOwnerStore } from "@/store/groundOwnerStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroundOwnerAnalyticsScreen() {
  const { token } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Use ground owner store with caching
  const {
    analytics,
    analyticsLoading,
    analyticsError,
    fetchAnalytics,
  } = useGroundOwnerStore();

  // Fetch analytics with smart caching
  useEffect(() => {
    if (token) {
      fetchAnalytics(token); // Smart fetch - only if not cached
    }
  }, [token]);

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    if (!token) return;
    
    setRefreshing(true);
    await fetchAnalytics(token, true); // Force refresh
    setRefreshing(false);
  }, [token, fetchAnalytics]);

  // Show loading only when data is being fetched from backend (not from cache)
  if (analyticsLoading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#15803d" />
        <Text className="text-gray-500 mt-4 font-medium">
          Loading analytics...
        </Text>
      </View>
    );
  }

  if (analyticsError) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <View className="bg-red-50 p-4 rounded-full mb-4">
          <Ionicons name="alert-circle" size={32} color="#dc2626" />
        </View>
        <Text className="text-red-600 text-lg font-bold text-center mb-2">
          Something went wrong
        </Text>
        <Text className="text-gray-500 text-center mb-6">{analyticsError}</Text>
        <Text
          onPress={() => token && fetchAnalytics(token, true)}
          className="text-green-700 font-bold text-lg"
        >
          Try Again
        </Text>
      </View>
    );
  }

  if (!analytics) return null;

  const { summary, grounds } = analytics;

  const SummaryCard = ({ title, value, icon, color }: {
    title: string;
    value: number | string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }) => (
    <View className="w-[48%] bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100">
      <View className={`w-10 h-10 rounded-full justify-center items-center mb-3 ${color}`}>
        <Ionicons name={icon} size={20} color="#15803d" />
      </View>
      <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
        {title}
      </Text>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#15803d" />
        }
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Analytics</Text>
          <Text className="text-gray-500 mt-1">
            Overview of your grounds performance
          </Text>
        </View>

        {/* Summary Grid */}
        <View className="flex-row flex-wrap justify-between mb-2">
          <SummaryCard
            title="Total Grounds"
            value={summary.totalGrounds}
            icon="map"
            color="bg-green-50"
          />
          <SummaryCard
            title="Total Bookings"
            value={summary.totalBookings}
            icon="calendar"
            color="bg-blue-50"
          />
          <SummaryCard
            title="Approved"
            value={summary.approvedBookings}
            icon="checkmark-circle"
            color="bg-emerald-50"
          />
          <SummaryCard
            title="Pending"
            value={summary.pendingBookings}
            icon="time"
            color="bg-amber-50"
          />
        </View>

        {/* Grounds List */}
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Detailed Breakdown
        </Text>

        {grounds.map((g: GroundAnalytics) => (
          <View
            key={g.groundId}
            className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  {g.groundName}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1">
                    {g.location}
                  </Text>
                </View>
              </View>
              <View className="bg-green-50 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-bold">
                  ₹{g.pricePerHour}/hr
                </Text>
              </View>
            </View>

            <View className="h-[1px] bg-gray-100 my-3" />

            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                  Total Bookings
                </Text>
                <Text className="text-xl font-bold text-gray-900">
                  {g.totalBookings}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                  Utilization
                </Text>
                <Text className="text-xl font-bold text-green-700">
                  {g.utilizationRate}%
                </Text>
              </View>
            </View>

            {/* Utilization Bar */}
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${Math.min(g.utilizationRate, 100)}%` }}
              />
            </View>
          </View>
        ))}

        {grounds.length === 0 && (
          <View className="items-center py-10">
            <Text className="text-gray-400">No grounds data available</Text>
          </View>
        )}
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
}
