import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  NativeSyntheticEvent,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

const handleSignUp = () => {
  console.log("Sign Up button pressed");

  router.push("/(root)/signup");
};

const VerifyScreen: React.FC = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const correctOtp: string = "8899"; // The correct OTP for verification

  const handleTextChange = (text: string, index: number) => {
    // Allows only single digit numbers
    if (/^[0-9]$/.test(text) || text === "") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to the next input field if a digit is entered
      if (text !== "" && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyPress = (
    { nativeEvent: { key } }: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    // Move to the previous input field on backspace if current is empty
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 4 && enteredOtp === correctOtp) {
      setIsVerified(true);
    } else {
      Alert.alert("Error", "Invalid OTP. Please try again.");
      setOtp(["", "", "", ""]); // Reset fields
      inputRefs[0].current?.focus(); // Focus the first input
    }
  };

  // Renders the Success Screen
  if (isVerified) {
    return (
      <SafeAreaView className="flex-1 bg-blue-600">
        <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
        <View className="flex-1 justify-center items-center p-6">
          <View className="bg-white rounded-full p-5 mb-8">
            <Feather name="check" size={60} color="#2563eb" />
          </View>
          <Text className="text-white text-4xl font-bold mb-2">Success !</Text>
          <Text className="text-gray-200 text-lg">
            Your account has been verified
          </Text>
        </View>
        <View className="p-6">
          <TouchableOpacity
            className="bg-white w-full py-4 rounded-full items-center"
            onPress={handleSignUp}
          >
            <Text className="text-blue-600 text-lg font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Renders the OTP Verification Screen
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1 p-6">
        <TouchableOpacity
          onPress={() => console.log("Back button pressed")}
          className="self-start"
        >
          <Ionicons name="arrow-back-circle" size={44} color="#3b82f6" />
        </TouchableOpacity>

        <View className="mt-8">
          <Text className="text-blue-600 text-3xl font-bold">
            Verification Code
          </Text>
          <Text className="text-gray-500 text-base mt-2 mb-12">
            We have sent the verification code to your email address
          </Text>
        </View>

        <View className="flex-row justify-between w-full mb-12">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              className="w-16 h-16 border-2 border-gray-200 rounded-xl text-center text-3xl font-bold text-gray-800 focus:border-blue-500"
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleTextChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>
      </View>

      <View className="p-6">
        <TouchableOpacity
          className="bg-blue-600 w-full py-4 rounded-full items-center"
          onPress={handleVerify}
        >
          <Text className="text-white text-lg font-bold">Verify</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VerifyScreen;
