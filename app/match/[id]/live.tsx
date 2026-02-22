
import { useAuth } from "@/context/AuthContext";
import { useMatchStore } from "@/store/matchStore";
import { socketService } from "@/utils/socketService";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function LiveMatchScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { matchData, fetchMatchData, updateMatchData, loading, error } = useMatchStore();
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const { token } = useAuth();

  useEffect(() => {
    if (!matchId) return;

    // 1. Initial Fetch
    fetchMatchData(matchId, token);

    // 2. Connect Socket
    socketService.connect();
    socketService.subscribeToMatch(matchId);
    setConnectionStatus("Live");

    // 3. Listen for updates
    socketService.onScoreUpdate((payload: any) => {
        console.log("⚡️ Socket Update:", payload.type);
        if (payload.data && (payload.type === 'BALL_UPDATE' || payload.type === 'UNDO_BALL')) {
            updateMatchData(payload.data);
        } else if (payload.type === 'INNINGS_COMPLETE') {
            // Might need separate handling or just re-fetch to be safe
            fetchMatchData(matchId);
        } else if (payload.type === 'MATCH_COMPLETE') {
            fetchMatchData(matchId);
        }
    });

    return () => {
        socketService.unsubscribeFromMatch(matchId);
        socketService.offScoreUpdate();
    };
  }, [matchId]);

  if (loading && !matchData) {
      return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#2563EB" /></View>;
  }

  if (error) {
      return <View className="flex-1 justify-center items-center"><Text className="text-red-500">{error}</Text></View>;
  }

  if (!matchData) return <View><Text>No Match Data Found</Text></View>;

  const currentRunRate = (matchData.totalRuns / (matchData.totalOvers || 1)).toFixed(2);
  const isMatchComplete = matchData.matchComplete;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      
      {/* Header Card */}
      <View className="bg-blue-900 p-6 rounded-b-3xl shadow-lg">
          <Text className="text-white text-center font-bold text-lg mb-2">
              {matchData.tournamentId ? "Tournament Match" : "Friendly Match"}
          </Text>
          
          <View className="flex-row justify-between items-center mt-4">
              <View className="items-center">
                  <View className="w-16 h-16 bg-white rounded-full justify-center items-center mb-2">
                       <Text className="text-blue-900 font-bold text-xl">A</Text> 
                       {/* Placeholder for Team Logo */}
                  </View>
                  <Text className="text-white font-semibold">Batting</Text>
              </View>

              <View className="items-center">
                  <Text className="text-5xl text-white font-extrabold">{matchData.totalRuns}/{matchData.totalWickets}</Text>
                  <Text className="text-blue-200 text-lg mt-1">{matchData.totalOvers} Overs</Text>
              </View>

              <View className="items-center">
                  <View className="w-16 h-16 bg-white rounded-full justify-center items-center mb-2">
                       <Text className="text-blue-900 font-bold text-xl">B</Text>
                  </View>
                  <Text className="text-white font-semibold">Bowling</Text>
              </View>
          </View>

          <View className="flex-row justify-between mt-6 px-4">
              <Text className="text-blue-200">CRR: {currentRunRate}</Text>
              {matchData.target && <Text className="text-yellow-400 font-bold">Target: {matchData.target}</Text>}
          </View>
          
          {matchData.result && (
              <View className="bg-white/20 mt-4 p-2 rounded text-center">
                  <Text className="text-white font-bold text-center">{matchData.result.winner}</Text>
              </View>
          )}

          <View className="absolute top-2 right-4 flex-row items-center">
             <View className={`w-2 h-2 rounded-full mr-1 ${connectionStatus === 'Live' ? 'bg-green-400' : 'bg-red-400'}`} />
             <Text className="text-white text-xs">{connectionStatus}</Text>
          </View>
      </View>

      {/* Live Status - Batsmen & Bowler */}
      <View className="m-4">
          <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Batting</Text>
              
              <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <View className="flex-row items-center">
                      <Text className="font-bold text-lg text-gray-800">{matchData.striker?.playerName}</Text>
                      <Text className="ml-2 text-blue-600 font-bold">*</Text>
                  </View>
                  <View className="items-end">
                      <Text className="font-bold text-xl text-gray-900">{matchData.striker?.runs} <Text className="text-sm font-normal text-gray-500">({matchData.striker?.balls})</Text></Text>
                  </View>
              </View>
              
              <View className="flex-row justify-between items-center py-2">
                  <Text className="font-semibold text-gray-600">{matchData.nonStriker?.playerName}</Text>
                  <View className="items-end">
                      <Text className="font-bold text-lg text-gray-700">{matchData.nonStriker?.runs} <Text className="text-sm font-normal text-gray-500">({matchData.nonStriker?.balls})</Text></Text>
                  </View>
              </View>
          </View>

          <View className="bg-white rounded-xl shadow-sm p-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Bowling</Text>
              <View className="flex-row justify-between items-center">
                  <Text className="font-bold text-lg text-gray-800">{matchData.currentBowler?.playerName}</Text>
                  <View className="flex-row items-end">
                      <View className="items-end mr-4">
                          <Text className="text-xs text-gray-500">Overs</Text>
                          <Text className="font-bold text-lg">{matchData.currentBowler?.overs}</Text>
                      </View>
                      <View className="items-end mr-4">
                          <Text className="text-xs text-gray-500">Runs</Text>
                          <Text className="font-bold text-lg">{matchData.currentBowler?.runs}</Text>
                      </View>
                      <View className="items-end">
                          <Text className="text-xs text-gray-500">Wickets</Text>
                          <Text className="font-bold text-lg">{matchData.currentBowler?.wickets}</Text>
                      </View>
                  </View>
              </View>
          </View>
      </View>

      {/* Recent Balls */}
      <View className="px-4 mb-6">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Recent Deliveries</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {matchData.lastBalls?.map((ball, index) => (
                  <View key={index} className={`w-10 h-10 rounded-full justify-center items-center mr-2 ${ball.deliveryType === 'wicket' ? 'bg-red-500' : ball.runs === 4 || ball.runs === 6 ? 'bg-green-500' : 'bg-gray-200'}`}>
                      <Text className={`font-bold ${ball.deliveryType === 'wicket' || ball.runs === 4 || ball.runs === 6 ? 'text-white' : 'text-gray-800'}`}>
                          {ball.deliveryType === 'wicket' ? 'W' : ball.runs}
                      </Text>
                  </View>
              ))}
          </ScrollView>
      </View>

    </ScrollView>
  );
}
