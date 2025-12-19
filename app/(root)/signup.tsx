import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import api from "../../api/api";
import { setOnboardingComplete } from "../../utils/onboardingUtils";

import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type Role = "Player" | "Organizer" | "Ground Owner";

// API Response interfaces
interface SignupResponse {
  status: number;
  success: boolean;
  data: any[]; // We don't need to store this anymore
}

interface SignupPayload {
  fullName: string;
  email: string;
  dateOfBirth: string;
  profilePicUrl: string;
  phone: string;
  password: string;
  role: "player" | "organizer" | "ground_owner";
}

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
      className="flex-1 items-center justify-center h-28 mx-2 rounded-2xl bg-white relative"
      style={{
        borderWidth: isSelected ? 2 : 1,
        borderColor,
      }}
    >
      {/* Checkbox indicator in corner */}
      <View className="absolute top-2 right-2">
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"} 
          size={20} 
          color={isSelected ? roleColors[label] : "#C0C0C0"} 
        />
      </View>
      
      <IconComponent name={iconName} size={32} color={iconColor} />
      <Text className="mt-2 font-rubikMedium" style={{ color: textColor }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const SignupScreen = () => {
  const [selectedRole, setSelectedRole] = useState<Role>("Player");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  
  // Error states for live validation
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Helper function to convert role display name to backend format
  const getRoleValue = (role: Role): "player" | "organizer" | "ground_owner" => {
    const roleMap: Record<Role, "player" | "organizer" | "ground_owner"> = {
      Player: "player",
      Organizer: "organizer",
      "Ground Owner": "ground_owner",
    };
    return roleMap[role];
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Validation functions
  const validateFullName = (name: string): string => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    if (phone.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    if (!/^[0-9]+$/.test(phone)) {
      return "Phone number must contain only digits";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*[0-9])/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPwd: string, pwd: string): string => {
    if (!confirmPwd) {
      return "Please confirm your password";
    }
    if (confirmPwd !== pwd) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleSignUp = async () => {
    // Validate all fields
    const nameError = validateFullName(fullName);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const pwdError = validatePassword(password);
    const confirmPwdError = validateConfirmPassword(confirmPassword, password);

    // Set all errors
    setFullNameError(nameError);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    setPasswordError(pwdError);
    setConfirmPasswordError(confirmPwdError);

    // Check if any errors exist
    if (nameError || emailErr || phoneErr || pwdError || confirmPwdError) {
      Alert.alert("Validation Error", "Please fix all errors before submitting");
      return;
    }

    // Prepare payload matching backend requirements
    const payload: SignupPayload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      dateOfBirth: formatDate(dateOfBirth),
      profilePicUrl: "https://example.com/profile.jpg",
      phone: phone.startsWith("+") ? phone : `+91${phone}`,
      password,
      role: getRoleValue(selectedRole),
    };

    console.log("📤 Sending signup payload:", payload);

    try {
      setLoading(true);
      const response = await api.post<SignupResponse>("/auth/register/", payload);

      console.log("📥 API Response:", response.data);

      if (!response.data.success || !response.data.data || response.data.data.length === 0) {
        Alert.alert("Error", "Sign up failed. Please try again.");
        return;
      }

      // Signup successful - mark onboarding complete and redirect to login
      await setOnboardingComplete();
      
      Alert.alert(
        "Success", 
        "Account created successfully! Please login with your credentials.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(root)/login")
          }
        ]
      );
    } catch (err: any) {
      console.error("❌ Sign Up Error:", err);
      const errorMessage = err.response?.data?.message || "Could not connect to server";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#166FFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View className="bg-primary pt-6 pb-8 rounded-b-[40px]">
              <View className="px-5">
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
              className="bg-gray-100/50 rounded-xl h-14 px-4 mt-2"
              style={{
                borderWidth: 1,
                borderColor: fullNameError ? '#EF4444' : '#E5E7EB',
              }}
              placeholder="John Doe"
              placeholderTextColor="#C0C0C0"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setFullNameError(validateFullName(text));
              }}
            />
            {fullNameError ? (
              <Text className="text-red-500 text-sm mt-1 ml-1">{fullNameError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Enter email address
            </Text>
            <TextInput
              className="bg-gray-100/50 rounded-xl h-14 px-4 mt-2"
              style={{
                borderWidth: 1,
                borderColor: emailError ? '#EF4444' : '#E5E7EB',
              }}
              placeholder="johndoe@gmail.com"
              placeholderTextColor="#C0C0C0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(validateEmail(text));
              }}
            />
            {emailError ? (
              <Text className="text-red-500 text-sm mt-1 ml-1">{emailError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Date of Birth
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-gray-100/50 border border-gray-200 rounded-xl h-14 px-4 mt-2 justify-center"
            >
              <Text className="font-rubik text-textBlack">
                {formatDate(dateOfBirth)}
              </Text>
            </TouchableOpacity>
            
            {/* iOS Date Picker Modal */}
            {Platform.OS === "ios" && showDatePicker && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={showDatePicker}
              >
                <View className="flex-1 justify-end bg-black/50">
                  <View className="bg-white rounded-t-3xl">
                    {/* Header with Done button */}
                    <View className="flex-row justify-between items-center px-5 py-3 border-b border-gray-200">
                      <Text className="font-rubikSemiBold text-lg text-textBlack">
                        Select Date of Birth
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        className="bg-primary px-4 py-2 rounded-full"
                      >
                        <Text className="text-white font-rubikSemiBold">Done</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Date Picker */}
                    <DateTimePicker
                      value={dateOfBirth}
                      mode="date"
                      display="spinner"
                      onChange={(event: any, selectedDate?: Date) => {
                        if (selectedDate) {
                          setDateOfBirth(selectedDate);
                        }
                      }}
                      maximumDate={new Date()}
                      textColor="#000000"
                    />
                  </View>
                </View>
              </Modal>
            )}
            
            {/* Android Date Picker */}
            {Platform.OS === "android" && showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="default"
                onChange={(event: any, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateOfBirth(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Enter phone number
            </Text>
            <View
              className="flex-row items-center bg-gray-100/50 rounded-xl h-14 px-4 mt-2"
              style={{
                borderWidth: 1,
                borderColor: phoneError ? '#EF4444' : '#E5E7EB',
              }}
            >
              <Text className="font-rubik text-textBlack mr-2">+91</Text>
              <TextInput
                className="flex-1 h-full font-rubik text-textBlack"
                placeholder="9876543210"
                placeholderTextColor="#C0C0C0"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setPhoneError(validatePhone(text));
                }}
                maxLength={10}
                returnKeyType="done"
              />
            </View>
            {phoneError ? (
              <Text className="text-red-500 text-sm mt-1 ml-1">{phoneError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Create password
            </Text>
            <View
              className="flex-row items-center bg-gray-100/50 rounded-xl h-14 px-4 mt-2"
              style={{
                borderWidth: 1,
                borderColor: passwordError ? '#EF4444' : '#E5E7EB',
              }}
            >
              <TextInput
                className="flex-1 h-full font-rubik text-textBlack"
                placeholder="********"
                placeholderTextColor="#C0C0C0"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError(validatePassword(text));
                  // Also revalidate confirm password when password changes
                  if (confirmPassword) {
                    setConfirmPasswordError(validateConfirmPassword(confirmPassword, text));
                  }
                }}
                returnKeyType="next"
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
            {passwordError ? (
              <Text className="text-red-500 text-sm mt-1 ml-1">{passwordError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="font-rubikMedium text-grayText">
              Confirm password
            </Text>
            <View
              className="flex-row items-center bg-gray-100/50 rounded-xl h-14 px-4 mt-2"
              style={{
                borderWidth: 1,
                borderColor: confirmPasswordError ? '#EF4444' : '#E5E7EB',
              }}
            >
              <TextInput
                className="flex-1 h-full font-rubik text-textBlack"
                placeholder="********"
                placeholderTextColor="#C0C0C0"
                secureTextEntry={!isConfirmPasswordVisible}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError(validateConfirmPassword(text, password));
                }}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() =>
                  setIsConfirmPasswordVisible((prev) => !prev)
                }
              >
                <Feather
                  name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#636364"
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text className="text-red-500 text-sm mt-1 ml-1">{confirmPasswordError}</Text>
            ) : null}
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
