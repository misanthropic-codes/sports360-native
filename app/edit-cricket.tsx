import { createCricketProfile } from "@/api/userApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditCricketProfile() {
  const { token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    playingPosition: "batsman" as "batsman" | "bowler" | "wicket_keeper" | "allrounder",
    bowlingStyle: "right_arm_fast" as any,
    battingStyle: "right_handed" as "right_handed" | "left_handed",
    experienceLevel: "intermediate" as "beginner" | "intermediate" | "professional",
    location: "",
    bio: "",
    availableForTeamSelection: true,
    availableForCaptain: false,
    receiveTournamentNotifications: true,
    batsmanType: "",
  });

  const [dropdownVisible, setDropdownVisible] = useState({
    position: false,
    bowling: false,
    batting: false,
    experience: false,
  });

  const positions = ["batsman", "bowler", "wicket_keeper", "allrounder"];
  const bowlingStyles = [
    "right_arm_fast",
    "right_arm_medium",
    "right_arm_spin",
    "left_arm_fast",
    "left_arm_spin",
    "left_arm_medium",
  ];
  const battingStyles = ["right_handed", "left_handed"];
  const experienceLevels = ["beginner", "intermediate", "professional"];

  const formatLabel = (str: string) => {
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleSave = async () => {
    if (!formData.location.trim()) {
      Alert.alert("Validation Error", "Please enter your location");
      return;
    }

    setLoading(true);
    try {
      await createCricketProfile(formData, token || "");
      Alert.alert("Success", "Cricket profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const Dropdown = ({
    label,
    value,
    options,
    visible,
    onToggle,
    onSelect,
  }: {
    label: string;
    value: string;
    options: string[];
    visible: boolean;
    onToggle: () => void;
    onSelect: (val: string) => void;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-2">{label} *</Text>
      <TouchableOpacity
        onPress={onToggle}
        className="bg-white border-2 border-blue-200 rounded-xl p-4 flex-row justify-between items-center"
      >
        <Text className="text-gray-800">{formatLabel(value)}</Text>
        <Text className="text-blue-600">▼</Text>
      </TouchableOpacity>

      {visible && (
        <View className="bg-white border-2 border-blue-200 rounded-xl mt-2">
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onSelect(option);
                onToggle();
              }}
              className={`p-4 ${
                index < options.length - 1 ? "border-b border-blue-100" : ""
              } ${value === option ? "bg-blue-50" : ""}`}
            >
              <Text
                className={`${
                  value === option ? "text-blue-600 font-semibold" : "text-gray-800"
                }`}
              >
                {formatLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-6 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white flex-1">Edit Cricket Profile</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Playing Details */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">Playing Details</Text>

          <Dropdown
            label="Playing Position"
            value={formData.playingPosition}
            options={positions}
            visible={dropdownVisible.position}
            onToggle={() =>
              setDropdownVisible({ ...dropdownVisible, position: !dropdownVisible.position })
            }
            onSelect={(val) =>
              setFormData({ ...formData, playingPosition: val as any })
            }
          />

          <Dropdown
            label="Bowling Style"
            value={formData.bowlingStyle || "right_arm_fast"}
            options={bowlingStyles}
            visible={dropdownVisible.bowling}
            onToggle={() =>
              setDropdownVisible({ ...dropdownVisible, bowling: !dropdownVisible.bowling })
            }
            onSelect={(val) => setFormData({ ...formData, bowlingStyle: val })}
          />

          <Dropdown
            label="Batting Style"
            value={formData.battingStyle}
            options={battingStyles}
            visible={dropdownVisible.batting}
            onToggle={() =>
              setDropdownVisible({ ...dropdownVisible, batting: !dropdownVisible.batting })
            }
            onSelect={(val) => setFormData({ ...formData, battingStyle: val as any })}
          />

          <Dropdown
            label="Experience Level"
            value={formData.experienceLevel}
            options={experienceLevels}
            visible={dropdownVisible.experience}
            onToggle={() =>
              setDropdownVisible({ ...dropdownVisible, experience: !dropdownVisible.experience })
            }
            onSelect={(val) => setFormData({ ...formData, experienceLevel: val as any })}
          />

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Batsman Type</Text>
            <TextInput
              className="bg-white border-2 border-blue-200 rounded-xl p-4 text-gray-800"
              placeholder="e.g., Opener, Middle Order"
              value={formData.batsmanType}
              onChangeText={(val) => setFormData({ ...formData, batsmanType: val })}
            />
          </View>
        </View>

        {/* Personal Info */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">Personal Info</Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Location *</Text>
            <TextInput
              className="bg-white border-2 border-blue-200 rounded-xl p-4 text-gray-800"
              placeholder="e.g., Mumbai, India"
              value={formData.location}
              onChangeText={(val) => setFormData({ ...formData, location: val })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">Bio</Text>
            <TextInput
              className="bg-white border-2 border-blue-200 rounded-xl p-4 text-gray-800"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChangeText={(val) => setFormData({ ...formData, bio: val })}
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: "top", minHeight: 100 }}
            />
          </View>
        </View>

        {/* Preferences */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">Preferences</Text>

          <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <Text className="text-gray-700 flex-1">Available for Team Selection</Text>
            <Switch
              value={formData.availableForTeamSelection}
              onValueChange={(val) =>
                setFormData({ ...formData, availableForTeamSelection: val })
              }
              trackColor={{ false: "#d1d5db", true: "#DBEAFE" }}
              thumbColor={formData.availableForTeamSelection ? "#3B82F6" : "#9ca3af"}
            />
          </View>

          <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <Text className="text-gray-700 flex-1">Available for Captain Role</Text>
            <Switch
              value={formData.availableForCaptain}
              onValueChange={(val) =>
                setFormData({ ...formData, availableForCaptain: val })
              }
              trackColor={{ false: "#d1d5db", true: "#DBEAFE" }}
              thumbColor={formData.availableForCaptain ? "#3B82F6" : "#9ca3af"}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700 flex-1">Receive Tournament Notifications</Text>
            <Switch
              value={formData.receiveTournamentNotifications}
              onValueChange={(val) =>
                setFormData({ ...formData, receiveTournamentNotifications: val })
              }
              trackColor={{ false: "#d1d5db", true: "#DBEAFE" }}
              thumbColor={formData.receiveTournamentNotifications ? "#3B82F6" : "#9ca3af"}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
            loading ? "bg-gray-400" : "bg-blue-600"
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
