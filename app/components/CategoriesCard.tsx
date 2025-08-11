import React, { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CategoryCardProps {
  icon: ReactNode;
  title: string;
  eventCount: number;
  color: string; // should be any valid CSS color or hex code
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  eventCount,
  color,
}) => {
  return (
    <TouchableOpacity className="bg-white p-4 rounded-2xl border border-slate-200 items-center flex-1 shadow-sm">
      <View
        className="w-16 h-16 rounded-full items-center justify-center"
        style={{ backgroundColor: color }}
      >
        {icon}
      </View>
      <Text className="font-bold text-slate-800 mt-3 text-center">{title}</Text>
      <Text className="text-slate-500 text-xs mt-1">{eventCount} Events</Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;
