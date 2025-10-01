import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { useBookingStore } from "@/store/bookingStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GroundListScreen: React.FC = () => {
  const { token } = useAuth();
  const setGrounds = useBookingStore((state) => state.setGrounds);
  const setSelectedGround = useBookingStore((state) => state.setSelectedGround);
  const [loading, setLoading] = useState(true);
  const [groundsData, setGroundsData] = useState<any[]>([]);
  const router = useRouter();

  const BASE_URL = "http://172.20.10.4:8080/api/v1";

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ground-owner/booking-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      const grouped = json.data.reduce((acc: any, request: any) => {
        const groundId = request.ground.id;
        if (!acc[groundId])
          acc[groundId] = { ground: request.ground, bookings: [] };
        acc[groundId].bookings.push(request);
        return acc;
      }, {});

      const groupedArray = Object.values(grouped);
      setGrounds(groupedArray);
      setGroundsData(groupedArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-2 text-gray-600 font-semibold">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="#15803d" barStyle="light-content" />
      <View className="p-4 bg-green-600">
        <Text className="text-xl text-white font-bold">
          Ground Booking Requests
        </Text>
      </View>

      <ScrollView className="p-4">
        {groundsData.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10 font-medium">
            No booking requests found
          </Text>
        ) : (
          groundsData.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white border-l-4 border-green-600 p-4 rounded-lg shadow mb-4"
              onPress={() => {
                setSelectedGround(item);
                router.push("/ground_owner/BookingRequest"); // navigate to booking request screen
              }}
            >
              <Image
                source={{ uri: item.ground.imageUrls.split(",")[0] }}
                className="w-full h-36 rounded mb-3"
                resizeMode="cover"
              />
              <Text className="text-lg font-bold text-gray-800">
                {item.ground.groundOwnerName}
              </Text>
              <Text className="text-gray-600">
                {item.ground.primaryLocation}
              </Text>
              <Text className="text-gray-500 mt-1">
                {item.bookings.length} booking request(s)
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
};

export default GroundListScreen;
