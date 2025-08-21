import ReusableButton from "@/components/button";
import CheckboxItem from "@/components/CheckBoxItem";
import ReusableDropdown from "@/components/dropdown";
import SelectionPill from "@/components/SelelctionPill";
import ReusableTextInput from "@/components/TextInput";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { FC, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

const CompleteMarathonProfileScreen: FC = () => {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [runningCategory, setRunningCategory] = useState<string | null>(null);
  const [runningStyle, setRunningStyle] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [bestFinishTime, setBestFinishTime] = useState("");
  const [bio, setBio] = useState("");
  const [prefs, setPrefs] = useState({
    team: true,
    captain: false,
    tournament: true,
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formatted = `${selectedDate.getDate()}/${
        selectedDate.getMonth() + 1
      }/${selectedDate.getFullYear()}`;
      setDob(formatted);
    }
  };

  const handleSubmit = () => {
    const payload = {
      fullName,
      dob,
      runningCategory,
      runningStyle,
      experienceLevel: experience,
      bestFinishTime,
      bio,
      availableForTeamSelection: prefs.team,
      availableForCaptain: prefs.captain,
      receiveTournamentNotifications: prefs.tournament,
    };
    console.log("Marathon Profile Submitted:", payload);
    Alert.alert("Success", "Profile submitted successfully!");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-blue-600"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1D4ED8"
        translucent={true}
      />

      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Pressable>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-xl font-bold absolute left-0 right-0 text-center">
          Complete Your Profile
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View className="px-4 pb-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-white font-semibold text-sm">Step 2 of 2</Text>
          <Text className="text-white font-semibold text-sm">100%</Text>
        </View>
        <View className="w-full bg-white/30 rounded-full h-1.5">
          <View className="bg-white h-1.5 rounded-full w-full" />
        </View>
      </View>

      <ScrollView
        className="bg-gray-50 flex-1"
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Profile Picture */}
        <View className="items-center -mt-16 mb-6">
          <Pressable className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white justify-center items-center shadow-md">
            <Feather name="camera" size={28} color="#6B7280" />
          </Pressable>
        </View>

        <View className="px-4 space-y-5">
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

          {/* Running Category */}
          <ReusableDropdown
            label="Running Category"
            selectedValue={runningCategory}
            onValueChange={setRunningCategory}
            placeholder="Select Category"
            options={["5K", "10K", "Half Marathon", "Full Marathon"]}
          />

          {/* Running Style */}
          <View>
            <Text className="text-gray-600 text-sm mb-2">Running Style</Text>
            <View className="flex-row flex-wrap gap-2">
              {["Forefoot", "Midfoot"].map((style) => (
                <SelectionPill
                  key={style}
                  label={style}
                  isSelected={runningStyle === style}
                  onPress={() => setRunningStyle(style)}
                />
              ))}
            </View>
          </View>

          {/* Experience Level */}
          <View>
            <Text className="text-gray-600 text-sm mb-2">Experience Level</Text>
            <View className="flex-row flex-wrap gap-2">
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
            label="Best Finish Time *"
            value={bestFinishTime}
            onChangeText={setBestFinishTime}
            placeholder="HH:MM:SS"
          />

          <ReusableTextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about your running journey..."
            multiline
          />

          {/* Preferences */}
          <View>
            <Text className="text-gray-800 text-lg font-bold mb-2">
              Preferences
            </Text>
            <View className="bg-blue-100 p-4 rounded-lg space-y-2">
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

          <View className="pt-4 items-center">
            <ReusableButton
              title="Complete Profile"
              role="player"
              onPress={handleSubmit}
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

export default CompleteMarathonProfileScreen;
