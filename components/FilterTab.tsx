import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FilterTabsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  setActiveTab,
}) => {
  return (
    <View className="flex-row justify-around p-2 bg-slate-50">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          className={`px-6 py-2 rounded-full ${
            activeTab === tab ? "bg-indigo-600" : "bg-indigo-200"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === tab ? "text-white" : "text-indigo-600"
            }`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FilterTabs;
