
import { getPlayingXI, setCurrentPlayers } from "@/api/scoreApi";
import { getMatchById, updateMatchStatus } from "@/api/tournamentApi";
import Dropdown from "@/components/Ui/Dropdown";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Player {
  playerId: string;
  playerName: string;
  role?: string;
}

interface TeamXI {
  teamId: string;
  teamName: string;
  playingXI: Player[];
}

export default function SetPlayersScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [teamA, setTeamA] = useState<TeamXI | null>(null);
  const [teamB, setTeamB] = useState<TeamXI | null>(null);
  const [matchDetails, setMatchDetails] = useState<any>(null);

  // Which team is batting/bowling this innings
  const [battingTeamId, setBattingTeamId] = useState<string>("");
  const [bowlingTeamId, setBowlingTeamId] = useState<string>("");

  // Player selections
  const [strikerId, setStrikerId] = useState("");
  const [nonStrikerId, setNonStrikerId] = useState("");
  const [bowlerId, setBowlerId] = useState("");

  // Max overs (new field)
  const [maxOvers, setMaxOvers] = useState("20");

  const fetchData = async () => {
    if (!matchId || !token) return;
    try {
      setLoading(true);

      const match = await getMatchById(matchId, token);
      if (!match) {
        Alert.alert("Error", "Match not found");
        return;
      }
      setMatchDetails(match);

      // Fetch XI for both teams (benched players already filtered in getPlayingXI)
      const xiRes = await getPlayingXI(matchId, token);
      if (xiRes) {
        setTeamA(xiRes.teamA);
        setTeamB(xiRes.teamB);

        if (xiRes.teamA && xiRes.teamB) {
          // Default: Team A bats, Team B bowls
          setBattingTeamId(xiRes.teamA.teamId);
          setBowlingTeamId(xiRes.teamB.teamId);
        }
      }
    } catch (error: any) {
      console.error("Error loading players:", error);
      Alert.alert("Error", "Failed to load match players");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [matchId, token]);

  const handleSwapTeams = () => {
    setBattingTeamId((prev) => (prev === teamA?.teamId ? teamB?.teamId ?? "" : teamA?.teamId ?? ""));
    setBowlingTeamId((prev) => (prev === teamA?.teamId ? teamB?.teamId ?? "" : teamA?.teamId ?? ""));
    setStrikerId("");
    setNonStrikerId("");
    setBowlerId("");
  };

  const handleSubmit = async () => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      Alert.alert("Missing Info", "Please select Striker, Non-Striker and Bowler");
      return;
    }

    if (strikerId === nonStrikerId) {
      Alert.alert("Invalid Selection", "Striker and Non-Striker cannot be the same person");
      return;
    }

    const overs = parseInt(maxOvers, 10);
    if (isNaN(overs) || overs < 1 || overs > 50) {
      Alert.alert("Invalid Overs", "Please enter a number between 1 and 50");
      return;
    }

    if (!matchDetails?.tournamentId) {
      Alert.alert("Error", "Missing tournament ID");
      return;
    }

    try {
      setSubmitting(true);

      const battingTeam = teamA?.teamId === battingTeamId ? teamA : teamB;
      const bowlingTeam = teamA?.teamId === bowlingTeamId ? teamA : teamB;

      const striker = battingTeam?.playingXI.find((p) => p.playerId === strikerId);
      const nonStriker = battingTeam?.playingXI.find((p) => p.playerId === nonStrikerId);
      const bowler = bowlingTeam?.playingXI.find((p) => p.playerId === bowlerId);

      if (!striker || !nonStriker || !bowler) {
        Alert.alert("Error", "Player not found in team roster");
        return;
      }

      // Start match only if not already live (re-submitting players is allowed)
      const currentStatus = matchDetails?.status?.toLowerCase() ?? "";
      const isAlreadyLive = currentStatus === "ongoing" || currentStatus === "live";
      if (!isAlreadyLive) {
        await updateMatchStatus(matchId!, "ongoing", token!);
      }

      await setCurrentPlayers(
        {
          matchId: matchId!,
          tournamentId: matchDetails.tournamentId,
          strikerId,
          strikerName: striker.playerName,
          nonStrikerId,
          nonStrikerName: nonStriker.playerName,
          bowlerId,
          bowlerName: bowler.playerName,
          maxOvers: overs,
        },
        token!
      );

      Alert.alert("Success", "Players set! Let's score.", [
        {
          text: "Start Scoring",
          onPress: () => router.replace(`/match/${matchId}/scorer`),
        },
      ]);
    } catch (error: any) {
      console.error("Error setting players:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to set players"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const battingTeam = teamA?.teamId === battingTeamId ? teamA : teamB;
  const bowlingTeam = teamA?.teamId === bowlingTeamId ? teamA : teamB;

  // Build dropdown options excluding already-selected players
  const battingOptions =
    battingTeam?.playingXI.map((p) => ({
      label: p.playerName,
      value: p.playerId,
    })) || [];

  const strikerOptions = battingOptions.filter((p) => p.value !== nonStrikerId);
  const nonStrikerOptions = battingOptions.filter((p) => p.value !== strikerId);
  const bowlingOptions =
    bowlingTeam?.playingXI.map((p) => ({
      label: p.playerName,
      value: p.playerId,
    })) || [];

  const isValid = strikerId && nonStrikerId && bowlerId && strikerId !== nonStrikerId;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-2xl font-bold text-center mb-1 text-gray-800">
          Set Players
        </Text>
        <Text className="text-center text-gray-400 text-sm mb-6">
          Match ID: {matchId}
        </Text>

        {/* Team Swap Row */}
        <View className="flex-row items-center justify-center gap-3 mb-6">
          <View className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 items-center">
            <Text className="text-xs text-blue-500 font-bold uppercase mb-1">
              Batting
            </Text>
            <Text className="font-bold text-blue-800" numberOfLines={1}>
              {battingTeam?.teamName ?? "—"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSwapTeams}
            className="bg-indigo-100 p-3 rounded-xl"
          >
            <Text className="text-indigo-600 font-bold">⇄</Text>
          </TouchableOpacity>

          <View className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 items-center">
            <Text className="text-xs text-red-500 font-bold uppercase mb-1">
              Bowling
            </Text>
            <Text className="font-bold text-red-800" numberOfLines={1}>
              {bowlingTeam?.teamName ?? "—"}
            </Text>
          </View>
        </View>

        {/* Batting Team Section */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
          <Text className="text-lg font-bold mb-4 text-blue-700">
            🏏 Batting — {battingTeam?.teamName}
          </Text>

          <Text className="text-xs text-gray-400 font-bold uppercase mb-1">
            Striker
          </Text>
          <View className="mb-4">
            <Dropdown
              placeholder="Select Striker"
              options={strikerOptions}
              value={strikerId}
              onSelect={setStrikerId}
            />
          </View>

          <Text className="text-xs text-gray-400 font-bold uppercase mb-1">
            Non-Striker
          </Text>
          <View className="mb-1">
            <Dropdown
              placeholder="Select Non-Striker"
              options={nonStrikerOptions}
              value={nonStrikerId}
              onSelect={setNonStrikerId}
            />
          </View>
        </View>

        {/* Bowling Team Section */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
          <Text className="text-lg font-bold mb-4 text-red-700">
            🎳 Bowling — {bowlingTeam?.teamName}
          </Text>

          <Text className="text-xs text-gray-400 font-bold uppercase mb-1">
            Opening Bowler
          </Text>
          <View className="mb-1">
            <Dropdown
              placeholder="Select Bowler"
              options={bowlingOptions}
              value={bowlerId}
              onSelect={setBowlerId}
            />
          </View>
        </View>

        {/* Max Overs */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <Text className="text-sm font-bold text-gray-600 uppercase mb-2">
            Max Overs per Innings
          </Text>
          <TextInput
            value={maxOvers}
            onChangeText={(v) => {
              const n = v.replace(/[^0-9]/g, "");
              setMaxOvers(n);
            }}
            keyboardType="number-pad"
            maxLength={2}
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold text-lg text-center"
            placeholder="20"
          />
          <Text className="text-xs text-center text-gray-400 mt-2">
            Enter 1–50. Defaults to 20 if left blank.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting || !isValid}
          className={`p-4 rounded-2xl items-center shadow ${
            submitting || !isValid ? "bg-gray-300" : "bg-green-600"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Start Match & Scoring
            </Text>
          )}
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
