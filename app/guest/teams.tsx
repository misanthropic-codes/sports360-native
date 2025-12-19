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

const GuestTeams = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { teams, loadingTeams, fetchTeams } = useGuestStore();

  useEffect(() => {
    fetchTeams();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeams({}, true);
    setRefreshing(false);
  };

  const sports = ['All', 'Cricket', 'Football', 'Basketball', 'Marathon'];

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || selectedSport === 'All' || team.sport === selectedSport.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const renderTeamCard = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => setShowSignupPrompt(true)}
      className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 font-rubikBold text-lg">
            {item.name || 'Unnamed Team'}
          </Text>
          {item.location && (
            <View className="flex-row items-center mt-1">
              <Feather name="map-pin" size={14} color="#6B7280" />
              <Text className="text-gray-600 font-rubikRegular text-sm ml-1">
                {item.location}
              </Text>
            </View>
          )}
        </View>

        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: '#2563EB15' }}
        >
          <Text className="text-primary font-rubikMedium text-xs capitalize">
            {item.sport || 'Sport'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="users" size={16} color="#6B7280" />
          <Text className="text-gray-600 font-rubikRegular text-sm ml-1">
            {item.playerCount || 0} Players
          </Text>
        </View>

        <View className="bg-yellow-100 px-3 py-1 rounded-full flex-row items-center">
          <Feather name="lock" size={12} color="#F59E0B" />
          <Text className="text-yellow-800 font-rubikMedium text-xs ml-1">
            View Details
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
              Explore Teams
            </Text>
            <Text className="text-gray-600 font-rubikRegular text-sm">
              {filteredTeams.length} teams available
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
          <Feather name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 font-rubikRegular text-base text-gray-900"
            placeholder="Search teams..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Sport Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 -mx-2"
        >
          {sports.map((sport) => (
            <TouchableOpacity
              key={sport}
              onPress={() => setSelectedSport(sport === 'All' ? null : sport)}
              className={`px-4 py-2 rounded-full mx-1 ${
                (selectedSport === sport || (!selectedSport && sport === 'All'))
                  ? 'bg-primary'
                  : 'bg-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-rubikMedium text-sm ${
                  (selectedSport === sport || (!selectedSport && sport === 'All'))
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Teams List */}
      {loadingTeams && teams.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 font-rubikRegular text-sm mt-4">
            Loading teams...
          </Text>
        </View>
      ) : filteredTeams.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <Feather name="users" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-rubikBold text-lg text-center">
            No Teams Found
          </Text>
          <Text className="text-gray-600 font-rubikRegular text-sm text-center mt-2">
            {searchQuery ? 'Try adjusting your search' : 'No teams available yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTeams}
          renderItem={renderTeamCard}
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
        title="Sign Up to View Team Details"
        message="Create an account to view full team profiles, player rosters, and match history."
      />
    </SafeAreaView>
  );
};

export default GuestTeams;
