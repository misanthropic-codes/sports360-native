import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SlidersHorizontal, Search } from 'lucide-react-native'; // Switched to lucide-react-native

/**
 * Top Navigation Bar (Header)
 * Displays the screen title and action icons, using lucide-react-native for consistency.
 * @param {{ title: string }} props
 */
const TopNavBar = ({ title }: { title: string; }) => {
  return (
    <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-slate-50">
      <Text className="text-2xl font-bold text-slate-800">{title}</Text>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity>
          <SlidersHorizontal size={26} color="#334155" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Search size={26} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TopNavBar;