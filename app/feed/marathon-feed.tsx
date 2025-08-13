import { PersonSimpleRun } from "phosphor-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

import BottomNavBar from "../components/BottomNavBar";
import CategoryCard from "../components/CategoriesCard";
import FeaturedEventCard from "../components/EventsCard";
import FilterTabs from "../components/FilterTab";
import SectionHeader from "../components/SectionHeader";
import TopNavBar from "../components/TopNavbar";
import UpcomingEventCard from "../components/UpcomingEventCard";

const MarathonScreen = ({ navigation }: { navigation?: any }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [activeScreen, setActiveScreen] = useState("Home");

  const role = "player"; // could come from context/auth
  const type = "marathon";

  const filterTabs = ["All", "Upcoming", "Live", "Completed"];

  const categories = [
    {
      icon: <PersonSimpleRun size={32} color="#4F46E5" />,
      title: "Full Marathon",
      eventCount: 10,
      color: "#EEF2FF",
    },
    {
      icon: <PersonSimpleRun size={32} color="#4F46E5" />,
      title: "Half Marathon",
      eventCount: 21,
      color: "#EEF2FF",
    },
  ];

  const categories2 = [
    {
      icon: <PersonSimpleRun size={32} color="#16A34A" />,
      title: "5 K Run",
      eventCount: 8,
      color: "#F0FDF4",
    },
    {
      icon: <PersonSimpleRun size={32} color="#16A34A" />,
      title: "10 K Run",
      eventCount: 15,
      color: "#F0FDF4",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <TopNavBar
        title="Marathons"
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
          title="Mumbai Marathon"
          description="India's premier marathon event with 50,000+ participants."
          location="Marine Drive"
          type="Full Marathon"
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
          title="Kolkata Marathon"
          subtitle="Half Marathon - 21.1 KM"
          status="Open"
          price="Rs 1200/-"
          date="22 Aug 2025"
          location="Ground no. 6"
          participants={0}
        />
        <UpcomingEventCard
          title="Kolkata Marathon"
          subtitle="Half Marathon - 21.1 KM"
          status="Open"
          price="Rs 1200/-"
          date="20 Aug 2025"
          location="Ground no. 6"
          participants={0}
        />
        <UpcomingEventCard
          title="Kolkata Marathon"
          subtitle="Half Marathon - 21.1 KM"
          status="Open"
          price="Rs 1200/-"
          date="20 Aug 2025"
          location="Ground no. 6"
          participants={0}
        />

        {/* Spacer so last card isn't hidden behind nav */}
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

export default MarathonScreen;
