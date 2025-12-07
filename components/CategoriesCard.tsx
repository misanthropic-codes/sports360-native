import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  eventCount: number;
  color: string;
  notificationCount?: number; // optional
  notificationColor?: string; // optional
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  eventCount,
  color,
  notificationCount = 0,
  notificationColor = "#000",
}) => {
  return (
    <TouchableOpacity className="bg-white p-4 pb-5 rounded-2xl border border-slate-200 items-center flex-1 shadow-sm min-w-[140px]">
      <View
        className="w-16 h-16 rounded-full items-center justify-center"
        style={{ backgroundColor: color }}
      >
        {icon}
      </View>
      <Text className="font-bold text-slate-800 mt-3 text-center">{title}</Text>
      <Text className="text-slate-500 text-xs mt-1">{eventCount} Events</Text>
      {notificationCount > 0 && (
        <View
          className="absolute bottom-3 right-3 w-5 h-5 rounded-full items-center justify-center border-2 border-white"
          style={{ backgroundColor: notificationColor }}
        >
          <Text className="text-white text-xs font-bold">
            {notificationCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CategoryCard;
