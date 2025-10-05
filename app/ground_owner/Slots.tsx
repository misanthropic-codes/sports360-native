// screens/DateTimePickerScreen.tsx
import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { useGroundStore } from "@/store/groundTStore";
import { Ionicons } from "@expo/vector-icons";
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

type TimeSlotType = "morning" | "afternoon" | "evening" | "duration";

interface DurationOption {
  label: string;
  minutes: number;
}

export default function DateTimePickerScreen(): JSX.Element {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<TimeSlotType>("afternoon");
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  // Duration-based states
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // minutes
  const [selectedStartHour, setSelectedStartHour] = useState<number>(9); // 9 AM default
  const [selectedStartMinute, setSelectedStartMinute] = useState<number>(0); // 0 or 30
  const [showTimeDropdown, setShowTimeDropdown] = useState<boolean>(false);

  const { token } = useAuth();
  const setAvailableGrounds = useGroundStore(
    (state) => state.setAvailableGrounds
  );
  const setTimeSlot = useGroundStore((state) => state.setTimeSlot);
  const router = useRouter();

  const timeSlots = {
    morning: { start: 9, end: 12, label: "Morning (9:00 AM - 12:00 PM)" },
    afternoon: { start: 12, end: 17, label: "Afternoon (12:00 PM - 5:00 PM)" },
    evening: { start: 17, end: 21, label: "Evening (5:00 PM - 9:00 PM)" },
  };

  const durationOptions: DurationOption[] = [
    { label: "30 min", minutes: 30 },
    { label: "1 hour", minutes: 60 },
    { label: "1.5 hours", minutes: 90 },
    { label: "2 hours", minutes: 120 },
    { label: "2.5 hours", minutes: 150 },
    { label: "3 hours", minutes: 180 },
  ];

  // Generate time slots in 30-minute intervals from 6 AM to 11:30 PM
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute.toString().padStart(2, "0");
        slots.push(`${displayHour}:${displayMinute} ${period}`);
      }
    }
    return slots;
  };

  const timeSlots30Min = generateTimeSlots();

  // Round time UP to next slot based on duration
  const roundToNextSlot = (date: Date, durationMinutes: number): Date => {
    const rounded = new Date(date);
    const currentMinutes = rounded.getHours() * 60 + rounded.getMinutes();

    // Round UP to next slot interval
    const roundedMinutes =
      Math.ceil(currentMinutes / durationMinutes) * durationMinutes;

    rounded.setHours(Math.floor(roundedMinutes / 60));
    rounded.setMinutes(roundedMinutes % 60);
    rounded.setSeconds(0);
    rounded.setMilliseconds(0);

    return rounded;
  };

  const getStartTime = (): Date => {
    const time = new Date();
    time.setHours(selectedStartHour, selectedStartMinute, 0, 0);
    return time;
  };

  const getSelectedTimeString = (): string => {
    const period = selectedStartHour >= 12 ? "PM" : "AM";
    const displayHour =
      selectedStartHour > 12
        ? selectedStartHour - 12
        : selectedStartHour === 0
          ? 12
          : selectedStartHour;
    const displayMinute = selectedStartMinute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const parseTimeString = (
    timeStr: string
  ): { hour: number; minute: number } => {
    const [time, period] = timeStr.split(" ");
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
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

  const calculateEndTime = (): Date => {
    const startTime = getStartTime();
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + selectedDuration);
    return endTime;
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
      let bookingStartTime: Date;
      let bookingEndTime: Date;

      if (selectedTimeSlot === "duration") {
        // Use duration-based timing
        bookingStartTime = new Date(selectedDate);
        bookingStartTime.setHours(selectedStartHour, selectedStartMinute, 0, 0);

        bookingEndTime = calculateEndTime();
        bookingEndTime.setFullYear(selectedDate.getFullYear());
        bookingEndTime.setMonth(selectedDate.getMonth());
        bookingEndTime.setDate(selectedDate.getDate());
      } else {
        // Use preset time slots
        const slot = timeSlots[selectedTimeSlot];
        bookingStartTime = new Date(selectedDate);
        bookingStartTime.setHours(slot.start, 0, 0, 0);

        bookingEndTime = new Date(selectedDate);
        bookingEndTime.setHours(slot.end, 0, 0, 0);
      }

      const startISO = bookingStartTime.toISOString();
      const endISO = bookingEndTime.toISOString();

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

        {/* Time Slots */}
        <View className="mb-5">
          {(Object.keys(timeSlots) as (keyof typeof timeSlots)[]).map(
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
                  {timeSlots[slot].label}
                </Text>
              </TouchableOpacity>
            )
          )}

          {/* Duration-Based Time Slot Button */}
          <TouchableOpacity
            onPress={() => setSelectedTimeSlot("duration")}
            className={`rounded-full py-4 px-6 mb-3 border-2 ${
              selectedTimeSlot === "duration"
                ? "bg-green-600 border-green-600"
                : "bg-white border-green-600"
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="time-outline"
                size={20}
                color={selectedTimeSlot === "duration" ? "#ffffff" : "#15803d"}
              />
              <Text
                className={`text-lg font-semibold ml-2 ${
                  selectedTimeSlot === "duration"
                    ? "text-white"
                    : "text-green-700"
                }`}
              >
                Choose Duration
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Duration-Based Selection */}
        {selectedTimeSlot === "duration" && (
          <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Select Duration
            </Text>

            {/* Duration Options */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-3">
                How long do you need?
              </Text>
              <View className="flex-row flex-wrap -mx-1">
                {durationOptions.map((option) => (
                  <View key={option.minutes} className="w-1/3 px-1 mb-2">
                    <TouchableOpacity
                      onPress={() => setSelectedDuration(option.minutes)}
                      className={`py-3 rounded-xl border-2 ${
                        selectedDuration === option.minutes
                          ? "bg-green-600 border-green-600"
                          : "bg-white border-green-600"
                      }`}
                    >
                      <Text
                        className={`text-center font-bold ${
                          selectedDuration === option.minutes
                            ? "text-white"
                            : "text-green-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Start Time Dropdown */}
            <View className="mb-2">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Select Start Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimeDropdown(true)}
                className="bg-green-50 border-2 border-green-600 rounded-full py-3 px-4 flex-row items-center justify-between"
              >
                <Text className="text-green-700 font-semibold text-base">
                  {getSelectedTimeString()}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#15803d" />
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 mt-1 ml-2">
                Times are in 30-minute intervals
              </Text>
            </View>

            {/* Calculated End Time Display */}
            <View className="bg-green-50 rounded-2xl p-4 mt-2">
              <Text className="text-sm font-semibold text-gray-600 mb-1">
                End Time (Auto-calculated)
              </Text>
              <Text className="text-green-700 font-bold text-lg">
                {formatTime(calculateEndTime())}
              </Text>
            </View>
          </View>
        )}

        {/* Time Dropdown Modal */}
        {showTimeDropdown && (
          <Modal transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-white rounded-3xl p-6 mx-5 w-[90%] shadow-xl max-h-[70%]">
                <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Select Start Time
                </Text>
                <ScrollView className="mb-4">
                  {timeSlots30Min.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => {
                        const { hour, minute } = parseTimeString(time);
                        setSelectedStartHour(hour);
                        setSelectedStartMinute(minute);
                        setShowTimeDropdown(false);
                      }}
                      className={`py-4 px-4 mb-2 rounded-xl border-2 ${
                        time === getSelectedTimeString()
                          ? "bg-green-600 border-green-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-center text-base font-semibold ${
                          time === getSelectedTimeString()
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setShowTimeDropdown(false)}
                  className="bg-gray-200 py-4 rounded-full"
                >
                  <Text className="text-gray-700 font-bold text-center text-lg">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Selected Info */}
        <View className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Selected:
          </Text>
          <Text className="text-base text-gray-700">
            {formatSelectedDate()} |{" "}
            {selectedTimeSlot === "duration"
              ? `${getSelectedTimeString()} - ${formatTime(calculateEndTime())} (${selectedDuration} min)`
              : selectedTimeSlot.charAt(0).toUpperCase() +
                selectedTimeSlot.slice(1)}
          </Text>
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
          <Text className="text-center font-semibold text-green-600 mb-4">
            {feedback}
          </Text>
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
