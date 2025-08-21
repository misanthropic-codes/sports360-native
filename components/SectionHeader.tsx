
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View className="flex-row justify-between items-center mt-6 mb-4">
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
      <TouchableOpacity>
        <Text className="text-sm font-semibold text-blue-600">View All</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;
