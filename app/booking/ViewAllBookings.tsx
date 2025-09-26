import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // your existing context

// ---------------------- API Call ----------------------
const BASE_URL = "http://172.20.10.4:8080";

const getMyBookings = async (token: string) => {
  const res = await axios.get(`${BASE_URL}/booking/my-bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data?.data || [];
};

// ---------------------- Screen ----------------------
type Booking = {
  id: string;
  groundId: string;
  groundName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  message: string;
  status: string;
};

const ViewBookingsScreen: React.FC = () => {
  const { token } = useAuth(); // using your existing AuthContext
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      try {
        const data = await getMyBookings(token);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token]);

  if (loading) {
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
