import { Search } from "lucide-react-native";
import React from "react";
import { TextInput, View } from "react-native";

const SearchBar = () => {
  return (
    <View className="bg-slate-100 rounded-lg flex-row items-center px-4 mx-4 my-2 border border-slate-200">
      <Search size={20} color="#94A3B8" />
      <TextInput
        placeholder="Search Ground By Location..."
        placeholderTextColor="#94A3B8"
        className="flex-1 h-12 ml-2 text-slate-700"
      />
    </View>
  );
};

export default SearchBar;
