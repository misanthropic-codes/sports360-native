// components/TabNavigation.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface Tab {
  id: string;
  label: string;
  icon: string; // Icon name from Ionicons
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
            className={`flex-1 py-3 px-2 items-center justify-center ${
              activeTab === tab.id ? "border-b-2 border-purple-600" : ""
            }`}
            style={{ minHeight: 48 }} // Fixed height to prevent layout shifts
          >
            {activeTab === tab.id ? (
              <Text
                className="text-purple-600 font-medium text-sm text-center"
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {tab.label}
              </Text>
            ) : (
              <Icon name={tab.icon} size={22} color="#9333EA" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TabNavigation;
