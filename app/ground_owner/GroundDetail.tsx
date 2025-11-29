import { useGroundStore } from "@/store/groundTStore";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GroundDetailsScreen() {
  const ground = useGroundStore((state) => state.selectedGround);

  if (!ground) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  const InfoCard = ({ label, value, icon }: { label: string; value: string; icon?: any }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <Text className="text-green-700 font-semibold text-sm mb-1">{label}</Text>
      <Text className="text-gray-700 text-base">{value}</Text>
    </View>
  );

  const Badge = ({ text, active = false }: { text: string; active?: boolean }) => (
    <View
      className={`px-4 py-2 rounded-full mr-2 ${active ? "bg-green-600" : "bg-gray-200"}`}
    >
      <Text
        className={`text-sm font-medium ${active ? "text-white" : "text-gray-600"}`}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="h-64"
          >
            {ground.imageUrls.split(",").map((url: string, index: number) => (
              <Image
                key={index}
                source={{ uri: url }}
                className="w-screen h-64"
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Back Button Overlay */}
          <TouchableOpacity className="absolute top-4 left-4 bg-white/90 rounded-full p-3 shadow-md">
            <Text className="text-green-700 font-bold">←</Text>
          </TouchableOpacity>
        </View>

        {/* Content Container */}
        <View className="px-4 pt-6 pb-8">
          {/* Header Section */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-2xl font-bold text-green-700 mb-2">
              {ground.groundOwnerName}
            </Text>

            {/* Rating */}
            <View className="flex-row items-center mb-3">
              <Text className="text-yellow-500 text-lg mr-1">★★★★</Text>
              <Text className="text-gray-600 text-sm">
                ★ (4.8/5) • 124 Reviews
              </Text>
            </View>

            {/* Price */}
            <View className="flex-row items-center justify-between bg-green-50 rounded-xl p-3">
              <Text className="text-gray-700 font-medium">Price per hour</Text>
              <Text className="text-2xl font-bold text-green-700">$30</Text>
            </View>
          </View>

          {/* Quick Info */}
          <View className="flex-row flex-wrap mb-4">
            <Badge text={ground.groundType} active={true} />
            <Badge text={ground.bookingFrequency} />
            <Badge
              text={
                ground.acceptOnlineBookings
                  ? "Online Booking"
                  : "In-Person Only"
              }
            />
          </View>

          {/* Description */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-green-700 font-bold text-lg mb-3">About</Text>
            <Text className="text-gray-700 text-base leading-6">
              {ground.groundDescription}
            </Text>
          </View>

          {/* Location */}
          <InfoCard label="Location" value={ground.primaryLocation} />

          {/* Facilities */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-green-700 font-bold text-lg mb-3">
              Facilities
            </Text>
            <View className="flex-row flex-wrap">
              {ground.facilityAvailable.split(",").map((facility: string, index: number) => (
                <View key={index} className="flex-row items-center mr-4 mb-2">
                  <View className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                  <Text className="text-gray-700">{facility.trim()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Features Grid */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-green-700 font-bold text-lg mb-3">
              Features
            </Text>

            <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
              <Text className="text-gray-600">Online Bookings</Text>
              <View
                className={`px-3 py-1 rounded-full ${ground.acceptOnlineBookings ? "bg-green-100" : "bg-gray-100"}`}
              >
                <Text
                  className={`text-sm font-medium ${ground.acceptOnlineBookings ? "text-green-700" : "text-gray-600"}`}
                >
                  {ground.acceptOnlineBookings ? "Available" : "Not Available"}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-3 pb-3 border-b border-gray-100">
              <Text className="text-gray-600">Tournament Bookings</Text>
              <View
                className={`px-3 py-1 rounded-full ${ground.allowTournamentsBookings ? "bg-green-100" : "bg-gray-100"}`}
              >
                <Text
                  className={`text-sm font-medium ${ground.allowTournamentsBookings ? "text-green-700" : "text-gray-600"}`}
                >
                  {ground.allowTournamentsBookings ? "Allowed" : "Not Allowed"}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Availability Notifications</Text>
              <View
                className={`px-3 py-1 rounded-full ${ground.receiveGroundAvailabilityNotifications ? "bg-green-100" : "bg-gray-100"}`}
              >
                <Text
                  className={`text-sm font-medium ${ground.receiveGroundAvailabilityNotifications ? "text-green-700" : "text-gray-600"}`}
                >
                  {ground.receiveGroundAvailabilityNotifications ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </View>

          {/* Owner Details */}
          <View className="bg-green-700 rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-white font-bold text-lg mb-3">
              Owner Details
            </Text>
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                <Text className="text-green-700 font-bold text-lg">
                  {ground.owner.fullName.charAt(0)}
                </Text>
              </View>
              <View>
                <Text className="text-white font-semibold text-base">
                  {ground.owner.fullName}
                </Text>
                <Text className="text-green-100 text-sm">
                  {ground.owner.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Book Now Button */}
          <TouchableOpacity className="bg-green-600 rounded-2xl py-4 shadow-lg active:bg-green-700">
            <Text className="text-white text-center font-bold text-lg">
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
