import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { setOnboardingComplete } from '../../utils/onboardingUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  features: string[];
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'For Players',
    subtitle: 'Join & Compete',
    description: 'Connect with teams, participate in tournaments, and track your performance',
    color: '#2563EB', // Player blue
    icon: 'users',
    features: [
      'Join teams and build your network',
      'Participate in tournaments',
      'Track your stats and achievements',
      'Book grounds for practice',
    ],
  },
  {
    id: 2,
    title: 'For Organizers',
    subtitle: 'Create & Manage',
    description: 'Organize tournaments, manage events, and bring the community together',
    color: '#7C3AED', // Organizer purple
    icon: 'calendar',
    features: [
      'Create and manage tournaments',
      'Invite teams and players',
      'Schedule matches effortlessly',
      'Track event progress in real-time',
    ],
  },
  {
    id: 3,
    title: 'For Ground Owners',
    subtitle: 'List & Earn',
    description: 'List your grounds, manage bookings, and maximize your revenue',
    color: '#15803d', // Ground owner green
    icon: 'map-pin',
    features: [
      'List your sports facilities',
      'Manage bookings and availability',
      'Set pricing and time slots',
      'Track revenue and analytics',
    ],
  },
];

const OnboardingSlides = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleSkip = async () => {
    await setOnboardingComplete();
    router.replace('/onboarding/welcome');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: SCREEN_WIDTH * (currentIndex + 1),
        animated: true,
      });
    } else {
      handleSkip();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Skip Button */}
      <View className="absolute top-12 right-6 z-10">
        <TouchableOpacity onPress={handleSkip} className="px-4 py-2">
          <Text className="text-gray-600 font-rubikMedium text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={{ width: SCREEN_WIDTH }}
            className="flex-1 px-8 pt-24 pb-8"
          >
            {/* Icon Circle */}
            <View
              className="w-32 h-32 rounded-full items-center justify-center self-center mb-8"
              style={{ backgroundColor: `${slide.color}15` }}
            >
              <Feather name={slide.icon as any} size={64} color={slide.color} />
            </View>

            {/* Title */}
            <Text
              className="text-4xl font-rubikBold text-center mb-2"
              style={{ color: slide.color }}
            >
              {slide.title}
            </Text>

            {/* Subtitle */}
            <Text className="text-2xl font-rubikSemiBold text-center text-gray-800 mb-4">
              {slide.subtitle}
            </Text>

            {/* Description */}
            <Text className="text-base font-rubikRegular text-center text-gray-600 mb-8 px-4">
              {slide.description}
            </Text>

            {/* Features List */}
            <View className="space-y-4 px-4">
              {slide.features.map((feature, index) => (
                <View key={index} className="flex-row items-start">
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center mt-0.5"
                    style={{ backgroundColor: `${slide.color}20` }}
                  >
                    <Feather name="check" size={14} color={slide.color} />
                  </View>
                  <Text className="flex-1 text-gray-700 font-rubikRegular text-base ml-3">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section: Pagination + Next Button */}
      <View className="pb-8 px-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center items-center mb-6">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIndex ? 'w-8' : 'w-2'
              }`}
              style={{
                backgroundColor:
                  index === currentIndex
                    ? slides[currentIndex].color
                    : '#D1D5DB',
              }}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="py-4 rounded-xl items-center justify-center"
          style={{ backgroundColor: slides[currentIndex].color }}
          activeOpacity={0.8}
        >
          <Text className="text-white font-rubikSemiBold text-lg">
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingSlides;
