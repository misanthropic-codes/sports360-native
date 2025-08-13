import { PersonStanding, Trophy } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

import ActivityCard from "../components/ActivityCard";
import BottomNavBar from "../components/BottomNavBar";
import CreateTeamButton from "../components/CreatTeamButton";
import Header from "../components/Header";
import SectionTitle from "../components/SectiontitleM";
import StatPillBar from "../components/StatPillBar";
import TeamCard from "../components/TeamCard";

type MyTeamScreenProps = {
  navigation: any;
};

const MyTeamScreen: React.FC<MyTeamScreenProps> = ({ navigation }) => {
  const [activeScreen, setActiveScreen] = useState("Teams");

  const role = "player"; // Could be "organizer" based on login
  const type = "team"; // For BottomNavBar navigation context

  const activeTeamStats = [
    { value: "15", label: "players" },
    { value: "8", label: "matches" },
    { value: "75%", label: "winning rate" },
  ];

  const recentActivities = [
    {
      icon: <PersonStanding size={24} color="#3B82F6" />,
      description: "Delhi Warriors won against Kolkata Knights",
      timestamp: "2 hours ago",
    },
    {
      icon: <Trophy size={24} color="#3B82F6" />,
      description: "New player joined Mumbai Tigers",
      timestamp: "1 day ago",
    },
    {
      icon: <Trophy size={24} color="#3B82F6" />,
      description: "Match scheduled for Delhi Warriors",
      timestamp: "1 day ago",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header
        type="title"
        title="My Team"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView>
        <CreateTeamButton onPress={() => console.log("Create Team")} />
        <StatPillBar />

        <SectionTitle title="My Team" />
        <TeamCard
          teamName="Delhi Warriors"
          status="Active"
          stats={activeTeamStats}
          onManage={() => console.log("Manage Delhi")}
        />
        <TeamCard
          teamName="Chennai Warriors"
          status="Pending"
          invitationFrom="Invitation from Rishabh | 2 days ago"
          onAccept={() => console.log("Accept Chennai")}
          onDecline={() => console.log("Decline Chennai")}
        />

        <SectionTitle
          title="Recent Activity"
          showViewAll
          onViewAllPress={() => console.log("View All Activity")}
        />
        {recentActivities.map((activity, index) => (
          <ActivityCard
            key={index}
            layoutType="simple"
            icon={activity.icon}
            description={activity.description}
            timestamp={activity.timestamp}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        role={role}
        type={type}
      />
    </SafeAreaView>
  );
};

export default MyTeamScreen;
