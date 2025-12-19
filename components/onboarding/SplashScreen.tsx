import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const SplashScreen = () => {
  const router = useRouter();
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo appearance
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
    opacity.value = withTiming(1, { duration: 500 });

    // Navigate to onboarding slides after delay
    const timer = setTimeout(() => {
      router.replace('/onboarding/slides');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#166FFF" />
      
      <View className="flex-1 justify-center items-center px-6">
        <Animated.View style={animatedStyle} className="items-center">
          {/* Logo */}
          <Text className="text-white font-rubikExtraBold text-6xl">
            Sports360
          </Text>
          
          {/* Tagline */}
          <Text className="text-white font-rubikMedium text-xl mt-4 opacity-90">
            Your Team. Your Turf.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;
