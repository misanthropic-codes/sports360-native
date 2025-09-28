// components/MatchesList.tsx
import { Match, Team } from "@/api/tournamentApi";
import React from "react";
import { Text, View } from "react-native";
import MatchCard from "./MatchCard";

interface MatchesListProps {
  matches: Match[];
  teams: Team[];
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, teams }) => {
  if (matches.length === 0) return null;

  // Group matches by round
  const matchesByRound = matches.reduce(
    (acc, match) => {
      const round = match.round;
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    },
    {} as { [key: number]: Match[] }
  );

  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <View className="mt-6">
      {/* Header */}
      <View className="bg-purple-50 rounded-xl p-4 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-purple-800">
            Generated Fixtures
          </Text>
          <View className="bg-purple-600 px-4 py-2 rounded-full">
            <Text className="text-white font-semibold">
              {matches.length} Match{matches.length !== 1 ? "es" : ""}
            </Text>
          </View>
        </View>
        <Text className="text-purple-600 mt-1">
          Tournament fixtures have been successfully generated
        </Text>
      </View>

      {/* Matches grouped by rounds */}
      {sortedRounds.map((round) => (
        <View key={round} className="mb-6">
          <View className="flex-row items-center mb-4">
            <View className="bg-purple-600 w-1 h-6 rounded-full mr-3" />
            <Text className="text-xl font-bold text-gray-800">
              Round {round}
            </Text>
            <View className="bg-gray-200 px-3 py-1 rounded-full ml-3">
              <Text className="text-gray-600 font-medium text-sm">
                {matchesByRound[round].length} match
                {matchesByRound[round].length !== 1 ? "es" : ""}
              </Text>
            </View>
          </View>

          {matchesByRound[round].map((match, index) => {
            // Calculate the overall match number
            const matchNumber = matches.findIndex((m) => m.id === match.id) + 1;
            return (
              <MatchCard
                key={match.id}
                match={match}
                matchNumber={matchNumber}
                teams={teams}
              />
            );
          })}
        </View>
      ))}

      {/* Footer Summary */}
      <View className="bg-gray-50 rounded-xl p-4 mt-4">
        <Text className="text-center text-gray-600 font-medium">
          🏆 Tournament Format: Knockout • {matches.length} Total Matches
        </Text>
      </View>
    </View>
  );
};

export default MatchesList;
