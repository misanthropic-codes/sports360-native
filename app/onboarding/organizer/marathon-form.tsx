import ReusableButton from "@/components/button";
import CheckboxItem from "@/components/CheckBoxItem";
import ReusableDropdown from "@/components/dropdown";
import SelectionPill from "@/components/SelelctionPill";
import ReusableTextInput from "@/components/TextInput";
import { pickAndStoreImage } from "@/utils/imageUtils";
import React, { useState } from "react";
import {
    Image,
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
  const [selectedExperience, setSelectedExperience] = useState("New organizer");
  const [selectedRaces, setSelectedRaces] = useState<string[]>([
    "Full Marathon",
  ]);
  const [preferences, setPreferences] = useState<string[]>([
    "Accept runner registrations",
    "Receive Route Setup Alerts & Logistics Reminders",
  ]);
  const [profileImageLocal, setProfileImageLocal] = useState<string | null>(null);
  const [profileImageApi, setProfileImageApi] = useState<string | null>(null);

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
    <SafeAreaView
      className="flex-1 bg-[#430A5D]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#430A5D"
        translucent={true}
      />

      {/* --- Header --- */}
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

      {/* --- Main Scrollable Section --- */}
      <ScrollView
        className="bg-gray-50 flex-1 relative"
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Profile Picture Uploader (Overlap Purple/White) --- */}
        <View className="items-center absolute -top-12 left-0 right-0 z-20">
          <TouchableOpacity 
            className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white items-center justify-center shadow-md overflow-hidden"
            onPress={async () => {
              const result = await pickAndStoreImage('profile');
              if (result) {
                setProfileImageLocal(result.localUri);
                setProfileImageApi(result.apiUrl);
                console.log('✅ Profile image selected:', result);
              }
            }}
          >
            {profileImageLocal ? (
              <Image
                source={{ uri: profileImageLocal }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Icon name="camera-outline" size={32} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        {/* --- Form Fields --- */}
        <View className="px-4 pt-20 pb-6 space-y-5">
          <ReusableTextInput
            label="Organisation name*"
            placeholder="Enter your organisation name..."
          />

          <ReusableTextInput
            label="Contact Person Name*"
            placeholder="Enter contact person name..."
          />

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

          <View>
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

          <View>
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

          <ReusableDropdown
            placeholder="Select Frequency"
            selectedValue="Monthly"
            onValueChange={() => {}}
            options={["Monthly", "Quarterly", "Yearly", "Twice a year"]}
          />

          <ReusableTextInput
            label="Tell us about your organization"
            placeholder="Tell us about your races, history, and team."
            multiline
          />

          <View>
            <Text className="text-base font-semibold mb-3 text-gray-800">
              Preferences
            </Text>
            <View className="bg-purple-100/50 p-3 rounded-lg">
              {preferenceOptions.map((option) => (
                <CheckboxItem
                  key={option}
                  label={option}
                  isChecked={preferences.includes(option)}
                  onPress={() => handlePreferenceToggle(option)}
                />
              ))}
            </View>
          </View>

          <View className="items-center">
            <ReusableButton
              title="Complete Profile"
              role="organizer"
              onPress={() => console.log("Form Submitted")}
            />
            <Text className="mt-3 text-center text-xs text-gray-500">
              You can update your profile anytime in the settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
