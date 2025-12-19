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
    TouchableOpacity,
    View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import SignupPrompt from '../../components/guest/SignupPrompt';
import { useGuestStore } from '../../store/guest/guestStore';

const GuestTournaments = () => {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { tournaments, loadingTournaments, fetchTournaments } = useGuestStore();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments({}, true);
    setRefreshing(false);
  };

  const statuses = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'ongoing', label: 'Ongoing' },
    { key: 'completed', label: 'Completed' },
  ];

  const filteredTournaments = tournaments.filter((tournament) => {
    if (selectedStatus === 'all') return true;
    return tournament.status?.toLowerCase() === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'ongoing':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'completed':
        return { bg: '#F3F4F6', text: '#6B7280' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderTournamentCard = ({ item }: any) => {
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity
        onPress={() => setShowSignupPrompt(true)}
        className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
        activeOpacity={0.7}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <Text className="text-gray-900 font-rubikBold text-lg">
              {item.name || 'Unnamed Tournament'}
            </Text>
            {item.sport && (
              <Text className="text-gray-600 font-rubikRegular text-sm mt-1 capitalize">
                {item.sport}
              </Text>
            )}
          </View>

          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: statusColors.bg }}
          >
            <Text
              className="font-rubikMedium text-xs capitalize"
              style={{ color: statusColors.text }}
            >
              {item.status || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className="space-y-2">
          {item.startDate && (
            <View className="flex-row items-center">
              <Feather name="calendar" size={16} color="#6B7280" />
              <Text className="text-gray-600 font-rubikRegular text-sm ml-2">
                Starts: {formatDate(item.startDate)}
              </Text>
            </View>
          )}

          {item.location && (
            <View className="flex-row items-center">
              <Feather name="map-pin" size={16} color="#6B7280" />
              <Text className="text-gray-600 font-rubikRegular text-sm ml-2">
                {item.location}
              </Text>
            </View>
          )}

          {item.teamCount !== undefined && (
            <View className="flex-row items-center">
              <Feather name="users" size={16} color="#6B7280" />
              <Text className="text-gray-600 font-rubikRegular text-sm ml-2">
                {item.teamCount} teams registered
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <View className="bg-purple-100 px-3 py-1 rounded-full flex-row items-center">
            <Feather name="lock" size={12} color="#7C3AED" />
            <Text className="text-purple-800 font-rubikMedium text-xs ml-1">
              Register to Join
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.7}>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
              Tournaments
            </Text>
            <Text className="text-gray-600 font-rubikRegular text-sm">
              {filteredTournaments.length} available
            </Text>
          </View>
        </View>

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-2"
        >
          {statuses.map((status) => (
            <TouchableOpacity
              key={status.key}
              onPress={() => setSelectedStatus(status.key as any)}
              className={`px-4 py-2 rounded-full mx-1 ${
                selectedStatus === status.key ? 'bg-primary' : 'bg-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-rubikMedium text-sm ${
                  selectedStatus === status.key ? 'text-white' : 'text-gray-700'
                }`}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tournaments List */}
      {loadingTournaments && tournaments.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text className="text-gray-600 font-rubikRegular text-sm mt-4">
            Loading tournaments...
          </Text>
        </View>
      ) : filteredTournaments.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <Feather name="award" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-rubikBold text-lg text-center">
            No Tournaments Found
          </Text>
          <Text className="text-gray-600 font-rubikRegular text-sm text-center mt-2">
            No {selectedStatus !== 'all' ? selectedStatus : ''} tournaments available yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTournaments}
          renderItem={renderTournamentCard}
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
        title="Join the Tournament"
        message="Sign up to register for tournaments, track results, and compete with teams from around the world."
      />
    </SafeAreaView>
  );
};

export default GuestTournaments;
