// screens/TeamDetailsScreen.tsx
import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

interface TeamDetailsParams {
  teamId: string;
  tournamentId: string;
}

const TeamDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { teamId, tournamentId } = route.params as TeamDetailsParams;

  // In a real app, you would fetch this data based on teamId and tournamentId
  const mockTeam = {
    id: teamId,
    tournamentId: tournamentId,
    name: 'Thunder Bolts',
    captain: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1234567890',
    members: [
      { id: '1', name: 'John Doe', role: 'Captain' },
      { id: '2', name: 'Jane Smith', role: 'Player' },
      { id: '3', name: 'Bob Johnson', role: 'Player' },
      { id: '4', name: 'Alice Brown', role: 'Player' },
      { id: '5', name: 'Charlie Wilson', role: 'Player' }
    ],
    stats: {
      matchesPlayed: 3,
      wins: 2,
      losses: 1,
      points: 6
    }
  };

  const handleRemoveTeam = () => {
    Alert.alert(
      'Remove Team',
      `Are you sure you want to remove ${mockTeam.name} from this tournament?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            console.log('Removing team:', teamId, 'from tournament:', tournamentId);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleEditRoster = () => {
    console.log('Edit roster for team:', teamId, 'in tournament:', tournamentId);
    // Navigate to roster edit screen
    // navigation.navigate('EditRoster', { teamId, tournamentId });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-purple-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Team Details</Text>
          <TouchableOpacity 
            onPress={handleRemoveTeam}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Tournament Info */}
        <View className="bg-purple-50 rounded-lg p-3 mb-4">
          <Text className="text-purple-700 font-medium">Tournament ID: {tournamentId}</Text>
          <Text className="text-purple-600 text-sm">Team ID: {teamId}</Text>
        </View>

        <View className="bg-white rounded-lg p-6 mb-4">
          <Text className="text-2xl font-bold text-black mb-4">{mockTeam.name}</Text>
          
          <View className="mb-4">
            <Text className="text-gray-600 mb-1">Captain: {mockTeam.captain}</Text>
            <Text className="text-gray-600 mb-1">Email: {mockTeam.email}</Text>
            <Text className="text-gray-600 mb-1">Phone: {mockTeam.phone}</Text>
            <Text className="text-gray-600">Total Members: {mockTeam.members.length}</Text>
          </View>

          <View className="flex-row justify-between bg-gray-50 rounded-lg p-4">
            <View className="items-center">
              <Text className="text-lg font-bold text-purple-600">{mockTeam.stats.matchesPlayed}</Text>
              <Text className="text-gray-600 text-sm">Matches</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-green-600">{mockTeam.stats.wins}</Text>
              <Text className="text-gray-600 text-sm">Wins</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-red-600">{mockTeam.stats.losses}</Text>
              <Text className="text-gray-600 text-sm">Losses</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-purple-600">{mockTeam.stats.points}</Text>
              <Text className="text-gray-600 text-sm">Points</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-black">Team Roster</Text>
            <TouchableOpacity 
              onPress={handleEditRoster}
              className="bg-purple-600 px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Edit Roster</Text>
            </TouchableOpacity>
          </View>

          {mockTeam.members.map((member, index) => (
            <View key={member.id} className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <View>
                <Text className="text-black font-medium">{member.name}</Text>
                <Text className="text-gray-600 text-sm">{member.role}</Text>
              </View>
              {member.role === 'Captain' && (
                <View className="bg-purple-100 px-2 py-1 rounded">
                  <Text className="text-purple-800 text-xs font-medium">Captain</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TeamDetailsScreen;