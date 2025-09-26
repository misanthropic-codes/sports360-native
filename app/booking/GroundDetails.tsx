import { getAllTournaments } from "@/api/tournamentApi"; // import your API helper
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker"; // ✅ fixed import
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Ground = {
  groundOwnerName: string;
  primaryLocation: string;
  groundDescription: string;
  facilityAvailable: string;
  imageUrls: string;
  groundId: string;
};

type Tournament = {
  id: string;
  name: string;
};

const BASE_URL = "http://172.20.10.4:8080";

const GroundDetailsScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");

  const ground: Ground | null = params.ground
    ? JSON.parse(params.ground as string)
    : null;

  // Fetch tournaments on mount
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
        setTournaments(data);
        if (data.length > 0) setSelectedTournamentId(data[0].id); // default
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };
    fetchTournaments();
  }, []);

  if (!ground) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-red-500">Ground data not found</Text>
      </SafeAreaView>
    );
  }

  const handleStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleBookNow = async () => {
    if (
      !startDate ||
      !endDate ||
      !purpose ||
      !message ||
      !selectedTournamentId
    ) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/booking/request`, {
        groundId: ground.groundId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        purpose,
        tournamentId: selectedTournamentId,
        message,
      });

      console.log("Booking successful:", response.data);
      alert("Booking request sent successfully!");
      router.push("/booking/ViewAllBookings");
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              • {f}
            </Text>
          ))}
        </View>

        {/* Booking Form */}
        <View className="mt-6">
          <Text className="font-semibold text-lg">Book This Ground</Text>

          {/* Tournament Selector */}
          <Text className="mt-2 font-semibold">Select Tournament:</Text>
          <Picker
            selectedValue={selectedTournamentId}
            onValueChange={(itemValue: string) =>
              setSelectedTournamentId(itemValue)
            }
            className="border p-2 rounded my-2"
          >
            {tournaments.map((t) => (
              <Picker.Item key={t.id} label={t.name} value={t.id} />
            ))}
          </Picker>

          {/* Date & Time Pickers */}
          <TouchableOpacity
            className="border p-2 rounded my-2"
            onPress={() => setShowStartPicker(true)}
          >
            <Text>Start Time: {startDate.toLocaleString()}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              display="default"
              onChange={handleStartChange}
            />
          )}

          <TouchableOpacity
            className="border p-2 rounded my-2"
            onPress={() => setShowEndPicker(true)}
          >
            <Text>End Time: {endDate.toLocaleString()}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              display="default"
              onChange={handleEndChange}
            />
          )}

          <TextInput
            placeholder="Purpose"
            value={purpose}
            onChangeText={setPurpose}
            className="border p-2 rounded my-2"
          />
          <TextInput
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
            className="border p-2 rounded my-2"
            multiline
          />
        </View>
      </ScrollView>

      {/* Sticky Book Now Button */}
      <View className="p-4 border-t border-gray-200">
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
    </SafeAreaView>
  );
};

export default GroundDetailsScreen;
