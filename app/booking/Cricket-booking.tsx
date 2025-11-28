import axios from "axios";
import { useRouter } from "expo-router";
import { ClipboardList, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavBar from "../../components/BottomNavBar";
import VenueCard from "../../components/Card";
import FilterPills from "../../components/FilterPills";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import { useAuth } from "../../context/AuthContext";
import { Ground, useGroundStore } from "../../store/groundStore";

const BASE_URL = "https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1";

const GroundBookingScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const setSelectedGround = useGroundStore((state) => state.setSelectedGround);

  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "team";

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/booking/grounds/all`);
        const groundsArray = res.data?.data || [];

        console.log("✅ Grounds fetched:", groundsArray);
        setGrounds(groundsArray);
      } catch (err) {
        console.error("❌ Error fetching grounds:", err);
        setGrounds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-gray-600">Loading grounds...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        name="BookGrounds"
        title="Book Grounds"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {/* Quick Actions Bar */}
      <View className="px-4 py-3 bg-blue-50 flex-row space-x-3">
        <TouchableOpacity
          onPress={() => router.push("/booking/BrowseGrounds" as any)}
          className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
        >
          <Search size={18} color="#ffffff" />
          <Text className="text-white font-semibold ml-2">Browse All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/booking/MyBookings" as any)}
          className="flex-1 bg-white border-2 border-blue-600 rounded-xl py-3 flex-row items-center justify-center"
        >
          <ClipboardList size={18} color="#3B82F6" />
          <Text className="text-blue-600 font-semibold ml-2">My Bookings</Text>
        </TouchableOpacity>
      </View>

      <SearchBar />
      <FilterPills />

      <ScrollView>
        {grounds.length > 0 ? (
          grounds.map((ground) => (
            <VenueCard
              key={ground.id}
              ground={ground}
              onBookNowPress={() => {
                setSelectedGround(ground);
                router.push(`booking/GroundDetails?groundId=${ground.id}` as any);
              }}
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500 text-base">
              No grounds available at the moment.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/booking/BrowseGrounds" as any)}
              className="mt-4 bg-blue-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Browse Grounds</Text>
            </TouchableOpacity>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default GroundBookingScreen;
