import type { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import BottomNavBar from "../components/BottomNavBar";
import VenueCard from "../components/Card";
import FilterPills from "../components/FilterPills";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

const tracks = [
  {
    id: 1,
    imageUrl: "https://placehold.co/600x400/D2B48C/ffffff?text=Track+1",
    availabilityText: "Available",
    initialIsFavorited: true,
    rating: 4.8,
    stadiumName: "Govind Running Track",
    location: "Sector 6, Noida",
    price: "Rs 1200/-",
    features: ["Parking", "First Aid"],
  },
  {
    id: 2,
    imageUrl: "https://placehold.co/600x400/BC8F8F/ffffff?text=Track+2",
    availabilityText: "Available",
    initialIsFavorited: true,
    rating: 4.8,
    stadiumName: "Govind Running Track",
    location: "Sector 6, Noida",
    price: "Rs 1200/-",
    features: ["Parking", "First Aid"],
  },
  {
    id: 3,
    imageUrl: "https://placehold.co/600x400/CD853F/ffffff?text=Track+3",
    availabilityText: "Available",
    initialIsFavorited: true,
    rating: 4.8,
    stadiumName: "Govind Running Track",
    location: "Sector 6, Noida",
    price: "Rs 1200/-",
    features: ["Parking", "First Aid"],
  },
];

type TrackBookingScreenProps = {
  navigation: StackNavigationProp<any>;
};

const TrackBookingScreen = ({ navigation }: TrackBookingScreenProps) => {
  const [activeScreen, setActiveScreen] = React.useState("Home");

  // Replace with your actual auth state
  const role = "player"; // or groundowner, organizer
  const type = "marathon";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        type="title"
        title="Track Booking"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <SearchBar />
      <FilterPills />
      <ScrollView>
        {tracks.map((track) => (
          <VenueCard
            key={track.id}
            {...track}
            onBookNowPress={() => console.log(`Booking ${track.stadiumName}`)}
          />
        ))}
        <View className="h-24" />
      </ScrollView>

      <BottomNavBar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        role={role}
        type={type}
      />
    </SafeAreaView>
  );
};

export default TrackBookingScreen;
