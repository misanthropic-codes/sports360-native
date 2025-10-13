import { useAuth } from "@/context/AuthContext"; // your auth context hook
import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { create } from "zustand";

// Zustand store for analytics
const useAnalyticsStore = create((set) => ({
  analytics: null,
  loading: false,
  error: null,
  fetchAnalytics: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(
        "http://172.20.10.4:8080/api/v1/ground-owner/analytics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      set({ analytics: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));

export default function GroundOwnerAnalyticsScreen() {
  const { token } = useAuth();
  const { analytics, loading, error, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    if (token) {
      fetchAnalytics(token);
    }
  }, [token]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="text-gray-700 mt-2">Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-600 text-lg">Error: {error}</Text>
      </View>
    );
  }

  if (!analytics) return null;

  const { summary, grounds } = analytics;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-4 text-gray-800">
          Ground Owner Analytics
        </Text>

        {/* Summary Cards */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-[48%] bg-gray-100 p-4 rounded-xl mb-3">
            <Text className="text-gray-500 text-sm">Total Grounds</Text>
            <Text className="text-xl font-bold text-gray-800">
              {summary.totalGrounds}
            </Text>
          </View>
          <View className="w-[48%] bg-gray-100 p-4 rounded-xl mb-3">
            <Text className="text-gray-500 text-sm">Total Bookings</Text>
            <Text className="text-xl font-bold text-gray-800">
              {summary.totalBookings}
            </Text>
          </View>
          <View className="w-[48%] bg-gray-100 p-4 rounded-xl mb-3">
            <Text className="text-gray-500 text-sm">Approved</Text>
            <Text className="text-xl font-bold text-gray-800">
              {summary.approvedBookings}
            </Text>
          </View>
          <View className="w-[48%] bg-gray-100 p-4 rounded-xl mb-3">
            <Text className="text-gray-500 text-sm">Pending</Text>
            <Text className="text-xl font-bold text-gray-800">
              {summary.pendingBookings}
            </Text>
          </View>
        </View>

        {/* Grounds List */}
        <Text className="text-xl font-semibold mb-2 text-gray-800">
          Your Grounds
        </Text>
        {grounds.map((g) => (
          <View
            key={g.groundId}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4"
          >
            <Text className="text-lg font-bold text-gray-900">
              {g.groundName}
            </Text>
            <Text className="text-gray-500 mb-2">{g.location}</Text>
            <View className="flex-row justify-between mt-2">
              <View>
                <Text className="text-gray-500 text-sm">Total Bookings</Text>
                <Text className="text-base font-semibold text-gray-800">
                  {g.totalBookings}
                </Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Price/Hour</Text>
                <Text className="text-base font-semibold text-gray-800">
                  ₹{g.pricePerHour}
                </Text>
              </View>
            </View>
            <View className="mt-2">
              <Text className="text-gray-500 text-sm">Utilization Rate</Text>
              <Text className="text-base font-semibold text-gray-800">
                {g.utilizationRate}%
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
