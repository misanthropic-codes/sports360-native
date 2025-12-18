import ReusableButton from "@/components/button";
import CheckboxItem from "@/components/CheckBoxItem";
import ReusableDropdown from "@/components/dropdown";
import SelectionPill from "@/components/SelelctionPill";
import ReusableTextInput from "@/components/TextInput";
import { router } from "expo-router";
import api from "../../../api/api";

import { useAuth } from "@/context/AuthContext";
import * as Location from 'expo-location';
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
import Icon from "react-native-vector-icons/Ionicons";

const CompleteProfileScreen = () => {
  const { token, user, updateUser } = useAuth();
  const userId = user?.id;

  // Form state
  const [organizationName, setOrganizationName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [experience, setExperience] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<string | null>(null);
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
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
        // Update user object with cricket domain
        await updateUser({ domains: ["cricket"] });

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

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location permissions to use this feature'
        );
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address && address.length > 0) {
        const { city, region, country } = address[0];
        const locationString = [city, region, country].filter(Boolean).join(', ');
        setPrimaryLocation(locationString);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location');
    } finally {
      setLoadingLocation(false);
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
      <View className="px-4 py-3 items-center justify-center">
        <Text className="text-white text-xl font-bold">
          Complete Your Profile
        </Text>
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
      >
        {/* Organization Details Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Icon name="business" size={20} color="#7C3AED" />
            <Text className="text-gray-800 text-lg font-bold ml-2">
              Organization Details
            </Text>
          </View>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
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

            <View>
              <Text className="text-gray-600 text-sm font-medium mb-2">
                Organization Type *
              </Text>
              <ReusableDropdown
                options={orgTypeOptions}
                selectedValue={orgType}
                onValueChange={setOrgType}
                placeholder="Select Organization Type"
              />
            </View>
          </View>
        </View>

        {/* Experience & Location Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Icon name="stats-chart" size={20} color="#7C3AED" />
            <Text className="text-gray-800 text-lg font-bold ml-2">
              Experience & Location
            </Text>
          </View>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
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

            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600 text-sm font-medium">Primary Location *</Text>
                <TouchableOpacity onPress={getCurrentLocation}>
                  <View className="flex-row items-center bg-purple-50 px-3 py-1.5 rounded-lg">
                    {loadingLocation ? (
                      <View className="w-4 h-4">
                        <View className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                      </View>
                    ) : (
                      <Icon name="location" size={14} color="#7C3AED" />
                    )}
                    <Text className="text-purple-600 text-xs font-medium ml-1">
                      {loadingLocation ? 'Getting...' : 'Use Current'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <ReusableTextInput
                label=""
                placeholder="e.g., Kolkata"
                value={primaryLocation}
                onChangeText={setPrimaryLocation}
              />
            </View>
          </View>
        </View>

        {/* Tournament Details Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Icon name="trophy" size={20} color="#7C3AED" />
            <Text className="text-gray-800 text-lg font-bold ml-2">
              Tournament Details
            </Text>
          </View>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
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

            <View>
              <Text className="text-gray-600 text-sm font-medium mb-2">
                Expected Tournament Frequency *
              </Text>
              <ReusableDropdown
                options={frequencyOptions}
                selectedValue={frequency}
                onValueChange={setFrequency}
                placeholder="Select Frequency"
              />
            </View>
          </View>
        </View>

        {/* About Organization Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Icon name="information-circle" size={20} color="#7C3AED" />
            <Text className="text-gray-800 text-lg font-bold ml-2">
              About Organization
            </Text>
          </View>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <ReusableTextInput
              label="Tell us about your organization"
              placeholder="Tell us about your organization, your experience and your goals...."
              multiline
              value={aboutOrganization}
              onChangeText={setAboutOrganization}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Icon name="settings" size={20} color="#7C3AED" />
            <Text className="text-gray-800 text-lg font-bold ml-2">
              Preferences
            </Text>
          </View>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <CheckboxItem
              label="Accept team registration requests"
              isChecked={prefs.registrations}
              onPress={() => setPrefs({ ...prefs, registrations: !prefs.registrations })}
            />
            <View className="h-3" />
            <CheckboxItem
              label="Allow player auctions in Tournament"
              isChecked={prefs.auctions}
              onPress={() => setPrefs({ ...prefs, auctions: !prefs.auctions })}
            />
            <View className="h-3" />
            <CheckboxItem
              label="Receive Ground Booking Notification"
              isChecked={prefs.notifications}
              onPress={() => setPrefs({ ...prefs, notifications: !prefs.notifications })}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className="pt-2 items-center">
          <ReusableButton
            title="Complete Profile"
            role="organizer"
            onPress={handleSubmit}
          />
          <Text className="text-gray-500 text-xs mt-3 text-center">
            You can update your profile anytime in settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
