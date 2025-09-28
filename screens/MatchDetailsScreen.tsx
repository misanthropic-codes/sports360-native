
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MatchDetailsParams {
  matchId: string;
  tournamentId: string;
}

const MatchDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { matchId, tournamentId } = route.params as MatchDetailsParams;

  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");

  // In a real app, you would fetch this data based on matchId and tournamentId
  const mockMatch = {
    id: matchId,
    tournamentId: tournamentId,
    team1: "Thunder Bolts",
    team2: "Fire Dragons",
    date: "2024-09-15",
    time: "14:00",
    venue: "Court A",
    status: "scheduled",
    score: { team1: 0, team2: 0 },
  };

  const handleUpdateScore = () => {
    if (!team1Score || !team2Score) {
      Alert.alert("Error", "Please enter scores for both teams");
      return;
    }

    console.log(
      "Updating score for match:",
      matchId,
      "in tournament:",
      tournamentId
    );
    console.log("New scores:", { team1: team1Score, team2: team2Score });

    Alert.alert("Success", "Score updated successfully", [
      {
        text: "OK",
        onPress: () => {
          setTeam1Score("");
          setTeam2Score("");
          // Navigate back with updated data
          navigation.goBack();
        },
      },
    ]);
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
          <Text className="text-xl font-bold text-black">Match Details</Text>
          <View />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Tournament Info */}
        <View className="bg-purple-50 rounded-lg p-3 mb-4">
          <Text className="text-purple-700 font-medium">
            Tournament ID: {tournamentId}
          </Text>
          <Text className="text-purple-600 text-sm">Match ID: {matchId}</Text>
        </View>

        <View className="bg-white rounded-lg p-6 mb-4">
          <View className="items-center mb-6">
            <View className="flex-row items-center justify-between w-full mb-4">
              <Text className="text-2xl font-bold text-black">
                {mockMatch.team1}
              </Text>
              <Text className="text-3xl font-bold text-purple-600">
                {mockMatch.score.team1}
              </Text>
            </View>
            <Text className="text-xl text-gray-500 my-2">VS</Text>
            <View className="flex-row items-center justify-between w-full">
              <Text className="text-2xl font-bold text-black">
                {mockMatch.team2}
              </Text>
              <Text className="text-3xl font-bold text-purple-600">
                {mockMatch.score.team2}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-200 pt-4">
            <Text className="text-gray-600 mb-1">Date: {mockMatch.date}</Text>
            <Text className="text-gray-600 mb-1">Time: {mockMatch.time}</Text>
            <Text className="text-gray-600 mb-1">Venue: {mockMatch.venue}</Text>
            <Text className="text-gray-600">Status: {mockMatch.status}</Text>
          </View>
        </View>

        {mockMatch.status !== "completed" && (
          <View className="bg-white rounded-lg p-6">
            <Text className="text-lg font-semibold text-black mb-4">
              Update Score
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 mb-2">
                {mockMatch.team1} Score
              </Text>
              <TextInput
                value={team1Score}
                onChangeText={setTeam1Score}
                placeholder="Enter score"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-3 py-3 text-black"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 mb-2">
                {mockMatch.team2} Score
              </Text>
              <TextInput
                value={team2Score}
                onChangeText={setTeam2Score}
                placeholder="Enter score"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-3 py-3 text-black"
              />
            </View>

            <TouchableOpacity
              onPress={handleUpdateScore}
              className="bg-purple-600 py-3 rounded-lg"
            >
              <Text className="text-white font-medium text-center text-lg">
                Update Score
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MatchDetailsScreen;
