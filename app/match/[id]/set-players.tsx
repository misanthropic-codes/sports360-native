
import { getPlayingXI, setCurrentPlayers } from "@/api/scoreApi";
import { getMatchById } from "@/api/tournamentApi";
import Dropdown from "@/components/Ui/Dropdown";
import { useAuth } from "@/context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

  // Selections
  const [battingTeamId, setBattingTeamId] = useState<string>("");
  const [bowlingTeamId, setBowlingTeamId] = useState<string>("");
  
  const [strikerId, setStrikerId] = useState("");
  const [nonStrikerId, setNonStrikerId] = useState("");
  const [bowlerId, setBowlerId] = useState("");

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

      const xiRes = await getPlayingXI(matchId, token);
      if (xiRes) {
        setTeamA(xiRes.teamA);
        setTeamB(xiRes.teamB);
        
        if (xiRes.teamA && xiRes.teamB) {
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

  const handleSubmit = async () => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      Alert.alert("Missing Info", "Please select Striker, Non-Striker and Bowler");
      return;
    }

    if (strikerId === nonStrikerId) {
      Alert.alert("Invalid Selection", "Striker and Non-Striker cannot be the same person");
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
      
      const striker = battingTeam?.playingXI.find(p => p.playerId === strikerId);
      const nonStriker = battingTeam?.playingXI.find(p => p.playerId === nonStrikerId);
      const bowler = bowlingTeam?.playingXI.find(p => p.playerId === bowlerId);

      await setCurrentPlayers({
        matchId,
        tournamentId: matchDetails.tournamentId,
        strikerId,
        strikerName: striker?.playerName,
        nonStrikerId,
        nonStrikerName: nonStriker?.playerName,
        bowlerId,
        bowlerName: bowler?.playerName
      }, token!);

      Alert.alert("Success", "Players set successfully!", [
        { text: "Start Scoring", onPress: () => router.replace(`/match/${matchId}/scorer`) }
      ]);
    } catch (error: any) {
      console.error("Error setting players:", error);
      Alert.alert("Error", "Failed to set players");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const battingTeam = teamA?.teamId === battingTeamId ? teamA : teamB;
  const bowlingTeam = teamA?.teamId === bowlingTeamId ? teamA : teamB;

  const battingOptions = battingTeam?.playingXI.map(p => ({ label: p.playerName, value: p.playerId })) || [];
  const bowlingOptions = bowlingTeam?.playingXI.map(p => ({ label: p.playerName, value: p.playerId })) || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 40 }}>
            <Text className="text-2xl font-bold text-center mb-6 text-gray-800">Set Opening Players</Text>
            
            {/* Batting Team Section */}
            <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <Text className="text-lg font-bold mb-3 text-blue-700">Batting Team: {battingTeam?.teamName}</Text>
                
                <Dropdown 
                    label="Striker"
                    placeholder="Select Striker"
                    options={battingOptions}
                    value={strikerId}
                    onSelect={setStrikerId}
                />
                
                <Dropdown 
                    label="Non-Striker"
                    placeholder="Select Non-Striker"
                    options={battingOptions}
                    value={nonStrikerId}
                    onSelect={setNonStrikerId}
                />
            </View>

            {/* Bowling Team Section */}
            <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <Text className="text-lg font-bold mb-3 text-red-700">Bowling Team: {bowlingTeam?.teamName}</Text>
                
                <Dropdown 
                    label="Opening Bowler"
                    placeholder="Select Bowler"
                    options={bowlingOptions}
                    value={bowlerId}
                    onSelect={setBowlerId}
                />
            </View>

            <TouchableOpacity 
                onPress={handleSubmit}
                disabled={submitting}
                className={`p-4 rounded-lg items-center ${submitting ? 'bg-gray-400' : 'bg-green-600'}`}
            >
                {submitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Start Match & Scoring</Text>
                )}
            </TouchableOpacity>
            
            <View className="h-10" />
        </ScrollView>
    </SafeAreaView>
  );
}
