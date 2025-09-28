import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  domains?: string[];
  token: string;
}

interface LoginResponse {
  success: boolean;
  data: UserData;
  message?: string;
}

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  domains: string[];
  token: string;
}

const LoginScreen = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        identifier: email,
        password: password,
      });

      if (response.data && response.data.success) {
        const userData: UserData = response.data.data;

        // Save user to context
        await login({
          id: userData.id,
          fullName: userData.fullName,
          email: userData.email,
          role: userData.role,
          domains: userData.domains || [],
          token: userData.token,
        });

        // Store role and domain (if present) in AsyncStorage
        await AsyncStorage.setItem("userRole", userData.role);
        if (userData.domains && userData.domains.length > 0) {
          await AsyncStorage.setItem("userDomain", userData.domains[0]);
        }

        Alert.alert("Success", "Logged in successfully!");

        const role = userData.role;
        const domain = userData.domains?.[0];

        console.log("Login successful, user role:", role);

        if (role && !domain) {
          console.log(
            "Role present but no domain, redirecting to choose-domain"
          );
          router.replace("/onboarding/choose-domain");
        } else if (role && domain) {
          console.log(
            "Role and domain present, redirecting to dashboard:",
            role,
            domain
          );
          router.replace(`/dashboard/${role}/${domain}` as any);
        } else {
          console.log("Fallback redirect to feed/cricket-feed");
          router.replace("/feed/cricket");
        }
      } else {
        throw new Error(response.data.message || "An unknown error occurred");
      }
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "Invalid credentials or server error.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response?.data?.message
      ) {
        errorMessage = (error as any).response.data.message;
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("/(root)/signup");
  };

  return (
    <SafeAreaView className="flex-1 relative bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#166FFF" />

      {/* Background header container */}
      <View className="absolute top-0 left-0 right-0 h-[90%] bg-primary rounded-b-[40px] z-0" />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-14 left-5 p-2 z-20"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 z-10"
      >
        {/* Welcome texts */}
        <View className="items-center mt-24 px-5">
          <Text className="text-white text-lg">Welcome Back!</Text>
          <Text className="text-white text-3xl font-bold mt-2 text-center">
            Sign in to your Account
          </Text>
          <Text className="text-white text-base mt-2 text-center">
            Enter your email and password to log in
          </Text>
        </View>

        {/* Login Box */}
        <View className="bg-white rounded-2xl p-6 mx-5 mt-10 shadow-lg z-10">
          {/* Google login button */}
          <Text className="text-grayText text-center text-sm">
            Continue with
          </Text>
          <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-lg py-3 mt-3">
            <Ionicons name="logo-google" size={22} color="#000000" />
            <Text className="text-textBlack font-semibold ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-grayText text-sm">Or login with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Email Input */}
          <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-4">
            <TextInput
              className="flex-1 h-12 text-base text-textBlack"
              placeholder="Enter your email"
              placeholderTextColor="#636364"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-4">
            <TextInput
              className="flex-1 h-12 text-base text-textBlack"
              placeholder="Enter your password"
              placeholderTextColor="#636364"
              secureTextEntry={!isPasswordShown}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
            >
              <Feather
                name={isPasswordShown ? "eye" : "eye-off"}
                size={22}
                color="#636364"
              />
            </TouchableOpacity>
          </View>

          {/* Remember me + Forgot password */}
          <View className="flex-row justify-between items-center mb-5">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={24}
                color={rememberMe ? "#166FFF" : "#636364"}
              />
              <Text className="ml-2 text-grayText">Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button with Loader */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-primary py-4 rounded-lg items-center flex-row justify-center"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-lg font-bold">Log In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Sign Up Prompt */}
      <View className="flex-row justify-center mt-2 mb-5 z-10">
        <Text className="text-textBlack">Don't have an account? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text className="text-primary font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
