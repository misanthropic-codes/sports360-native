import React from "react";
import { Text, View } from "react-native";

export default function OrganizerMarathonForm() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-purple-600 mb-4">
        Organizer - Marathon Form
      </Text>
      <Text className="text-base text-gray-600 text-center">
        This is the form for organizers who selected Marathon. Add your specific
        form fields here.
      </Text>
    </View>
  );
}
