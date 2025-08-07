import React, { FC } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

// --- Type Definitions ---

type RoleType = "player" | "organizer" | "owner";

interface ReusableButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  className?: string;
  isSelected?: boolean;
  
  role?: RoleType;
}



const ReusableButton: FC<ReusableButtonProps> = ({
  onPress,
  title,
  className = "",
  isSelected = false,
  role = "player", 
}) => {
  const roleStyles = {
    player: styles.player,
    organizer: styles.organizer,
    owner: styles.owner,
  };

  return (
    <Pressable
      onPress={onPress}
      className={`py-3 px-8 rounded-full flex-row justify-center items-center ${className}`}
      style={[
        roleStyles[role],
        isSelected && {
          borderWidth: 2,
          borderColor: "#2563eb",
        },
      ]}
    >
      <Text className="text-white text-lg font-semibold">{title}</Text>
    </Pressable>
  );
};

export default ReusableButton;


const styles = StyleSheet.create({
  player: {
    backgroundColor: "#0D3BF9",
  },
  organizer: {
    backgroundColor: "#510EB1",
  },
  owner: {
    backgroundColor: "#0D991E",
  },
});
