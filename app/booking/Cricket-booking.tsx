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
import { Ground, useGroundStore } from "../../store/groundStore";

const BASE_URL = "http://172.20.10.4:8080/api/v1";

const GroundBookingScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const setSelectedGround = useGroundStore((state) => state.setSelectedGround);
  const setGroundReviews = useGroundStore((state) => state.setGroundReviews);

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

        // Fetch reviews for each ground
        await Promise.all(
          groundsArray.map(async (ground: Ground) => {
            try {
              const reviewRes = await axios.get(
                `${BASE_URL}/review/ground/${ground.id}`
              );

              console.log(
                `📄 Reviews for ground ${ground.id}:`,
                JSON.stringify(reviewRes.data, null, 2)
              );

              const reviewData = reviewRes.data || {};
              setGroundReviews(ground.id, {
                reviews: reviewData.reviews || [],
                averageRating: reviewData.averageRating || 0,
                totalReviews: reviewData.totalReviews || 0,
                page: reviewData.page || 0,
                limit: reviewData.limit || 0,
              });
            } catch (error) {
              console.warn(
                `⚠️ Error fetching reviews for ground ${ground.id}:`,
                error
              );
              setGroundReviews(ground.id, {
                reviews: [],
                averageRating: 0,
                totalReviews: 0,
                page: 0,
                limit: 0,
              });
            }
          })
        );
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
              groundId={ground.id} // ✅ Pass groundId for rating fetch
              imageUrl={ground.imageUrls.split(",")[0]}
              availabilityText={
                ground.acceptOnlineBookings ? "Available" : "Unavailable"
              }
              initialIsFavorited={true}
              stadiumName={ground.groundOwnerName}
              location={ground.primaryLocation}
              price={`₹ ${
                ground.bookingFrequency === "daily" ? "1200/-" : "N/A"
              }`}
              features={ground.facilityAvailable.split(",")}
              onBookNowPress={() => {
                setSelectedGround(ground);
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
