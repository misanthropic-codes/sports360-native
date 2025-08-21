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
} from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/Ionicons";

const CompleteProfileScreen = () => {
  const [formState, setFormState] = useState({
    experience: "New organizer",
    tournamentTypes: ["T20 Tournaments", "League Format"],
    preferences: {
      registrations: true,
      auctions: true,
      notifications: false,
    },
  });

  const [orgType, setOrgType] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>(null);

  const handleToggle = (
    field: "tournamentTypes" | "experience",
    value: string
  ) => {
    setFormState((prevState) => {
      const currentValues = prevState[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prevState, [field]: newValues };
    });
  };

  const handlePreferenceToggle = (key: keyof typeof formState.preferences) => {
    setFormState((prevState) => ({
      ...prevState,
      preferences: {
        ...prevState.preferences,
        [key]: !prevState.preferences[key],
      },
    }));
  };

  const experienceOptions = [
    "New organizer",
    "1-2 years",
    "3-5 years",
    "5+ years",
  ];
  const tournamentTypeOptions = [
    "T20 Tournaments",
    "ODI Matches",
    "Test Matches",
    "League Format",
    "Youth Cricket",
    "Corporate Events",
  ];
  const orgTypeOptions = ["School", "Club", "Academy", "Company"];
  const frequencyOptions = ["Weekly", "Monthly", "Quarterly", "Yearly"];

  return (
    <SafeAreaView className="flex-1 bg-[#4D1A88]">
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
          {/* Avatar */}
          <View className="items-center -mt-16 mb-6">
            <TouchableOpacity className="w-24 h-24 bg-gray-200 rounded-full justify-center items-center border-4 border-white shadow-md">
              <Icon name="camera-outline" size={32} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            <ReusableTextInput
              label="Organisation name*"
              placeholder="Enter your organisation name..."
            />

            <ReusableTextInput
              label="Contact Person Name*"
              placeholder="Enter Contact person name..."
            />

            <ReusableDropdown
              options={orgTypeOptions}
              selectedValue={orgType}
              onValueChange={setOrgType}
              placeholder="Select Organization Type"
            />

            <View>
              <Text className="text-gray-600 text-sm font-medium mb-2">
                Experience in Organizing
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {experienceOptions.map((opt) => (
                  <SelectionPill
                    key={opt}
                    label={opt}
                    isSelected={formState.experience === opt}
                    onPress={() =>
                      setFormState((s) => ({ ...s, experience: opt }))
                    }
                  />
                ))}
              </View>
            </View>

            <ReusableTextInput label="Primary location *" placeholder="Patna" />

            <View>
              <Text className="text-gray-600 text-sm font-medium mb-2">
                Tournament types you organize
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {tournamentTypeOptions.map((type) => (
                  <SelectionPill
                    key={type}
                    label={type}
                    isSelected={formState.tournamentTypes.includes(type)}
                    onPress={() => handleToggle("tournamentTypes", type)}
                  />
                ))}
              </View>
            </View>

            <ReusableDropdown
              options={frequencyOptions}
              selectedValue={frequency}
              onValueChange={setFrequency}
              placeholder="Select Frequency"
            />

            <ReusableTextInput
              label="Tell us about your organization"
              placeholder="Tell us about your organization, your experience and your goals...."
              multiline
            />

            <View>
              <Text className="text-gray-800 text-lg font-bold mb-3">
                Preferences
              </Text>
              <View className="bg-purple-100/50 p-4 rounded-lg">
                <CheckboxItem
                  label="Accept team registration requests"
                  isChecked={formState.preferences.registrations}
                  onPress={() => handlePreferenceToggle("registrations")}
                />
                <CheckboxItem
                  label="Allow player auctions in Tournament"
                  isChecked={formState.preferences.auctions}
                  onPress={() => handlePreferenceToggle("auctions")}
                />
                <CheckboxItem
                  label="Receive Ground Booking Notification"
                  isChecked={formState.preferences.notifications}
                  onPress={() => handlePreferenceToggle("notifications")}
                />
              </View>
            </View>

            <View className="pt-4 items-center">
              <ReusableButton
                title="Complete Profile"
                role="organizer"
                onPress={() => {
                  // handle submit
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
