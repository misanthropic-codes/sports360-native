import { getTournamentById, updateTournament } from "@/api/tournamentApi";
import FormDropdown from "@/components/FormDropdown";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Header from "@/components/Header";
import ReusableButton from "@/components/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";

type DateTimePickerEvent = any;

const statusOptions = ["upcoming", "ongoing", "completed"];

interface FormData {
  name: string;
  description: string;
  location: string;
  bannerImageUrl: string;
  teamSize: string;
  teamCount: string;
  prizePool: string;
  status: string;
  startDate: Date;
  endDate: Date;
}

const EditTournament: React.FC = () => {
  const { tournamentId } = useLocalSearchParams();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    location: "",
    bannerImageUrl: "",
    teamSize: "",
    teamCount: "",
    prizePool: "",
    status: "upcoming",
    startDate: new Date(),
    endDate: new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showStartTimePicker, setShowStartTimePicker] =
    useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);

  // Fetch tournament data
  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) return;

      try {
        const tournament = await getTournamentById(tournamentId as string);
        if (tournament) {
          setFormData({
            name: tournament.name || "",
            description: tournament.description || "",
            location: tournament.location || "",
            bannerImageUrl: tournament.bannerImageUrl || "",
            teamSize: tournament.teamSize?.toString() || "",
            teamCount: tournament.teamCount?.toString() || "",
            prizePool: tournament.prizePool?.toString() || "",
            status: tournament.status || "upcoming",
            startDate: tournament.startDate ? new Date(tournament.startDate) : new Date(),
            endDate: tournament.endDate ? new Date(tournament.endDate) : new Date(),
          });
        }
      } catch (error) {
        console.error("Failed to fetch tournament:", error);
        Alert.alert("Error", "Failed to load tournament data");
      } finally {
        setFetchingData(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | Date
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDateTimeForAPI = (date: Date): string => {
    return date.toISOString();
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeForDisplay = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ): void => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const currentStartDate = formData.startDate;
      const newDate = new Date(selectedDate);
      newDate.setHours(currentStartDate.getHours());
      newDate.setMinutes(currentStartDate.getMinutes());
      handleInputChange("startDate", newDate);
    }
  };

  const onStartTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ): void => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const currentStartDate = formData.startDate;
      const newDate = new Date(currentStartDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      handleInputChange("startDate", newDate);
    }
  };

  const onEndDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ): void => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const currentEndDate = formData.endDate;
      const newDate = new Date(selectedDate);
      newDate.setHours(currentEndDate.getHours());
      newDate.setMinutes(currentEndDate.getMinutes());
      handleInputChange("endDate", newDate);
    }
  };

  const onEndTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ): void => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const currentEndDate = formData.endDate;
      const newDate = new Date(currentEndDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      handleInputChange("endDate", newDate);
    }
  };

  const validateForm = (): string | null => {
    const {
      name,
      description,
      location,
      bannerImageUrl,
      teamSize,
      teamCount,
      prizePool,
      status,
    } = formData;

    if (!name) return "Tournament Name is required";
    if (!description) return "Description is required";
    if (!location) return "Location is required";
    if (!bannerImageUrl) return "Banner Image URL is required";
    if (!teamSize || isNaN(Number(teamSize)))
      return "Team Size must be a number";
    if (!teamCount || isNaN(Number(teamCount)))
      return "Team Count must be a number";
    if (!prizePool || isNaN(Number(prizePool)))
      return "Prize Pool must be a number";
    if (!status) return "Status is required";
    if (formData.startDate >= formData.endDate)
      return "End date must be after start date";

    return null;
  };

  const handleSubmit = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);

    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      teamSize: Number(formData.teamSize),
      teamCount: Number(formData.teamCount),
      prizePool: Number(formData.prizePool),
      startDate: formatDateTimeForAPI(formData.startDate),
      endDate: formatDateTimeForAPI(formData.endDate),
    };

    try {
      if (!user?.token) {
        Alert.alert("Error", "You must be logged in to edit a tournament");
        setLoading(false);
        return;
      }

      if (!tournamentId) {
        Alert.alert("Error", "Tournament ID is missing");
        setLoading(false);
        return;
      }

      await updateTournament(tournamentId as string, payload, user.token);

      Alert.alert("Success", "Tournament Updated Successfully!");
      router.back();
    } catch (err: unknown) {
      const error = err as any;
      console.error(
        "❌ API Error:",
        error.response?.data || error.message || error
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = (): void => {
    navigation.goBack();
  };

  if (fetchingData) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-gray-600">Loading tournament...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6366f1"
        translucent={false}
      />

      <SafeAreaView
        className="flex-1 bg-slate-50"
        style={{
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
        }}
      >
        <Header
          title="Edit Tournament"
          showBackButton={true}
          onBackPress={handleBackPress}
          rightComponent={
            <TouchableOpacity>
              <Text className="text-white font-bold text-base">Tags</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        >
          <FormSection title="Basic Information" />

          <FormInput
            label="Tournament Name*"
            placeholder="Enter tournament name"
            value={formData.name}
            onChangeText={(val: string) => handleInputChange("name", val)}
          />

          <FormInput
            label="Short Description*"
            placeholder="Enter short description..."
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(val: string) =>
              handleInputChange("description", val)
            }
            style={{ height: 100, textAlignVertical: "top" }}
          />

          <FormSection title="Schedule" />

          {/* Date Time Pickers - Same as Create */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Start Date *</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="w-[48%] bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text className="text-gray-900">
                  {formatDateForDisplay(formData.startDate)}
                </Text>
                <Text className="text-gray-400">📅</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-[48%] bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text className="text-gray-900">
                  {formatTimeForDisplay(formData.startDate)}
                </Text>
                <Text className="text-gray-400">🕐</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">End Date *</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="w-[48%] bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text className="text-gray-900">
                  {formatDateForDisplay(formData.endDate)}
                </Text>
                <Text className="text-gray-400">📅</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-[48%] bg-white border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text className="text-gray-900">
                  {formatTimeForDisplay(formData.endDate)}
                </Text>
                <Text className="text-gray-400">🕐</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FormSection title="Location & Venue" />

          <FormInput
            label="City*"
            placeholder="Enter city"
            value={formData.location}
            onChangeText={(val: string) => handleInputChange("location", val)}
          />
          <FormInput
            label="Banner Image URL*"
            placeholder="Enter banner image link"
            value={formData.bannerImageUrl}
            onChangeText={(val: string) =>
              handleInputChange("bannerImageUrl", val)
            }
            keyboardType="url"
          />

          <View className="flex-row justify-between mb-4">
            <View className="w-[48%]">
              <FormInput
                label="Team Size*"
                placeholder="e.g. 11"
                value={formData.teamSize}
                onChangeText={(val: string) =>
                  handleInputChange("teamSize", val)
                }
                keyboardType="numeric"
              />
            </View>
            <View className="w-[48%]">
              <FormInput
                label="Team Count*"
                placeholder="e.g. 16"
                value={formData.teamCount}
                onChangeText={(val: string) =>
                  handleInputChange("teamCount", val)
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <FormInput
            label="Prize Pool*"
            placeholder="Enter prize pool"
            value={formData.prizePool}
            onChangeText={(val: string) => handleInputChange("prizePool", val)}
            keyboardType="numeric"
          />

          <FormDropdown
            label="Status"
            placeholder="Select status"
            options={statusOptions}
            selectedValue={formData.status}
            onValueChange={(val: string) => handleInputChange("status", val)}
          />

          <ReusableButton
            title={loading ? "Updating..." : "Update Tournament"}
            onPress={handleSubmit}
            role="organizer"
            className="my-4"
            disabled={loading}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default EditTournament;
