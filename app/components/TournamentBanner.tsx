import { MapPin } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TournamentBannerProps {
  date: string; // in "MMM DD" or any string format you choose
  title: string;
  description: string;
  location: string;
  type: string;
  onJoinPress: () => void;
}

const TournamentBanner: React.FC<TournamentBannerProps> = ({
  date,
  title,
  description,
  location,
  type,
  onJoinPress,
}) => {
  return (
    <View className="bg-blue-900 m-4 rounded-2xl p-5 overflow-hidden shadow-lg">
      {/* Decorative circles for background effect */}
      <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
      <View className="absolute -bottom-12 -left-5 w-24 h-24 bg-white/5 rounded-full" />

      <Text className="text-blue-200 text-xs font-semibold">
        {date.toUpperCase()}
      </Text>
      <Text className="text-white text-2xl font-bold mt-1">{title}</Text>
      <Text className="text-blue-200 mt-1">{description}</Text>

      <View className="flex-row justify-between items-end mt-4">
        <View>
          <View className="bg-white/20 self-start px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">{type}</Text>
          </View>
          <View className="flex-row items-center mt-2">
            <MapPin size={14} color="#A5B4FC" />
            <Text className="text-blue-200 text-xs ml-1">{location}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onJoinPress}
          className="bg-white px-8 py-3 rounded-full shadow"
        >
          <Text className="text-blue-900 font-bold">Join Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TournamentBanner;
