import FormDropdown from "@/components/FormDropdown";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Header from "@/components/Header";
import ReusableButton from "@/components/button";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import React, { useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
// @ts-ignore - DateTimePicker types might not be available
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

type DateTimePickerEvent = any;

const statusOptions = ["upcoming", "ongoing", "completed"];
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

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

const CreateTournament: React.FC = () => {
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

  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showStartTimePicker, setShowStartTimePicker] =
    useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);

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
    if (loading) return; // prevent double click
    setLoading(true);

    console.log("▶️ handleSubmit called");

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
        Alert.alert("Error", "You must be logged in to create a tournament");
        setLoading(false);
        return;
      }

      if (!BASE_URL) {
        Alert.alert("Error", "BASE_URL is not defined in .env");
        setLoading(false);
        return;
      }

      console.log("🌍 BASE_URL:", BASE_URL);
      console.log("📤 Payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/api/v1/tournament/create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      console.log("✅ API Response:", response.data);
      Alert.alert("Success", "Tournament Created Successfully!");

      // ✅ navigate using expo-router
      router.push({
        pathname: "/tournament/ViewTournament",
        params: { tournamentId: response.data?.id },
      });
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
    console.log("Back Pressed");
    navigation.goBack();
  };

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
          title="Create Tournament"
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

          {/* Start Date Row */}
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

          {/* End Date Row */}
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
            title={loading ? "Creating..." : "Create Tournament"}
            onPress={handleSubmit}
            role="organizer"
            className="my-4"
            disabled={loading}
          />
        </ScrollView>

        {/* Date Time Pickers */}
        {/* Start Date Picker */}
        {Platform.OS === "ios" && showStartDatePicker && (
          <Modal transparent={true} animationType="slide" visible={showStartDatePicker}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row justify-between items-center px-5 py-3 border-b border-gray-200">
                  <Text className="font-semibold text-lg text-gray-800">Select Start Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(false)}
                    className="bg-purple-600 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  display="spinner"
                  onChange={onStartDateChange}
                  minimumDate={new Date()}
                  textColor="#000000"
                />
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS === "android" && showStartDatePicker && (
          <DateTimePicker
            value={formData.startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Start Time Picker */}
        {Platform.OS === "ios" && showStartTimePicker && (
          <Modal transparent={true} animationType="slide" visible={showStartTimePicker}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row justify-between items-center px-5 py-3 border-b border-gray-200">
                  <Text className="font-semibold text-lg text-gray-800">Select Start Time</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartTimePicker(false)}
                    className="bg-purple-600 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={formData.startDate}
                  mode="time"
                  display="spinner"
                  onChange={onStartTimeChange}
                  textColor="#000000"
                />
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS === "android" && showStartTimePicker && (
          <DateTimePicker
            value={formData.startDate}
            mode="time"
            display="default"
            onChange={onStartTimeChange}
          />
        )}

        {/* End Date Picker */}
        {Platform.OS === "ios" && showEndDatePicker && (
          <Modal transparent={true} animationType="slide" visible={showEndDatePicker}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row justify-between items-center px-5 py-3 border-b border-gray-200">
                  <Text className="font-semibold text-lg text-gray-800">Select End Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(false)}
                    className="bg-purple-600 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={formData.endDate}
                  mode="date"
                  display="spinner"
                  onChange={onEndDateChange}
                  minimumDate={formData.startDate}
                  textColor="#000000"
                />
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS === "android" && showEndDatePicker && (
          <DateTimePicker
            value={formData.endDate}
            mode="date"
            display="default"
            onChange={onEndDateChange}
            minimumDate={formData.startDate}
          />
        )}

        {/* End Time Picker */}
        {Platform.OS === "ios" && showEndTimePicker && (
          <Modal transparent={true} animationType="slide" visible={showEndTimePicker}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row justify-between items-center px-5 py-3 border-b border-gray-200">
                  <Text className="font-semibold text-lg text-gray-800">Select End Time</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndTimePicker(false)}
                    className="bg-purple-600 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={formData.endDate}
                  mode="time"
                  display="spinner"
                  onChange={onEndTimeChange}
                  textColor="#000000"
                />
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS === "android" && showEndTimePicker && (
          <DateTimePicker
            value={formData.endDate}
            mode="time"
            display="default"
            onChange={onEndTimeChange}
          />
        )}
      </SafeAreaView>
    </>
  );
};

export default CreateTournament;
