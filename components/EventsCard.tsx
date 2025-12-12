import { MapPin } from "phosphor-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FeaturedEventCardProps {
  date: string;
  title: string;
  description: string;
  location: string;
  type: string;
  onJoinPress?: () => void;
  buttonText?: string;
}

const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({
  date,
  title,
  description,
  location,
  type,
  onJoinPress,
  buttonText = "Join Now",
}) => {
  return (
    <View className="bg-indigo-700 rounded-2xl p-5 shadow-lg" style={{ width: 320 }}>
      <Text className="text-indigo-200 text-xs font-semibold">
        {date.toUpperCase()}
      </Text>
      <Text className="text-white text-2xl font-bold mt-1">{title}</Text>
      <Text className="text-indigo-200 mt-1">{description}</Text>
      <View className="flex-row justify-between items-end mt-4">
        <View>
          <View className="flex-row items-center mt-2">
            <MapPin size={14} color="#C7D2FE" />
            <Text className="text-indigo-200 text-xs ml-1">{location}</Text>
          </View>
          <View className="bg-indigo-500/50 self-start px-3 py-1 rounded-full mt-3">
            <Text className="text-white text-xs font-bold">{type}</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="bg-white px-8 py-3 rounded-full"
          onPress={onJoinPress}
        >
          <Text className="text-indigo-700 font-bold">{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FeaturedEventCard;
