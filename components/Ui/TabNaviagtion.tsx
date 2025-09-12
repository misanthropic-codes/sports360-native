// components/TabNavigation.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-row">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className={`flex-1 py-4 px-4 ${
              activeTab === tab.id ? "border-b-2 border-purple-600" : ""
            }`}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === tab.id ? "text-purple-600" : "text-gray-600"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TabNavigation;
