import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useGroundStore } from "@/store/groundTStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Ground {
  id: string;
  userId: string;
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
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
}

type FilterType = "all" | "indoor" | "outdoor" | "turf";

export default function AvailableGroundsScreen(): JSX.Element {
  const availableGrounds = useGroundStore((state) => state.availableGrounds);
  const timeSlot = useGroundStore((state) => state.timeSlot);
  const setSelectedGround = useGroundStore((state) => state.setSelectedGround);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const handleSelectGround = (ground: Ground): void => {
    setSelectedGround(ground);
    router.push("/ground_owner/GroundDetail");
  };

  const formatDateTime = (): { date: string; time: string } => {
    if (!timeSlot) return { date: "", time: "" };

    const start = new Date(timeSlot.startTime);
    const end = new Date(timeSlot.endTime);

    const dateStr = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const startTime = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endTime = end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { date: dateStr, time: `${startTime} - ${endTime}` };
  };

  const { date, time } = formatDateTime();

  const filteredGrounds = availableGrounds.filter((ground) => {
    const matchesSearch = ground.groundOwnerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      ground.groundType.toLowerCase() === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating: number): JSX.Element[] => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={14} color="#15803d" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#15803d" />
      );
    }
    return stars;
  };

  const calculateDistance = (): string => {
    // Mock distance calculation - integrate real location logic later
    return (Math.random() * 5 + 0.5).toFixed(1);
  };

  const calculatePrice = (): string => {
    // Mock price calculation - integrate real pricing logic later
    return Math.floor(Math.random() * 400 + 200).toString(); // ₹200–₹600/hr
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Available Grounds
        </Text>
        <Text className="text-xl font-bold text-gray-800">{date}</Text>
        <Text className="text-lg text-gray-600">{time}</Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 py-4 bg-white">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Find a ground..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-800 text-base"
          />
          <TouchableOpacity className="bg-blue-600 w-10 h-10 rounded-full justify-center items-center">
            <Ionicons name="location" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-5 pb-3 bg-white">
        <View className="flex-row">
          {[
            { key: "all", label: "All" },
            { key: "indoor", label: "Indoor" },
            { key: "outdoor", label: "Outdoor" },
            { key: "turf", label: "Turf" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key as FilterType)}
              className={`mr-3 px-5 py-2 rounded-full ${
                activeFilter === filter.key ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-semibold ${
                  activeFilter === filter.key ? "text-white" : "text-gray-600"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Grounds List */}
      <FlatList
        data={filteredGrounds}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const rating = Math.random() * 2 + 3; // Mock rating 3–5
          const distance = calculateDistance();
          const price = calculatePrice();

          return (
            <TouchableOpacity
              onPress={() => handleSelectGround(item)}
              className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
            >
              <View className="flex-row p-4">
                {/* Ground Image */}
                <Image
                  source={{
                    uri:
                      item.imageUrls.split(",")[0] ||
                      "https://via.placeholder.com/100",
                  }}
                  className="w-24 h-24 rounded-xl"
                />

                {/* Ground Info */}
                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-lg font-bold text-gray-900 flex-1">
                      {item.groundOwnerName}
                    </Text>
                    <Text className="text-blue-600 font-bold text-base">
                      ₹{price}/hr
                    </Text>
                  </View>

                  {/* Rating */}
                  <View className="flex-row items-center mb-1">
                    <Text className="text-sm font-bold text-gray-800 mr-1">
                      {rating.toFixed(1)}
                    </Text>
                    <View className="flex-row mr-2">{renderStars(rating)}</View>
                  </View>

                  {/* Distance */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-500">
                      {distance} km away
                    </Text>
                  </View>

                  {/* Availability Badge */}
                  <View className="absolute right-0 bottom-0">
                    <View className="bg-green-50 px-3 py-1 rounded-full">
                      <Text className="text-green-700 font-semibold text-xs">
                        Available
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="search-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">No grounds found</Text>
          </View>
        }
      />

      <BottomNavBar />
    </SafeAreaView>
  );
}
