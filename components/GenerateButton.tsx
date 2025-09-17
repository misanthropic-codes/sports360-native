// components/GenerateButton.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface GenerateButtonProps {
  onGenerate: () => void;
  loading?: boolean;
  disabled?: boolean;
  selectedCount?: number;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  onGenerate,
  disabled,
}) => {
  return (
    <View className="mb-6">
      <TouchableOpacity
        className="py-4 rounded-xl bg-purple-600"
        style={{ elevation: 0, shadowOpacity: 0 }}
        onPress={onGenerate}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-lg text-center">
          Generate Fixtures
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GenerateButton;
