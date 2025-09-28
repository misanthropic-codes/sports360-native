import { ArrowLeft, Bell, User } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type HeaderProps = {
  type?: "title" | "welcome";
  name?: string;
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  avatarUrl?: string;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
};

const Header: React.FC<HeaderProps> = ({
  type = "title",
  name,
  title,
  showBackButton,
  onBackPress,
  rightComponent,
  avatarUrl,
  onProfilePress,
  onNotificationPress,
}) => {
  if (type === "welcome") {
    return (
      <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
        {/* Left Section */}
        <View className="flex-row items-center">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          )}
          <View>
            <Text className="text-base font-semibold text-gray-800">
              Welcome Back {name || "User"}!
            </Text>
            <Text className="text-sm text-gray-500">
              Ready for your next match?
            </Text>
          </View>
        </View>

        {/* Right Section */}
        <View className="flex-row items-center">
          <TouchableOpacity
            className="p-2"
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <Bell color="#4A5568" size={22} />
            {/* Example badge */}
            {/* <View className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full" /> */}
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2 ml-2"
            onPress={onProfilePress}
            activeOpacity={0.7}
          >
            <User color="#4A5568" size={22} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Title type header
  return (
    <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
      {/* Left Section */}
      <View className="w-1/4">
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress} className="p-1 self-start">
            <ArrowLeft size={28} color="#334155" />
          </TouchableOpacity>
        )}
      </View>

      {/* Title Center */}
      <View className="w-1/2 items-center">
        <Text
          className="text-lg font-semibold text-slate-800"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* Right Section */}
      <View className="w-1/4 flex-row items-center justify-end">
        {rightComponent}
      </View>
    </View>
  );
};

export default Header;
