import { Calendar, FileText, MapPin, Users } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNavBar from "../../components/BottomNavBar";
import Header from "../../components/Header";
import InfoRow from "../../components/InfoRow";
import RegistrationCard from "../../components/RegistrationCard";
import SectionTitle from "../../components/SectionTitile";
import StatsBar from "../../components/StatsBar";
import TournamentBanner from "../../components/TournamentBanner";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type TournamentDetailsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const TournamentDetailsScreen = ({
  navigation,
}: TournamentDetailsScreenProps) => {
  const [activeScreen, setActiveScreen] = useState("Home");

  // Adjust role/type depending on the match type
  const role = "player";
  const type = "cricket";

  const stats = [
    { value: "Rs 50K", label: "Prize Pool" },
    { value: "16", label: "Teams" },
    { value: "5", label: "Days left" },
  ];

  const details = [
    {
      icon: <Calendar size={24} color="#3B82F6" />,
      title: "Tournament Dates",
      subtitle: "12 August - 17 August 2025",
    },
    {
      icon: <MapPin size={24} color="#3B82F6" />,
      title: "Venue",
      subtitle: "Govind Stadium",
    },
    {
      icon: <Users size={24} color="#3B82F6" />,
      title: "Team Size",
      subtitle: "11 players + 4 substitutes",
    },
    {
      icon: <FileText size={24} color="#3B82F6" />,
      title: "Registration Fees",
      subtitle: "Rs 2500 per team / Rs 200 per person",
    },
  ];

  const registrationFeatures = [
    "11 main players + 4 substitutes",
    "Team captain privileges",
    "Custom team jersey & logo",
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "left", "right"]} // ✅ ensures notch + status bar safe area
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <Header
        type="title"
        title="Tournament Details"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <TournamentBanner
          date="12 August 2025"
          title="Mumbai Premier League"
          description="India's premier tournament event with 50,000+ participants"
          location="Govind Stadium"
          type="T-20 Match"
          onJoinPress={() => console.log("Join Now")}
        />

        <StatsBar stats={stats} />

        <View className="my-4">
          {details.map((item, index) => (
            <InfoRow key={index} {...item} />
          ))}
        </View>

        <SectionTitle title="Registration Options" />

        <RegistrationCard
          type="Team"
          price="Rs 2500/-"
          priceSubtitle="per team"
          features={registrationFeatures}
          onRegisterPress={() => console.log("Register Team")}
        />

        <RegistrationCard
          type="Individual"
          price="Rs 200/-"
          priceSubtitle="per person"
          features={registrationFeatures}
          onRegisterPress={() => console.log("Register Individual")}
        />

        {/* Spacer so content doesn't hide behind nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default TournamentDetailsScreen;
