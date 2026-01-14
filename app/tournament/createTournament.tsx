import FormDropdown from "@/components/FormDropdown";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Header from "@/components/Header";
import ReusableButton from "@/components/button";
import { organizerColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
// @ts-ignore - DateTimePicker types might not be available
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";

type DateTimePickerEvent = any;

const statusOptions = ["Upcoming", "Ongoing", "Completed"];
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// Hardcoded banner images for selection
const BANNER_OPTIONS = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
    label: "Cricket Stadium",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
    label: "Cricket Match",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800",
    label: "Cricket Ball",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800",
    label: "Trophy",
  },
];

interface FormData {
  name: string;
  description: string;
  location: string;
  bannerImageUrl: string;
  teamSize: string;
  playingSquadSize: string;
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
    bannerImageUrl: BANNER_OPTIONS[0].url,
    teamSize: "",
    playingSquadSize: "",
    teamCount: "",
    prizePool: "",
    status: "Upcoming",
    startDate: new Date(),
    endDate: new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeForDisplay = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get current location and extract city name
  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location permissions to use this feature"
        );
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address && address.length > 0) {
        const { city, region } = address[0];
        const cityName = city || region || "";
        handleInputChange("location", cityName);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Unable to get your current location");
    } finally {
      setLoadingLocation(false);
    }
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
      playingSquadSize,
      teamCount,
      prizePool,
      status,
    } = formData;

    if (!name) return "Tournament Name is required";
    if (!description) return "Description is required";
    if (!location) return "Location is required";
    if (!bannerImageUrl) return "Banner Image is required";
    if (!teamSize || isNaN(Number(teamSize)))
      return "Team Size must be a number";
    if (!playingSquadSize || isNaN(Number(playingSquadSize)))
      return "Playing Squad Size must be a number";
    if (Number(playingSquadSize) > Number(teamSize))
      return "Playing Squad Size cannot exceed Team Size";
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

    const statusMap: Record<string, string> = {
      Upcoming: "upcoming",
      Ongoing: "ongoing",
      Completed: "completed",
    };

    const payload = {
      ...formData,
      teamSize: Number(formData.teamSize),
      playingSquadSize: Number(formData.playingSquadSize),
      teamCount: Number(formData.teamCount),
      prizePool: Number(formData.prizePool),
      status: statusMap[formData.status] || formData.status.toLowerCase(),
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

      const { useOrganizerTournamentStore } = await import(
        "@/store/organizerTournamentStore"
      );
      const { useTournamentStore } = await import("@/store/tournamentStore");

      const {
        invalidateCache: invalidateOrganizerCache,
        fetchOrganizerTournaments,
      } = useOrganizerTournamentStore.getState();
      const { invalidateCache: invalidateTournamentCache, fetchTournaments } =
        useTournamentStore.getState();

      invalidateOrganizerCache();
      invalidateTournamentCache();

      if (user?.token) {
        await Promise.all([
          fetchOrganizerTournaments(user.token, true),
          fetchTournaments(user.token, true),
        ]);
      }

      Alert.alert("Success", "Tournament created successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/tournament/MyTournaments"),
        },
      ]);
    } catch (err: unknown) {
      const error = err as any;
      console.error("❌ API Error:", error.response?.data || error.message);
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

  const selectBannerImage = (url: string) => {
    handleInputChange("bannerImageUrl", url);
    setShowImagePicker(false);
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={organizerColors.primary}
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
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          {/* Basic Information */}
          <FormSection title="Basic Information" />

          <FormInput
            label="Tournament Name"
            placeholder="e.g., Champions League T20"
            value={formData.name}
            onChangeText={(val: string) => handleInputChange("name", val)}
          />

          <FormInput
            label="Description"
            placeholder="Brief description about the tournament..."
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(val: string) =>
              handleInputChange("description", val)
            }
            style={{ height: 80, textAlignVertical: "top" }}
          />

          {/* Banner Image */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-slate-600 mb-2">
              Banner Image
            </Text>
            <TouchableOpacity
              onPress={() => setShowImagePicker(true)}
              className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden"
              activeOpacity={0.8}
            >
              {formData.bannerImageUrl ? (
                <View className="relative">
                  <Image
                    source={{ uri: formData.bannerImageUrl }}
                    className="w-full h-36"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-2 right-2 bg-white/90 px-3 py-1.5 rounded-full flex-row items-center">
                    <Icon name="images-outline" size={16} color={organizerColors.primary} />
                    <Text className="text-purple-700 font-medium text-sm ml-1">
                      Change
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="h-36 items-center justify-center bg-slate-100">
                  <Icon name="image-outline" size={32} color="#94A3B8" />
                  <Text className="text-slate-500 text-sm mt-2">
                    Tap to select banner image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Schedule */}
          <FormSection title="Schedule" />

          {/* Start Date & Time */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-slate-600 mb-2">
              Start Date & Time
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setShowStartDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text className="text-slate-800 text-sm">
                  {formatDateForDisplay(formData.startDate)}
                </Text>
                <Icon name="calendar-outline" size={18} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setShowStartTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text className="text-slate-800 text-sm">
                  {formatTimeForDisplay(formData.startDate)}
                </Text>
                <Icon name="time-outline" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* End Date & Time */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-slate-600 mb-2">
              End Date & Time
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setShowEndDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text className="text-slate-800 text-sm">
                  {formatDateForDisplay(formData.endDate)}
                </Text>
                <Icon name="calendar-outline" size={18} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setShowEndTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text className="text-slate-800 text-sm">
                  {formatTimeForDisplay(formData.endDate)}
                </Text>
                <Icon name="time-outline" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <FormSection title="Location" />

          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-slate-600">City</Text>
              <TouchableOpacity
                onPress={getCurrentLocation}
                disabled={loadingLocation}
                className="flex-row items-center bg-purple-50 px-3 py-1.5 rounded-full"
                activeOpacity={0.7}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color={organizerColors.primary} />
                ) : (
                  <Icon name="locate" size={14} color={organizerColors.primary} />
                )}
                <Text className="text-purple-700 text-xs font-medium ml-1.5">
                  {loadingLocation ? "Detecting..." : "Use GPS"}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="bg-slate-50 border border-slate-200 rounded-lg flex-row items-center px-4">
              <Icon name="location-outline" size={18} color="#64748B" />
              <TextInput
                className="flex-1 py-3 px-3 text-base text-slate-800"
                placeholder="e.g., Mumbai"
                placeholderTextColor="#94A3B8"
                value={formData.location}
                onChangeText={(val) => handleInputChange("location", val)}
              />
            </View>
          </View>

          {/* Team Configuration */}
          <FormSection title="Team Configuration" />

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-base font-semibold text-slate-600 mb-2">
                Team Size
              </Text>
              <View className="bg-slate-50 border border-slate-200 rounded-lg flex-row items-center px-4">
                <Icon name="people-outline" size={18} color="#64748B" />
                <TextInput
                  className="flex-1 py-3 px-3 text-base text-slate-800"
                  placeholder="18"
                  placeholderTextColor="#94A3B8"
                  value={formData.teamSize}
                  onChangeText={(val) => handleInputChange("teamSize", val)}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-slate-600 mb-2">
                Playing XI
              </Text>
              <View className="bg-slate-50 border border-slate-200 rounded-lg flex-row items-center px-4">
                <Icon name="shirt-outline" size={18} color="#64748B" />
                <TextInput
                  className="flex-1 py-3 px-3 text-base text-slate-800"
                  placeholder="11"
                  placeholderTextColor="#94A3B8"
                  value={formData.playingSquadSize}
                  onChangeText={(val) => handleInputChange("playingSquadSize", val)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-base font-semibold text-slate-600 mb-2">
              Number of Teams
            </Text>
            <View className="bg-slate-50 border border-slate-200 rounded-lg flex-row items-center px-4">
              <Icon name="flag-outline" size={18} color="#64748B" />
              <TextInput
                className="flex-1 py-3 px-3 text-base text-slate-800"
                placeholder="16"
                placeholderTextColor="#94A3B8"
                value={formData.teamCount}
                onChangeText={(val) => handleInputChange("teamCount", val)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Prize & Status */}
          <FormSection title="Prize & Status" />

          <View className="mb-4">
            <Text className="text-base font-semibold text-slate-600 mb-2">
              Prize Pool (₹)
            </Text>
            <View className="bg-slate-50 border border-slate-200 rounded-lg flex-row items-center px-4">
              <Icon name="trophy-outline" size={18} color="#64748B" />
              <TextInput
                className="flex-1 py-3 px-3 text-base text-slate-800"
                placeholder="500000"
                placeholderTextColor="#94A3B8"
                value={formData.prizePool}
                onChangeText={(val) => handleInputChange("prizePool", val)}
                keyboardType="numeric"
              />
            </View>
          </View>

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
            className="mt-6"
            disabled={loading}
          />

          <Text className="text-slate-400 text-xs text-center mt-3 mb-4">
            You can edit tournament details after creation
          </Text>
        </ScrollView>

        {/* Image Picker Modal */}
        <Modal
          transparent={true}
          animationType="slide"
          visible={showImagePicker}
          onRequestClose={() => setShowImagePicker(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setShowImagePicker(false)}
          >
            <View className="flex-1 justify-end">
              <TouchableOpacity activeOpacity={1}>
                <View className="bg-white rounded-t-3xl">
                  <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100">
                    <Text className="font-bold text-lg text-slate-800">
                      Select Banner
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowImagePicker(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
                    >
                      <Icon name="close" size={20} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, gap: 12 }}
                  >
                    {BANNER_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => selectBannerImage(option.url)}
                        className={`rounded-xl overflow-hidden border-2 ${
                          formData.bannerImageUrl === option.url
                            ? "border-purple-600"
                            : "border-slate-200"
                        }`}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: option.url }}
                          className="w-44 h-28"
                          resizeMode="cover"
                        />
                        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3">
                          <Text className="text-white text-xs font-medium">
                            {option.label}
                          </Text>
                        </View>
                        {formData.bannerImageUrl === option.url && (
                          <View className="absolute top-2 right-2 bg-purple-600 rounded-full w-6 h-6 items-center justify-center">
                            <Icon name="checkmark" size={14} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Date Time Pickers */}
        {Platform.OS === "ios" && showStartDatePicker && (
          <Modal transparent animationType="slide" visible={showStartDatePicker}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row justify-between items-center px-5 py-3 border-b border-slate-100">
                  <Text className="font-semibold text-lg text-slate-800">
                    Start Date
                  </Text>
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

        {Platform.OS === "ios" && showStartTimePicker && (
          <Modal transparent animationType="slide" visible={showStartTimePicker}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row justify-between items-center px-5 py-3 border-b border-slate-100">
                  <Text className="font-semibold text-lg text-slate-800">
                    Start Time
                  </Text>
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

        {Platform.OS === "ios" && showEndDatePicker && (
          <Modal transparent animationType="slide" visible={showEndDatePicker}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row justify-between items-center px-5 py-3 border-b border-slate-100">
                  <Text className="font-semibold text-lg text-slate-800">
                    End Date
                  </Text>
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

        {Platform.OS === "ios" && showEndTimePicker && (
          <Modal transparent animationType="slide" visible={showEndTimePicker}>
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl">
                <View className="flex-row justify-between items-center px-5 py-3 border-b border-slate-100">
                  <Text className="font-semibold text-lg text-slate-800">
                    End Time
                  </Text>
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
