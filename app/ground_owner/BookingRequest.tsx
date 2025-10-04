import { reviewBookingRequest } from "@/api/booking";
import { useAuth } from "@/context/AuthContext";
import { useBookingStore } from "@/store/bookingStore";
import { useRouter } from "expo-router";
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

const BookingRequestsScreen: React.FC = () => {
  const selectedGround = useBookingStore((state) => state.selectedGround);
  const { token } = useAuth();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleReview = async (
    bookingId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      setLoadingId(bookingId);
      await reviewBookingRequest(bookingId, status, token);

      Alert.alert("Success", `Request ${status} successfully!`);

      // Update Zustand store instantly
      useBookingStore.setState((state) => {
        if (!state.selectedGround) return {};
        return {
          selectedGround: {
            ...state.selectedGround,
            bookings: state.selectedGround.bookings.map((b: any) =>
              b.id === bookingId ? { ...b, status } : b
            ),
            ground: state.selectedGround.ground,
          },
        };
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update request");
    } finally {
      setLoadingId(null);
    }
  };

  if (!selectedGround) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">No ground selected</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#15803d" barStyle="light-content" />

      {/* Header */}
      <View className="p-4 bg-green-600">
        <Text className="text-xl text-white font-bold">
          {selectedGround.ground.groundOwnerName}
        </Text>
        <Text className="text-white">
          {selectedGround.ground.primaryLocation}
        </Text>
      </View>

      {/* Booking List */}
      <ScrollView className="p-4">
        {selectedGround.bookings.map((booking: any) => (
          <View
            key={booking.id}
            className="bg-white border-l-4 border-green-600 p-4 rounded-xl shadow-lg mb-4"
          >
            <Text className="text-lg font-semibold text-gray-900">
              {booking.user.fullName}
            </Text>
            <Text className="text-gray-600">{booking.user.email}</Text>
            <Text className="mt-2 text-gray-700">
              <Text className="font-bold">Purpose:</Text> {booking.purpose}
            </Text>

            <Text
              className={`mt-1 text-sm font-bold ${
                booking.status === "approved"
                  ? "text-green-600"
                  : booking.status === "rejected"
                    ? "text-red-600"
                    : "text-orange-600"
              }`}
            >
              Status: {booking.status.toUpperCase()}
            </Text>

            {/* Actions */}
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/ground_owner/BookingDetails",
                    params: { bookingId: booking.id },
                  })
                }
                className="flex-1 mr-2 bg-blue-500 rounded-lg py-2 items-center"
              >
                <Text className="text-white font-bold">View</Text>
              </TouchableOpacity>

              {booking.status === "pending" && (
                <>
                  <TouchableOpacity
                    onPress={() => handleReview(booking.id, "approved")}
                    className="flex-1 mx-1 bg-green-600 rounded-lg py-2 items-center"
                  >
                    {loadingId === booking.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold">Approve</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReview(booking.id, "rejected")}
                    className="flex-1 ml-2 bg-red-600 rounded-lg py-2 items-center"
                  >
                    {loadingId === booking.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold">Reject</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingRequestsScreen;
