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
import Feather from "react-native-vector-icons/Feather";

const CompleteProfileScreen = () => {
  const [selectedExperience, setSelectedExperience] = useState("New organizer");
  const [selectedRaces, setSelectedRaces] = useState<string[]>([
    "Full Marathon",
  ]);
  const [preferences, setPreferences] = useState<string[]>([
    "Accept runner registrations",
    "Receive Route Setup Alerts & Logistics Reminders",
  ]);

  const raceOptions: string[] = [
    "5 K Run",
    "10 K Run",
    "Half Marathon",
    "Full Marathon",
    "Ultra Marathon",
  ];

  const preferenceOptions: string[] = [
    "Accept runner registrations",
    "Receive Route Setup Alerts & Logistics Reminders",
    "Receive Ground Booking Notification",
  ];

  const handleRaceToggle = (race: string) => {
    setSelectedRaces((prev) =>
      prev.includes(race) ? prev.filter((r) => r !== race) : [...prev, race]
    );
  };

  const handlePreferenceToggle = (option: string) => {
    setPreferences((prev) =>
      prev.includes(option)
        ? prev.filter((p) => p !== option)
        : [...prev, option]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#430A5D]">
      <StatusBar barStyle="light-content" backgroundColor="#430A5D" />

      {/* --- Header --- */}
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity>
            <Text className="text-white text-2xl font-bold">←</Text>
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-white text-xl font-bold text-center">
              Complete Your Profile
            </Text>
            <Text className="text-gray-300 text-sm text-center">
              Step 1 of 1
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full border-2 border-[#A020F0] items-center justify-center bg-[#5A1A7A]">
            <Text className="text-white font-bold">100%</Text>
          </View>
        </View>
        <View className="w-full bg-gray-600 rounded-full h-1 mt-2">
          <View
            className="bg-[#A020F0] h-1 rounded-full"
            style={{ width: "100%" }}
          ></View>
        </View>
      </View>

      {/* --- Main Content --- */}
      <ScrollView
        contentContainerStyle={{ paddingTop: 48, paddingBottom: 40 }}
        className="bg-white rounded-t-[30px] mt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* --- Profile Picture Uploader --- */}
        <View className="absolute w-full items-center -top-10">
          <TouchableOpacity className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white items-center justify-center">
            <Feather name="camera" size={32} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View className="px-4">
          <ReusableTextInput
            label="Enter Organisation name*"
            placeholder="Enter your organisation name..."
          />
          <ReusableTextInput
            label="Enter Contact Person Name*"
            placeholder="Enter Contact person name..."
          />

          <View className="mb-5">
            <Text className="text-sm text-gray-600 mb-2">Organizer Type*</Text>
            <ReusableDropdown
              placeholder="Select Organizer Type"
              selectedValue="Running Club"
              onValueChange={() => {}}
              options={[
                "Running Club",
                "NGO",
                "School / College",
                "Sports Body",
                "Individual Organizer",
              ]}
            />
          </View>

          <View className="mb-5">
            <Text className="text-sm text-gray-600 mb-2">
              Experience in Organizing
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["New organizer", "1-2 years", "3-5 years", "5+ years"].map(
                (exp) => (
                  <SelectionPill
                    key={exp}
                    label={exp}
                    isSelected={selectedExperience === exp}
                    onPress={() => setSelectedExperience(exp)}
                  />
                )
              )}
            </View>
          </View>

          <ReusableTextInput label="Primary location*" placeholder="Patna" />

          <View className="mb-5">
            <Text className="text-sm text-gray-600 mb-2">
              Marathon types you organize*
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {raceOptions.map((race) => (
                <SelectionPill
                  key={race}
                  label={race}
                  isSelected={selectedRaces.includes(race)}
                  onPress={() => handleRaceToggle(race)}
                />
              ))}
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-sm text-gray-600 mb-2">
              Expected Tournament Frequency*
            </Text>
            <ReusableDropdown
              placeholder="Select Frequency"
              selectedValue="Monthly"
              onValueChange={() => {}}
              options={["Monthly", "Quarterly", "Yearly", "Twice a year"]}
            />
          </View>

          <ReusableTextInput
            label="Tell us about your organization"
            placeholder="Tell us about your races, history, and team."
            multiline
          />

          <View className="mb-4 bg-[#F3E8FF] p-4 rounded-lg">
            <Text className="text-base font-semibold mb-3 text-gray-800">
              Preferences
            </Text>
            {preferenceOptions.map((option) => (
              <CheckboxItem
                key={option}
                label={option}
                isChecked={preferences.includes(option)}
                onPress={() => handlePreferenceToggle(option)}
              />
            ))}
          </View>

          <ReusableButton
            title="Complete Profile"
            role="organizer"
            onPress={() => console.log("Form Submitted")}
          />

          <Text className="mt-3 text-center text-xs text-gray-500">
            You can update your profile anytime in the settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
