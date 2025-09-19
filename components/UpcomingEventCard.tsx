import { Calendar, MapPin, Users } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface UpcomingEventCardProps {
  title: string;
  subtitle: string;
  status: string;
  price: string | number;
  date: string;
  location: string;
  participants: number;
}

const UpcomingEventCard: React.FC<UpcomingEventCardProps> = ({
  title,
  subtitle,
  status,
  price,
  date,
  location,
  participants,
}) => {
  return (
    <View className="bg-white p-4 rounded-2xl border border-slate-200 mx-4 mb-3 shadow-sm">
      {/* Top Section: Title, Status, Price */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text
            className="text-base font-bold text-slate-800"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          <Text
            className="text-sm text-slate-500"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        </View>
        <View className="items-end">
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-bold">{status}</Text>
          </View>
          <Text className="text-lg font-bold text-slate-800 mt-1">{price}</Text>
        </View>
      </View>

      {/* Bottom Section: Details + Button */}
      <View className="flex-row justify-between items-center mt-3">
        {/* Details */}
        <View className="flex-1 flex-row flex-wrap items-center gap-x-3 gap-y-1 pr-2">
          <View className="flex-row items-center">
            <Calendar size={14} color="#94A3B8" />
            <Text
              className="text-xs text-slate-500 ml-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {date}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={14} color="#EF4444" />
            <Text
              className="text-xs text-red-500 font-semibold ml-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {location}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Users size={14} color="#94A3B8" />
            <Text className="text-xs text-slate-500 ml-1">
              {participants} joined
            </Text>
          </View>
        </View>

        {/* Join Button (safe padding to avoid overflow) */}
        <TouchableOpacity className="bg-indigo-600 px-4 py-2 rounded-lg min-w-[80px] items-center">
          <Text className="text-white font-bold text-sm">Join Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpcomingEventCard;
