// components/SelectionPill.tsx
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface SelectionPillProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const SelectionPill: React.FC<SelectionPillProps> = ({
  label,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`py-2 px-4 rounded-full border ${
      isSelected
        ? "bg-purple-100 border-purple-600"
        : "bg-gray-100 border-gray-300"
    }`}
  >
    <Text
      className={`font-medium ${
        isSelected ? "text-purple-700" : "text-gray-700"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default SelectionPill;
