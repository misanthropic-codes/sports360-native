// components/ReusableTextInput.tsx
import React from "react";
import { Text, TextInput, View } from "react-native";

interface ReusableTextInputProps {
  label: string;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  rightIcon?: React.ReactNode;
}

const ReusableTextInput: React.FC<ReusableTextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  rightIcon,
}) => (
  <View>
    <Text className="text-gray-600 text-sm font-medium mb-1">{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        className={`border border-gray-300 rounded-lg p-3 ${
          multiline ? "h-24 text-top" : ""
        }`}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={{ flex: 1 }}
      />
      {rightIcon}
    </View>
  </View>
);

export default ReusableTextInput;
