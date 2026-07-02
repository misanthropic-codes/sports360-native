import { getLiveMatchPath } from "@/utils/matchNavigation";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface LiveMatchListItem {
  id: string;
  tournamentId?: string;
  tournamentName?: string;
  tournament?: { name?: string };
  teamAId?: string;
  teamBId?: string;
  teamAName?: string;
  teamBName?: string;
  teamA?: { name?: string };
  teamB?: { name?: string };
  scoreA?: string | number | null;
  scoreB?: string | number | null;
  wicketsA?: number | null;
  wicketsB?: number | null;
  status?: string;
  matchTime?: string;
}

function getTeamAName(match: LiveMatchListItem): string {
  return match.teamAName || match.teamA?.name || "Team A";
}

function getTeamBName(match: LiveMatchListItem): string {
  return match.teamBName || match.teamB?.name || "Team B";
}

function getTournamentName(match: LiveMatchListItem): string {
  return match.tournamentName || match.tournament?.name || "Match";
}

function formatScore(
  match: LiveMatchListItem,
  side: "A" | "B"
): string {
  const score = side === "A" ? match.scoreA : match.scoreB;
  const wickets = side === "A" ? match.wicketsA : match.wicketsB;

  if (typeof score === "string" && score.length > 0) return score;
  if (score !== undefined && score !== null && score !== "") {
    return `${score}/${wickets ?? 0}`;
  }
  return side === "A" ? "-/-" : "0/0";
}

interface LiveMatchCardProps {
  match: LiveMatchListItem;
  variant?: "highlight" | "compact";
  highlightMine?: boolean;
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({
  match,
  variant = "compact",
  highlightMine = false,
}) => {
  const onPress = () => router.push(getLiveMatchPath(match.id));

  if (variant === "highlight" || highlightMine) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className="bg-white mr-4 rounded-xl p-4 border-l-4 border-l-red-500 border-y border-r border-gray-100 w-72 shadow-sm"
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xs font-bold text-red-500 uppercase">Live Now</Text>
          <Text className="text-xs text-gray-500 font-medium" numberOfLines={1}>
            {getTournamentName(match)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-1 pr-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-bold text-slate-900 text-lg flex-1 mr-2" numberOfLines={1}>
                {getTeamAName(match)}
              </Text>
              <Text className="text-lg font-bold text-slate-800">
                {formatScore(match, "A")}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-slate-900 text-lg flex-1 mr-2" numberOfLines={1}>
                {getTeamBName(match)}
              </Text>
              <Text className="text-lg font-bold text-slate-800">
                {formatScore(match, "B")}
              </Text>
            </View>
          </View>
        </View>
        <Text className="text-xs text-slate-500 mt-2 text-right">
          {match.status || "Ongoing"}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white mr-4 rounded-xl p-4 border border-slate-200 w-64 shadow-sm"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xs font-bold text-blue-500 uppercase">Ongoing</Text>
        <Text className="text-xs text-slate-500 font-medium" numberOfLines={1}>
          {getTournamentName(match)}
        </Text>
      </View>

      <View className="gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="font-semibold text-slate-800 text-sm flex-1 mr-2" numberOfLines={1}>
            {getTeamAName(match)}
          </Text>
          <Text className="text-slate-600 text-xs font-bold">
            {formatScore(match, "A")}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="font-semibold text-slate-800 text-sm flex-1 mr-2" numberOfLines={1}>
            {getTeamBName(match)}
          </Text>
          <Text className="text-slate-600 text-xs font-bold">
            {formatScore(match, "B")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LiveMatchCard;
