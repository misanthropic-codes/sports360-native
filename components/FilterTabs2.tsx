import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FilterTabsProps {
  tabs: string[];
  onTabChange: (tab: string) => void;
  color?: "indigo" | "purple"; // two color options
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  onTabChange,
  color = "indigo",
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handlePress = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const activeBgColor = color === "indigo" ? "bg-indigo-600" : "bg-[#510EB0]";
  const inactiveTextColor =
    color === "indigo" ? "text-indigo-600" : "text-[#510EB0]";
  const containerBgColor =
    color === "indigo" ? "bg-indigo-100" : "bg-[#EBDCF9]"; // softer bg for purple mode

  return (
    <View
      className={`flex-row items-center justify-between ${containerBgColor} rounded-full p-1 mx-4`}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => handlePress(tab)}
          className={`flex-1 py-2 px-4 rounded-full ${activeTab === tab ? activeBgColor : ""}`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === tab ? "text-white" : inactiveTextColor
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
