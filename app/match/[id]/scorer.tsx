
import {
  DeliveryType,
  getMatchScore,
  getPlayingXI,
  MatchScoreState,
  resetLastBall,
  updateBallScore,
  WicketType
} from "@/api/scoreApi";
import Dropdown from "@/components/Ui/Dropdown";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* -------------------------------------------------------------------------- */
/*                            Sub-Components                                  */
/* -------------------------------------------------------------------------- */

const ScoreButton = ({ label, value, onPress, color = "bg-blue-100" }: any) => (
  <TouchableOpacity 
    onPress={() => onPress(value)}
    className={`${color} w-16 h-16 justify-center items-center rounded-full m-2 shadow`}
  >
    <Text className="text-xl font-bold">{label}</Text>
  </TouchableOpacity>
);

const ActionButton = ({ label, onPress, color = "bg-gray-200", textColor = "text-black" }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`${color} py-3 px-6 rounded-lg m-2 shadow`}
  >
    <Text className={`font-bold ${textColor}`}>{label}</Text>
  </TouchableOpacity>
);

/* -------------------------------------------------------------------------- */
/*                               Main Screen                                  */
/* -------------------------------------------------------------------------- */

export default function ScorerDashboard() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<MatchScoreState | null>(null);
  
  // Scoring State
  const [sending, setSending] = useState(false);
  
  // Wicket Modal State
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState<WicketType>("caught");
  const [outBatsmanId, setOutBatsmanId] = useState("");
  const [newBatsmanId, setNewBatsmanId] = useState("");
  
  // Playing XI for selection
  const [battingTeamPlayers, setBattingTeamPlayers] = useState<any[]>([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState<any[]>([]);

  // Bowler Selection (End of Over)
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [nextBowlerId, setNextBowlerId] = useState("");

  const wicketOptions = [
    { label: "Caught", value: "caught" },
    { label: "Bowled", value: "bowled" },
    { label: "LBW", value: "lbw" },
    { label: "Run Out", value: "run_out" },
    { label: "Stumped", value: "stumped" },
    { label: "Hit Wicket", value: "hit_wicket" }
  ];

  const fetchData = async () => {
    if (!matchId || !token) return;
    try {
      setLoading(true);
      const data = await getMatchScore(matchId, token);
      setMatchData(data);
      
      // Also fetch players for Wicket/Bowler selection
      const xi = await getPlayingXI(matchId, token);
      if (xi) {
         // Determine which team is batting/bowling
         const isTeamABatting = data.battingTeamId === xi.teamA.teamId;
         setBattingTeamPlayers(isTeamABatting ? xi.teamA.playingXI : xi.teamB.playingXI);
         setBowlingTeamPlayers(isTeamABatting ? xi.teamB.playingXI : xi.teamA.playingXI);
      }
      
    } catch (error) {
      console.error("Error fetching match data:", error);
      Alert.alert("Error", "Failed to load match data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [matchId, token]);

  const handleScore = async (runs: number, deliveryType: DeliveryType, isFour = false, isSix = false, extraRuns = 0) => {
    if (!matchData) return;
    
    setSending(true);
    
    try {
      const payload: any = {
        matchId,
        tournamentId: matchData.tournamentId,
        runs: runs,
        deliveryType: deliveryType,
        batsmanId: matchData.striker?.playerId,
        bowlerId: matchData.currentBowler?.playerId, 
        currentOver: Math.floor(matchData.totalOvers) || 0,
        currentBall: Math.round((matchData.totalOvers % 1) * 10) || 0, 
        isFour,
        isSix
      };

      if (!payload.batsmanId || !payload.bowlerId) {
          Alert.alert("Error", "Striker or Bowler missing. Please set players.");
          return;
      }

      await updateBallScore(payload, token!);
      await fetchData(); // Refresh state
    } catch (error: any) {
      console.error("Score update failed:", error);
      Alert.alert("Error", "Failed to update score");
    } finally {
      setSending(false);
    }
  };
  
  const handleWicket = async () => {
      if (!outBatsmanId) {
          Alert.alert("Error", "Please select who got out");
          return;
      }
      
      setSending(true);
      setShowWicketModal(false);
      
      try {
        const payload: any = {
            matchId,
            tournamentId: matchData?.tournamentId,
            runs: 0,
            deliveryType: "wicket",
            batsmanId: matchData!.striker.playerId,
            bowlerId: matchData!.currentBowler.playerId,
            currentOver: Math.floor(matchData!.totalOvers),
            currentBall: Math.round((matchData!.totalOvers % 1) * 10),
            
            wicketType: wicketType,
            outBatsmanId: outBatsmanId,
        };
        
        await updateBallScore(payload, token!);
        const freshData = await getMatchScore(matchId!, token!);
        setMatchData(freshData);
        
        // Reset modal state
        setOutBatsmanId("");
        
      } catch (error: any) {
        console.error("Wicket update failed:", error);
        Alert.alert("Error", "Failed to record wicket");
      } finally {
        setSending(false);
      }
  };
  
  const handleUndo = async () => {
     Alert.alert("Undo Last Ball", "Are you sure?", [
         { text: "Cancel", style: "cancel" },
         { text: "Yes", onPress: async () => {
             try {
                setLoading(true);
                await resetLastBall(matchId!, matchData!.tournamentId, token!);
                await fetchData();
             } catch(e) {
                 Alert.alert("Error", "Failed to undo");
             } finally {
                 setLoading(false);
             }
         }}
     ]);
  };

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator color="#6B21A8" /></View>;
  }

  if (!matchData) return <View className="flex-1 justify-center items-center"><Text>No Match Data</Text></View>;

  // Check if we need to select a new player (if striker is missing but match not over)
  const isStrikerMissing = !matchData.striker?.playerId && !matchData.matchComplete && !matchData.innings1Complete && !matchData.innings2Complete;
  
  if (isStrikerMissing) {
      const newBatsmanOptions = battingTeamPlayers.filter(p => 
          p.playerId !== matchData.nonStriker?.playerId 
      ).map(p => ({ label: p.playerName, value: p.playerId }));

      return (
          <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
          <View className="flex-1 justify-center items-center p-6">
             <Text className="text-xl font-bold mb-4 text-center">Wicket Fell! Select New Batsman</Text>
             
             <View className="w-full mb-6">
                 <Dropdown
                    label="Select New Batsman"
                    placeholder="Choose Player..."
                    options={newBatsmanOptions}
                    value={newBatsmanId}
                    onSelect={setNewBatsmanId}
                 />
             </View>
             
             <TouchableOpacity 
                className={`w-full py-4 rounded-xl ${!newBatsmanId ? 'bg-gray-300' : 'bg-purple-600'}`}
                disabled={!newBatsmanId}
                onPress={async () => {
                    if (!newBatsmanId) return;
                    try {
                        setLoading(true);
                         // Using `setCurrentPlayers` API
                        await import("@/api/scoreApi").then(m => m.setCurrentPlayers({
                            matchId: matchId!,
                            tournamentId: matchData.tournamentId,
                            strikerId: newBatsmanId,
                            nonStrikerId: matchData.nonStriker.playerId,
                            bowlerId: matchData.currentBowler.playerId,
                        }, token!));
                        setNewBatsmanId("");
                        fetchData();
                    } catch(e) {
                        Alert.alert("Error", "Failed to set player");
                        setLoading(false);
                    }
                }}
             >
                 <Text className="text-white font-bold text-center text-lg">Resume Scoring</Text>
             </TouchableOpacity>
          </View>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* 1. Score Header */}
      <View className="bg-white p-5 shadow-sm mb-3 border-b border-gray-100">
         <View className="flex-row justify-between items-center">
             <View>
                 <Text className="text-purple-600 font-bold mb-1 uppercase tracking-wider">{matchData.innings1?.teamId === matchData.battingTeamId ? "1st Innings" : "2nd Innings"}</Text>
                 <View className="flex-row items-baseline">
                    <Text className="text-5xl font-extrabold text-gray-900">{matchData.totalRuns}</Text>
                    <Text className="text-3xl font-bold text-gray-400">/{matchData.totalWickets}</Text>
                 </View>
                 <Text className="text-gray-500 font-medium mt-1">Overs: {matchData.totalOvers} <Text className="text-gray-400">({matchData.maxOvers})</Text></Text>
             </View>
             <View className="items-end bg-gray-50 p-3 rounded-lg">
                 <Text className="text-gray-500 font-medium text-xs uppercase">Run Rate</Text>
                 <Text className="text-xl font-bold text-gray-800">{(matchData.totalRuns / (Math.max(0.1, matchData.totalOvers) || 1)).toFixed(2)}</Text>
                 {matchData.target && (
                     <Text className="text-xs text-red-500 mt-1 font-medium">Target: {matchData.target}</Text>
                 )}
             </View>
         </View>
      </View>

      {/* 2. Players Card */}
      <View className="bg-white mx-4 rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
         <View className="flex-row justify-between border-b border-gray-100 pb-3 mb-3">
             <View className="flex-1">
                 <View className="flex-row items-center mb-1">
                    <Text className="font-bold text-lg text-gray-800 max-w-[80%]" numberOfLines={1}>{matchData.striker?.playerName}</Text>
                    <Ionicons name="caret-back" size={16} color="#7C3AED" />
                 </View>
                 <Text className="text-gray-500 font-medium">{matchData.striker?.runs} <Text className="text-xs">({matchData.striker?.balls})</Text></Text>
             </View>
             <View className="flex-1 items-end opacity-70">
                 <Text className="font-bold text-lg text-gray-800 max-w-[80%]" numberOfLines={1}>{matchData.nonStriker?.playerName}</Text>
                 <Text className="text-gray-500 font-medium">{matchData.nonStriker?.runs} <Text className="text-xs">({matchData.nonStriker?.balls})</Text></Text>
             </View>
         </View>
         <View className="flex-row items-center justify-between">
             <View>
                 <Text className="text-xs uppercase text-gray-400 font-bold mb-1">Current Bowler</Text>
                 <Text className="font-bold text-md text-gray-800">{matchData.currentBowler?.playerName}</Text>
             </View>
             <View className="items-end"> 
                <Text className="text-xs text-gray-500">{matchData.currentBowler?.wickets} Wkts</Text>
                <Text className="text-xs text-gray-500">{matchData.currentBowler?.runs} Runs • {matchData.currentBowler?.overs} Ov</Text>
             </View>
         </View>
      </View>

      {/* 4. Recent Balls */}
      <View className="px-4 mb-4">
          <Text className="font-bold text-gray-400 text-xs uppercase mb-2 ml-1">Recent Deliveries</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
              {matchData.lastBalls?.slice(0, 12).map((ball, idx) => ( // Show last 12
                  <View key={idx} className={`w-9 h-9 rounded-full justify-center items-center mr-2 border ${ball.deliveryType === 'wicket' ? 'bg-red-500 border-red-600' : ball.runs >= 4 ? 'bg-green-500 border-green-600' : 'bg-white border-gray-200'}`}>
                      <Text className={`font-bold text-xs ${ball.deliveryType === 'wicket' || ball.runs >= 4 ? 'text-white' : 'text-gray-700'}`}>
                        {ball.deliveryType === 'wicket' ? 'W' : ball.runs}
                        {ball.deliveryType !== 'normal' && ball.deliveryType !== 'wicket' ? 'e' : ''} 
                      </Text>
                  </View>
              ))}
          </ScrollView>
      </View>

      {/* 3. Controls */}
      <View className="bg-white mx-4 rounded-xl p-5 shadow-sm border border-gray-100">
         {sending && <View className="absolute z-10 top-0 left-0 w-full h-full bg-white/60 justify-center items-center rounded-xl"><ActivityIndicator color="#7C3AED" /></View>}
         
         {/* Runs */}
         <Text className="text-center text-gray-400 text-xs font-bold uppercase mb-3">Runs</Text>
         <View className="flex-row flex-wrap justify-center gap-2 mb-6">
             <ScoreButton label="0" value={0} onPress={() => handleScore(0, "normal")} color="bg-gray-100" />
             <ScoreButton label="1" value={1} onPress={() => handleScore(1, "normal")} color="bg-gray-100" />
             <ScoreButton label="2" value={2} onPress={() => handleScore(2, "normal")} color="bg-gray-100" />
             <ScoreButton label="3" value={3} onPress={() => handleScore(3, "normal")} color="bg-gray-100" />
             <ScoreButton label="4" value={4} onPress={() => handleScore(4, "normal", true, false)} color="bg-green-100 text-green-800" />
             <ScoreButton label="6" value={6} onPress={() => handleScore(6, "normal", false, true)} color="bg-purple-100 text-purple-800" />
         </View>
         
         <View className="h-[1px] bg-gray-100 my-2" />

         {/* Extras */}
         <Text className="text-center text-gray-400 text-xs font-bold uppercase mb-3 mt-2">Extras</Text>
         <View className="flex-row flex-wrap justify-between gap-2 mb-6">
             <ActionButton label="WD" onPress={() => handleScore(1, "wide")} />
             <ActionButton label="NB" onPress={() => handleScore(1, "no_ball")} />
             <ActionButton label="BYE" onPress={() => handleScore(1, "bye")} />
             <ActionButton label="LB" onPress={() => handleScore(1, "leg_bye")} />
         </View>
         
         <View className="h-[1px] bg-gray-100 my-2" />

         {/* Actions */}
         <View className="flex-row justify-between mt-4">
             <TouchableOpacity 
                onPress={() => {
                    setOutBatsmanId(matchData.striker?.playerId); // Default to striker
                    setShowWicketModal(true);
                }}
                className="bg-red-500 flex-1 py-4 rounded-xl mr-2 items-center shadow-red-200 shadow-sm"
             >
                 <Text className="text-white font-bold text-lg">WICKET</Text>
             </TouchableOpacity>
             
             <TouchableOpacity 
                onPress={handleUndo}
                className="bg-gray-800 w-16 items-center justify-center rounded-xl shadow-lg"
             >
                 <Ionicons name="arrow-undo" size={24} color="white" />
             </TouchableOpacity>
         </View>
      </View>


      <View className="h-20" />


      {/* Wicket Modal */}
      <Modal visible={showWicketModal} transparent animationType="fade">
          <View className="flex-1 bg-black/60 justify-end">
              <View className="bg-white rounded-t-3xl p-6 h-[70%]">
                  <View className="items-center mb-6">
                      <View className="w-12 h-1 bg-gray-300 rounded-full" />
                  </View>
                  
                  <Text className="text-2xl font-bold mb-6 text-center text-gray-800">Record Wicket</Text>
                  
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="mb-3 font-bold text-gray-500 uppercase text-xs">Dismissal Type</Text>
                    <View className="mb-6">
                        <Dropdown 
                            placeholder="Select Type"
                            options={wicketOptions}
                            value={wicketType}
                            onSelect={(v) => setWicketType(v as WicketType)}
                        />
                    </View>

                    <Text className="mb-3 font-bold text-gray-500 uppercase text-xs">Who is out?</Text>
                    <View className="flex-row justify-center mb-8 gap-3">
                        <TouchableOpacity 
                            onPress={() => setOutBatsmanId(matchData.striker?.playerId)}
                            className={`flex-1 p-4 rounded-xl border-2 items-center ${outBatsmanId === matchData.striker?.playerId ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-bold ${outBatsmanId === matchData.striker?.playerId ? 'text-red-700' : 'text-gray-700'}`}>{matchData.striker?.playerName}</Text>
                            <Text className="text-xs text-gray-400 mt-1">Striker</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setOutBatsmanId(matchData.nonStriker?.playerId)}
                            className={`flex-1 p-4 rounded-xl border-2 items-center ${outBatsmanId === matchData.nonStriker?.playerId ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-bold ${outBatsmanId === matchData.nonStriker?.playerId ? 'text-red-700' : 'text-gray-700'}`}>{matchData.nonStriker?.playerName}</Text>
                            <Text className="text-xs text-gray-400 mt-1">Non-Striker</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleWicket} className="bg-red-600 py-4 rounded-xl items-center shadow-lg shadow-red-200 mb-3">
                        <Text className="text-white font-bold text-lg">Confirm Wicket</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => setShowWicketModal(false)} className="py-4 items-center mb-6">
                        <Text className="text-gray-500 font-medium">Cancel</Text>
                    </TouchableOpacity>
                  </ScrollView>
              </View>
          </View>
      </Modal>

    </ScrollView>
    </SafeAreaView>
  );
}
