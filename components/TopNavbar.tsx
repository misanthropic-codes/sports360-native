import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TopNavBarProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  title,
  showBackButton = false,
  onBackPress,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-white">
      {/* Left section */}
      <View className="flex-row items-center">
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} className="p-2 mr-2">
            <ArrowLeft size={28} color="#334155" />
          </TouchableOpacity>
        )}
      </View>

      {/* Center section */}
      <View className="flex-1 items-center">
        <Text className="text-2xl font-bold text-slate-800">{title}</Text>
      </View>

      {/* Right section */}
      <View className="flex-row items-center justify-end gap-4">
        <TouchableOpacity className="p-2">
          <SlidersHorizontal size={26} color="#334155" />
        </TouchableOpacity>
        <TouchableOpacity className="p-2">
          <Search size={26} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TopNavBar;
