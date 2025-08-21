import ReusableButton from "@/components/button";
import CheckboxItem from "@/components/CheckBoxItem";
import ReusableDropdown from "@/components/dropdown";
import SelectionPill from "@/components/SelelctionPill";
import ReusableTextInput from "@/components/TextInput";

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
  const [formState, setFormState] = useState({
    yearsOfOperation: "less than 1 year",
    facilities: ["Floodlights", "League Format"],
    preferences: {
      onlineBookings: true,
      tournamentBookings: true,
      availabilityNotifications: false,
    },
  });

  const [groundType, setGroundType] = useState<string | null>(null);
  const [bookingFrequency, setBookingFrequency] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleFacilityToggle = (value: string) => {
    setFormState((prevState) => {
      const currentFacilities = prevState.facilities;
      const newFacilities = currentFacilities.includes(value)
        ? currentFacilities.filter((item) => item !== value)
        : [...currentFacilities, value];
      return { ...prevState, facilities: newFacilities };
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

  const yearsOfOperationOptions = [
    "less than 1 year",
    "1-2 years",
    "3-5 years",
    "5+ years",
  ];
  const facilityOptions = [
    "Floodlights",
    "Washroom",
    "Parking",
    "League Format",
    "Locker Room",
    "Turf Grass",
  ];
  const groundTypeOptions = [
    "Turf",
    "Stadium",
    "Local Ground",
    "School/College Ground",
    "Private Factory",
  ];
  const bookingFrequencyOptions = [
    "Daily",
    "Weekly",
    "Monthly",
    "Yearly",
    "Seasonly",
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#0D991E]"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
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
          <TouchableOpacity className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white items-center justify-center shadow-md overflow-hidden">
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Icon name="camera-outline" size={32} color="#888" />
            )}
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="px-4 pt-20 pb-6 space-y-5">
          <ReusableTextInput
            label="Enter Ground Name*"
            placeholder="Enter your organisation name..."
          />
          <ReusableTextInput
            label="Enter Owner Name*"
            placeholder="Enter Contact person name..."
          />

          <ReusableDropdown
            options={groundTypeOptions}
            selectedValue={groundType}
            onValueChange={setGroundType}
            placeholder="Select ground Type"
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
              Facility Available
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {facilityOptions.map((facility) => (
                <SelectionPill
                  key={facility}
                  label={facility}
                  isSelected={formState.facilities.includes(facility)}
                  onPress={() => handleFacilityToggle(facility)}
                />
              ))}
            </View>
          </View>

          <ReusableDropdown
            options={bookingFrequencyOptions}
            selectedValue={bookingFrequency}
            onValueChange={setBookingFrequency}
            placeholder="Select Frequency"
          />

          <ReusableTextInput
            label="Add Ground Description *"
            placeholder="Tell Us About The Ground Details"
            multiline
          />

          <View>
            <Text className="text-gray-600 text-sm font-medium mb-2">
              Upload 2-3 images of the ground*
            </Text>
            <TouchableOpacity className="bg-green-100 border border-dashed border-green-500 rounded-lg p-6 items-center justify-center">
              <Icon name="cloud-upload-outline" size={32} color="#0D991E" />
              <Text className="text-green-700 mt-2">Upload Ground Images</Text>
            </TouchableOpacity>
          </View>

          {/* Preferences Section */}
          <View>
            <Text className="text-gray-800 text-lg font-bold mb-3">
              Preferences
            </Text>
            <View className="bg-green-100 p-4 rounded-lg">
              <CheckboxItem
                label="Accept Online Bookings"
                isChecked={formState.preferences.onlineBookings}
                onPress={() => handlePreferenceToggle("onlineBookings")}
              />
              <CheckboxItem
                label="Allow Tournament Bookings"
                isChecked={formState.preferences.tournamentBookings}
                onPress={() => handlePreferenceToggle("tournamentBookings")}
              />
              <CheckboxItem
                label="Receive Ground Availability Notifications"
                isChecked={formState.preferences.availabilityNotifications}
                onPress={() =>
                  handlePreferenceToggle("availabilityNotifications")
                }
              />
            </View>
          </View>

          {/* Submit Button */}
          <View className="pt-2 items-center">
            <ReusableButton
              title="Complete Profile"
              role="owner"
              onPress={() =>
                console.log("Form State:", {
                  ...formState,
                  groundType,
                  bookingFrequency,
                })
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
