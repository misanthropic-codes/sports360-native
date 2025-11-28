import { useAuth } from "@/context/AuthContext";
import { Clipboard, Envelope, Gear, Trophy, UserPlus, Users } from "phosphor-react-native";
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
import BottomNavBar from "../../../components/BottomNavBar";
import JoinRequests from "./JoinRequest";
import Matches from "./Matches";
import TeamMembers from "./TeamMembers";
import Tournaments from "./Tournament";
import TournamentInvitations from "./TournamentInvitations";

type Tab = "members" | "requests" | "invitations" | "tournaments" | "matches";

const tabs = [
  { 
    id: "members", 
    label: "Team Members",
    icon: Users,
  },
  { 
    id: "requests", 
    label: "Join Requests",
    icon: UserPlus,
  },
  { 
    id: "invitations", 
    label: "Invitations",
    icon: Envelope,
  },
  { 
    id: "tournaments", 
    label: "Tournaments",
    icon: Trophy,
  },
  { 
    id: "matches", 
    label: "Matches",
    icon: Clipboard,
  },
];

const ManageTeam: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const { user } = useAuth();
  
  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains[0]
    : user?.domains || "cricket";

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
            <Gear size={24} weight="bold" color="#ffffff" />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3"
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as Tab)}
                className={`
                  flex-row items-center px-6 py-3.5 mr-3 rounded-full
                  ${isActive ? "bg-indigo-600" : "bg-gray-200"}
                `}
              >
                <Icon 
                  size={18} 
                  weight={isActive ? "fill" : "regular"}
                  color={isActive ? "#ffffff" : "#4B5563"} 
                />
                <Text
                  className={`
                    ml-2 font-semibold text-sm
                    ${isActive ? "text-white" : "text-gray-800"}
                  `}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Indicator */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-1 h-6 bg-indigo-500 rounded-full mr-3" />
          <Text className="text-lg font-semibold text-gray-800">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </Text>
          <View className="flex-1" />
          <View className="bg-indigo-100 px-3 py-1.5 rounded-full">
            <Text className="text-indigo-700 text-xs font-medium">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content - Made Scrollable */}
      <ScrollView 
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-6">
          <View className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            {activeTab === "members" && <TeamMembers />}
            {activeTab === "requests" && <JoinRequests />}
            {activeTab === "invitations" && <TournamentInvitations />}
            {activeTab === "tournaments" && <Tournaments />}
            {activeTab === "matches" && <Matches />}
          </View>
        </View>
        
        {/* Bottom spacing for nav bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom accent */}
      <View className="h-1 bg-gradient-to-r from-indigo-400 to-indigo-600" />
      
      {/* Bottom Navigation Bar */}
      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default ManageTeam;
