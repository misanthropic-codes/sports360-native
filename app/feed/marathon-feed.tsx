import { PersonSimpleRun } from "phosphor-react-native";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";

// Import Reusable Components
import BottomNavBar from "../components/BottomNavBar";
import CategoryCard from "../components/CategoriesCard";
import FeaturedEventCard from "../components/EventsCard";
import FilterTabs from "../components/FilterTab";
import SectionHeader from "../components/SectionHeader";
import TopNavBar from "../components/TopNavbar";
import UpcomingEventCard from "../components/UpcomingEventCard";

const MarathonScreen = () => {
  const [activeTab, setActiveTab] = useState("All");
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
    // Use a View with flex: 1 instead of SafeAreaView if your navigator already handles safe areas.
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <TopNavBar title="Marathons" />
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
          location="Ground no. 6" participants={0}        />
        <UpcomingEventCard
          title="Kolkata Marathon"
          subtitle="Half Marathon - 21.1 KM"
          status="Open"
          price="Rs 1200/-"
          date="20 Aug 2025"
          location="Ground no. 6" participants={0}        />
        <UpcomingEventCard
          title="Kolkata Marathon"
          subtitle="Half Marathon - 21.1 KM"
          status="Open"
          price="Rs 1200/-"
          date="20 Aug 2025"
          location="Ground no. 6" participants={0}        />
        {/* Add padding to the bottom to ensure it doesn't get hidden by your bottom nav bar */}
        <BottomNavBar
          activeScreen={"Home"}
          setActiveScreen={function (screenName: string): void {
            throw new Error("Function not implemented.");
          }}
        />
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default MarathonScreen;
