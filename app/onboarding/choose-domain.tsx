import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";

// --- Reusable Progress Indicator ---
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <View className="w-full px-6 pt-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white font-medium">
          Step {currentStep} of {totalSteps}
        </Text>
        <Text className="text-white bg-white/30 px-2 py-1 rounded text-xs font-semibold">
          {percentage}%
        </Text>
      </View>

      <View className="w-full h-3 bg-white/30 rounded-full relative overflow-hidden">
        <View
          style={{ width: `${percentage}%` }}
          className="absolute h-full bg-white rounded-full"
        />
        <View
          style={{
            left: `${percentage}%`,
            transform: [{ translateX: -10 }],
          }}
          className="absolute w-5 h-5 bg-white border-4 border-blue-600 rounded-full -top-1"
        />
      </View>
    </View>
  );
};

// --- Domain options ---
interface Domain {
  name: string;
  icon: string;
}

const domains: Domain[] = [
  { name: "Cricket", icon: "cricket" },
  { name: "Marathon", icon: "run" },
];

// --- Main Screen ---
const ChooseDomainScreen: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const { role } = useLocalSearchParams();

  const handleContinue = () => {
    if (!selectedDomain || !role) {
      console.warn("Missing role or domain");
      return;
    }

    const formattedRole = String(role).toLowerCase().replace(/\s+/g, "-");
    const formattedDomain = selectedDomain.toLowerCase();

    const targetRoute = `/onboarding/${formattedRole}/${formattedDomain}-form`;

    console.log("Navigating to:", targetRoute);
    router.push(targetRoute);
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-600">
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* Blue Header Area */}
          <View className="bg-blue-600 pt-8 pb-6 px-4">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="arrow-back-circle" size={40} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold ml-3">
                Complete Your Profile
              </Text>
            </View>

            <ProgressIndicator currentStep={1} totalSteps={2} />
          </View>

          {/* White Content Area */}
          <View className="flex-1 bg-gray-100 rounded-t-3xl">
            <View className="items-center p-6">
              <View className="bg-blue-500 rounded-full py-3 px-6 mb-8 shadow-md shadow-black">
                <Text className="text-white font-bold text-lg">
                  Choose Your Domain
                </Text>
              </View>

              <View className="w-full items-center">
                {domains.map((domain) => {
                  const isSelected = selectedDomain === domain.name;
                  return (
                    <TouchableOpacity
                      key={domain.name}
                      onPress={() => setSelectedDomain(domain.name)}
                      className={`
                        w-48 h-36 items-center justify-center rounded-2xl mb-6 border-2
                        ${
                          isSelected
                            ? "bg-blue-100 border-blue-500"
                            : "bg-white border-gray-200"
                        }
                        shadow-lg shadow-black
                      `}
                      style={styles.androidShadow}
                    >
                      <MaterialCommunityIcon
                        name={domain.icon}
                        size={60}
                        color={isSelected ? "#2563eb" : "#4b5563"}
                      />
                      <Text
                        className={`text-lg font-bold mt-2 ${
                          isSelected ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {domain.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Continue Button */}
            <View className="p-6 mt-auto">
              <TouchableOpacity
                className={`w-full py-4 rounded-full items-center shadow-md shadow-black ${
                  selectedDomain ? "bg-blue-600" : "bg-gray-400"
                }`}
                onPress={handleContinue}
                disabled={!selectedDomain}
              >
                <Text className="text-white text-lg font-bold">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  androidShadow: {
    elevation: 8,
  },
});

export default ChooseDomainScreen;
