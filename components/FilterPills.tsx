import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const FilterPills = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Available Now", "Top rated"];

  return (
    <View className="px-4 my-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row bg-blue-100/50 rounded-full p-1 border border-blue-200">
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full ${isActive ? "bg-blue-500 shadow" : ""}`}
              >
                <Text
                  className={`font-semibold ${isActive ? "text-white" : "text-blue-500"}`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default FilterPills;
