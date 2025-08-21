import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionTitleProps {
  title: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, showViewAll, onViewAllPress }) => {
  return (
    <View className="flex-row justify-between items-center px-4 mt-6 mb-2">
      <Text className="text-xl font-bold text-slate-800">{title}</Text>
      {showViewAll && (
        <TouchableOpacity onPress={onViewAllPress}>
          <Text className="text-sm font-semibold text-blue-500">View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionTitle;