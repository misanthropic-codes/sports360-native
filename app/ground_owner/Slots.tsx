// screens/DateTimePickerScreen.tsx
import BottomNavBar from "@/components/Ground-owner/BottomTabBar";
import { useAuth } from "@/context/AuthContext";
import { useGroundStore } from "@/store/groundTStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
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

export default function DateTimePickerScreen(): JSX.Element {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");

  const { token } = useAuth();
  const setAvailableGrounds = useGroundStore(
    (state) => state.setAvailableGrounds
  );
  const setTimeSlot = useGroundStore((state) => state.setTimeSlot);
  const router = useRouter();

  const fetchAvailableGrounds = async (): Promise<void> => {
    if (endTime <= startTime) {
      setFeedback("⚠ End time must be after start time");
      return;
    }

    setLoading(true);
    setFeedback("Fetching available grounds...");
    try {
      const startISO = startTime.toISOString();
      const endISO = endTime.toISOString();

      console.log("Fetching grounds for:", startISO, endISO);

      const res = await fetch(
        `http://172.20.10.4:8080/api/v1/booking/grounds/available?startTime=${startISO}&endTime=${endISO}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API Response status:", res.status);

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data: { message: string; timeSlot: TimeSlot; data: Ground[] } =
        await res.json();

      console.log("API Response data:", data);

      if (data.data && data.data.length > 0) {
        setAvailableGrounds(data.data);
        setTimeSlot(data.timeSlot);
        setFeedback("Grounds found ✅");
        router.push("/ground_owner/ViewAllGrounds");
      } else {
        setFeedback("No grounds found for this time slot ❌");
        console.warn("No grounds found:", data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setFeedback("Error fetching grounds ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Date & Time</Text>

      <Text style={styles.label}>Start Time</Text>
      <DateTimePicker
        value={startTime}
        mode="datetime"
        display="default"
        onChange={(e: any, date: any) => setStartTime(date || startTime)}
      />

      <Text style={styles.label}>End Time</Text>
      <DateTimePicker
        value={endTime}
        mode="datetime"
        display="default"
        minimumDate={startTime} // ⏳ Prevents selecting end time before start time
        onChange={(e: any, date: any) => setEndTime(date || endTime)}
      />

      <TouchableOpacity style={styles.button} onPress={fetchAvailableGrounds}>
        <Text style={styles.buttonText}>Find Ground</Text>
      </TouchableOpacity>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      {/* ✅ Loading Overlay */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 20,
  },
  label: { fontSize: 16, color: "#15803d", marginTop: 20 },
  button: {
    backgroundColor: "#15803d",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  feedback: {
    marginTop: 15,
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "bold",
    alignSelf: "center",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
