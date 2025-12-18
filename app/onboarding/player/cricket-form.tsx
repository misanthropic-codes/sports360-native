import ReusableButton from "@/components/button";
import CheckboxItem from "@/components/CheckBoxItem";
import ReusableDropdown from "@/components/dropdown";
import FormImagePicker from "@/components/FormImagePicker";
import SelectionPill from "@/components/SelelctionPill";
import ReusableTextInput from "@/components/TextInput";
import { router } from "expo-router";
import api from "../../../api/api";

import { Ionicons } from '@expo/vector-icons';
import React, { FC, useState } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import { playerColors } from '@/constants/colors';
import { useAuth } from "@/context/AuthContext";
import { ImagePickerResult } from "@/utils/imageUtils";
import * as Location from 'expo-location';

const CompleteProfileScreen: FC = () => {
  const { token, user, updateUser } = useAuth();
  const userId = user?.id;

  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [bio, setBio] = useState("");
  const [battingStyle, setBattingStyle] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [playingPosition, setPlayingPosition] = useState<string | null>(null);
  const [bowlingStyle, setBowlingStyle] = useState<string | null>(null);
  
  // Image state
  const [profileImage, setProfileImage] = useState<ImagePickerResult | null>(null);
  
  const [prefs, setPrefs] = useState({
    team: true,
    captain: false,
    tournament: true,
  });

  const handleImagePicked = (result: ImagePickerResult) => {
    setProfileImage(result);
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    // Validation
    if (!playingPosition) {
      Alert.alert("Validation Error", "Please select a playing position");
      return;
    }

    if (!experience) {
      Alert.alert("Validation Error", "Please select your experience level");
      return;
    }

    // Map UI values to backend enum values
    const playingPositionMap: Record<string, string> = {
      "Batsman": "batsman",
      "Bowler": "bowler",
      "All-Rounder": "allrounder",
      "Wicket Keeper": "wicket_keeper",
    };

    const battingStyleMap: Record<string, string> = {
      "Right Handed": "right_handed",
      "Left Handed": "left_handed",
    };

    const bowlingStyleMap: Record<string, string> = {
      "Right Arm Fast": "right_arm_fast",
      "Right Arm Medium": "right_arm_medium",
      "Right Arm Spin": "right_arm_spin",
      "Left Arm Fast": "left_arm_fast",
      "Left Arm Medium": "left_arm_medium",
      "Left Arm Spin": "left_arm_spin",
    };

    const experienceLevelMap: Record<string, string> = {
      "Beginner": "beginner",
      "Intermediate": "intermediate",
      "Professional": "professional",
    };

    // Prepare payload with properly mapped values
    const payload = {
      playingPosition: playingPositionMap[playingPosition] || playingPosition.toLowerCase(),
      bowlingStyle: bowlingStyle ? bowlingStyleMap[bowlingStyle] : "",
      battingStyle: battingStyle ? battingStyleMap[battingStyle] : "",
      experienceLevel: experienceLevelMap[experience] || experience.toLowerCase(),
      location: location,
      bio: bio,
      profilePicUrl: profileImage?.apiUrl || "https://example.com/profile.jpg",
      availableForTeamSelection: prefs.team,
      availableForCaptain: prefs.captain,
      receiveTournamentNotifications: prefs.tournament,
    };

    console.log("📤 Submitting cricket profile:", payload);

    try {
      const response = await api.post("/user/cricket-profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        // Update user object with cricket domain
        await updateUser({ domains: ["cricket"] });

        Alert.alert(
          "Success", 
          "Profile created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to cricket dashboard
                router.replace("/dashboard/player/cricket" as any);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("❌ Cricket profile error:", error);
      Alert.alert("Error", "Something went wrong while submitting profile");
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location permissions to use this feature'
        );
        setLoadingLocation(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address && address.length > 0) {
        const { city, region, country } = address[0];
        const locationString = [city, region, country].filter(Boolean).join(', ');
        setLocation(locationString);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location');
    } finally {
      setLoadingLocation(false);
    }
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
        backgroundColor={playerColors.primary}
        translucent={false}
      />

      {/* Header */}
      <View className="px-5 py-4 bg-blue-600">
        <View className="flex-row items-center justify-center">
          <Text className="text-white text-xl font-rubikBold">
            Complete Your Profile
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="mt-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white/90 font-rubikMedium text-sm">Step 2 of 2</Text>
            <Text className="text-white/90 font-rubikMedium text-sm">100%</Text>
          </View>
          <View className="w-full bg-white/30 rounded-full h-2">
            <View className="bg-white h-2 rounded-full w-full" />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              className="bg-gray-50 flex-1"
              style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Profile Picture Section */}
              <View className="items-center mb-6">
                <View className="bg-white p-6 rounded-2xl shadow-sm w-full items-center border border-gray-100">
                  <FormImagePicker
                    label=""
                    onImagePicked={handleImagePicked}
                    imageUrl={profileImage?.localUri || null}
                    category="profile"
                  />
                  <Text className="text-gray-600 text-sm mt-3 font-rubikMedium">
                    Add Profile Picture
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">
                    JPG or PNG, max 5MB
                  </Text>
                </View>
              </View>

              {/* Player Details Section */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="person" size={20} color={playerColors.primary} />
                  <Text className="text-gray-800 text-lg font-rubikBold ml-2">
                    Player Details
                  </Text>
                </View>
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  {/* Playing Position */}
                  <View className="mb-4">
                    <Text className="text-gray-700 text-sm mb-2 font-rubikMedium">
                      Playing Position *
                    </Text>
                    <ReusableDropdown
                      selectedValue={playingPosition}
                      onValueChange={setPlayingPosition}
                      placeholder="Select Position"
                      options={["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"]}
                    />
                  </View>

                  {/* Experience Level */}
                  <View>
                    <Text className="text-gray-700 text-sm mb-2 font-rubikMedium">
                      Experience Level *
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {["Beginner", "Intermediate", "Professional"].map((level) => (
                        <SelectionPill
                          key={level}
                          label={level}
                          isSelected={experience === level}
                          onPress={() => setExperience(level)}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Skills Section */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="trophy" size={20} color={playerColors.primary} />
                  <Text className="text-gray-800 text-lg font-rubikBold ml-2">
                    Skills
                  </Text>
                </View>
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  {/* Batting Style */}
                  <View className="mb-4">
                    <Text className="text-gray-700 text-sm mb-2 font-rubikMedium">
                      Batting Style
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {["Right Handed", "Left Handed"].map((style) => (
                        <SelectionPill
                          key={style}
                          label={style}
                          isSelected={battingStyle === style}
                          onPress={() => setBattingStyle(style)}
                        />
                      ))}
                    </View>
                  </View>

                  {/* Bowling Style */}
                  <View>
                    <Text className="text-gray-700 text-sm mb-2 font-rubikMedium">
                      Bowling Style
                    </Text>
                    <ReusableDropdown
                      selectedValue={bowlingStyle}
                      onValueChange={setBowlingStyle}
                      placeholder="Select Bowling Style"
                      options={[
                        "Right Arm Fast",
                        "Right Arm Medium",
                        "Right Arm Spin",
                        "Left Arm Fast",
                        "Left Arm Medium",
                        "Left Arm Spin"
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* About You Section */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle" size={20} color={playerColors.primary} />
                  <Text className="text-gray-800 text-lg font-rubikBold ml-2">
                    About You
                  </Text>
                </View>
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  {/* Location */}
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-700 text-sm font-rubikMedium">Location</Text>
                      <TouchableWithoutFeedback onPress={getCurrentLocation}>
                        <View className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-lg">
                          {loadingLocation ? (
                            <View className="w-4 h-4">
                              <View className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                            </View>
                          ) : (
                            <Ionicons name="location" size={14} color={playerColors.primary} />
                          )}
                          <Text className="text-blue-600 text-xs font-rubikMedium ml-1">
                            {loadingLocation ? 'Getting...' : 'Use Current'}
                          </Text>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                    <ReusableTextInput
                      label=""
                      value={location}
                      onChangeText={setLocation}
                      placeholder="e.g. Mumbai, India"
                    />
                  </View>

                  {/* Bio */}
                  <ReusableTextInput
                    label="Bio"
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us about yourself..."
                    multiline
                  />
                </View>
              </View>

              {/* Preferences Section */}
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="settings" size={20} color={playerColors.primary} />
                  <Text className="text-gray-800 text-lg font-rubikBold ml-2">
                    Preferences
                  </Text>
                </View>
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <CheckboxItem
                    label="Available for team selection"
                    isChecked={prefs.team}
                    onPress={() => setPrefs({ ...prefs, team: !prefs.team })}
                  />
                  <View className="h-3" />
                  <CheckboxItem
                    label="Available for captain roles"
                    isChecked={prefs.captain}
                    onPress={() => setPrefs({ ...prefs, captain: !prefs.captain })}
                  />
                  <View className="h-3" />
                  <CheckboxItem
                    label="Receive Tournament Notifications"
                    isChecked={prefs.tournament}
                    onPress={() =>
                      setPrefs({ ...prefs, tournament: !prefs.tournament })
                    }
                  />
                </View>
              </View>

              {/* Submit Button */}
              <View className="pt-2 items-center">
                <ReusableButton
                  title="Complete Profile"
                  role="player"
                  onPress={handleSubmit}
                />
                <Text className="text-gray-500 text-xs mt-3 text-center font-rubik">
                  You can update your profile anytime in settings
                </Text>
              </View>
            </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
