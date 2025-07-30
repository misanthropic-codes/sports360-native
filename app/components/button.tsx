import React, { FC } from "react";
import { GestureResponderEvent, Pressable, Text } from "react-native";

// --- Type Definitions ---

interface ReusableButtonProps {
  /**
   * The text to display inside the button.
   */
  title: string;
  /**
   * Function to execute on button press.
   */
  onPress: (event: GestureResponderEvent) => void;
  /**
   * Optional additional class names for custom styling.
   */
  className?: string;
}

// --- Component ---

/**
 * A reusable button component with consistent styling.
 */
const ReusableButton: FC<ReusableButtonProps> = ({
  onPress,
  title,
  className = "",
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={`py-3 px-8 bg-blue-600 rounded-full flex-row justify-center items-center active:bg-blue-700 ${className}`}
    >
      <Text className="text-white text-lg font-semibold">{title}</Text>
    </Pressable>
  );
};

export default ReusableButton;
