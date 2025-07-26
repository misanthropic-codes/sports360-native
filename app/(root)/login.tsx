import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

const LoginScreen = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = () => {
    console.log("Sign Up button pressed");

    router.push("/signup");
  };

  return (
    <SafeAreaView className="flex-1 relative bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#166FFF" />

      {/* Blue background stretched */}
      <View className="absolute top-0 left-0 right-0 h-[90%] bg-primary rounded-b-[40px] z-0" />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("/" as never)}
        className="absolute top-14 left-5 p-2 z-20"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 z-10"
      >
        {/* Header Content */}
        <View className="items-center mt-24 px-5">
          <Text className="text-white text-lg">Welcome Back!</Text>
          <Text className="text-white text-3xl font-bold mt-2 text-center">
            Sign in to your Account
          </Text>
          <Text className="text-white text-base mt-2 text-center">
            Enter your email and password to log in
          </Text>
        </View>

        {/* Login Form Card */}
        <View className="bg-white rounded-2xl p-6 mx-5 mt-10 shadow-lg z-10">
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
              placeholder="riyasingh@gmail.com"
              placeholderTextColor="#636364"
              keyboardType="email-address"
              defaultValue="riyasingh@gmail.com"
            />
          </View>

          {/* Password Input */}
          <View className="flex-row items-center border border-gray-200 rounded-lg px-4 mb-4">
            <TextInput
              className="flex-1 h-12 text-base text-textBlack"
              placeholder="********"
              placeholderTextColor="#636364"
              secureTextEntry={!isPasswordShown}
              defaultValue="********"
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

          {/* Remember Me & Forgot Password */}
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

          {/* Log In Button */}
          <TouchableOpacity className="bg-primary py-4 rounded-lg items-center">
            <Text className="text-white text-lg font-bold">Log In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Sign Up Prompt - moved just below blue area with ~5px space */}
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
