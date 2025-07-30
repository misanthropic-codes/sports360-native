import ReusableButton from "@/app/components/button";
import ReusableDropdown from "@/app/components/dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { FC, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

// Reusable Subcomponents
const FormInput = ({ label, isOptional, children, ...props }: any) => (
  <View className="mb-4">
    <Text className="text-sm text-gray-600 mb-2">
      {label} {isOptional && <Text className="text-gray-400">(optional)</Text>}
    </Text>
    <View className="flex-row items-center">
      <TextInput
        className={`flex-1 bg-white border border-gray-300 rounded-lg p-4 text-base ${props.multiline ? "h-24" : ""}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {children}
    </View>
  </View>
);

const SelectableButton = ({ label, onPress, isSelected }: any) => (
  <Pressable
    onPress={onPress}
    className={`py-3 px-5 rounded-full border ${isSelected ? "bg-blue-100 border-blue-500" : "bg-white border-gray-300"}`}
  >
    <Text
      className={`text-base font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}
    >
      {label}
    </Text>
  </Pressable>
);

const PreferenceCheckbox = ({ label, isSelected, onPress }: any) => (
  <Pressable onPress={onPress} className="flex-row items-center py-2">
    <View
      className={`w-6 h-6 rounded-full border-2 mr-3 justify-center items-center ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}
    >
      {isSelected && <View className="w-3 h-3 rounded-full bg-white" />}
    </View>
    <Text className="text-base text-gray-700">{label}</Text>
  </Pressable>
);

const CompleteMarathonProfileScreen: FC = () => {
  // State for marathon runner profile
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
      const formatted = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
      setDob(formatted);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 flex-row items-center bg-white border-b border-gray-200">
        <Pressable>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-black text-xl font-bold ml-4">
          Complete Your Profile
        </Text>
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
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
          <FormInput
            label="Enter full name *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. John Doe"
          />

          <FormInput
            label="Date of Birth *"
            value={dob}
            placeholder="DD/MM/YYYY"
            editable={false}
          >
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="-ml-10"
            >
              <Ionicons name="calendar" size={24} color="#9CA3AF" />
            </Pressable>
          </FormInput>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">
              Running Category *
            </Text>
            <ReusableDropdown
              selectedValue={runningCategory}
              onValueChange={setRunningCategory}
              placeholder="Select Category"
              options={["5K", "10K", "Half Marathon", "Full Marathon"]}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Running Style *</Text>
            <View className="flex-row space-x-4">
              {["Forefoot", "Midfoot"].map((style) => (
                <SelectableButton
                  key={style}
                  label={style}
                  isSelected={runningStyle === style}
                  onPress={() => setRunningStyle(style)}
                />
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">
              Experience level *
            </Text>
            {/* Layout adjusted to stack buttons vertically */}
            <View className="flex-col items-start space-y-3">
              {["Beginner", "Intermediate", "Advanced"].map((level) => (
                <SelectableButton
                  key={level}
                  label={level}
                  isSelected={experience === level}
                  onPress={() => setExperience(level)}
                />
              ))}
            </View>
          </View>

          <FormInput
            label="Best Finish Time *"
            value={bestFinishTime}
            onChangeText={setBestFinishTime}
            placeholder="HH:MM:SS"
          />

          <FormInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about your running journey..."
            isOptional
            multiline
          />

          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">Preferences</Text>
            <View className="bg-blue-50 p-4 rounded-lg">
              <PreferenceCheckbox
                label="Available for team selection"
                isSelected={prefs.team}
                onPress={() => setPrefs({ ...prefs, team: !prefs.team })}
              />
              <PreferenceCheckbox
                label="Available for captain roles"
                isSelected={prefs.captain}
                onPress={() => setPrefs({ ...prefs, captain: !prefs.captain })}
              />
              <PreferenceCheckbox
                label="Receive Tournament Notifications"
                isSelected={prefs.tournament}
                onPress={() =>
                  setPrefs({ ...prefs, tournament: !prefs.tournament })
                }
              />
            </View>
          </View>

          <ReusableButton
            title="Complete Profile"
            onPress={() => console.log("Marathon Profile Submitted!")}
          />

          <Text className="text-center text-xs text-gray-500 mt-4">
            You can update your profile anytime in the settings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompleteMarathonProfileScreen;
