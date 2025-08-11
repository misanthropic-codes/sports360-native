import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface UpcomingEventCardProps {
  title: string;
  subtitle: string;
  status: string;
  price: string;
  date: string;
  location: string;
  participants?: number; // optional if not used
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
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-800">{title}</Text>
          <Text className="text-sm text-slate-500">{subtitle}</Text>
        </View>
        <View className="items-end">
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-bold">{status}</Text>
          </View>
          <Text className="text-lg font-bold text-indigo-600 mt-1">
            {price}
          </Text>
        </View>
      </View>

      <View className="border-t border-dashed border-slate-200 my-3" />

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xs text-slate-500">{date}</Text>
          <Text className="text-xs text-red-500 font-semibold mt-1">
            {location}
          </Text>
        </View>
        <TouchableOpacity className="bg-indigo-600 px-6 py-2 rounded-full">
          <Text className="text-white font-bold text-sm">Join Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpcomingEventCard;
