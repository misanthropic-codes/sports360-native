import React from "react";
import { View, Text } from "react-native";

export default function OrganizerCricketForm() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-purple-600 mb-4">Organizer - Cricket Form</Text>
      <Text className="text-base text-gray-600 text-center">
        This is the form for organizers who selected Cricket. Add your specific form fields here.
      </Text>
    </View>
  );
}
