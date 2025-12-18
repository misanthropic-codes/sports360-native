import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { MapPin, Sparkles, TrendingUp } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavBar from "../../components/BottomNavBar";
import VenueCard from "../../components/Card";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import { useAuth } from "../../context/AuthContext";
import { useGroundStore } from "../../store/groundStore";

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const GroundBookingScreen = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    grounds,
    groundsLoading,
    fetchGrounds,
    setSelectedGround,
  } = useGroundStore();

  const role = user?.role || "player";
  const type = Array.isArray(user?.domains)
    ? user.domains.join(", ")
    : user?.domains || "team";

  useEffect(() => {
    if (!token) return;
    fetchGrounds(token);
  }, [token]);

  // Request location permission and get user's location
  const requestLocation = async () => {
    try {
      setLocationLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearest grounds.',
          [{ text: 'OK' }]
        );
        setLocationEnabled(false);
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      setLocationEnabled(true);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
      setLocationEnabled(false);
    } finally {
      setLocationLoading(false);
    }
  };

  // Toggle location filter
  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      await requestLocation();
    } else {
      setLocationEnabled(false);
      setUserLocation(null);
    }
  };

  // Filter and sort grounds
  const filteredAndSortedGrounds = useMemo(() => {
    let result = [...grounds];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ground =>
        ground.name?.toLowerCase().includes(query) ||
        ground.location?.toLowerCase().includes(query) ||
        ground.address?.toLowerCase().includes(query) ||
        ground.city?.toLowerCase().includes(query)
      );
    }

    // Apply location sorting
    if (locationEnabled && userLocation) {
      result = result
        .map(ground => ({
          ...ground,
          distance: ground.latitude && ground.longitude
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                ground.latitude,
                ground.longitude
              )
            : Infinity
        }))
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    return result;
  }, [grounds, searchQuery, locationEnabled, userLocation]);

  const onRefresh = async () => {
    if (!token) return;
    
    setRefreshing(true);
    await fetchGrounds(token, true);
    setRefreshing(false);
  };

  if (groundsLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-3 text-gray-600 font-medium">Loading grounds...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header
        name="BookGrounds"
        title="Book Grounds"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Hero Section */}
        <View className="bg-blue-600 pt-6 pb-8 px-4">
          <View className="mb-4">
            <Text className="text-white text-3xl font-bold mb-2">
              Find Your Perfect
            </Text>
            <Text className="text-white text-3xl font-bold">
              Ground
            </Text>
          </View>

          {/* Search Bar */}
          <View className="-mb-6">
            <SearchBar 
              placeholder="Search grounds, locations..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Location Filter Toggle */}
        <View className="px-4 pt-10 pb-2">
          <View className="bg-white rounded-2xl p-4 border border-slate-100 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-blue-50 p-2 rounded-full mr-3">
                <MapPin size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-base">Show Nearest Grounds</Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  {locationEnabled && userLocation
                    ? 'Sorted by distance from you'
                    : 'Enable to sort by location'}
                </Text>
              </View>
            </View>
            {locationLoading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Switch
                value={locationEnabled}
                onValueChange={handleLocationToggle}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={locationEnabled ? '#3B82F6' : '#F1F5F9'}
              />
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push("/booking/MyBookings" as any)}
              className="flex-1 bg-white rounded-2xl p-4 border border-blue-100"
              activeOpacity={0.7}
              style={{
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="bg-blue-50 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Sparkles size={20} color="#3B82F6" />
              </View>
              <Text className="text-slate-900 font-bold text-base mb-1">
                My Bookings
              </Text>
              <Text className="text-slate-500 text-xs">
                View your reservations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/booking/BrowseGrounds" as any)}
              className="flex-1 bg-white rounded-2xl p-4 border border-emerald-100"
              activeOpacity={0.7}
              style={{
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="bg-emerald-50 w-12 h-12 rounded-full items-center justify-center mb-3">
                <TrendingUp size={20} color="#10B981" />
              </View>
              <Text className="text-slate-900 font-bold text-base mb-1">
                Browse All
              </Text>
              <Text className="text-slate-500 text-xs">
                Explore more grounds
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grounds Section */}
        <View className="px-4 mt-2 mb-2">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-slate-900 text-2xl font-bold">
                {locationEnabled && userLocation ? 'Nearest Grounds' : 
                 searchQuery ? 'Search Results' : 'Featured Grounds'}
              </Text>
              <Text className="text-slate-500 text-sm mt-1">
                {filteredAndSortedGrounds.length} {filteredAndSortedGrounds.length === 1 ? 'ground' : 'grounds'} found
              </Text>
            </View>
          </View>
        </View>

        {/* Grounds List */}
        {filteredAndSortedGrounds.length > 0 ? (
          <View className="pb-6">
            {filteredAndSortedGrounds.map((ground) => (
              <VenueCard
                key={ground.id}
                ground={ground}
                distance={locationEnabled && ground.distance ? ground.distance : undefined}
                onBookNowPress={() => {
                  setSelectedGround(ground);
                  router.push(`booking/GroundDetails?groundId=${ground.id}` as any);
                }}
              />
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-6 py-20">
            <View className="bg-slate-100 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Text className="text-4xl">🔍</Text>
            </View>
            <Text className="text-slate-900 text-xl font-bold mb-2 text-center">
              No Grounds Found
            </Text>
            <Text className="text-slate-500 text-center mb-6 leading-6">
              {searchQuery 
                ? `No grounds match "${searchQuery}". Try a different search term.`
                : 'We couldn\'t find any grounds at the moment. Try browsing or check back later!'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className="bg-blue-600 px-8 py-4 rounded-xl mb-3"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">Clear Search</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => router.push("/booking/BrowseGrounds" as any)}
              className="bg-slate-200 px-8 py-4 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-slate-700 font-bold text-base">Browse All Grounds</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Bottom Spacing for Nav Bar */}
        <View className="h-24" />
      </ScrollView>

      <BottomNavBar role={role} type={type} />
    </SafeAreaView>
  );
};

export default GroundBookingScreen;
