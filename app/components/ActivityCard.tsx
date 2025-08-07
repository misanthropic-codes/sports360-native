// components/ActivityCard.tsx

import { Calendar, MapPin } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActivityCardProps {
  icon?: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  subtitle?: string;
  tag?: string;
  date?: string;
  time?: string;
  location?: string;
  timestamp?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  icon: IconComponent,
  title,
  subtitle,
  tag,
  date,
  time,
  location,
  timestamp,
}) => {
  return (
    <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 shadow-sm">
      <View className="flex-row items-start">
        <View className="w-10 h-10 bg-blue-500 rounded-lg items-center justify-center mr-4">
          {IconComponent && <IconComponent color="white" size={24} />}
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-800"
            numberOfLines={2}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
          )}
          {tag && (
            <View className="bg-blue-100 self-start px-2 py-1 rounded-full mt-2">
              <Text className="text-xs font-semibold text-blue-800">{tag}</Text>
            </View>
          )}
          {timestamp && (
            <Text className="text-xs text-gray-400 mt-1">{timestamp}</Text>
          )}
        </View>
      </View>

      {(date || time || location) && (
        <View className="border-t border-gray-100 mt-3 pt-3 flex-row justify-between items-center">
          <View className="flex-row items-center">
            {date && <Calendar color="#6B7280" size={14} />}
            {(date || time) && (
              <Text className="text-xs text-gray-600 ml-1">
                {date} / {time}
              </Text>
            )}
          </View>
          <View className="flex-row items-center">
            {location && <MapPin color="#6B7280" size={14} />}
            {location && (
              <Text className="text-xs text-gray-600 ml-1">{location}</Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ActivityCard;
