import { Calendar, MapPin } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ActivityCardProps {
  // Common props
  icon: React.ReactNode;
  onPress?: () => void;

  // Layout type selector
  layoutType: "simple" | "detailed";

  // Props for 'simple' layout
  description?: string;
  timestamp?: string;

  // Props for 'detailed' layout
  title?: string;
  subtitle?: string;
  tag?: string;
  date?: string;
  time?: string; // ✅ added time here
  location?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  layoutType,
  icon,
  onPress,
  description,
  title,
  subtitle,
  tag,
  date,
  time,
  location,
  timestamp,
}) => {
  // 'simple' layout for recent activity feeds
  if (layoutType === "simple") {
    return (
      <View className="flex-row items-center bg-white p-3 mx-4 my-1.5 rounded-xl border border-slate-100 shadow-sm">
        <View className="bg-blue-100 p-3 rounded-lg mr-4">{icon}</View>
        <View className="flex-1">
          {description && (
            <Text className="text-slate-700 font-semibold" numberOfLines={2}>
              {description}
            </Text>
          )}
          {timestamp && (
            <Text className="text-slate-400 text-xs mt-0.5">{timestamp}</Text>
          )}
        </View>
      </View>
    );
  }

  // 'detailed' layout for event lists
  if (layoutType === "detailed") {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-white p-4 rounded-xl mb-3 shadow-sm mx-4"
      >
        <View className="flex-row items-start">
          <View className="w-10 h-10 bg-blue-500 rounded-lg items-center justify-center mr-4">
            {icon}
          </View>
          <View className="flex-1">
            {title && (
              <Text
                className="text-base font-semibold text-gray-800"
                numberOfLines={2}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
            )}
            {tag && (
              <View className="bg-blue-100 self-start px-2 py-1 rounded-full mt-2">
                <Text className="text-xs font-semibold text-blue-800">
                  {tag}
                </Text>
              </View>
            )}
          </View>
        </View>

        {(date || time || location) && (
          <View className="border-t border-gray-100 mt-3 pt-3 flex-row justify-between items-center">
            <View className="flex-row items-center">
              {(date || time) && <Calendar color="#6B7280" size={14} />}
              {(date || time) && (
                <Text className="text-xs text-gray-600 ml-1">
                  {date} {time ? `• ${time}` : ""}
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
  }

  return null;
};

export default ActivityCard;
