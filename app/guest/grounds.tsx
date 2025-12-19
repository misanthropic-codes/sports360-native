import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import SignupPrompt from '../../components/guest/SignupPrompt';
import { useGuestStore } from '../../store/guest/guestStore';

const GuestGrounds = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { grounds, loadingGrounds, fetchGrounds } = useGuestStore();

  useEffect(() => {
    fetchGrounds();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGrounds({}, true);
    setRefreshing(false);
  };

  const groundTypes = ['All', 'Stadium', 'Local Ground', 'Turf'];

  const filteredGrounds = grounds.filter((ground) => {
    const matchesSearch =
      ground.groundOwnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ground.primaryLocation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      !selectedType ||
      selectedType === 'All' ||
      ground.groundType?.toLowerCase().includes(selectedType.toLowerCase());
    return matchesSearch && matchesType;
  });

  const renderGroundCard = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => setShowSignupPrompt(true)}
      className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-gray-900 font-rubikBold text-lg">
            {item.groundOwnerName || 'Unnamed Ground'}
          </Text>
          {item.primaryLocation && (
            <View className="flex-row items-center mt-1">
              <Feather name="map-pin" size={14} color="#6B7280" />
              <Text className="text-gray-600 font-rubikRegular text-sm ml-1">
                {item.primaryLocation}
              </Text>
            </View>
          )}
        </View>

        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: '#15803d15' }}
        >
          <Text className="text-green-800 font-rubikMedium text-xs capitalize">
            {item.groundType?.replace(/_/g, ' ') || 'Ground'}
          </Text>
        </View>
      </View>

      {/* Facility */}
      {item.facilityAvailable && (
        <View className="flex-row flex-wrap mb-3">
          <View className="bg-gray-100 px-2 py-1 rounded-md mr-2">
            <Text className="text-gray-700 font-rubikRegular text-xs capitalize">
              {item.facilityAvailable.replace(/_/g, ' ')}
            </Text>
          </View>
          {item.capacity && (
            <View className="bg-gray-100 px-2 py-1 rounded-md mr-2">
              <Text className="text-gray-700 font-rubikRegular text-xs">
                Capacity: {item.capacity.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Details */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          {item.pricePerHour && (
            <View className="flex-row items-center mr-4">
              <Text className="text-gray-600 font-rubikSemiBold text-sm">
                ₹{item.pricePerHour.toLocaleString()}/hr
              </Text>
            </View>
          )}

          {item.acceptOnlineBookings && (
            <View className="flex-row items-center">
              <Feather name="check-circle" size={16} color="#059669" />
              <Text className="text-gray-600 font-rubikRegular text-sm ml-1">
                Online Booking
              </Text>
            </View>
          )}
        </View>

        <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
          <Feather name="lock" size={12} color="#15803d" />
          <Text className="text-green-800 font-rubikMedium text-xs ml-1">
            Book Now
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-gray-900 font-rubikBold text-xl">
              Find Grounds
            </Text>
            <Text className="text-gray-600 font-rubikRegular text-sm">
              {filteredGrounds.length} venues available
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
          <Feather name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 font-rubikRegular text-base text-gray-900"
            placeholder="Search by name or location..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Type Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 -mx-2"
        >
          {groundTypes.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type === 'All' ? null : type)}
              className={`px-4 py-2 rounded-full mx-1 ${
                (selectedType === type || (!selectedType && type === 'All'))
                  ? 'bg-green-700'
                  : 'bg-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-rubikMedium text-sm ${
                  (selectedType === type || (!selectedType && type === 'All'))
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Grounds List */}
      {loadingGrounds && grounds.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#15803d" />
          <Text className="text-gray-600 font-rubikRegular text-sm mt-4">
            Loading grounds...
          </Text>
        </View>
      ) : filteredGrounds.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <Feather name="map-pin" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-rubikBold text-lg text-center">
            No Grounds Found
          </Text>
          <Text className="text-gray-600 font-rubikRegular text-sm text-center mt-2">
            {searchQuery ? 'Try adjusting your search' : 'No grounds available yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredGrounds}
          renderItem={renderGroundCard}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Signup Prompt */}
      <SignupPrompt
        visible={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        title="Sign Up to Book Grounds"
        message="Create an account to book grounds, view availability, and manage your reservations."
      />
    </SafeAreaView>
  );
};

export default GuestGrounds;
