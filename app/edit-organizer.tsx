import { updateOrganizerProfile } from "@/api/userApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
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

export default function EditOrganizerProfile() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phone || "",
    location: "",
    bio: "",
    organizationName: "",
  });

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert("Validation Error", "Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      await updateOrganizerProfile(formData, token || "");
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-600 px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white flex-1">Edit Profile</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Info */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
          <Text className="text-xl font-bold text-gray-800 mb-4">Personal Information</Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Full Name *</Text>
            <TextInput
              className="bg-white border-2 border-purple-200 rounded-xl p-4 text-gray-800"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(val) => setFormData({ ...formData, fullName: val })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Phone Number</Text>
            <TextInput
              className="bg-white border-2 border-purple-200 rounded-xl p-4 text-gray-800"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChangeText={(val) => setFormData({ ...formData, phoneNumber: val })}
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Location</Text>
            <TextInput
              className="bg-white border-2 border-purple-200 rounded-xl p-4 text-gray-800"
              placeholder="e.g., Mumbai, India"
              value={formData.location}
              onChangeText={(val) => setFormData({ ...formData, location: val })}
            />
          </View>
        </View>

        {/* Organization Info */}
        <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
          <Text className="text-xl font-bold text-gray-800 mb-4">Organization Details</Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Organization Name</Text>
            <TextInput
              className="bg-white border-2 border-purple-200 rounded-xl p-4 text-gray-800"
              placeholder="Enter organization name (optional)"
              value={formData.organizationName}
              onChangeText={(val) => setFormData({ ...formData, organizationName: val })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Bio</Text>
            <TextInput
              className="bg-white border-2 border-purple-200 rounded-xl p-4 text-gray-800"
              placeholder="Tell us about yourself or your organization..."
              value={formData.bio}
              onChangeText={(val) => setFormData({ ...formData, bio: val })}
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: "top", minHeight: 120 }}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
            loading ? "bg-gray-400" : "bg-purple-600"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Save size={20} color="#ffffff" />
              <Text className="text-white font-bold text-lg ml-2">Save Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
