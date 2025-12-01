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
import FormDropdown from "../../components/FormDropdown";
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

  // Validation errors
  const [errors, setErrors] = useState<{
    teamName?: string;
    description?: string;
    location?: string;
    teamCode?: string;
    sport?: string;
    teamType?: string;
    teamSize?: string;
  }>({});

  // Track which fields have been touched
  const [touched, setTouched] = useState<{
    teamName?: boolean;
    description?: boolean;
    location?: boolean;
    teamCode?: boolean;
    sport?: boolean;
    teamType?: boolean;
    teamSize?: boolean;
  }>({});

  // Track if user has attempted to submit
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Get team type options based on selected sport
  const getTeamTypeOptions = (): string[] => {
    if (sport === "cricket") {
      return ["T20", "ODI", "Test"];
    } else if (sport === "marathon") {
      return ["5K", "10K", "Half Marathon", "Full Marathon"];
    }
    return [];
  };

  // Get valid team types for current sport
  const getValidTeamTypes = (): string[] => {
    return getTeamTypeOptions();
  };

  // Validate individual field
  const validateField = (field: string, value: any): string | undefined => {
    switch (field) {
      case "teamName":
        if (!value || value.trim().length === 0) {
          return "Team name is required";
        }
        if (value.trim().length < 3) {
          return "Team name must be at least 3 characters";
        }
        if (value.trim().length > 50) {
          return "Team name must be less than 50 characters";
        }
        break;

      case "description":
        if (!value || value.trim().length === 0) {
          return "Description is required";
        }
        if (value.trim().length < 10) {
          return "Description must be at least 10 characters";
        }
        break;

      case "location":
        if (!value || value.trim().length === 0) {
          return "Location is required";
        }
        break;

      case "teamCode":
        if (!value || value.trim().length === 0) {
          return "Team code is required";
        }
        if (value.trim().length < 5) {
          return "Code must be longer than or equal to 5 characters";
        }
        if (!/^[A-Z0-9]{5,10}$/.test(value.trim())) {
          return "Team code must be 5-10 uppercase letters/numbers";
        }
        break;

      case "sport":
        if (!value || value.trim().length === 0) {
          return "Sport is required";
        }
        if (value !== "cricket" && value !== "marathon") {
          return "Sport must be one of the following values: cricket, marathon";
        }
        break;

      case "teamType":
        if (!value || value.trim().length === 0) {
          return "Team type is required";
        }
        // Validate based on sport
        const validTypes =
          sport === "cricket"
            ? ["T20", "ODI", "Test"]
            : sport === "marathon"
              ? ["5K", "10K", "Half Marathon", "Full Marathon"]
              : [];

        if (!validTypes.includes(value)) {
          const sportName = sport.charAt(0).toUpperCase() + sport.slice(1);
          return `For ${sportName}, team type must be one of: ${validTypes.join(", ")}`;
        }
        break;

      case "teamSize":
        const size = Number(value);
        if (isNaN(size) || !Number.isInteger(size)) {
          return "Team size must be a whole number";
        }
        if (size < 1) {
          return "Team size must be at least 1";
        }
        if (size > 100) {
          return "Team size must be less than 100";
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    newErrors.teamName = validateField("teamName", teamName);
    newErrors.description = validateField("description", description);
    newErrors.location = validateField("location", location);
    newErrors.teamCode = validateField("teamCode", teamCode);
    newErrors.sport = validateField("sport", sport);
    newErrors.teamType = validateField("teamType", teamType);
    newErrors.teamSize = validateField("teamSize", teamSize);

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  // Check if form is valid (for button disable state)
  const isFormValid = (): boolean => {
    return (
      teamName.trim().length >= 3 &&
      description.trim().length >= 10 &&
      location.trim().length > 0 &&
      teamCode.trim().length >= 5 &&
      /^[A-Z0-9]{5,10}$/.test(teamCode.trim()) &&
      sport.trim().length > 0 &&
      teamType.trim().length > 0 &&
      !isNaN(Number(teamSize)) &&
      Number(teamSize) >= 1 &&
      Number(teamSize) <= 100
    );
  };

  // Get list of current validation errors
  const getValidationErrors = (): string[] => {
    const errorMessages: string[] = [];

    const teamNameError = validateField("teamName", teamName);
    if (teamNameError) errorMessages.push(`• ${teamNameError}`);

    const descriptionError = validateField("description", description);
    if (descriptionError) errorMessages.push(`• ${descriptionError}`);

    const locationError = validateField("location", location);
    if (locationError) errorMessages.push(`• ${locationError}`);

    const teamCodeError = validateField("teamCode", teamCode);
    if (teamCodeError) errorMessages.push(`• ${teamCodeError}`);

    const sportError = validateField("sport", sport);
    if (sportError) errorMessages.push(`• ${sportError}`);

    const teamTypeError = validateField("teamType", teamType);
    if (teamTypeError) errorMessages.push(`• ${teamTypeError}`);

    const teamSizeError = validateField("teamSize", teamSize);
    if (teamSizeError) errorMessages.push(`• ${teamSizeError}`);

    return errorMessages;
  };

  const handleCreateTeam = async () => {
    setAttemptedSubmit(true);

    // Validate form before submission
    if (!validateForm()) {
      const errorMessages = getValidationErrors();
      Alert.alert(
        "Validation Errors",
        `Please fix the following errors:\n\n${errorMessages.join("\n")}`
      );
      return;
    }

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
      const response = await api.post("/team/create", formData, {
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

          <View>
            <FormInput
              label="Team Name *"
              value={teamName}
              onChangeText={(text) => {
                setTeamName(text);
                setTouched((prev) => ({ ...prev, teamName: true }));
                setErrors((prev) => ({
                  ...prev,
                  teamName: validateField("teamName", text),
                }));
              }}
              placeholder="e.g., Chennai Super Kings"
              style={
                (touched.teamName || attemptedSubmit) && errors.teamName
                  ? { borderColor: "#EF4444", borderWidth: 2 }
                  : {}
              }
            />
            {(touched.teamName || attemptedSubmit) && errors.teamName && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                ⚠️ {errors.teamName}
              </Text>
            )}
          </View>

          <View>
            <FormInput
              label="Description *"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setTouched((prev) => ({ ...prev, description: true }));
                setErrors((prev) => ({
                  ...prev,
                  description: validateField("description", text),
                }));
              }}
              placeholder="A short description of your team"
              multiline
              numberOfLines={3}
              style={{
                height: 100,
                textAlignVertical: "top",
                ...((touched.description || attemptedSubmit) &&
                errors.description
                  ? { borderColor: "#EF4444", borderWidth: 2 }
                  : {}),
              }}
            />
            {(touched.description || attemptedSubmit) && errors.description && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                ⚠️ {errors.description}
              </Text>
            )}
          </View>

          <View>
            <FormInput
              label="Location *"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setTouched((prev) => ({ ...prev, location: true }));
                setErrors((prev) => ({
                  ...prev,
                  location: validateField("location", text),
                }));
              }}
              placeholder="e.g., Hyderabad"
              style={
                (touched.location || attemptedSubmit) && errors.location
                  ? { borderColor: "#EF4444", borderWidth: 2 }
                  : {}
              }
            />
            {(touched.location || attemptedSubmit) && errors.location && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                ⚠️ {errors.location}
              </Text>
            )}
          </View>

          <View>
            <FormInput
              label="Team Code *"
              value={teamCode}
              onChangeText={(text) => {
                const upperText = text.toUpperCase();
                setTeamCode(upperText);
                setTouched((prev) => ({ ...prev, teamCode: true }));
                setErrors((prev) => ({
                  ...prev,
                  teamCode: validateField("teamCode", upperText),
                }));
              }}
              placeholder="e.g., CSK2024 (min 5 chars)"
              autoCapitalize="characters"
              style={
                (touched.teamCode || attemptedSubmit) && errors.teamCode
                  ? { borderColor: "#EF4444", borderWidth: 2 }
                  : {}
              }
            />
            {(touched.teamCode || attemptedSubmit) && errors.teamCode && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                ⚠️ {errors.teamCode}
              </Text>
            )}
          </View>

          {/* ✅ new inputs */}
          <View>
            <FormDropdown
              label="Sport *"
              options={["cricket", "marathon"]}
              selectedValue={sport}
              onValueChange={(value) => {
                setSport(value);
                setTouched((prev) => ({ ...prev, sport: true }));
                // Reset team type when sport changes
                const newOptions =
                  value === "cricket"
                    ? ["T20", "ODI", "Test"]
                    : ["5K", "10K", "Half Marathon", "Full Marathon"];
                // Set default team type for the new sport
                setTeamType(newOptions[0]);
                setErrors((prev) => ({
                  ...prev,
                  sport: validateField("sport", value),
                  teamType: undefined, // Clear team type error when sport changes
                }));
              }}
              placeholder="Select a sport"
            />
            {(touched.sport || attemptedSubmit) && errors.sport && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                ⚠️ {errors.sport}
              </Text>
            )}
          </View>

          <View>
            <FormDropdown
              label="Team Type *"
              options={getTeamTypeOptions()}
              selectedValue={teamType}
              onValueChange={(value) => {
                setTeamType(value);
                setTouched((prev) => ({ ...prev, teamType: true }));
                setErrors((prev) => ({
                  ...prev,
                  teamType: validateField("teamType", value),
                }));
              }}
              placeholder={`Select team type for ${sport}`}
            />
            {(touched.teamType || attemptedSubmit) && errors.teamType && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                ⚠️ {errors.teamType}
              </Text>
            )}
          </View>

          <View>
            <FormInput
              label="Team Size *"
              value={String(teamSize)}
              onChangeText={(val) => {
                const numVal = val === "" ? "" : Number(val);
                setTeamSize(numVal as number);
                setTouched((prev) => ({ ...prev, teamSize: true }));
                setErrors((prev) => ({
                  ...prev,
                  teamSize: validateField("teamSize", numVal),
                }));
              }}
              placeholder="e.g., 11"
              keyboardType="numeric"
              style={
                (touched.teamSize || attemptedSubmit) && errors.teamSize
                  ? { borderColor: "#EF4444", borderWidth: 2 }
                  : {}
              }
            />
            {(touched.teamSize || attemptedSubmit) && errors.teamSize && (
              <Text className="text-red-500 text-sm mt-1 ml-1">
                ⚠️ {errors.teamSize}
              </Text>
            )}
          </View>

          <FormSwitch
            label="Team is Active"
            value={isActive}
            onValueChange={setIsActive}
          />

          <View className="mt-4">
            <TouchableOpacity
              onPress={handleCreateTeam}
              disabled={!isFormValid()}
              className={`py-4 rounded-xl items-center justify-center shadow-lg ${
                isFormValid() ? "bg-blue-500" : "bg-gray-400"
              }`}
            >
              <Text className="text-white font-bold text-lg">Create Team</Text>
            </TouchableOpacity>
            {!isFormValid() && attemptedSubmit && (
              <View className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Text className="text-red-600 font-semibold mb-1">
                  Please fix the following errors:
                </Text>
                {getValidationErrors().map((error, index) => (
                  <Text key={index} className="text-red-500 text-sm">
                    {error}
                  </Text>
                ))}
              </View>
            )}
            {!isFormValid() && !attemptedSubmit && (
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Please fill all required fields correctly
              </Text>
            )}
          </View>
        </View>
        <View className="h-24" />
      </ScrollView>
      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default CreateTeamScreen;
