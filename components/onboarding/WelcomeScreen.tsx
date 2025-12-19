import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const WelcomeScreen = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.replace('/(root)/login');
  };

  const handleSignUp = () => {
    router.replace('/(root)/signup');
  };

  const handleGuestMode = () => {
    router.push('/guest/dashboard');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#166FFF" />

      <View className="flex-1 justify-center items-center px-6">
        {/* Icon */}
        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6 opacity-90">
          <Feather name="zap" size={40} color="#166FFF" />
        </View>

        {/* Logo and Tagline */}
        <View className="items-center mb-8">
          <Text className="text-white font-rubikExtraBold text-5xl">
            Sports360
          </Text>
          <Text className="text-white font-rubikMedium text-xl mt-2 opacity-90">
            Your Team. Your Turf.
          </Text>
        </View>

        {/* Welcome Message */}
        <View className="items-center mb-12 px-6">
          <Text className="text-white font-rubikSemiBold text-2xl text-center mb-2">
            Ready to Get Started?
          </Text>
          <Text className="text-white font-rubikRegular text-base text-center opacity-80 leading-6">
            Join the Sports360 community and experience the future of sports management
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full px-6">
          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="bg-white py-4 rounded-xl items-center justify-center shadow-lg mb-4"
            activeOpacity={0.8}
          >
            <Text className="text-primary font-rubikBold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>

          {/* Log In Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="border-2 border-white py-4 rounded-xl items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-rubikBold text-lg">
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest Mode (Optional) */}
        <TouchableOpacity onPress={handleGuestMode} className="mt-6" activeOpacity={0.7}>
          <Text className="text-white font-rubikRegular text-sm opacity-70">
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
