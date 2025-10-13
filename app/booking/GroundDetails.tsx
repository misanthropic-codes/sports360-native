import { getAllTournaments } from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronDown, Clock, Star } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { Ground, useGroundStore } from "../../store/groundStore";

const BASE_URL = "http://172.20.10.4:8080/api/v1";

type Tournament = {
  id: string;
  name: string;
};

type DateTimePickerState = {
  show: boolean;
  mode: "date" | "time";
  type: "start" | "end";
};

const GroundDetailsScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token, role } = useAuth();

  const setSelectedGround = useGroundStore((state) => state.setSelectedGround);
  const selectedGround = useGroundStore((state) => state.selectedGround);
  const groundReviews = useGroundStore((state) =>
    selectedGround ? state.groundReviews[selectedGround.id] : null
  );

  const [ground, setGround] = useState<Ground | null>(selectedGround);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [showTournamentPicker, setShowTournamentPicker] = useState(false);

  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");

  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(() => {
    const end = new Date();
    end.setHours(end.getHours() + 2);
    return end;
  });

  const [pickerState, setPickerState] = useState<DateTimePickerState>({
    show: false,
    mode: "date",
    type: "start",
  });

  const finalGroundId = (params.groundId as string) || "";

  // 🎨 Role-based theme
  const theme = useMemo(() => {
    const isOrganizer = role?.toLowerCase() === "organizer";
    return {
      primary: isOrganizer ? "#9333ea" : "#2563eb",
      primaryDark: isOrganizer ? "#7e22ce" : "#1d4ed8",
      primaryLight: isOrganizer ? "#c084fc" : "#60a5fa",
      primaryBg: isOrganizer ? "#faf5ff" : "#eff6ff",
      primaryBorder: isOrganizer ? "#e9d5ff" : "#dbeafe",
    };
  }, [role]);

  // 🏟️ Fetch Ground Details
  useEffect(() => {
    const fetchGroundDetails = async () => {
      if (ground || !finalGroundId) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/booking/grounds/${finalGroundId}`
        );
        setGround(res.data.data);
        setSelectedGround(res.data.data);
      } catch (error) {
        console.error("❌ Error fetching ground details:", error);
      }
    };

    fetchGroundDetails();
  }, [finalGroundId]);

  // 🏆 Fetch Tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments(token);
        setTournaments(data);
        if (data.length > 0) setSelectedTournamentId(data[0].id);
      } catch (error) {
        console.error("❌ Error fetching tournaments:", error);
      }
    };
    fetchTournaments();
  }, [token]);

  // 📅 DateTime Picker Controls
  const showDateTimePicker = (mode: "date" | "time", type: "start" | "end") =>
    setPickerState({ show: true, mode, type });

  const onDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setPickerState((prev) => ({ ...prev, show: false }));
    }
    if (selectedDate) {
      if (pickerState.type === "start") setStartDateTime(selectedDate);
      else setEndDateTime(selectedDate);
    }
  };

  const hideDateTimePicker = () =>
    setPickerState((prev) => ({ ...prev, show: false }));

  // 📆 Formatters
  const formatDate = (date: Date): string =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatTime = (date: Date): string =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  // 🏁 Book Ground
  const handleBookNow = async () => {
    if (!purpose.trim() || !message.trim() || !selectedTournamentId) {
      alert("Please fill in all fields");
      return;
    }
    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/booking/request`,
        {
          groundId: finalGroundId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          purpose: purpose.trim(),
          tournamentId: selectedTournamentId,
          message: message.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Booking request sent successfully!");
      router.push("/booking/ViewAllBookings");
    } catch (error: any) {
      console.error("Booking failed:", error.response?.data || error);
      alert("❌ Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const DateTimeButton = ({
    label,
    date,
    onPress,
    icon: Icon,
  }: {
    label: string;
    date: Date;
    onPress: () => void;
    icon: any;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderColor: theme.primaryBorder,
        backgroundColor: theme.primaryBg,
      }}
      className="border-2 p-4 rounded-xl my-2"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-600 text-sm mb-1">{label}</Text>
          <Text className="text-base font-semibold text-gray-900">
            {formatDate(date)} • {formatTime(date)}
          </Text>
        </View>
        <Icon size={24} color={theme.primary} />
      </View>
    </TouchableOpacity>
  );

  if (!ground) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  const facilities = ground.facilityAvailable
    ? ground.facilityAvailable.split(",")
    : [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 🖼️ Ground Image */}
        <Image
          source={{
            uri:
              ground.profileImageUrl ||
              ground.businessLogoUrl ||
              "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
          }}
          className="w-full h-64"
          resizeMode="cover"
        />

        <View className="px-4 pt-4">
          {/* Ground Info */}
          <Text className="text-3xl font-bold text-gray-900 mb-1">
            {ground.businessName}
          </Text>
          <Text className="text-base text-gray-600 mb-3">
            {ground.businessAddress || "No address provided"}
          </Text>

          {/* Ratings */}
          {groundReviews && (
            <View className="flex-row items-center mb-4">
              <View
                style={{ backgroundColor: theme.primary }}
                className="flex-row items-center px-3 py-2 rounded-full"
              >
                <Star size={16} color="#fff" fill="#fff" />
                <Text className="ml-1 font-bold text-base text-white">
                  {groundReviews.averageRating.toFixed(1)}
                </Text>
              </View>
              <Text className="ml-3 text-gray-600 text-base">
                {groundReviews.totalReviews} reviews
              </Text>
            </View>
          )}

          <Text className="text-base text-gray-700 leading-6 mb-4">
            {ground.groundDescription || "No description available."}
          </Text>

          {/* 🏗️ Facilities */}
          <View
            style={{
              backgroundColor: theme.primaryBg,
              borderColor: theme.primaryBorder,
            }}
            className="border-2 rounded-2xl p-4 mb-6"
          >
            <Text className="font-bold text-lg mb-3 text-gray-900">
              Facilities
            </Text>
            <View className="flex-row flex-wrap">
              {facilities.map((f, idx) => (
                <View
                  key={idx}
                  className="px-4 py-2 rounded-full mr-2 mb-2 border border-gray-200 bg-white"
                >
                  <Text className="text-gray-700 text-sm font-medium">
                    {f.trim()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 📝 Booking Form */}
          <View className="mb-6">
            <Text className="font-bold text-2xl mb-4 text-gray-900">
              Book This Ground
            </Text>

            {/* Tournament Selection */}
            <Text className="font-semibold text-base mb-2 text-gray-900">
              Select Tournament
            </Text>
            <TouchableOpacity
              onPress={() => setShowTournamentPicker(true)}
              style={{
                borderColor: theme.primaryBorder,
                backgroundColor: theme.primaryBg,
              }}
              className="border-2 p-4 rounded-xl mb-4 flex-row justify-between items-center"
            >
              <Text className="text-base font-medium text-gray-900 flex-1">
                {tournaments.find((t) => t.id === selectedTournamentId)?.name ||
                  "Select a tournament"}
              </Text>
              <ChevronDown size={24} color={theme.primary} />
            </TouchableOpacity>

            {/* Date & Time Inputs */}
            <Text className="font-semibold text-base mb-2 text-gray-900">
              Start Date & Time
            </Text>
            <DateTimeButton
              label="Date"
              date={startDateTime}
              onPress={() => showDateTimePicker("date", "start")}
              icon={Calendar}
            />
            <DateTimeButton
              label="Time"
              date={startDateTime}
              onPress={() => showDateTimePicker("time", "start")}
              icon={Clock}
            />

            <Text className="font-semibold text-base mb-2 mt-4 text-gray-900">
              End Date & Time
            </Text>
            <DateTimeButton
              label="Date"
              date={endDateTime}
              onPress={() => showDateTimePicker("date", "end")}
              icon={Calendar}
            />
            <DateTimeButton
              label="Time"
              date={endDateTime}
              onPress={() => showDateTimePicker("time", "end")}
              icon={Clock}
            />

            {/* Purpose */}
            <Text className="font-semibold text-base mb-2 mt-4 text-gray-900">
              Purpose
            </Text>
            <TextInput
              placeholder="Enter purpose of booking"
              placeholderTextColor="#9ca3af"
              value={purpose}
              onChangeText={setPurpose}
              style={{
                borderColor: theme.primaryBorder,
                backgroundColor: theme.primaryBg,
              }}
              className="border-2 p-4 rounded-xl text-base text-gray-900"
            />

            {/* Message */}
            <Text className="font-semibold text-base mb-2 mt-4 text-gray-900">
              Additional Message
            </Text>
            <TextInput
              placeholder="Any additional message or requirements"
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              style={{
                borderColor: theme.primaryBorder,
                backgroundColor: theme.primaryBg,
              }}
              className="border-2 p-4 rounded-xl text-base text-gray-900"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Book Button */}
      <View
        className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200"
        style={{ paddingBottom: Platform.OS === "ios" ? 34 : 16 }}
      >
        <TouchableOpacity
          style={{ backgroundColor: theme.primary }}
          className="p-4 rounded-2xl shadow-lg"
          onPress={handleBookNow}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-bold">
              Book Now
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Tournament Picker */}
      <Modal transparent animationType="slide" visible={showTournamentPicker}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowTournamentPicker(false)}>
                <Text
                  style={{ color: theme.primary }}
                  className="text-base font-semibold"
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-900">
                Select Tournament
              </Text>
              <TouchableOpacity onPress={() => setShowTournamentPicker(false)}>
                <Text
                  style={{ color: theme.primary }}
                  className="text-base font-semibold"
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {tournaments.map((tournament) => (
                <TouchableOpacity
                  key={tournament.id}
                  onPress={() => {
                    setSelectedTournamentId(tournament.id);
                    setShowTournamentPicker(false);
                  }}
                  className="p-4 border-b border-gray-100"
                  style={{
                    backgroundColor:
                      selectedTournamentId === tournament.id
                        ? theme.primaryBg
                        : "white",
                  }}
                >
                  <Text
                    className="text-base font-medium"
                    style={{
                      color:
                        selectedTournamentId === tournament.id
                          ? theme.primary
                          : "#111827",
                    }}
                  >
                    {tournament.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* iOS DateTime Picker */}
      {Platform.OS === "ios" && pickerState.show && (
        <Modal transparent animationType="slide" visible={pickerState.show}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl">
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <TouchableOpacity onPress={hideDateTimePicker}>
                  <Text
                    style={{ color: theme.primary }}
                    className="text-base font-semibold"
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">
                  Select {pickerState.mode === "date" ? "Date" : "Time"}
                </Text>
                <TouchableOpacity onPress={hideDateTimePicker}>
                  <Text
                    style={{ color: theme.primary }}
                    className="text-base font-semibold"
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={
                  pickerState.type === "start" ? startDateTime : endDateTime
                }
                mode={pickerState.mode}
                is24Hour
                display="spinner"
                onChange={onDateTimeChange}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android DateTime Picker */}
      {Platform.OS === "android" && pickerState.show && (
        <DateTimePicker
          value={pickerState.type === "start" ? startDateTime : endDateTime}
          mode={pickerState.mode}
          is24Hour
          display="default"
          onChange={onDateTimeChange}
        />
      )}
    </SafeAreaView>
  );
};

export default GroundDetailsScreen;
