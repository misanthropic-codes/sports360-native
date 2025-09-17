// src/components/Input.tsx
import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerClassName?: string;
}

export default function Input({
  label,
  error,
  containerClassName = "",
  ...textInputProps
}: InputProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      <TextInput
        className={`border rounded-lg px-3 py-3 text-gray-900 ${
          error ? "border-red-500" : "border-gray-200"
        } bg-white`}
        placeholderTextColor="#A3A3A3"
        {...textInputProps}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
