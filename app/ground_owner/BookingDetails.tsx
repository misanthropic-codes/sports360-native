import { reviewBookingRequest } from "@/api/booking";
import { useAuth } from "@/context/AuthContext";
import { useBookingStore } from "@/store/bookingStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BookingDetails: React.FC = () => {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const selectedGround = useBookingStore((state) => state.selectedGround);

  const [loading, setLoading] = useState(false);

  if (!selectedGround) return null;

  const booking = selectedGround.bookings.find((b: any) => b.id === bookingId);

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Booking not found</Text>
      </SafeAreaView>
    );
  }

  const handleReview = async (status: "approved" | "rejected") => {
    Alert.alert(
      `${status.charAt(0).toUpperCase() + status.slice(1)} Booking`,
      `Are you sure you want to ${status} this booking?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setLoading(true);
              await reviewBookingRequest(booking.id, status, token);

              Alert.alert("Success", `Booking ${status} successfully!`);

              // Update Zustand state instantly
              useBookingStore.setState((state) => {
                if (!state.selectedGround) return {};
                return {
                  selectedGround: {
                    ...state.selectedGround,
                    bookings: state.selectedGround.bookings.map((b: any) =>
                      b.id === booking.id ? { ...b, status } : b
                    ),
                    ground: state.selectedGround.ground,
                  },
                };
              });

              router.back();
            } catch (err: any) {
              console.error("Error reviewing booking:", err);
              Alert.alert("Error", "Failed to update booking");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#15803d" barStyle="light-content" />

      <ScrollView className="p-4">
        <View className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
          {/* Booking Header */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {booking.user.fullName}
          </Text>
          <Text className="text-gray-700 mb-1">{booking.user.email}</Text>

          {/* Booking Details */}
          <Text className="mt-2 text-gray-800">
            <Text className="font-bold">Purpose:</Text> {booking.purpose}
          </Text>
          <Text className="mt-1 text-gray-800">
            <Text className="font-bold">Message:</Text> {booking.message}
          </Text>
          <Text className="mt-1 text-gray-800">
            <Text className="font-bold">Start:</Text>{" "}
            {new Date(booking.startTime).toLocaleString()}
          </Text>
          <Text className="mt-1 text-gray-800">
            <Text className="font-bold">End:</Text>{" "}
            {new Date(booking.endTime).toLocaleString()}
          </Text>

          {/* Status */}
          <Text
            className={`mt-4 text-lg font-bold ${
              booking.status === "approved"
                ? "text-green-600"
                : booking.status === "rejected"
                  ? "text-red-600"
                  : "text-orange-600"
            }`}
          >
            Status: {booking.status.toUpperCase()}
          </Text>

          {/* Action Buttons */}
          {booking.status === "pending" && (
            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                disabled={loading}
                onPress={() => handleReview("approved")}
                className="flex-1 mr-2 bg-green-600 rounded-lg py-3 items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-lg font-bold">Approve</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                disabled={loading}
                onPress={() => handleReview("rejected")}
                className="flex-1 ml-2 bg-red-600 rounded-lg py-3 items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-lg font-bold">Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingDetails;
