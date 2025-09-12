// --- FILE: ./src/screens/CreateTeamScreen.tsx ---
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../api/api";
import BottomNavBar from "../../components/BottomNavBar";
import FormImagePicker from "../../components/FormImagePicker";
import FormInput from "../../components/FormInput";
import FormSwitch from "../../components/FormSwitch";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";

const CreateTeamScreen: React.FC = () => {
  const { user } = useAuth();

  const role = "player";
  const type = "team";

  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  // ✅ new dynamic fields
  const [sport, setSport] = useState("cricket");
  const [teamType, setTeamType] = useState("T20");
  const [teamSize, setTeamSize] = useState(11);

  const handleCreateTeam = async () => {
    if (!user?.token) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    const finalLogoUrl =
      logoUrl || "https://placehold.co/128x128/3B82F6/FFFFFF?text=TEAM";

    const formData = {
      name: teamName,
      description,
      location,
      sport,
      teamType,
      teamSize,
      code: teamCode,
      logoUrl: finalLogoUrl,
      isActive,
    };

    console.log("📤 Sending team data:", JSON.stringify(formData, null, 2));

    try {
      const response = await api.post("/team", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      console.log("✅ Team created successfully:", response.data);
      Alert.alert("Success", "Your team has been created!");
      router.push("/team/Myteam");
    } catch (error: any) {
      console.error(
        "❌ Error creating team:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          JSON.stringify(error.response?.data) ||
          "Failed to create team. Please try again."
      );
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

          {/* ✅ new inputs */}
          <FormInput
            label="Sport"
            value={sport}
            onChangeText={setSport}
            placeholder="e.g., cricket"
          />

          <FormInput
            label="Team Type"
            value={teamType}
            onChangeText={setTeamType}
            placeholder="e.g., T20"
          />

          <FormInput
            label="Team Size"
            value={String(teamSize)}
            onChangeText={(val) => setTeamSize(Number(val))}
            placeholder="e.g., 11"
            keyboardType="numeric"
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
