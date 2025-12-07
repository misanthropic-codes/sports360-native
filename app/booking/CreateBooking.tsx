import { createBookingRequest } from "@/api/bookingApi";
import { useAuth } from "@/context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, MessageSquare } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateBooking() {
  const { token } = useAuth();
  const router = useRouter();
  const { groundId } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [formData, setFormData] = useState({
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 hours
    purpose: "practice" as "tournament" | "practice" | "match",
    message: "",
  });

  const purposes = ["practice", "match", "tournament"];

  const handleSubmit = async () => {
    if (!groundId || !token) {
      Alert.alert("Error", "Missing ground information");
      return;
    }

    setLoading(true);
    try {
      await createBookingRequest(
        {
          groundId: groundId as string,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
          purpose: formData.purpose,
          message: formData.message,
        },
        token
      );

      Alert.alert("Success", "Booking request submitted successfully!", [
        { text: "OK", onPress: () => router.push("/booking/MyBookings" as any) },
      ]);
    } catch (error: any) {
      console.error("Failed to create booking:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white flex-1">Create Booking</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Selection */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">Select Time Slot</Text>

          {/* Start Time */}
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4 flex-row items-center"
          >
            <Calendar size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-500 text-xs mb-1">Start Time</Text>
              <Text className="text-gray-900 font-semibold">
                {formatDateTime(formData.startTime)}
              </Text>
            </View>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={formData.startTime}
              mode="datetime"
              display="default"
              onChange={(_event: any, date?: Date) => {
                setShowStartPicker(false);
                if (date) setFormData({ ...formData, startTime: date });
              }}
            />
          )}

          {/* End Time */}
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex-row items-center"
          >
            <Clock size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-500 text-xs mb-1">End Time</Text>
              <Text className="text-gray-900 font-semibold">
                {formatDateTime(formData.endTime)}
              </Text>
            </View>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={formData.endTime}
              mode="datetime"
              display="default"
              minimumDate={formData.startTime}
              onChange={(_event: any, date?: Date) => {
                setShowEndPicker(false);
                if (date) setFormData({ ...formData, endTime: date });
              }}
            />
          )}
        </View>

        {/* Purpose */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">Booking Purpose</Text>

          <View className="flex-row flex-wrap gap-3">
            {purposes.map((purpose) => (
              <TouchableOpacity
                key={purpose}
                onPress={() => setFormData({ ...formData, purpose: purpose as any })}
                className={`px-6 py-3 rounded-full border-2 ${
                  formData.purpose === purpose
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-blue-200"
                }`}
              >
                <Text
                  className={`font-semibold capitalize ${
                    formData.purpose === purpose ? "text-white" : "text-gray-700"
                  }`}
                >
                  {purpose}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <MessageSquare size={20} color="#3B82F6" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Additional Message</Text>
          </View>

          <TextInput
            className="bg-white border-2 border-blue-200 rounded-xl p-4 text-gray-800"
            placeholder="Any special requirements or notes..."
            value={formData.message}
            onChangeText={(val) => setFormData({ ...formData, message: val })}
            multiline
            numberOfLines={4}
            style={{ textAlignVertical: "top", minHeight: 100 }}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
            loading ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Submit Booking Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
