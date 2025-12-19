import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import SignupPrompt from '../../components/guest/SignupPrompt';
import { useGuestStore } from '../../store/guest/guestStore';

const GuestDashboard = () => {
  const router = useRouter();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    platformStats,
    loadingStats,
    fetchPlatformStats,
  } = useGuestStore();

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlatformStats(true);
    setRefreshing(false);
  };

  const handleFeatureClick = (route: string, requiresAuth: boolean = false) => {
    if (requiresAuth) {
      setShowSignupPrompt(true);
    } else {
      router.push(route as any);
    }
  };

  const statsCards = [
    {
      label: 'Teams',
      value: platformStats?.totalTeams || 0,
      icon: 'users',
      color: '#2563EB',
      bgColor: '#EFF6FF',
    },
    {
      label: 'Tournaments',
      value: platformStats?.totalTournaments || 0,
      icon: 'award',
      color: '#7C3AED',
      bgColor: '#F3E8FF',
    },
    {
      label: 'Grounds',
      value: platformStats?.totalGrounds || 0,
      icon: 'map-pin',
      color: '#15803d',
      bgColor: '#f0fdf4',
    },
    {
      label: 'Active Players',
      value: platformStats?.totalPlayers || 0,
      icon: 'activity',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
  ];

  const features = [
    {
      id: 'teams',
      title: 'Explore Teams',
      description: 'Browse teams from around the world',
      icon: 'users',
      color: '#2563EB',
      route: '/guest/teams',
      requiresAuth: false,
    },
    {
      id: 'tournaments',
      title: 'Upcoming Tournaments',
      description: 'View featured and upcoming tournaments',
      icon: 'calendar',
      color: '#7C3AED',
      route: '/guest/tournaments',
      requiresAuth: false,
    },
    {
      id: 'grounds',
      title: 'Find Grounds',
      description: 'Discover sports facilities nearby',
      icon: 'map-pin',
      color: '#15803d',
      route: '/guest/grounds',
      requiresAuth: false,
    },
    {
      id: 'join-tournament',
      title: 'Join a Tournament',
      description: 'Participate in competitions',
      icon: 'zap',
      color: '#F59E0B',
      route: '',
      requiresAuth: true,
    },
    {
      id: 'create-team',
      title: 'Create Your Team',
      description: 'Build and manage your own team',
      icon: 'plus-circle',
      color: '#EF4444',
      route: '',
      requiresAuth: true,
    },
    {
      id: 'book-ground',
      title: 'Book a Ground',
      description: 'Reserve venues for your games',
      icon: 'calendar',
      color: '#8B5CF6',
      route: '',
      requiresAuth: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 font-rubikBold text-2xl">
              Guest Mode
            </Text>
            <Text className="text-gray-600 font-rubikRegular text-sm mt-1">
              Explore Sports360 features
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSignupPrompt(true)}
            className="bg-primary px-4 py-2 rounded-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-rubikSemiBold text-sm">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-gray-900 font-rubikSemiBold text-lg mb-3">
            Platform Overview
          </Text>

          {loadingStats && !platformStats ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : (
            <View className="flex-row flex-wrap -mx-2">
              {statsCards.map((stat, index) => (
                <View key={index} className="w-1/2 px-2 mb-3">
                  <View className="bg-white rounded-xl p-4 border border-gray-200">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mb-3"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <Feather name={stat.icon as any} size={24} color={stat.color} />
                    </View>
                    <Text className="text-gray-900 font-rubikBold text-2xl">
                      {stat.value.toLocaleString()}
                    </Text>
                    <Text className="text-gray-600 font-rubikRegular text-sm mt-1">
                      {stat.label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Features Section */}
        <View className="px-6 pb-4">
          <Text className="text-gray-900 font-rubikSemiBold text-lg mb-3">
            Explore Features
          </Text>

          <View className="space-y-3">
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                onPress={() => handleFeatureClick(feature.route, feature.requiresAuth)}
                className="bg-white rounded-xl p-4 border border-gray-200 flex-row items-center mb-3"
                activeOpacity={0.7}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <Feather name={feature.icon as any} size={24} color={feature.color} />
                </View>
                
                <View className="flex-1">
                  <Text className="text-gray-900 font-rubikSemiBold text-base">
                    {feature.title}
                  </Text>
                  <Text className="text-gray-600 font-rubikRegular text-sm mt-1">
                    {feature.description}
                  </Text>
                </View>

                {feature.requiresAuth ? (
                  <View className="bg-yellow-100 px-3 py-1 rounded-full mr-2">
                    <Text className="text-yellow-800 font-rubikMedium text-xs">
                      Sign Up
                    </Text>
                  </View>
                ) : null}

                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <View className="px-6 pb-6">
          <View className="bg-primary rounded-2xl p-6">
            <View className="items-center">
              <Feather name="star" size={32} color="#FFFFFF" />
              <Text className="text-white font-rubikBold text-xl mt-3 text-center">
                Ready to Join?
              </Text>
              <Text className="text-white font-rubikRegular text-sm mt-2 text-center opacity-90">
                Create an account to access all features and join the community
              </Text>
              
              <TouchableOpacity
                onPress={() => router.push('/(root)/signup')}
                className="bg-white px-8 py-3 rounded-xl mt-4"
                activeOpacity={0.8}
              >
                <Text className="text-primary font-rubikBold text-base">
                  Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(root)/login')}
                className="mt-2"
                activeOpacity={0.7}
              >
                <Text className="text-white font-rubikMedium text-sm underline">
                  Already have an account? Log in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Signup Prompt Modal */}
      <SignupPrompt
        visible={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
      />
    </SafeAreaView>
  );
};

export default GuestDashboard;
