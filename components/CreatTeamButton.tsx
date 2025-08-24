import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface CreateTournamentButtonProps {
  onPress: () => void;
  title: string;
  color?: "indigo" | "purple"; // two color options
}

const CreateTournamentButton: React.FC<CreateTournamentButtonProps> = ({
  onPress,
  title,
  color = "indigo", // default is indigo
}) => {
  const bgColor = color === "indigo" ? "bg-indigo-600" : "bg-[#510EB0]";

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${bgColor} mx-4 my-4 rounded-xl p-4 items-center justify-center shadow-lg`}
    >
      <Text className="text-white font-bold text-lg">{title}</Text>
    </TouchableOpacity>
  );
};

export default CreateTournamentButton;
