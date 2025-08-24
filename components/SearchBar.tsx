import { MapPin } from "lucide-react-native";
import React from "react";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search..." }) => {
  return (
    <View className="bg-white rounded-full flex-row items-center px-4 mx-4 my-4 shadow-sm border border-gray-200">
      <MapPin size={20} color="#94A3B8" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="flex-1 h-12 ml-2 text-slate-700"
      />
    </View>
  );
};

export default SearchBar;
