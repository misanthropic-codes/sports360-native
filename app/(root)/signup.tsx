import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../api/api";

import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../context/AuthContext";

type Role = "Player" | "Organizer" | "Ground Owner";

const RoleCard = ({
  IconComponent,
  iconName,
  label,
  selected,
  onPress,
}: {
  IconComponent: any;
  iconName: string;
  label: Role;
  selected: Role;
  onPress: (role: Role) => void;
}) => {
  const isSelected = selected === label;

  // Assign colors based on role
  const roleColors: Record<Role, string> = {
    Player: "#166FFF", // blue
    Organizer: "#8B5CF6", // purple
    "Ground Owner": "#FF9800", // orange
  };

  const borderColor = isSelected ? roleColors[label] : "#E5E7EB";
  const textColor = isSelected ? roleColors[label] : "#166FFF";
  const iconColor = isSelected ? roleColors[label] : "#166FFF";

  return (
    <TouchableOpacity
      onPress={() => onPress(label)}
      className="flex-1 items-center justify-center h-28 mx-2 rounded-2xl bg-white"
      style={{
        borderWidth: isSelected ? 2 : 1,
        borderColor,
      }}
    >
      <IconComponent name={iconName} size={32} color={iconColor} />
      <Text className="mt-2 font-rubikMedium" style={{ color: textColor }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const SignupScreen = () => {
  const [selectedRole, setSelectedRole] = useState<Role>("Organizer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignUp = async () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    const payload = {
      fullName,
      email,
      profilePicUrl: "https://example.com/default-avatar.png",
      phone: `+91 ${phone}`,
      password,
      role: selectedRole.toLowerCase().replace(" ", "_"),
    };

    console.log("Sending payload:", payload);

    try {
      setLoading(true);
      const response = await api.post("/auth/register/", payload);

      console.log("API Response:", response.data);

      if (response.status < 200 || response.status >= 300) {
        const msg = response.data?.message || "Sign up failed";
        Alert.alert("Error", msg);
        return;
      }

      login();

      Alert.alert("Success", "Account created successfully!");
      router.replace(
        `/onboarding/choose-domain?role=${encodeURIComponent(selectedRole)}`
      );
    } catch (err) {
      console.error("Sign Up Error:", err);
      Alert.alert("Network Error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#166FFF" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="bg-primary pt-6 pb-8 rounded-b-[40px]">
          <View className="px-5">
            <TouchableOpacity
              className="self-start p-2 -ml-2"
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={28} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white font-rubikBold text-3xl mt-4">
              Create Your Account
            </Text>
            <Text className="text-white font-rubik text-base mt-1">
              Join Sports360 community today!
            </Text>
          </View>

          <View className="mt-6">
            <View className="flex-row items-center px-6">
              <View className="flex-1 h-px bg-white/50" />
              <Text className="text-white font-rubikMedium mx-4">
                I want to register as
              </Text>
              <View className="flex-1 h-px bg-white/50" />
            </View>

            <View className="flex-row justify-between mt-4 px-4">
              <RoleCard
                label="Player"
                IconComponent={FontAwesome5}
                iconName="running"
                selected={selectedRole}
                onPress={setSelectedRole}
              />
              <RoleCard
                label="Organizer"
                IconComponent={Ionicons}
                iconName="briefcase"
                selected={selectedRole}
                onPress={setSelectedRole}
              />
              <RoleCard
                label="Ground Owner"
                IconComponent={MaterialCommunityIcons}
                iconName="stadium"
                selected={selectedRole}
                onPress={setSelectedRole}
              />
            </View>
          </View>
        </View>

        <View className="px-6 py-6">
          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Enter full name
            </Text>
            <TextInput
              className="bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2"
              placeholder="Riya Singh"
              placeholderTextColor="#C0C0C0"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Enter email address
            </Text>
            <TextInput
              className="bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2"
              placeholder="riyasingh@gmail.com"
              placeholderTextColor="#C0C0C0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Enter phone number
            </Text>
            <View className="flex-row items-center bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2">
              <Text className="font-rubik text-textBlack mr-2">+91</Text>
              <TextInput
                className="flex-1 h-full font-rubik text-textBlack"
                placeholder="9876543210"
                placeholderTextColor="#C0C0C0"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TouchableOpacity onPress={() => router.push("/verifyScreen")}>
                <Text className="font-rubikSemiBold text-primary">
                  Verify through OTP
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Create password
            </Text>
            <View className="flex-row items-center bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2">
              <TextInput
                className="flex-1 h-full font-rubik text-textBlack"
                placeholder="********"
                placeholderTextColor="#C0C0C0"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible((prev) => !prev)}
              >
                <Feather
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#636364"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Confirm password
            </Text>
            <View className="flex-row items-center bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2">
              <TextInput
                className="flex-1 h-full font-rubik text-textBlack"
                placeholder="********"
                placeholderTextColor="#C0C0C0"
                secureTextEntry={!isConfirmPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
              >
                <Feather
                  name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#636364"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className="bg-primary rounded-full h-14 items-center justify-center mt-8"
          >
            <Text className="text-white font-rubikBold text-lg">
              {loading ? "Signing Up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="font-rubikMedium text-grayText">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(root)/login")}>
              <Text className="font-rubikBold text-primary">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;
