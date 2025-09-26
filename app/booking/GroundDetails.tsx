import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Ground = {
  groundOwnerName: string;
  primaryLocation: string;
  groundDescription: string;
  facilityAvailable: string;
  imageUrls: string;
};

const GroundDetailsScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse ground object passed as string
  const ground: Ground | null = params.ground
    ? JSON.parse(params.ground as string)
    : null;

  if (!ground) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-red-500">Ground data not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Image
          source={{ uri: ground.imageUrls.split(",")[0] }}
          className="w-full h-60 rounded-xl"
        />

        <Text className="text-2xl font-bold mt-4">
          {ground.groundOwnerName}
        </Text>
        <Text className="text-gray-600">{ground.primaryLocation}</Text>

        <Text className="mt-2 text-base">{ground.groundDescription}</Text>

        <View className="mt-4">
          <Text className="font-semibold">Facilities:</Text>
          {ground.facilityAvailable.split(",").map((f, idx) => (
            <Text key={idx} className="text-gray-700">
              • {f}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Book Now Button */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-xl"
          onPress={() =>
            console.log(`Booking ground: ${ground.groundOwnerName}`)
          }
        >
          <Text className="text-white text-center text-lg font-bold">
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GroundDetailsScreen;
