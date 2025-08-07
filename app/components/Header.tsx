import { Bell, Search } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  name: string;
}

const Header: React.FC<HeaderProps> = ({ name }) => {
  return (
    <View className="flex-row items-center justify-between py-4">
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
};

export default Header;
