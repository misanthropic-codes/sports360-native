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
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 8,
      }}
    >
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={{
            backgroundColor: activeTab === tab ? "#4F46E5" : "#E5E7EB",
            paddingVertical: 8,
            paddingHorizontal: 20,
            borderRadius: 999,
            marginLeft: index === 0 ? 0 : 12, // spacing between tabs
          }}
        >
          <Text
            style={{
              color: activeTab === tab ? "#fff" : "#374151",
              fontWeight: "500",
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FilterTabs;
