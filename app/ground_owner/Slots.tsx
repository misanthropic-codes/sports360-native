// screens/DateTimePickerScreen.tsx
import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { useGroundStore } from "@/store/groundTStore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Ground {
  id: string;
  userId: string;
  groundOwnerName: string;
  ownerName: string;
  groundType: string;
  yearsOfOperation: string;
  primaryLocation: string;
  facilityAvailable: string;
  bookingFrequency: string;
  groundDescription: string;
  imageUrls: string;
  acceptOnlineBookings: boolean;
  allowTournamentsBookings: boolean;
  receiveGroundAvailabilityNotifications: boolean;
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
}

type TimeSlotType = "15min" | "30min" | "45min" | "1hr" | "custom";

export default function DateTimePickerScreen(): JSX.Element {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<TimeSlotType>("30min");
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  // Custom time states
  const [customStartTime, setCustomStartTime] = useState<Date>(new Date());
  const [customEndTime, setCustomEndTime] = useState<Date>(new Date());
  const [showStartTimePicker, setShowStartTimePicker] =
    useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);

  const { token } = useAuth();
  const setAvailableGrounds = useGroundStore(
    (state) => state.setAvailableGrounds
  );
  const setTimeSlot = useGroundStore((state) => state.setTimeSlot);
  const router = useRouter();

  const durationSlots = {
    "15min": { duration: 15, label: "15 Minutes" },
    "30min": { duration: 30, label: "30 Minutes" },
    "45min": { duration: 45, label: "45 Minutes" },
    "1hr": { duration: 60, label: "1 Hour" },
  };

  const getStartOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (direction: number): void => {
    setSelectedDate(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + direction,
        1
      )
    );
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const onStartTimeChange = (event: any, selectedTime?: Date): void => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setCustomStartTime(selectedTime);
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date): void => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setCustomEndTime(selectedTime);
    }
  };

  const renderCalendar = (): JSX.Element => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const today = new Date();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const isToday = (day: number): boolean => {
      return (
        day === today.getDate() &&
        selectedDate.getMonth() === today.getMonth() &&
        selectedDate.getFullYear() === today.getFullYear()
      );
    };

    const isSelectedDay = (day: number): boolean => {
      return (
        day === selectedDate.getDate() &&
        selectedDate.getMonth() === selectedDate.getMonth()
      );
    };

    return (
      <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm">
        {/* Month Header */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            className="w-12 h-12 bg-green-50 rounded-full justify-center items-center"
          >
            <Ionicons name="chevron-back" size={24} color="#15803d" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">
            {selectedDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity
            onPress={() => changeMonth(1)}
            className="w-12 h-12 bg-green-50 rounded-full justify-center items-center"
          >
            <Ionicons name="chevron-forward" size={24} color="#15803d" />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View className="flex-row justify-between mb-3">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day, idx) => (
            <Text
              key={day}
              className={`text-xs font-semibold w-10 text-center ${
                idx === 6 ? "text-green-600" : "text-gray-500"
              }`}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View className="flex-row flex-wrap">
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (day) {
                  setSelectedDate(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      day
                    )
                  );
                }
              }}
              disabled={!day}
              className="w-[14.28%] aspect-square justify-center items-center"
            >
              {day ? (
                <View
                  className={`w-10 h-10 rounded-full justify-center items-center ${
                    isSelectedDay(day)
                      ? "bg-green-600"
                      : isToday(day)
                        ? "border-2 border-green-600"
                        : ""
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      isSelectedDay(day)
                        ? "text-white"
                        : index % 7 === 6
                          ? "text-green-600"
                          : "text-gray-700"
                    }`}
                  >
                    {day}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const fetchAvailableGrounds = async (): Promise<void> => {
    setLoading(true);
    setFeedback("Fetching available grounds...");

    try {
      let startTime: Date;
      let endTime: Date;

      if (selectedTimeSlot === "custom") {
        // Use custom times
        startTime = new Date(selectedDate);
        startTime.setHours(
          customStartTime.getHours(),
          customStartTime.getMinutes(),
          0,
          0
        );

        endTime = new Date(selectedDate);
        endTime.setHours(
          customEndTime.getHours(),
          customEndTime.getMinutes(),
          0,
          0
        );

        // Validate that end time is after start time
        if (endTime <= startTime) {
          setFeedback("❌ End time must be after start time");
          setLoading(false);
          return;
        }
      } else {
        // Use duration-based slots from current time
        const now = new Date();
        startTime = new Date(selectedDate);
        startTime.setHours(now.getHours(), now.getMinutes(), 0, 0);

        const duration = durationSlots[selectedTimeSlot].duration;
        endTime = new Date(startTime.getTime() + duration * 60000);
      }

      const startISO = startTime.toISOString();
      const endISO = endTime.toISOString();

      const res = await fetch(
        `http://172.20.10.4:8080/api/v1/booking/grounds/available?startTime=${startISO}&endTime=${endISO}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data: { message: string; timeSlot: TimeSlot; data: Ground[] } =
        await res.json();

      if (data.data && data.data.length > 0) {
        setAvailableGrounds(data.data);
        setTimeSlot(data.timeSlot);
        setFeedback("✅ Grounds found");
        router.push("/ground_owner/ViewAllGrounds");
      } else {
        setFeedback("❌ No grounds found for this time slot");
      }
    } catch (error) {
      setFeedback("❌ Error fetching grounds");
    } finally {
      setLoading(false);
    }
  };

  const formatSelectedDate = (): string => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
  };

  const getTimeSlotPreview = (): string => {
    if (selectedTimeSlot === "custom") {
      return `${formatTime(customStartTime)} - ${formatTime(customEndTime)}`;
    } else {
      const now = new Date();
      const duration = durationSlots[selectedTimeSlot].duration;
      const endTime = new Date(now.getTime() + duration * 60000);
      return `${formatTime(now)} - ${formatTime(endTime)}`;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5 py-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-gray-800">GroundFinder</Text>
          <TouchableOpacity className="w-14 h-14 bg-green-100 rounded-full justify-center items-center">
            <Ionicons name="person" size={28} color="#15803d" />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        {renderCalendar()}

        {/* Duration-based Time Slots */}
        <View className="mb-5">
          <Text className="text-xl font-bold text-gray-800 mb-3">
            Select Duration
          </Text>

          {(Object.keys(durationSlots) as (keyof typeof durationSlots)[]).map(
            (slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedTimeSlot(slot)}
                className={`rounded-full py-4 px-6 mb-3 border-2 ${
                  selectedTimeSlot === slot
                    ? "bg-green-600 border-green-600"
                    : "bg-white border-green-600"
                }`}
              >
                <Text
                  className={`text-center text-lg font-semibold ${
                    selectedTimeSlot === slot ? "text-white" : "text-green-700"
                  }`}
                >
                  {durationSlots[slot].label}
                </Text>
              </TouchableOpacity>
            )
          )}

          {/* Custom Time Slot Button */}
          <TouchableOpacity
            onPress={() => setSelectedTimeSlot("custom")}
            className={`rounded-full py-4 px-6 mb-3 border-2 ${
              selectedTimeSlot === "custom"
                ? "bg-green-600 border-green-600"
                : "bg-white border-green-600"
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="time-outline"
                size={20}
                color={selectedTimeSlot === "custom" ? "#ffffff" : "#15803d"}
              />
              <Text
                className={`text-lg font-semibold ml-2 ${
                  selectedTimeSlot === "custom"
                    ? "text-white"
                    : "text-green-700"
                }`}
              >
                Custom Time
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Custom Time Pickers */}
        {selectedTimeSlot === "custom" && (
          <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Select Custom Time
            </Text>

            {/* Start Time */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Start Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(true)}
                className="bg-green-50 border-2 border-green-600 rounded-full py-3 px-4 flex-row items-center justify-between"
              >
                <Text className="text-green-700 font-semibold text-base">
                  {formatTime(customStartTime)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#15803d" />
              </TouchableOpacity>
            </View>

            {/* End Time */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                End Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(true)}
                className="bg-green-50 border-2 border-green-600 rounded-full py-3 px-4 flex-row items-center justify-between"
              >
                <Text className="text-green-700 font-semibold text-base">
                  {formatTime(customEndTime)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#15803d" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Time Pickers with Modal */}
        {showStartTimePicker && (
          <Modal transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-white rounded-3xl p-6 mx-5 w-[90%] shadow-xl">
                <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Select Start Time
                </Text>
                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <DateTimePicker
                    value={customStartTime}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onStartTimeChange}
                    textColor="#000000"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowStartTimePicker(false)}
                  className="bg-green-600 py-4 rounded-full"
                >
                  <Text className="text-white font-bold text-center text-lg">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {showEndTimePicker && (
          <Modal transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-white rounded-3xl p-6 mx-5 w-[90%] shadow-xl">
                <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Select End Time
                </Text>
                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <DateTimePicker
                    value={customEndTime}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onEndTimeChange}
                    textColor="#000000"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowEndTimePicker(false)}
                  className="bg-green-600 py-4 rounded-full"
                >
                  <Text className="text-white font-bold text-center text-lg">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Selected Info */}
        <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Selected:
          </Text>
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar" size={20} color="#15803d" />
            <Text className="text-base text-gray-700 ml-2">
              {formatSelectedDate()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time" size={20} color="#15803d" />
            <Text className="text-base text-gray-700 ml-2">
              {getTimeSlotPreview()}
            </Text>
          </View>
        </View>

        {/* Find Button */}
        <TouchableOpacity
          onPress={fetchAvailableGrounds}
          className="bg-green-600 py-5 rounded-full shadow-lg mb-6"
        >
          <Text className="text-white font-bold text-lg text-center">
            Find Available Grounds
          </Text>
        </TouchableOpacity>

        {/* Feedback */}
        {feedback ? (
          <View className="flex-row items-center justify-center mb-4">
            {feedback.includes("✅") ? (
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            ) : feedback.includes("❌") ? (
              <Ionicons name="close-circle" size={20} color="#dc2626" />
            ) : null}
            <Text
              className={`text-center font-semibold ml-2 ${
                feedback.includes("✅")
                  ? "text-green-600"
                  : feedback.includes("❌")
                    ? "text-red-600"
                    : "text-green-600"
              }`}
            >
              {feedback.replace("✅", "").replace("❌", "").trim()}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Loading Overlay */}
      <Modal visible={loading} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="mt-3 text-white text-lg font-bold">Loading...</Text>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
  );
}
