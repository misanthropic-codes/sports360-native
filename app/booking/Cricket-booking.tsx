import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import BottomNavBar from "../../components/BottomNavBar";
import VenueCard from "../../components/Card";
import FilterPills from "../../components/FilterPills";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import { useAuth } from "../../context/AuthContext";
import { useGroundStore } from "../../store/groundStore";

interface Ground {
  id: string;
  groundOwnerName: string;
  ownerName: string;
  groundType: string;
  yearsOfOperation: string;
  primaryLocation: string;
  facilityAvailable: string;
  bookingFrequency: string;
  groundDescription: string;
  imageUrls: string;
  acceptOnlineBookings: boolean;
  allowTournamentsBookings: boolean;
  receiveGroundAvailabilityNotifications: boolean;
  owner?: {
    id: string;
    fullName: string;
    email: string;
  };
}

const BASE_URL = "http://172.20.10.4:8080/api/v1";

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
        // ✅ Correctly access nested array in response
        const groundsArray = res.data?.data?.data || [];
        setGrounds(groundsArray);
      } catch (err) {
        console.error("Error fetching grounds:", err);
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
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        name="GroundBooking"
        title="Ground Booking"
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      <SearchBar />
      <FilterPills />

      <ScrollView>
        {Array.isArray(grounds) && grounds.length > 0 ? (
          grounds.map((ground) => (
            <VenueCard
              key={ground.id}
              imageUrl={ground.imageUrls.split(",")[0]}
              availabilityText={
                ground.acceptOnlineBookings ? "Available" : "Unavailable"
              }
              initialIsFavorited={true}
              rating={4.8}
              stadiumName={ground.groundOwnerName}
              location={ground.primaryLocation}
              // 💰 Use rupees
              price={`₹ ${
                ground.bookingFrequency === "daily" ? "1200/-" : "N/A"
              }`}
              features={ground.facilityAvailable.split(",")}
              onBookNowPress={() => {
                setSelectedGround(ground); // Store ground in Zustand
                router.push(`/booking/GroundDetails?groundId=${ground.id}`);
              }}
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500 text-base">
              No grounds available at the moment.
            </Text>
          </View>
        )}
        <View className="h-24" />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default GroundBookingScreen;
