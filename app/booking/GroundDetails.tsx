import { getAllTournaments } from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useGroundStore } from "../../store/groundStore";

type Ground = {
  id: string;
  groundOwnerName: string;
  primaryLocation: string;
  groundDescription: string;
  facilityAvailable: string;
  imageUrls: string;
};

type Tournament = {
  id: string;
  name: string;
};

type DateTimePickerState = {
  show: boolean;
  mode: "date" | "time";
  type: "start" | "end";
};

const BASE_URL = "http://172.20.10.4:8080/api/v1";

const GroundDetailsScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const setSelectedGround = useGroundStore((state) => state.setSelectedGround);
  const selectedGround = useGroundStore((state) => state.selectedGround);

  const [loading, setLoading] = useState(false);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(() => {
    const end = new Date();
    end.setHours(end.getHours() + 2);
    return end;
  });

  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  const [pickerState, setPickerState] = useState<DateTimePickerState>({
    show: false,
    mode: "date",
    type: "start",
  });

  const finalGroundId = (params.groundId as string) || "";

  const [ground, setGround] = useState<Ground | null>(selectedGround);

  // If no ground in Zustand, fetch from API
  useEffect(() => {
    const fetchGroundDetails = async () => {
      if (!finalGroundId || ground) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/booking/grounds/${finalGroundId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setGround(res.data.data);
        setSelectedGround(res.data.data); // Store in Zustand for reuse
      } catch (error) {
        console.error("Error fetching ground details:", error);
      }
    };

    fetchGroundDetails();
  }, [finalGroundId, token, ground, setSelectedGround]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
        setTournaments(data);
        if (data.length > 0) {
          setSelectedTournamentId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchTournaments();
  }, []);

  const showDateTimePicker = (mode: "date" | "time", type: "start" | "end") => {
    setPickerState({ show: true, mode, type });
  };

  const onDateTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setPickerState((prev) => ({ ...prev, show: false }));
    }
    if (selectedDate) {
      if (pickerState.type === "start") {
        setStartDateTime(selectedDate);
      } else {
        setEndDateTime(selectedDate);
      }
    }
  };

  const hideDateTimePicker = () => {
    setPickerState((prev) => ({ ...prev, show: false }));
  };

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

  const handleBookNow = async () => {
    if (
      !purpose.trim() ||
      !message.trim() ||
      !selectedTournamentId ||
      !finalGroundId
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/booking/request`,
        {
          groundId: finalGroundId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          purpose: purpose.trim(),
          tournamentId: selectedTournamentId,
          message: message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Booking request sent successfully!");
      router.push("/booking/ViewAllBookings");
    } catch (error: any) {
      console.error("Booking failed:", error.response?.data || error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const DateTimeButton = ({
    label,
    date,
    onPress,
  }: {
    label: string;
    date: Date;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="border border-gray-300 p-3 rounded-lg my-2 bg-gray-50"
    >
      <Text className="text-gray-700 font-medium">{label}</Text>
      <Text className="text-lg text-black">
        {formatDate(date)} at {formatTime(date)}
      </Text>
    </TouchableOpacity>
  );

  if (!ground) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Image
          source={{ uri: ground.imageUrls.split(",")[0] }}
          className="w-full h-60 rounded-xl"
        />
        <Text className="text-2xl font-bold mt-4">
          {ground.groundOwnerName}
        </Text>
        <Text className="text-gray-600">{ground.primaryLocation}</Text>
        <Text className="mt-2 text-base">{ground.groundDescription}</Text>
        <View className="mt-4">
          <Text className="font-semibold">Facilities:</Text>
          {ground.facilityAvailable.split(",").map((f, idx) => (
            <Text key={idx} className="text-gray-700">
              • {f.trim()}
            </Text>
          ))}
        </View>

        {/* Booking Form */}
        <View className="mt-6">
          <Text className="font-semibold text-lg mb-4">Book This Ground</Text>

          <Text className="mt-2 font-semibold">Select Tournament:</Text>
          <View className="border border-gray-300 rounded-lg my-2">
            <Picker
              selectedValue={selectedTournamentId}
              onValueChange={(itemValue) => setSelectedTournamentId(itemValue)}
            >
              {tournaments.map((t) => (
                <Picker.Item key={t.id} label={t.name} value={t.id} />
              ))}
            </Picker>
          </View>

          <Text className="mt-4 font-semibold mb-2">Start Date & Time:</Text>
          <DateTimeButton
            label="Select Start Date"
            date={startDateTime}
            onPress={() => showDateTimePicker("date", "start")}
          />
          <DateTimeButton
            label="Select Start Time"
            date={startDateTime}
            onPress={() => showDateTimePicker("time", "start")}
          />

          <Text className="mt-4 font-semibold mb-2">End Date & Time:</Text>
          <DateTimeButton
            label="Select End Date"
            date={endDateTime}
            onPress={() => showDateTimePicker("date", "end")}
          />
          <DateTimeButton
            label="Select End Time"
            date={endDateTime}
            onPress={() => showDateTimePicker("time", "end")}
          />

          <Text className="mt-4 font-semibold">Purpose:</Text>
          <TextInput
            placeholder="Enter purpose of booking"
            value={purpose}
            onChangeText={setPurpose}
            className="border border-gray-300 p-3 rounded-lg my-2 bg-gray-50"
          />

          <Text className="mt-2 font-semibold">Message:</Text>
          <TextInput
            placeholder="Any additional message"
            value={message}
            onChangeText={setMessage}
            className="border border-gray-300 p-3 rounded-lg my-2 bg-gray-50"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-xl"
          onPress={handleBookNow}
          disabled={loading}
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

      {/* DateTime Picker */}
      {Platform.OS === "ios" && pickerState.show && (
        <Modal transparent animationType="slide" visible={pickerState.show}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white p-4">
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={hideDateTimePicker}>
                  <Text className="text-blue-600 text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold">
                  Select {pickerState.mode === "date" ? "Date" : "Time"}
                </Text>
                <TouchableOpacity onPress={hideDateTimePicker}>
                  <Text className="text-blue-600 text-lg font-semibold">
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
