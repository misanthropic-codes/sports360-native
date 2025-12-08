import { Filter, Search } from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  placeholder?: string;
  onFilterPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search grounds, locations...",
  onFilterPress,
  value,
  onChangeText,
}) => {
  return (
    <View className="px-4 my-3">
      <View 
        className="bg-white rounded-2xl flex-row items-center px-4 py-1 border border-blue-100"
        style={{
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        }}
      >
        <Search size={20} color="#3B82F6" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          className="flex-1 h-12 ml-3 text-slate-800 font-medium"
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity 
          onPress={onFilterPress}
          className="bg-blue-50 p-2.5 rounded-xl"
          activeOpacity={0.7}
        >
          <Filter size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;
