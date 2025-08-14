// --- FILE: ./src/screens/CreateTeamScreen.tsx ---
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavBar from "../components/BottomNavBar";
import FormImagePicker from "../components/FormImagePicker";
import FormInput from "../components/FormInput";
import FormSwitch from "../components/FormSwitch";
import Header from "../components/Header";

const CreateTeamScreen: React.FC = () => {
  const role = "player";
  const type = "team";

  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  const handleCreateTeam = async () => {
    // ✅ Ensure logoUrl is never empty or null
    const finalLogoUrl =
      logoUrl || "https://placehold.co/128x128/3B82F6/FFFFFF?text=TEAM";

    const formData = {
      name: teamName,
      description,
      location,
      sport: "cricket",
      teamType: "T20",
      teamSize: 11,
      code: teamCode,
      logoUrl: finalLogoUrl,
      isActive,
    };

    try {
      const baseURL = process.env.EXPO_PUBLIC_BASE_URL;
      if (!baseURL) {
        console.error("Base URL not found in .env");
        Alert.alert("Error", "Base URL not configured.");
        return;
      }

      // 🔑 Get token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You must be logged in to create a team.");
        return;
      }

      console.log(`Sending request to: ${baseURL}/api/v1/team`);
      console.log(`Using Bearer token: ${token}`);

      const response = await axios.post(`${baseURL}/api/v1/team`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Team created successfully:", response.data);
      Alert.alert("Success", "Your team has been created!");

      const route = "/team/CreateTeam";
      console.log(`Navigating to route: ${route}`);
    } catch (error: any) {
      console.error(
        "❌ Error creating team:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to create team. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        type="title"
        title="Create Your Team"
        showBackButton={true}
        onBackPress={() => console.log("Back pressed")}
      />
      <ScrollView>
        <View className="p-4">
          <FormImagePicker
            label="Team Logo"
            imageUrl={logoUrl}
            onSelectImage={() => {
              console.log("Opening image picker...");
              setLogoUrl("https://placehold.co/128x128/3B82F6/FFFFFF?text=CSK");
            }}
          />

          <FormInput
            label="Team Name"
            value={teamName}
            onChangeText={setTeamName}
            placeholder="e.g., Chennai Super Kings"
          />

          <FormInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="A short description of your team"
            multiline
            numberOfLines={3}
            style={{ height: 100, textAlignVertical: "top" }}
          />

          <FormInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Hyderabad"
          />

          <FormInput
            label="Team Code"
            value={teamCode}
            onChangeText={setTeamCode}
            placeholder="A unique code for your team"
            autoCapitalize="characters"
          />

          <FormSwitch
            label="Team is Active"
            value={isActive}
            onValueChange={setIsActive}
          />

          <View className="mt-4">
            <TouchableOpacity
              onPress={handleCreateTeam}
              className="bg-blue-500 py-4 rounded-xl items-center justify-center shadow-lg"
            >
              <Text className="text-white font-bold text-lg">Create Team</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="h-24" />
      </ScrollView>
      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default CreateTeamScreen;
