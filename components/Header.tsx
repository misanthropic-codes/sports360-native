import { ArrowLeft, Bell, Search } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type HeaderProps = {
  type?: "title" | "welcome";
  name?: string;
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({
  type = "title",
  name,
  title,
  showBackButton,
  onBackPress,
  rightComponent,
}) => {
  if (type === "welcome") {
    return (
      <View className="flex-row items-center justify-between p-4 bg-white">
        <View className="flex-row items-center">
          <Image
            source={{
              uri: "https://placehold.co/40x40/E2E8F0/4A5568?text=R",
            }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-xl font-bold text-gray-800">
              Welcome Back {name}!
            </Text>
            <Text className="text-sm text-gray-500">
              Ready for your next match?
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="p-2">
            <Bell color="#4A5568" size={24} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 ml-2">
            <Search color="#4A5568" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Title type header
  return (
    <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
      <View className="w-1/4">
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} className="p-1 self-start">
            <ArrowLeft size={28} color="#334155" />
          </TouchableOpacity>
        )}
      </View>
      <View className="w-1/2 items-center">
        <Text className="text-xl font-bold text-slate-800" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View className="w-1/4 flex-row items-center justify-end">
        {rightComponent}
      </View>
    </View>
  );
};

export default Header;
