import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import BottomNavBar from "../../components/BottomNavBar";
import VenueCard from "../../components/Card";
import FilterPills from "../../components/FilterPills";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";

type GroundBookingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const [activeScreen, setActiveScreen] = useState("Home");

const venues = [
  {
    id: 1,
    imageUrl: "https://placehold.co/600x400/5A9A78/ffffff?text=Stadium+1",
    availabilityText: "Available",
    initialIsFavorited: true,
    rating: 4.8,
    stadiumName: "Govind Stadium",
    location: "Sector 6, Noida",
    price: "Rs 1200/-",
    features: ["Parking", "Floodlights"],
  },
  {
    id: 2,
    imageUrl: "https://placehold.co/600x400/6B8E23/ffffff?text=Stadium+2",
    availabilityText: "Available",
    initialIsFavorited: true,
    rating: 4.8,
    stadiumName: "Govind Stadium",
    location: "Sector 6, Noida",
    price: "Rs 1200/-",
    features: ["Parking", "Floodlights"],
  },
  {
    id: 3,
    imageUrl: "https://placehold.co/600x400/2E8B57/ffffff?text=Stadium+3",
    availabilityText: "Available",
    initialIsFavorited: true,
    rating: 4.8,
    stadiumName: "Govind Stadium",
    location: "Sector 6, Noida",
    price: "Rs 1200/-",
    features: ["Parking", "Floodlights"],
  },
];

const GroundBookingScreen = ({ navigation }: GroundBookingScreenProps) => {
  const [activeScreen, setActiveScreen] = React.useState("Home");

  // Example — you would replace with your auth state/context
  const role = "player"; // or "groundowner", "organizer"
  const type = "cricket"; // or "marathon"

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        name="GroundBooking"
        title="Ground Booking"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <SearchBar />
      <FilterPills />
      <ScrollView>
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            {...venue}
            onBookNowPress={() => console.log(`Booking ${venue.stadiumName}`)}
          />
        ))}
        <View className="h-24" />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default GroundBookingScreen;
