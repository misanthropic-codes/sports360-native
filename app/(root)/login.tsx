import AsyncStorage from "@react-native-async-storage/async-storage";
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
        const { token, role } = response.data.data;

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("userRole", role);

        login(); // Set user in context

        Alert.alert("Success", "Logged in successfully!");

        router.replace(`/dashboard/${role}/cricket` as any);
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
        typeof (error as any).response === "object" &&
        (error as any).response !== null &&
        "data" in (error as any).response &&
        typeof (error as any).response.data === "object" &&
        (error as any).response.data !== null &&
        "message" in (error as any).response.data
      ) {
        errorMessage = (error as any).response.data.message;
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push("signup");
  };

  return (
    <SafeAreaView className="flex-1 relative bg-white">
      {/* ... (Your existing UI code remains mostly the same) ... */}
      <StatusBar barStyle="light-content" backgroundColor="#166FFF" />
      <View className="absolute top-0 left-0 right-0 h-[90%] bg-primary rounded-b-[40px] z-0" />
      <TouchableOpacity
        onPress={() => navigation.goBack()} // Use goBack() for better navigation practice
        className="absolute top-14 left-5 p-2 z-20"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 z-10"
      >
        <View className="items-center mt-24 px-5">
          <Text className="text-white text-lg">Welcome Back!</Text>
          <Text className="text-white text-3xl font-bold mt-2 text-center">
            Sign in to your Account
          </Text>
          <Text className="text-white text-base mt-2 text-center">
            Enter your email and password to log in
          </Text>
        </View>
        <View className="bg-white rounded-2xl p-6 mx-5 mt-10 shadow-lg z-10">
          {/* ... (Google login and divider) ... */}
          <Text className="text-grayText text-center text-sm">
            Continue with
          </Text>
          <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-lg py-3 mt-3">
            <Ionicons name="logo-google" size={22} color="#000000" />
            <Text className="text-textBlack font-semibold ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>
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

          {/* ... (Remember me and Forgot Password) ... */}
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

          {/* ✨ CHANGED: Login Button now shows ActivityIndicator */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-primary py-4 rounded-lg items-center flex-row justify-center"
            disabled={loading} // Disable button when loading
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
