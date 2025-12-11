import { useAuth } from "@/context/AuthContext";
import { Clipboard, Envelope, Trophy, UserPlus, Users } from "phosphor-react-native";
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
    label: "Players",
    icon: Users,
    gradient: ["#3B82F6", "#2563EB"], // blue gradient
  },
  { 
    id: "requests", 
    label: "Requests",
    icon: UserPlus,
    gradient: ["#8B5CF6", "#7C3AED"], // purple gradient
  },
  { 
    id: "invitations", 
    label: "Invites",
    icon: Envelope,
    gradient: ["#EC4899", "#DB2777"], // pink gradient
  },
  { 
    id: "tournaments", 
    label: "Tournaments",
    icon: Trophy,
    gradient: ["#F59E0B", "#D97706"], // amber gradient
  },
  { 
    id: "matches", 
    label: "Matches",
    icon: Clipboard,
    gradient: ["#10B981", "#059669"], // emerald gradient
  },
];

const ManageTeam: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const { user } = useAuth();
  
  const role = user?.role?.toLowerCase() || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains[0]
    : user?.domains || "cricket";

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Dream11-Style Header */}
      <View 
        className="bg-white pb-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Title */}
        <View className="px-5 pt-3 pb-3">
          <Text className="text-2xl font-extrabold text-slate-900">
            Team Manager
          </Text>
          <Text className="text-sm text-slate-500 mt-0.5">
            Manage everything in one place
          </Text>
        </View>

        {/* Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-3"
          contentContainerStyle={{ paddingRight: 12 }}
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as Tab)}
                className={`mr-2 px-5 py-3 rounded-full items-center justify-center ${
                  isActive ? "" : "bg-slate-100"
                }`}
                activeOpacity={0.7}
                style={
                  isActive
                    ? {
                        backgroundColor: tab.gradient[0],
                        shadowColor: tab.gradient[0],
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 4,
                      }
                    : {}
                }
              >
                <View className="flex-row items-center">
                  <Icon
                    size={18}
                    weight={isActive ? "fill" : "regular"}
                    color={isActive ? "#FFFFFF" : "#64748B"}
                  />
                  <Text
                    className={`ml-2 font-bold text-sm ${
                      isActive ? "text-white" : "text-slate-600"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Area */}
      <View className="flex-1">
        {activeTab === "members" && <TeamMembers />}
        {activeTab === "requests" && <JoinRequests />}
        {activeTab === "invitations" && <TournamentInvitations />}
        {activeTab === "tournaments" && <Tournaments />}
        {activeTab === "matches" && <Matches />}
      </View>
      
      {/* Bottom Navigation */}
      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default ManageTeam;
