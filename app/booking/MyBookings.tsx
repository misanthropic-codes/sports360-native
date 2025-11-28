import type { Booking } from "@/api/bookingApi";
import { cancelBooking, getMyBookings } from "@/api/bookingApi";
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, MapPin, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyBookings() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains) ? user.domains[0] : user?.domains || "cricket";

  const fetchBookings = async () => {
    if (!token) return;

    try {
      const data = await getMyBookings(filter, token);
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBooking(bookingId, token || "");
              setBookings(bookings.filter((b) => b.id !== bookingId));
              Alert.alert("Success", "Booking cancelled successfully");
            } catch (error: any) {
              console.error("Failed to cancel booking:", error);
              Alert.alert("Error", error.response?.data?.message || "Failed to cancel booking");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1">My Bookings</Text>
        </View>

        {/* Quick Action - My Reviews */}
        <TouchableOpacity
          onPress={() => router.push("/reviews/MyReviews" as any)}
          className="bg-white/20 backdrop-blur rounded-xl py-3 px-4 flex-row items-center justify-center mb-3"
        >
          <Text className="text-white font-semibold">📝 Manage My Reviews</Text>
        </TouchableOpacity>

        {/* Filter Pills */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setFilter(undefined)}
            className={`px-4 py-2 rounded-full ${
              filter === undefined ? "bg-white" : "bg-white/20"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                filter === undefined ? "text-blue-600" : "text-white"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("pending")}
            className={`px-4 py-2 rounded-full ${
              filter === "pending" ? "bg-white" : "bg-white/20"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                filter === "pending" ? "text-blue-600" : "text-white"
              }`}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("approved")}
            className={`px-4 py-2 rounded-full ${
              filter === "approved" ? "bg-white" : "bg-white/20"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                filter === "approved" ? "text-blue-600" : "text-white"
              }`}
            >
              Approved
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      >
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <View
              key={booking.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
            >
              {/* Ground Name & Status */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {booking.ground?.name || booking.ground?.groundOwnerName || "Ground Booking"}
                  </Text>
                  {booking.ground?.location && (
                    <View className="flex-row items-center">
                      <MapPin size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {booking.ground.location}
                      </Text>
                    </View>
                  )}
                </View>

                <View className={`px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                  <Text className="text-xs font-bold uppercase">
                    {booking.status}
                  </Text>
                </View>
              </View>

              {/* Timing */}
              <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#3B82F6" />
                  <Text className="text-gray-700 text-sm ml-2 font-medium">Start</Text>
                </View>
                <Text className="text-gray-900 font-semibold ml-6">
                  {formatDateTime(booking.startTime)}
                </Text>

                <View className="flex-row items-center mt-3 mb-2">
                  <Clock size={16} color="#EF4444" />
                  <Text className="text-gray-700 text-sm ml-2 font-medium">End</Text>
                </View>
                <Text className="text-gray-900 font-semibold ml-6">
                  {formatDateTime(booking.endTime)}
                </Text>
              </View>

              {/* Purpose & Message */}
              <View className="mb-3">
                <Text className="text-gray-500 text-xs mb-1">Purpose</Text>
                <View className="bg-blue-50 px-3 py-1 rounded-full self-start">
                  <Text className="text-blue-700 font-medium text-sm capitalize">
                    {booking.purpose}
                  </Text>
                </View>
              </View>

              {booking.message && (
                <View className="mb-3">
                  <Text className="text-gray-500 text-xs mb-1">Message</Text>
                  <Text className="text-gray-700 text-sm">{booking.message}</Text>
                </View>
              )}

              {/* Cancel Button */}
              {booking.status === "pending" && (
                <TouchableOpacity
                  onPress={() => handleCancel(booking.id)}
                  className="bg-red-50 border border-red-200 rounded-xl py-3 flex-row items-center justify-center mt-2"
                >
                  <X size={18} color="#EF4444" />
                  <Text className="text-red-600 font-semibold text-sm ml-2">
                    Cancel Booking
                  </Text>
                </TouchableOpacity>
              )}

              {/* Write Review Button */}
              {booking.status === "approved" && (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/reviews/CreateReview" as any,
                      params: {
                        bookingId: booking.id,
                        groundId: booking.groundId,
                      },
                    })
                  }
                  className="bg-blue-50 border border-blue-200 rounded-xl py-3 flex-row items-center justify-center mt-2"
                >
                  <Text className="text-blue-600 font-semibold text-sm ml-2">
                    ✍️ Write a Review
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Calendar size={48} color="#CBD5E1" />
            <Text className="text-gray-400 mt-4 text-center">
              {filter ? `No ${filter} bookings found` : "No bookings yet"}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/booking/BrowseGrounds" as any)}
              className="mt-4 bg-blue-600 px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Browse Grounds</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
}
