import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useBookingStore } from "../../store/bookingStore";

const ViewBookingsScreen: React.FC = () => {
  const { token } = useAuth();
  
  // Use bookingStore instead of local state
  const {
    bookings,
    bookingsLoading,
    fetchMyBookings,
  } = useBookingStore();

  useEffect(() => {
    if (!token) return;
    
    // Smart fetch - only fetches if not cached
    fetchMyBookings(token);
  }, [token]);

  if (bookingsLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (bookings.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">No bookings found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">
              {item.groundName || "Ground"}
            </Text>
            <Text>Purpose: {item.purpose}</Text>
            <Text>Message: {item.message}</Text>
            <Text>
              Time: {new Date(item.startTime).toLocaleString()} -{" "}
              {new Date(item.endTime).toLocaleString()}
            </Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default ViewBookingsScreen;
