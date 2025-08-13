import { Cricket } from "phosphor-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

import BottomNavBar from "../components/BottomNavBar";
import CategoryCard from "../components/CategoriesCard";
import FeaturedEventCard from "../components/EventsCard";
import FilterTabs from "../components/FilterTab";
import SectionHeader from "../components/SectionHeader";
import TopNavBar from "../components/TopNavbar";
import UpcomingEventCard from "../components/UpcomingEventCard";

const CricketScreen = ({ navigation }: { navigation?: any }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [activeScreen, setActiveScreen] = useState("Home");

  const role = "player"; // Could come from context
  const type = "cricket";

  const filterTabs = ["All", "Upcoming", "Live", "Completed"];

  const categories = [
    {
      icon: <Cricket size={32} color="#4338CA" />,
      title: "Test Match",
      eventCount: 10,
      color: "#EEF2FF",
      notificationCount: 1,
      notificationColor: "#4F46E5",
    },
    {
      icon: <Cricket size={32} color="#7E22CE" weight="fill" />,
      title: "ODI Match",
      eventCount: 18,
      color: "#F5F3FF",
      notificationCount: 1,
      notificationColor: "#9333EA",
    },
  ];

  const categories2 = [
    {
      icon: <Cricket size={32} color="#BE123C" weight="fill" />,
      title: "T20 Match",
      eventCount: 30,
      color: "#FEF2F2",
      notificationCount: 2,
      notificationColor: "#DC2626",
    },
    {
      icon: <Cricket size={32} color="#16A34A" weight="fill" />,
      title: "Practice Match",
      eventCount: 15,
      color: "#F0FDF4",
      notificationCount: 3,
      notificationColor: "#16A34A",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <TopNavBar
        title="Matches"
        showBackButton
        onBackPress={() => navigation?.goBack?.()}
      />
      <FilterTabs
        tabs={filterTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <ScrollView>
        <FeaturedEventCard
          date="12 August 2025"
          title="Mumbai Premier League"
          description="India's premier tournament event with 50,000+ participants."
          location="Govind Stadium"
          type="T-20 Match"
        />

        <SectionHeader title="Categories" />
        <View className="flex-row px-4 gap-3 mt-2">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </View>
        <View className="flex-row px-4 gap-3 mt-3">
          {categories2.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </View>

        <SectionHeader title="Upcoming Events" />
        <UpcomingEventCard
          title="Kolkata Championship"
          subtitle="T-20 Match (20 Overs)"
          status="Open"
          price="Rs 1200/-"
          date="28 Aug 2025"
          location="S.K Stadium"
          participants={10500}
        />
        <UpcomingEventCard
          title="Kolkata Championship"
          subtitle="T-20 Match (20 Overs)"
          status="Open"
          price="Rs 1200/-"
          date="28 Aug 2025"
          location="S.K Stadium"
          participants={12500}
        />
        <UpcomingEventCard
          title="Kolkata Championship"
          subtitle="T-20 Match (20 Overs)"
          status="Open"
          price="Rs 1200/-"
          date="28 Aug 2025"
          location="S.K Stadium"
          participants={10500}
        />

        {/* Spacer so last card isn't hidden behind navbar */}
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

export default CricketScreen;
