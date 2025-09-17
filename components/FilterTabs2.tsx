import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FilterTabsProps {
  tabs: string[];
  onTabChange: (tab: string) => void;
  color?: "indigo" | "purple";
  logos?: Record<string, string>; // icons for inactive tabs
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  onTabChange,
  color = "indigo",
  logos = {},
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
    color === "indigo" ? "bg-indigo-100" : "bg-[#EBDCF9]";

  return (
    <View
      className={`flex-row items-center justify-around ${containerBgColor} rounded-full p-1 mx-4`}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => handlePress(tab)}
          className={`py-2 px-4 rounded-full ${
            activeTab === tab ? activeBgColor : ""
          }`}
        >
          {activeTab === tab ? (
            <Text className="text-white font-semibold text-center">{tab}</Text>
          ) : (
            <Text className={`text-center font-semibold ${inactiveTextColor}`}>
              {logos[tab] || tab.charAt(0)}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FilterTabs;
