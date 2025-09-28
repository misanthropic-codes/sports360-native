import React, { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import JoinRequests from "./JoinRequest";
import Matches from "./Matches";
import TeamMembers from "./TeamMembers";
import Tournaments from "./Tournament";

type Tab = "members" | "requests" | "tournaments" | "matches";

const tabs = [
  { id: "members", label: "Team Members" },
  { id: "requests", label: "Join Requests" },
  { id: "tournaments", label: "Tournaments" },
  { id: "matches", label: "Matches" },
];

const ManageTeam: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("members");

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header */}
      <View className="bg-indigo-700 px-6 py-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white">
              Team Management
            </Text>
            <Text className="text-white text-base mt-1">
              Organize and oversee your team
            </Text>
          </View>
          <View className="bg-white/20 rounded-full p-3">
            <Text className="text-2xl">⚙️</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-2"
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as Tab)}
              className={`
                px-6 py-4 mr-3 rounded-full transition-all duration-200
                ${activeTab === tab.id ? "bg-indigo-600" : "bg-gray-200"}
              `}
            >
              <Text
                className={`
                  font-semibold text-sm
                  ${activeTab === tab.id ? "text-white" : "text-gray-800"}
                `}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Indicator */}
      <View className="bg-white px-6 py-3 border-b border-gray-50">
        <View className="flex-row items-center">
          <View className="w-1 h-6 bg-indigo-500 rounded-full mr-3" />
          <Text className="text-lg font-semibold text-gray-800">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </Text>
          <View className="flex-1" />
          <View className="bg-indigo-100 px-3 py-1 rounded-full">
            <Text className="text-indigo-700 text-xs font-medium">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 px-6 py-4">
          <View className="flex-1 bg-white rounded-2xl p-6 border border-gray-100">
            {activeTab === "members" && <TeamMembers />}
            {activeTab === "requests" && <JoinRequests />}
            {activeTab === "tournaments" && <Tournaments />}
            {activeTab === "matches" && <Matches />}
          </View>
        </View>
      </View>

      {/* Bottom accent */}
      <View className="h-1 bg-gradient-to-r from-indigo-400 to-indigo-600" />
    </SafeAreaView>
  );
};

export default ManageTeam;
