// src/components/Toggle.tsx
import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

interface ToggleProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  containerClassName?: string;
}

export default function Toggle({
  label,
  value,
  onToggle,
  containerClassName = "",
}: ToggleProps) {
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = value ? "#6A4CFF" : "#E5E5E5";

  return (
    <View className={`mb-4 ${containerClassName}`}>
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-700 font-medium">{label}</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onToggle(!value)}
          style={{
            width: 48,
            height: 28,
            borderRadius: 14,
            backgroundColor,
            justifyContent: "center",
            padding: 2,
          }}
        >
          <Animated.View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "white",
              transform: [{ translateX }],
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
