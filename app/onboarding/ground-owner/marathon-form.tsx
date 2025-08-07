import ReusableButton from "@/app/components/button";
import CheckboxItem from "@/app/components/CheckBoxItem";
import ReusableDropdown from "@/app/components/dropdown";
import SelectionPill from "@/app/components/SelelctionPill";
import ReusableTextInput from "@/app/components/TextInput";

import React, { useState } from "react";
import {
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
  // State to manage form inputs, updated for the track profile UI
  const [formState, setFormState] = useState({
    yearsOfOperation: "less than 1 year",
    suitableFor: ["Full Marathon"],
    preferences: {
      fullDayBookings: true,
      shortRuns: true,
      marathonBookingNotifications: false,
    },
  });

  // State for dropdowns
  const [trackType, setTrackType] = useState<string | null>(null);
  const [trackLength, setTrackLength] = useState<string | null>(null);

  // Toggles a "suitable for" option in the state
  const handleSuitableForToggle = (value: string) => {
    setFormState((prevState) => {
      const currentSuitableFor = prevState.suitableFor;
      const newSuitableFor = currentSuitableFor.includes(value)
        ? currentSuitableFor.filter((item) => item !== value)
        : [...currentSuitableFor, value];
      return { ...prevState, suitableFor: newSuitableFor };
    });
  };

  // Toggles a preference in the state
  const handlePreferenceToggle = (key: keyof typeof formState.preferences) => {
    setFormState((prevState) => ({
      ...prevState,
      preferences: {
        ...prevState.preferences,
        [key]: !prevState.preferences[key],
      },
    }));
  };

  // Options for form elements, updated from the new image
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
    <SafeAreaView className="flex-1 bg-[#0D991E]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="p-4 flex-row items-center justify-between">
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
      <View className="px-4 pb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-white font-semibold">Step 1 of 1</Text>
          <Text className="text-white font-semibold">100%</Text>
        </View>
        <View className="w-full bg-white/30 rounded-full h-1.5">
          <View className="bg-white rounded-full h-1.5 w-full"></View>
        </View>
      </View>

      <ScrollView
        className="bg-gray-50"
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      >
        <View className="p-6">
          {/* Avatar/Image Upload Placeholder */}
          <View className="items-center -mt-16 mb-6">
            <TouchableOpacity className="w-24 h-24 bg-gray-200 rounded-full justify-center items-center border-4 border-white shadow-md">
              <Icon name="camera-outline" size={32} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Form Fields - Updated to match the new image */}
          <View className="space-y-4">
            <ReusableTextInput
              label="Enter Ground / Track Name*"
              placeholder="Enter your organisation name..."
            />

            <ReusableTextInput
              label="Enter Owner/ Manager Name*"
              placeholder="Enter Contact person name..."
            />

            <ReusableDropdown
              options={trackTypeOptions}
              selectedValue={trackType}
              onValueChange={setTrackType}
              placeholder="Select Track Type"
            />

            <View>
              <Text className="text-gray-600 text-sm font-medium mb-2">
                Years of operations
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {yearsOfOperationOptions.map((opt) => (
                  <SelectionPill
                    key={opt}
                    label={opt}
                    isSelected={formState.yearsOfOperation === opt}
                    onPress={() =>
                      setFormState((s) => ({ ...s, yearsOfOperation: opt }))
                    }
                  />
                ))}
              </View>
            </View>

            <ReusableTextInput label="Primary location *" placeholder="Patna" />

            <View>
              <Text className="text-gray-600 text-sm font-medium mb-2">
                Suitable For
              </Text>
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
              placeholder="Tell us about your ground, notable marathons hosted, and its special features"
              multiline
            />

            {/* Preferences Section */}
            <View>
              <Text className="text-gray-800 text-lg font-bold mb-3">
                Preferences
              </Text>
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
                onPress={() => {
                  // Handle profile submission logic here
                  console.log("Form State:", {
                    ...formState,
                    trackType,
                    trackLength,
                  });
                }}
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
