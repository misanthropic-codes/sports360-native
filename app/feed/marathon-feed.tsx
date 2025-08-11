import { PersonSimpleRun } from "phosphor-react-native";
import React from "react";
import { ScrollView, View } from "react-native";

// Import Reusable Components
import CategoryCard from "../components/CategoriesCard";
import FeaturedEventCard from "../components/EventsCard";
import SectionHeader from "../components/SectionHeader";
import UpcomingEventCard from "../components/UpcomingEventCard";

interface Category {
  icon: React.ReactNode;
  title: string;
  eventCount: number;
  color: string;
}

const MarathonScreen: React.FC = () => {
  const categories: Category[] = [
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

  const categories2: Category[] = [
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
    <ScrollView className="bg-slate-50">
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
      />
      <UpcomingEventCard
        title="Kolkata Marathon"
        subtitle="Half Marathon - 21.1 KM"
        status="Open"
        price="Rs 1200/-"
        date="20 Aug 2025"
        location="Ground no. 6"
      />
      <UpcomingEventCard
        title="Kolkata Marathon"
        subtitle="Half Marathon - 21.1 KM"
        status="Open"
        price="Rs 1200/-"
        date="20 Aug 2025"
        location="Ground no. 6"
      />
    </ScrollView>
  );
};

export default MarathonScreen;
