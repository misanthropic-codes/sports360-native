// components/CheckboxItem.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface CheckboxItemProps {
  label: string;
  isChecked: boolean;
  onPress: () => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  label,
  isChecked,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
  >
    <View
      className={`w-6 h-6 rounded-md justify-center items-center ${
        isChecked ? "bg-purple-600" : "bg-gray-200"
      }`}
    >
      {isChecked && <Icon name="checkmark" size={18} color="#FFF" />}
    </View>
    <Text className="text-gray-800 text-base ml-3">{label}</Text>
  </TouchableOpacity>
);

export default CheckboxItem;
