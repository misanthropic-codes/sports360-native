import ReusableButton from "@/components/button";
import CheckboxItem from "@/components/CheckBoxItem";
import ReusableDropdown from "@/components/dropdown";
import SelectionPill from "@/components/SelelctionPill";
import ReusableTextInput from "@/components/TextInput";

import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/Ionicons";

const CompleteProfileScreen = () => {
  const [formState, setFormState] = useState({
    yearsOfOperation: "less than 1 year",
    suitableFor: ["Full Marathon"],
    preferences: {
      fullDayBookings: true,
      shortRuns: true,
      marathonBookingNotifications: false,
    },
  });

  const [trackType, setTrackType] = useState<string | null>(null);
  const [trackLength, setTrackLength] = useState<string | null>(null);

  const handleSuitableForToggle = (value: string) => {
    setFormState((prev) => {
      const current = prev.suitableFor;
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, suitableFor: updated };
    });
  };

  const handlePreferenceToggle = (key: keyof typeof formState.preferences) => {
    setFormState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key],
      },
    }));
  };

  const yearsOfOperationOptions = [
    "less than 1 year",
    "1-2 years",
    "3-5 years",
    "5+ years",
  ];
  const suitableForOptions = [
    "5 K Run",
    "10 K Run",
    "Half Marathon",
    "Full Marathon",
    "Ultra Marathon",
    "Custom",
  ];
  const trackTypeOptions = [
    "Track Circuit",
    "School / College Field",
    "Open Ground",
    "Private Facility",
  ];
  const trackLengthOptions = ["400 m", "800 m", "1 K", "5 K", "10 K", "Custom"];

  return (
    <SafeAreaView
      className="flex-1 bg-[#0D991E]"
      style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0D991E"
        translucent={true}
      />

      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Complete Your Profile</Text>
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
          <View className="bg-white rounded-full h-1.5 w-full" />
        </View>
      </View>

      {/* Main Scrollable Section */}
      <ScrollView
        className="bg-gray-50 flex-1 relative"
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View className="items-center absolute -top-12 left-0 right-0 z-20">
          <TouchableOpacity className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white items-center justify-center shadow-md">
            <Icon name="camera-outline" size={32} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="px-4 pt-20 pb-6 space-y-5">
          <ReusableTextInput
            label="Enter Ground / Track Name*"
            placeholder="Enter your track or ground name..."
          />
          <ReusableTextInput
            label="Enter Owner / Manager Name*"
            placeholder="Enter owner or manager name..."
          />

          <ReusableDropdown
            options={trackTypeOptions}
            selectedValue={trackType}
            onValueChange={setTrackType}
            placeholder="Select Track Type"
          />

          <View>
            <Text className="text-gray-600 text-sm font-medium mb-2">Years of operations</Text>
            <View className="flex-row flex-wrap gap-2">
              {yearsOfOperationOptions.map((opt) => (
                <SelectionPill
                  key={opt}
                  label={opt}
                  isSelected={formState.yearsOfOperation === opt}
                  onPress={() => setFormState((s) => ({ ...s, yearsOfOperation: opt }))}
                />
              ))}
            </View>
          </View>

          <ReusableTextInput label="Primary location *" placeholder="Patna" />

          <View>
            <Text className="text-gray-600 text-sm font-medium mb-2">Suitable For</Text>
            <View className="flex-row flex-wrap gap-2">
              {suitableForOptions.map((option) => (
                <SelectionPill
                  key={option}
                  label={option}
                  isSelected={formState.suitableFor.includes(option)}
                  onPress={() => handleSuitableForToggle(option)}
                />
              ))}
            </View>
          </View>

          <ReusableDropdown
            options={trackLengthOptions}
            selectedValue={trackLength}
            onValueChange={setTrackLength}
            placeholder="Select Track Length"
          />

          <ReusableTextInput
            label="Add Ground / Track Description *"
            placeholder="Tell us about your track, notable marathons hosted, and special features"
            multiline
          />

          {/* Preferences Section */}
          <View>
            <Text className="text-gray-800 text-lg font-bold mb-3">Preferences</Text>
            <View className="bg-green-100 p-4 rounded-lg">
              <CheckboxItem
                label="Allow bookings for full-day events"
                isChecked={formState.preferences.fullDayBookings}
                onPress={() => handlePreferenceToggle("fullDayBookings")}
              />
              <CheckboxItem
                label="Allow short runs or practice runs"
                isChecked={formState.preferences.shortRuns}
                onPress={() => handlePreferenceToggle("shortRuns")}
              />
              <CheckboxItem
                label="Receive Marathon Booking Notifications"
                isChecked={formState.preferences.marathonBookingNotifications}
                onPress={() =>
                  handlePreferenceToggle("marathonBookingNotifications")
                }
              />
            </View>
          </View>

          {/* Submit Button */}
          <View className="pt-4 items-center">
            <ReusableButton
              title="Complete Profile"
              role="owner"
              onPress={() =>
                console.log("Form State:", { ...formState, trackType, trackLength })
              }
            />
            <Text className="text-gray-500 text-xs mt-3 text-center">
              You can update your profile anytime in the settings
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
