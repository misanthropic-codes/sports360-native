import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api/api";

type GroundType = "Local Ground" | "Sports Complex" | "Cricket Ground";
type YearsOfOperation = "New" | "1-2 Years" | "3-5 Years" | "5+ Years";
type FacilityType = "Turf Grass" | "Artificial Turf" | "Concrete";
type BookingFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly";

export default function PostGround() {
  const { token } = useAuth();

  // Form state
  const [groundOwnerName, setGroundOwnerName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [groundType, setGroundType] = useState<GroundType | null>(null);
  const [yearsOfOperation, setYearsOfOperation] = useState<YearsOfOperation | null>(null);
  const [primaryLocation, setPrimaryLocation] = useState("");
  const [facilityAvailable, setFacilityAvailable] = useState<FacilityType | null>(null);
  const [bookingFrequency, setBookingFrequency] = useState<BookingFrequency | null>(null);
  const [groundDescription, setGroundDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [tournamentPrice, setTournamentPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [address, setAddress] = useState("");
  
  // Preferences
  const [acceptOnlineBookings, setAcceptOnlineBookings] = useState(true);
  const [allowTournamentsBookings, setAllowTournamentsBookings] = useState(true);
  const [receiveNotifications, setReceiveNotifications] = useState(true);

  const [loading, setLoading] = useState(false);

  // Dropdown visibility
  const [showGroundTypeDropdown, setShowGroundTypeDropdown] = useState(false);
  const [showYearsDropdown, setShowYearsDropdown] = useState(false);
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);

  const groundTypeOptions: GroundType[] = ["Local Ground", "Sports Complex", "Cricket Ground"];
  const yearsOptions: YearsOfOperation[] = ["New", "1-2 Years", "3-5 Years", "5+ Years"];
  const facilityOptions: FacilityType[] = ["Turf Grass", "Artificial Turf", "Concrete"];
  const frequencyOptions: BookingFrequency[] = ["Daily", "Weekly", "Monthly", "Quarterly"];

  const mapToBackend = (value: string): string => {
    const mapping: Record<string, string> = {
      "Local Ground": "local_ground",
      "Sports Complex": "sports_complex",
      "Cricket Ground": "cricket_ground",
      "New": "new",
      "1-2 Years": "1-2_years",
      "3-5 Years": "3-5_years",
      "5+ Years": "5+_years",
      "Turf Grass": "turf_grass",
      "Artificial Turf": "artificial_turf",
      "Concrete": "concrete",
      "Daily": "daily",
      "Weekly": "weekly",
      "Monthly": "monthly",
      "Quarterly": "quarterly",
    };
    return mapping[value] || value.toLowerCase();
  };

  const handleSubmit = async () => {
    // Validation
    if (!groundOwnerName.trim()) {
      Alert.alert("Validation Error", "Please enter ground owner name");
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert("Validation Error", "Please enter owner name");
      return;
    }
    if (!groundType) {
      Alert.alert("Validation Error", "Please select ground type");
      return;
    }
    if (!yearsOfOperation) {
      Alert.alert("Validation Error", "Please select years of operation");
      return;
    }
    if (!primaryLocation.trim()) {
      Alert.alert("Validation Error", "Please enter primary location");
      return;
    }
    if (!facilityAvailable) {
      Alert.alert("Validation Error", "Please select facility type");
      return;
    }
    if (!bookingFrequency) {
      Alert.alert("Validation Error", "Please select booking frequency");
      return;
    }
    if (!groundDescription.trim()) {
      Alert.alert("Validation Error", "Please enter ground description");
      return;
    }
    if (!imageUrls.trim()) {
      Alert.alert("Validation Error", "Please enter at least one image URL");
      return;
    }
    if (!pricePerHour || isNaN(Number(pricePerHour)) || Number(pricePerHour) <= 0) {
      Alert.alert("Validation Error", "Please enter valid price per hour");
      return;
    }
    if (!tournamentPrice || isNaN(Number(tournamentPrice)) || Number(tournamentPrice) <= 0) {
      Alert.alert("Validation Error", "Please enter valid tournament price");
      return;
    }
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      Alert.alert("Validation Error", "Please enter valid capacity");
      return;
    }
    if (!coordinates.trim() || !coordinates.includes(",")) {
      Alert.alert("Validation Error", "Please enter coordinates in format: lat,long");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Validation Error", "Please enter address");
      return;
    }

    setLoading(true);

    const payload = {
      groundOwnerName: groundOwnerName.trim(),
      ownerName: ownerName.trim(),
      groundType: mapToBackend(groundType),
      yearsOfOperation: mapToBackend(yearsOfOperation),
      primaryLocation: primaryLocation.trim(),
      facilityAvailable: mapToBackend(facilityAvailable),
      bookingFrequency: mapToBackend(bookingFrequency),
      groundDescription: groundDescription.trim(),
      imageUrls: imageUrls.trim(),
      acceptOnlineBookings,
      allowTournamentsBookings,
      receiveGroundAvailabilityNotifications: receiveNotifications,
      pricePerHour: Number(pricePerHour),
      tournamentPrice: Number(tournamentPrice),
      capacity: Number(capacity),
      coordinates: coordinates.trim(),
      address: address.trim(),
    };

    console.log("📤 Submitting ground:", payload);

    try {
      const response = await api.post("/ground-owner/grounds", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        Alert.alert(
          "Success",
          "Ground posted successfully!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/ground_owner/myGrounds" as any),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("❌ Post ground error:", error);
      const errorMessage = error.response?.data?.message || "Failed to post ground";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const Dropdown = ({
    label,
    value,
    options,
    onSelect,
    visible,
    setVisible,
  }: {
    label: string;
    value: string | null;
    options: string[];
    onSelect: (value: any) => void;
    visible: boolean;
    setVisible: (visible: boolean) => void;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-2">{label} *</Text>
      <TouchableOpacity
        onPress={() => setVisible(!visible)}
        className="bg-white border-2 border-green-200 rounded-xl p-4 flex-row justify-between items-center"
      >
        <Text className={value ? "text-gray-800" : "text-gray-400"}>
          {value || `Select ${label}`}
        </Text>
        <Text className="text-green-600">▼</Text>
      </TouchableOpacity>

      {visible && (
        <View className="bg-white border-2 border-green-200 rounded-xl mt-2 overflow-hidden">
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onSelect(option);
                setVisible(false);
              }}
              className={`p-4 border-b border-green-100 ${
                value === option ? "bg-green-50" : ""
              }`}
            >
              <Text className={`${value === option ? "text-green-600 font-semibold" : "text-gray-800"}`}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-green-600 mb-2">Post a Ground</Text>
              <Text className="text-gray-600">Fill in the details to list your ground</Text>
            </View>

            {/* Ground Information */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-xl font-bold text-gray-800 mb-4">Ground Information</Text>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Ground Owner Name *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="e.g., Wankhede Cricket Stadium"
                  value={groundOwnerName}
                  onChangeText={setGroundOwnerName}
                  returnKeyType="next"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Owner Name *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="e.g., Stadium Manager - Suresh Patil"
                  value={ownerName}
                  onChangeText={setOwnerName}
                  returnKeyType="next"
                />
              </View>

              <Dropdown
                label="Ground Type"
                value={groundType}
                options={groundTypeOptions}
                onSelect={setGroundType}
                visible={showGroundTypeDropdown}
                setVisible={setShowGroundTypeDropdown}
              />

              <Dropdown
                label="Years of Operation"
                value={yearsOfOperation}
                options={yearsOptions}
                onSelect={setYearsOfOperation}
                visible={showYearsDropdown}
                setVisible={setShowYearsDropdown}
              />

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Primary Location *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={primaryLocation}
                  onChangeText={setPrimaryLocation}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Facilities */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-xl font-bold text-gray-800 mb-4">Facilities</Text>

              <Dropdown
                label="Facility Available"
                value={facilityAvailable}
                options={facilityOptions}
                onSelect={setFacilityAvailable}
                visible={showFacilityDropdown}
                setVisible={setShowFacilityDropdown}
              />

              <Dropdown
                label="Booking Frequency"
                value={bookingFrequency}
                options={frequencyOptions}
                onSelect={setBookingFrequency}
                visible={showFrequencyDropdown}
                setVisible={setShowFrequencyDropdown}
              />

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Ground Description *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="Describe your ground..."
                  value={groundDescription}
                  onChangeText={setGroundDescription}
                  multiline
                  numberOfLines={4}
                  style={{ textAlignVertical: "top", minHeight: 100 }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Capacity *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="e.g., 33000"
                  value={capacity}
                  onChangeText={setCapacity}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Pricing */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-xl font-bold text-gray-800 mb-4">Pricing</Text>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Price Per Hour (₹) *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="e.g., 5000"
                  value={pricePerHour}
                  onChangeText={setPricePerHour}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Tournament Price (₹) *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="e.g., 200000"
                  value={tournamentPrice}
                  onChangeText={setTournamentPrice}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Location Details */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-xl font-bold text-gray-800 mb-4">Location Details</Text>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Address *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="e.g., D Road, Churchgate, Mumbai - 400020"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  style={{ textAlignVertical: "top", minHeight: 80 }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Coordinates *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="e.g., 18.9388,72.8258"
                  value={coordinates}
                  onChangeText={setCoordinates}
                  returnKeyType="next"
                />
                <Text className="text-gray-500 text-xs mt-1">Format: latitude,longitude</Text>
              </View>
            </View>

            {/* Images */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-xl font-bold text-gray-800 mb-4">Images</Text>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Image URLs *</Text>
                <TextInput
                  className="bg-gray-50 border-2 border-green-200 rounded-xl p-4 text-gray-800"
                  placeholder="https://example.com/image1.jpg,https://example.com/image2.jpg"
                  value={imageUrls}
                  onChangeText={setImageUrls}
                  multiline
                  numberOfLines={3}
                  style={{ textAlignVertical: "top", minHeight: 80 }}
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Separate multiple URLs with commas
                </Text>
              </View>
            </View>

            {/* Preferences */}
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Text className="text-xl font-bold text-gray-800 mb-4">Preferences</Text>

              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <Text className="text-gray-700 flex-1">Accept Online Bookings</Text>
                <Switch
                  value={acceptOnlineBookings}
                  onValueChange={setAcceptOnlineBookings}
                  trackColor={{ false: "#d1d5db", true: "#bbf7d0" }}
                  thumbColor={acceptOnlineBookings ? "#16a34a" : "#9ca3af"}
                />
              </View>

              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <Text className="text-gray-700 flex-1">Allow Tournament Bookings</Text>
                <Switch
                  value={allowTournamentsBookings}
                  onValueChange={setAllowTournamentsBookings}
                  trackColor={{ false: "#d1d5db", true: "#bbf7d0" }}
                  thumbColor={allowTournamentsBookings ? "#16a34a" : "#9ca3af"}
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700 flex-1">
                  Receive Ground Availability Notifications
                </Text>
                <Switch
                  value={receiveNotifications}
                  onValueChange={setReceiveNotifications}
                  trackColor={{ false: "#d1d5db", true: "#bbf7d0" }}
                  thumbColor={receiveNotifications ? "#16a34a" : "#9ca3af"}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`py-4 rounded-2xl shadow-lg ${
                loading ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              <Text className="text-white text-center font-bold text-lg">
                {loading ? "Posting Ground..." : "Post Ground"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <BottomNavBar />
    </SafeAreaView>
  );
}
