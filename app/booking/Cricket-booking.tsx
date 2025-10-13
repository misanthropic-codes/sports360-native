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
import VenueCard from "../../components/Card"; // Updated VenueCard
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

        console.log("✅ Ground owner grounds fetched:", groundsArray);
        setGrounds(groundsArray);
      } catch (err) {
        console.error("❌ Error fetching ground owner data:", err);
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
        name="MyGrounds"
        title="My Grounds"
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      <SearchBar />
      <FilterPills />

      <ScrollView>
        {grounds.length > 0 ? (
          grounds.map((ground) => (
            <VenueCard
              key={ground.id}
              ground={ground} // Pass full ground object
              onBookNowPress={() => {
                setSelectedGround(ground);
                router.push(`booking/GroundDetails?groundId=${ground.id}`);
              }}
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500 text-base">
              No grounds found for this owner.
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
