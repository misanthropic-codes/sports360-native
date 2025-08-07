import ReusableButton from "@/app/components/button";
import CheckboxItem from "@/app/components/CheckBoxItem";
import ReusableDropdown from "@/app/components/dropdown";
import SelectionPill from "@/app/components/SelelctionPill";
import ReusableTextInput from "@/app/components/TextInput";

import DateTimePicker from "@react-native-community/datetimepicker";
import React, { FC, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

const CompleteProfileScreen: FC = () => {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [battingStyle, setBattingStyle] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [playingPosition, setPlayingPosition] = useState<string | null>(null);
  const [bowlingStyle, setBowlingStyle] = useState<string | null>(null);
  const [prefs, setPrefs] = useState({
    team: true,
    captain: false,
    tournament: true,
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formatted = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
      setDob(formatted);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-row items-center bg-blue-600">
        <Pressable>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold ml-4">
          Complete Your Profile
        </Text>
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm text-gray-500">Step 2 of 2</Text>
          <Text className="text-sm text-blue-600 font-semibold">100%</Text>
        </View>
        <View className="w-full bg-gray-200 rounded-full h-2">
          <View
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: "100%" }}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View className="items-center my-4">
          <View className="w-32 h-32 rounded-full bg-gray-200 justify-center items-center">
            <Feather name="camera" size={28} color="#6B7280" />
          </View>
        </View>

        <View className="px-4">
          <ReusableTextInput
            label="Enter full name *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. John Doe"
          />

          <View>
            <ReusableTextInput
              label="Date of Birth *"
              value={dob}
              placeholder="DD/MM/YYYY"
            />
            <Pressable
              style={{ position: "absolute", right: 0, top: 32, padding: 8 }}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Playing Position</Text>
            <ReusableDropdown
              selectedValue={playingPosition}
              onValueChange={setPlayingPosition}
              placeholder="Select Position"
              options={["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"]}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Batting Style</Text>
            <View className="flex-row space-x-4">
              {["Left hand", "Right hand"].map((style) => (
                <SelectionPill
                  key={style}
                  label={style}
                  isSelected={battingStyle === style}
                  onPress={() => setBattingStyle(style)}
                />
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Bowling Style</Text>
            <ReusableDropdown
              selectedValue={bowlingStyle}
              onValueChange={setBowlingStyle}
              placeholder="Select Bowling Style"
              options={["Fast", "Medium Pace", "Spin"]}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Experience level</Text>
            <View className="flex-row space-x-4">
              {["Beginner", "Intermediate", "Advanced"].map((level) => (
                <SelectionPill
                  key={level}
                  label={level}
                  isSelected={experience === level}
                  onPress={() => setExperience(level)}
                />
              ))}
            </View>
          </View>

          <ReusableTextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. New Delhi"
          />

          <ReusableTextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline
          />

          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">Preferences</Text>
            <View className="bg-blue-50 p-4 rounded-lg">
              <CheckboxItem
                label="Available for team selection"
                isChecked={prefs.team}
                onPress={() => setPrefs({ ...prefs, team: !prefs.team })}
              />
              <CheckboxItem
                label="Available for captain roles"
                isChecked={prefs.captain}
                onPress={() => setPrefs({ ...prefs, captain: !prefs.captain })}
              />
              <CheckboxItem
                label="Receive Tournament Notifications"
                isChecked={prefs.tournament}
                onPress={() =>
                  setPrefs({ ...prefs, tournament: !prefs.tournament })
                }
              />
            </View>
          </View>

          <ReusableButton
            title="Complete Profile"
            role="player"
            onPress={() => console.log("Profile Submitted!")}
          />

          <Text className="text-center text-xs text-gray-500 mt-4">
            You can update your profile anytime in the settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
