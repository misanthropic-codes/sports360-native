import { useBookingStore } from "@/store/bookingStore";
import React from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native";

const BookingRequestsScreen: React.FC = () => {
  const selectedGround = useBookingStore((state) => state.selectedGround);

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

      <View className="p-4 bg-green-600">
        <Text className="text-xl text-white font-bold">
          {selectedGround.ground.groundOwnerName}
        </Text>
        <Text className="text-white">
          {selectedGround.ground.primaryLocation}
        </Text>
      </View>

      <ScrollView className="p-4">
        {selectedGround.bookings.map((booking: any, index: number) => (
          <View
            key={index}
            className="bg-white border-l-4 border-green-600 p-4 rounded-lg shadow mb-4"
          >
            <Text className="text-lg font-semibold text-gray-800">
              {booking.user.fullName}
            </Text>

            <Text className="text-gray-600">
              <Text className="font-bold">Email: </Text>
              {booking.user.email}
            </Text>

            <Text className="text-gray-600">
              <Text className="font-bold">Purpose: </Text>
              {booking.purpose}
            </Text>

            <Text className="text-gray-600">
              <Text className="font-bold">Start Time: </Text>
              {new Date(booking.startTime).toLocaleString()}
            </Text>

            <Text className="text-gray-600">
              <Text className="font-bold">End Time: </Text>
              {new Date(booking.endTime).toLocaleString()}
            </Text>

            <Text className="text-gray-600">
              <Text className="font-bold">Message: </Text>
              {booking.message}
            </Text>

            <Text
              className={`text-sm font-bold ${booking.status === "approved" ? "text-green-600" : "text-orange-600"}`}
            >
              Status: {booking.status.toUpperCase()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingRequestsScreen;
