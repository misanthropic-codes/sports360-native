import ReusableButton from "@/components/button";
import CheckboxItem from "@/components/CheckBoxItem";
import ReusableDropdown from "@/components/dropdown";
import SelectionPill from "@/components/SelelctionPill";
import ReusableTextInput from "@/components/TextInput";
import { router } from "expo-router";
import api from "../../../api/api";

import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/Ionicons";

const CompleteProfileScreen = () => {
  const { token, user } = useAuth();
  const userId = user?.id;

  // Form state
  const [organizationName, setOrganizationName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [experience, setExperience] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<string | null>(null);
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [tournamentType, setTournamentType] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>(null);
  const [aboutOrganization, setAboutOrganization] = useState("");
  
  const [prefs, setPrefs] = useState({
    registrations: true,
    auctions: false,
    notifications: true,
  });

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    // Validation
    if (!organizationName.trim()) {
      Alert.alert("Validation Error", "Please enter organization name");
      return;
    }

    if (!contactPersonName.trim()) {
      Alert.alert("Validation Error", "Please enter contact person name");
      return;
    }

    if (!experience) {
      Alert.alert("Validation Error", "Please select experience level");
      return;
    }

    if (!orgType) {
      Alert.alert("Validation Error", "Please select organization type");
      return;
    }

    if (!primaryLocation.trim()) {
      Alert.alert("Validation Error", "Please enter primary location");
      return;
    }

    if (!tournamentType) {
      Alert.alert("Validation Error", "Please select tournament type");
      return;
    }

    if (!frequency) {
      Alert.alert("Validation Error", "Please select frequency");
      return;
    }

    // Map UI values to backend enum values
    const experienceMap: Record<string, string> = {
      "New Organizer": "new_organizer",
      "1-2 Years": "1-2_years",
      "3-5 Years": "3-5_years",
      "5+ Years": "5+_years",
    };

    const orgTypeMap: Record<string, string> = {
      "Cricket Academy": "cricket_academy",
      "Cricket Club": "cricket_club",
      "Sports Association": "sports_association",
      "Corporate Association": "corporate_association",
      "Individual Organizer": "individual_organizer",
      "School or College": "school_or_college",
    };

    const tournamentTypeMap: Record<string, string> = {
      "T20 Tournaments": "T20_TOURNAMENT",
      "ODI Matches": "ODI_MATCHES",
      "Test Matches": "TEST_MATCHES",
      "League Format": "LEAGUE_FORMAT",
      "Youth Cricket": "YOUTH_CRICKET",
      "Corporate Events": "CORPORATE_EVENTS",
    };

    const frequencyMap: Record<string, string> = {
      "Weekly": "weekly",
      "Monthly": "monthly",
      "Quarterly": "quarterly",
      "Twice a Year": "twice_a_year",
      "Yearly": "yearly",
    };

    // Prepare payload
    const payload = {
      organizationName: organizationName.trim(),
      organizerContactPersonName: contactPersonName.trim(),
      experienceInOrganizing: experienceMap[experience] || experience.toLowerCase(),
      organizationType: orgTypeMap[orgType] || orgType.toLowerCase(),
      primaryLocation: primaryLocation.trim(),
      tournamentType: tournamentTypeMap[tournamentType] || tournamentType.toUpperCase().replace(/ /g, "_"),
      expectedTournamentFrequency: frequencyMap[frequency] || frequency.toLowerCase(),
      aboutOrganization: aboutOrganization.trim(),
      acceptTeamRegistrationRequests: prefs.registrations,
      allowPlayerAuctionInTournament: prefs.auctions,
      receiveGroundBookingNotifications: prefs.notifications,
    };

    console.log("📤 Submitting organizer profile:", payload);

    try {
      const response = await api.post("/organizer-profile/profile/cricket", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        Alert.alert(
          "Success",
          "Organizer profile created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to organizer dashboard
                router.replace("/dashboard/organizer/cricket" as any);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("❌ Organizer profile error:", error);
      Alert.alert("Error", "Something went wrong while submitting profile");
    }
  };


  const experienceOptions = [
    "New Organizer",
    "1-2 Years",
    "3-5 Years",
    "5+ Years",
  ];
  
  const tournamentTypeOptions = [
    "T20 Tournaments",
    "ODI Matches",
    "Test Matches",
    "League Format",
    "Youth Cricket",
    "Corporate Events",
  ];
  
  const orgTypeOptions = [
    "Cricket Academy",
    "Cricket Club",
    "Sports Association",
    "Corporate Association",
    "Individual Organizer",
    "School or College",
  ];
  
  const frequencyOptions = [
    "Weekly",
    "Monthly",
    "Quarterly",
    "Twice a Year",
    "Yearly",
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#4D1A88]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4D1A88"
        translucent={true}
      />

      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">
          Complete Your Profile
        </Text>
        <TouchableOpacity>
          <FeatherIcon name="bell" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="px-4 pb-6">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-white font-semibold">Step 1 of 1</Text>
          <Text className="text-white font-semibold">100%</Text>
        </View>
        <View className="w-full bg-white/30 rounded-full h-1.5">
          <View className="bg-white rounded-full h-1.5 w-full"></View>
        </View>
      </View>

      {/* White Scrollable Section */}
      <ScrollView
        className="bg-gray-50 flex-1 relative"
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}
      >
        <View className="px-4 pb-6">
          {/* Form Fields */}
          <View className="space-y-5">
            <ReusableTextInput
              label="Organisation Name *"
              placeholder="Enter your organisation name..."
              value={organizationName}
              onChangeText={setOrganizationName}
            />

            <ReusableTextInput
              label="Contact Person Name *"
              placeholder="Enter contact person name..."
              value={contactPersonName}
              onChangeText={setContactPersonName}
            />

            <ReusableDropdown
              label="Organization Type *"
              options={orgTypeOptions}
              selectedValue={orgType}
              onValueChange={setOrgType}
              placeholder="Select Organization Type"
            />

            <View>
              <Text className="text-gray-600 text-sm font-medium mb-3">
                Experience in Organizing *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {experienceOptions.map((opt) => (
                  <SelectionPill
                    key={opt}
                    label={opt}
                    isSelected={experience === opt}
                    onPress={() => setExperience(opt)}
                  />
                ))}
              </View>
            </View>

            <ReusableTextInput
              label="Primary Location *"
              placeholder="e.g., Kolkata"
              value={primaryLocation}
              onChangeText={setPrimaryLocation}
            />

            <View>
              <Text className="text-gray-600 text-sm font-medium mb-3">
                Tournament Type You Organize *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {tournamentTypeOptions.map((type) => (
                  <SelectionPill
                    key={type}
                    label={type}
                    isSelected={tournamentType === type}
                    onPress={() => setTournamentType(type)}
                  />
                ))}
              </View>
            </View>

            <ReusableDropdown
              label="Expected Tournament Frequency *"
              options={frequencyOptions}
              selectedValue={frequency}
              onValueChange={setFrequency}
              placeholder="Select Frequency"
            />

            <ReusableTextInput
              label="Tell us about your organization"
              placeholder="Tell us about your organization, your experience and your goals...."
              multiline
              value={aboutOrganization}
              onChangeText={setAboutOrganization}
            />

            <View>
              <Text className="text-gray-800 text-lg font-bold mb-3">
                Preferences
              </Text>
              <View className="bg-purple-100/50 p-3 rounded-lg">
                <CheckboxItem
                  label="Accept team registration requests"
                  isChecked={prefs.registrations}
                  onPress={() => setPrefs({ ...prefs, registrations: !prefs.registrations })}
                />
                <CheckboxItem
                  label="Allow player auctions in Tournament"
                  isChecked={prefs.auctions}
                  onPress={() => setPrefs({ ...prefs, auctions: !prefs.auctions })}
                />
                <CheckboxItem
                  label="Receive Ground Booking Notification"
                  isChecked={prefs.notifications}
                  onPress={() => setPrefs({ ...prefs, notifications: !prefs.notifications })}
                />
              </View>
            </View>

            <View className="pt-2 items-center">
              <ReusableButton
                title="Complete Profile"
                role="organizer"
                onPress={handleSubmit}
              />
              <Text className="text-gray-500 text-xs mt-3">
                You can update your profile anytime in the settings
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
