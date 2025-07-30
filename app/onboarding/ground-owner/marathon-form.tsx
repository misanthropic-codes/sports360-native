import React from "react";
import { Text, View } from "react-native";

export default function GroundOwnerMarathonForm() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold text-green-600 mb-4">
        Ground Owner - Marathon Form
      </Text>
      <Text className="text-base text-gray-600 text-center">
        This is the form for ground owners who selected Marathon. Add your
        specific form fields here.
      </Text>
    </View>
  );
}
