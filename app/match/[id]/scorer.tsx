
import {
    changeBowler,
    DeliveryType,
    getDismissedBatsmen,
    getMatchScore,
    getPlayingXI,
    MatchScoreState,
    resetLastBall,
    setCurrentPlayers,
    swapBatsmen,
    updateBallScore,
    WicketType,
} from "@/api/scoreApi";
import { getTeamMembers } from "@/api/teamApi";
import Dropdown from "@/components/Ui/Dropdown";
import { useAuth } from "@/context/AuthContext";
import { isMemberBenched } from "@/utils/teamMemberUtils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* -------------------------------------------------------------------------- */
/*                            Sub-Components                                  */
/* -------------------------------------------------------------------------- */

const ScoreButton = ({
  label,
  onPress,
  color = "bg-blue-100",
  textColor = "text-gray-800",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`${color} w-16 h-16 justify-center items-center rounded-full m-2 shadow ${
      disabled ? "opacity-40" : ""
    }`}
    activeOpacity={0.7}
  >
    <Text className={`text-xl font-bold ${textColor}`}>{label}</Text>
  </TouchableOpacity>
);

const ActionButton = ({
  label,
  onPress,
  color = "bg-gray-200",
  textColor = "text-black",
  disabled = false,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`${color} py-3 px-5 rounded-lg m-1 shadow flex-1 items-center ${
      disabled ? "opacity-40" : ""
    }`}
    activeOpacity={0.75}
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
  const [sending, setSending] = useState(false);
  const [matchData, setMatchData] = useState<MatchScoreState | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Playing XI for bowler/batsman pickers
  const [battingTeamPlayers, setBattingTeamPlayers] = useState<any[]>([]);
  const [bowlingTeamPlayers, setBowlingTeamPlayers] = useState<any[]>([]);

  // — Wicket Modal —
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState<WicketType>("caught");
  const [outBatsmanId, setOutBatsmanId] = useState("");

  // — Extras Runs Modal (WD / NB / BYE / LB) —
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [extrasDelivery, setExtrasDelivery] = useState<DeliveryType>("wide");
  const [extrasRuns, setExtrasRuns] = useState("0");

  // — Bowler Change Modal (after over ends) —
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [nextBowlerId, setNextBowlerId] = useState("");

  // — New Batsman (after wicket) —
  const [showNewBatsmanModal, setShowNewBatsmanModal] = useState(false);
  const [newBatsmanId, setNewBatsmanId] = useState("");
  const [batsmanToReplace, setBatsmanToReplace] = useState<
    "striker" | "non_striker" | null
  >(null);

  // Track previous over to detect over end
  const prevOverRef = useRef<number>(0);
  const lastOutBatsmanIdRef = useRef("");

  const wicketOptions = [
    { label: "Caught", value: "caught" },
    { label: "Bowled", value: "bowled" },
    { label: "LBW", value: "lbw" },
    { label: "Run Out", value: "run_out" },
    { label: "Stumped", value: "stumped" },
    { label: "Hit Wicket", value: "hit_wicket" },
  ];

  /* ---------------------------------------------------------------------- */
  /*                           Data Fetching                                */
  /* ---------------------------------------------------------------------- */

  const loadBowlingRoster = useCallback(
    async (bowlingTeamId: string) => {
      if (!token) return;
      try {
        const members = await getTeamMembers(bowlingTeamId, token);
        const players = members
          .filter((m) => !isMemberBenched(m))
          .map((m) => ({
            playerId: m.userId,
            playerName: m.fullName || m.email || "Unknown Player",
          }));
        if (players.length > 0) {
          setBowlingTeamPlayers(players);
        }
      } catch (e) {
        console.error("Failed to load bowling roster:", e);
      }
    },
    [token]
  );

  const loadBattingRoster = useCallback(
    async (battingTeamId: string) => {
      if (!token) return;
      try {
        const members = await getTeamMembers(battingTeamId, token);
        const players = members
          .filter((m) => !isMemberBenched(m))
          .map((m) => ({
            playerId: m.userId,
            playerName: m.fullName || m.email || "Unknown Player",
          }));
        if (players.length > 0) {
          setBattingTeamPlayers(players);
        }
      } catch (e) {
        console.error("Failed to load batting roster:", e);
      }
    },
    [token]
  );

  const fetchPlayers = useCallback(
    async (data: MatchScoreState) => {
      try {
        const xi = await getPlayingXI(matchId!, token);
        if (xi) {
          const teamAPlayers = xi.teamA.playingXI;
          const teamBPlayers = xi.teamB.playingXI;

          setBattingTeamPlayers(
            data.battingTeamId === xi.teamA.teamId ? teamAPlayers : teamBPlayers
          );
          setBowlingTeamPlayers(
            data.bowlingTeamId === xi.teamA.teamId ? teamAPlayers : teamBPlayers
          );
          return;
        }
      } catch (e) {
        console.error("Failed to fetch XI:", e);
      }

      if (data.bowlingTeamId && token) {
        await loadBowlingRoster(data.bowlingTeamId);
      }
      if (data.battingTeamId && token) {
        await loadBattingRoster(data.battingTeamId);
      }
    },
    [matchId, token, loadBowlingRoster, loadBattingRoster]
  );

  const fetchDismissed = useCallback(async () => {
    try {
      const dismissed = await getDismissedBatsmen(matchId!, token);
      setDismissedIds(dismissed);
    } catch (e) {
      console.error("Failed to fetch dismissed:", e);
    }
  }, [matchId, token]);

  const fetchData = useCallback(async () => {
    if (!matchId || !token) return;
    try {
      setLoading(true);
      const data = await getMatchScore(matchId, token);
      if (!data) {
        router.replace(`/match/${matchId}/set-players`);
        return;
      }
      setMatchData(data);
      prevOverRef.current = data.currentOver;
      if (
        data.striker?.playerId &&
        !data.currentBowler?.playerId &&
        !data.matchComplete
      ) {
        setNextBowlerId("");
      }
      if (
        !data.matchComplete &&
        data.nonStriker?.playerId &&
        !data.striker?.playerId
      ) {
        setBatsmanToReplace("striker");
        setNewBatsmanId("");
      }
      await Promise.all([fetchPlayers(data), fetchDismissed()]);
    } catch (error) {
      console.error("Error fetching match data:", error);
      Alert.alert("Error", "Failed to load match data");
    } finally {
      setLoading(false);
    }
  }, [matchId, token]);

  useEffect(() => {
    fetchData();
  }, [matchId, token]);

  useEffect(() => {
    if (!matchData?.bowlingTeamId || bowlingTeamPlayers.length > 0) return;
    loadBowlingRoster(matchData.bowlingTeamId);
  }, [matchData?.bowlingTeamId, bowlingTeamPlayers.length, loadBowlingRoster]);

  useEffect(() => {
    if (!matchData?.battingTeamId || battingTeamPlayers.length > 0) return;
    loadBattingRoster(matchData.battingTeamId);
  }, [matchData?.battingTeamId, battingTeamPlayers.length, loadBattingRoster]);

  /* ---------------------------------------------------------------------- */
  /*                      Post-ball State Detection                          */
  /* ---------------------------------------------------------------------- */

  const handleStateAfterUpdate = useCallback(
    async (newState: MatchScoreState) => {
      setMatchData(newState);

      // ① Match complete
      if (newState.matchComplete) {
        // Result is shown in-screen – no further actions
        return;
      }

      // ② Innings 1 just completed → set up 2nd innings players
      if (
        newState.innings1Complete &&
        newState.currentInnings === 2 &&
        !matchData?.innings1Complete
      ) {
        Alert.alert(
          "Innings Complete!",
          `Target: ${newState.target} runs. Set 2nd innings players now.`,
          [
            {
              text: "Set Players",
              onPress: () => router.push(`/match/${matchId}/set-players`),
            },
          ]
        );
        return;
      }

      // ③ Wicket fell → fetch dismissed list, prompt new batsman
      if (
        newState.totalWickets > (matchData?.totalWickets ?? 0) &&
        !newState.matchComplete
      ) {
        await fetchDismissed();
        const outId = lastOutBatsmanIdRef.current;
        const replaceRole: "striker" | "non_striker" =
          outId && outId === matchData?.nonStriker?.playerId
            ? "non_striker"
            : "striker";
        setBatsmanToReplace(replaceRole);
        setNewBatsmanId("");
        lastOutBatsmanIdRef.current = "";
        return;
      }

      // ④ Over just ended → prompt bowler change
      const overEnded =
        newState.currentBall === 0 &&
        newState.currentOver > prevOverRef.current;

      if (overEnded) {
        prevOverRef.current = newState.currentOver;
        setNextBowlerId("");
        return;
      }

      prevOverRef.current = newState.currentOver;
    },
    [matchData, matchId, router, fetchDismissed]
  );

  /* ---------------------------------------------------------------------- */
  /*                            Score Handlers                               */
  /* ---------------------------------------------------------------------- */

  const buildBasePayload = (
    data: MatchScoreState,
    deliveryType: DeliveryType,
    runs: number,
    extras: Partial<{ isFour: boolean; isSix: boolean; wicketType: WicketType; outBatsmanId: string }>
  ) => ({
    matchId: matchId!,
    tournamentId: data.tournamentId,
    runs,
    deliveryType,
    batsmanId: data.striker!.playerId,
    bowlerId: data.currentBowler!.playerId,
    currentOver: data.currentOver,
    currentBall: data.currentBall,
    isFour: extras.isFour ?? false,
    isSix: extras.isSix ?? false,
    ...(extras.wicketType && { wicketType: extras.wicketType }),
    ...(extras.outBatsmanId && { outBatsmanId: extras.outBatsmanId }),
  });

  const ensureReadyToScore = (): boolean => {
    if (!matchData?.striker?.playerId) {
      Alert.alert("Error", "Striker not set. Please set players.");
      return false;
    }
    if (!matchData?.currentBowler?.playerId) {
      return false;
    }
    return true;
  };

  const shouldSwapStriker = (
    runs: number,
    deliveryType: DeliveryType,
    isFour = false,
    isSix = false
  ) => {
    if (deliveryType === "wicket" || isFour || isSix) return false;
    return runs % 2 === 1;
  };

  const applyAutoStrikerSwap = async (
    previous: MatchScoreState,
    updated: MatchScoreState,
    runs: number,
    deliveryType: DeliveryType,
    isFour = false,
    isSix = false
  ): Promise<MatchScoreState> => {
    if (updated.striker?.playerId !== previous.striker?.playerId) {
      return updated;
    }

    const lastBall = updated.lastBalls?.[updated.lastBalls.length - 1];
    const needsSwap =
      lastBall?.strikerSwapped ||
      shouldSwapStriker(runs, deliveryType, isFour, isSix);

    if (!needsSwap) return updated;

    return swapBatsmen(
      { matchId: matchId!, tournamentId: updated.tournamentId },
      token!
    );
  };

  const handleScore = async (
    runs: number,
    deliveryType: DeliveryType = "normal",
    isFour = false,
    isSix = false
  ) => {
    if (!ensureReadyToScore()) return;
    setSending(true);
    try {
      const payload = buildBasePayload(matchData, deliveryType, runs, {
        isFour,
        isSix,
      });
      let newState = await updateBallScore(payload, token!);
      newState = await applyAutoStrikerSwap(
        matchData,
        newState,
        runs,
        deliveryType,
        isFour,
        isSix
      );
      await handleStateAfterUpdate(newState);
    } catch (error: any) {
      console.error("Score update failed:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to update score");
    } finally {
      setSending(false);
    }
  };

  const handleExtrasSubmit = async () => {
    const runs = parseInt(extrasRuns, 10) || 0;
    setShowExtrasModal(false);
    await handleScore(runs, extrasDelivery);
  };

  const handleWicket = async () => {
    if (!outBatsmanId) {
      Alert.alert("Error", "Please select who got out");
      return;
    }
    if (!ensureReadyToScore()) return;
    setSending(true);
    setShowWicketModal(false);

    try {
      lastOutBatsmanIdRef.current = outBatsmanId;
      const payload = buildBasePayload(matchData!, "wicket", 0, {
        wicketType,
        outBatsmanId,
      });
      const newState = await updateBallScore(payload, token!);
      setOutBatsmanId("");
      await handleStateAfterUpdate(newState);
    } catch (error: any) {
      console.error("Wicket failed:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to record wicket");
    } finally {
      setSending(false);
    }
  };

  const handleNewBatsman = async () => {
    const replaceRole = batsmanToReplace ?? "striker";
    if (!newBatsmanId) {
      Alert.alert("Error", "Please select the next batsman");
      return;
    }
    if (!matchData?.nonStriker?.playerId && replaceRole === "striker") {
      Alert.alert("Error", "Non-striker not set. Please set players.");
      return;
    }
    if (!matchData?.striker?.playerId && replaceRole === "non_striker") {
      Alert.alert("Error", "Striker not set. Please set players.");
      return;
    }
    if (!matchData?.currentBowler?.playerId) {
      Alert.alert("Error", "Please select a bowler before resuming.");
      return;
    }

    setSending(true);
    setShowNewBatsmanModal(false);

    try {
      const player = battingTeamPlayers.find((p) => p.playerId === newBatsmanId);
      const bowler = matchData.currentBowler;

      let strikerId = matchData.striker?.playerId ?? "";
      let strikerName = matchData.striker?.playerName ?? "";
      let nonStrikerId = matchData.nonStriker?.playerId ?? "";
      let nonStrikerName = matchData.nonStriker?.playerName ?? "";

      if (replaceRole === "striker") {
        strikerId = newBatsmanId;
        strikerName = player?.playerName ?? "";
      } else {
        nonStrikerId = newBatsmanId;
        nonStrikerName = player?.playerName ?? "";
      }

      const newState = await setCurrentPlayers(
        {
          matchId: matchId!,
          tournamentId: matchData.tournamentId,
          strikerId,
          strikerName,
          nonStrikerId,
          nonStrikerName,
          bowlerId: bowler.playerId,
          bowlerName: bowler.playerName,
        },
        token!
      );
      setMatchData(newState);
      setNewBatsmanId("");
      setBatsmanToReplace(null);
    } catch (error: any) {
      console.error("Set new batsman failed:", error);
      setShowNewBatsmanModal(true);
      Alert.alert("Error", error?.response?.data?.message || "Failed to set new batsman");
    } finally {
      setSending(false);
    }
  };

  const handleChangeBowler = async () => {
    if (!nextBowlerId) {
      Alert.alert("Error", "Please select a bowler");
      return;
    }
    setSending(true);

    try {
      const player = bowlingTeamPlayers.find((p) => p.playerId === nextBowlerId);
      const newState = await changeBowler(
        {
          matchId: matchId!,
          tournamentId: matchData!.tournamentId,
          bowlerId: nextBowlerId,
          bowlerName: player?.playerName ?? "",
        },
        token!
      );
      setMatchData(newState);
      setNextBowlerId("");
      setShowBowlerModal(false);
    } catch (error: any) {
      console.error("Change bowler failed:", error);
      setShowBowlerModal(true);
      Alert.alert("Error", error?.response?.data?.message || "Failed to change bowler");
    } finally {
      setSending(false);
    }
  };

  const handleSwapBatsmen = async () => {
    setSending(true);
    try {
      const newState = await swapBatsmen(
        { matchId: matchId!, tournamentId: matchData!.tournamentId },
        token!
      );
      setMatchData(newState);
    } catch (error: any) {
      Alert.alert("Error", "Failed to swap batsmen");
    } finally {
      setSending(false);
    }
  };

  const handleUndo = async () => {
    Alert.alert("Undo Last Ball", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            setLoading(true);
            const newState = await resetLastBall(
              matchId!,
              matchData!.tournamentId,
              token!
            );
            setMatchData(newState);
            prevOverRef.current = newState.currentOver;
            await fetchDismissed();
          } catch (e) {
            Alert.alert("Error", "Failed to undo");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  /* ---------------------------------------------------------------------- */
  /*                               Render                                    */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!matchData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No Match Data</Text>
      </View>
    );
  }

  // Match complete overlay
  if (matchData.matchComplete && matchData.result) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center p-6">
        <View className="bg-white rounded-3xl p-8 w-full items-center shadow-2xl">
          <Text className="text-4xl mb-3">🏆</Text>
          <Text className="text-2xl font-extrabold text-gray-900 text-center mb-2">
            Match Complete
          </Text>
          <Text className="text-purple-600 font-bold text-lg text-center mb-1">
            {matchData.result.winner}
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            {matchData.result.margin}
          </Text>
          <TouchableOpacity
            className="bg-purple-600 py-4 px-10 rounded-2xl"
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold text-lg">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Build options for modals
  const activeBatsmanRole = batsmanToReplace ?? "striker";

  const creaseBatsmanId =
    activeBatsmanRole === "striker"
      ? matchData.nonStriker?.playerId
      : matchData.striker?.playerId;

  const availableBatsmen = battingTeamPlayers
    .filter(
      (p) =>
        !dismissedIds.includes(p.playerId) && p.playerId !== creaseBatsmanId
    )
    .map((p) => ({ label: p.playerName, value: p.playerId }));

  const bowlerOptions = bowlingTeamPlayers.map((p) => ({
    label: p.playerName,
    value: p.playerId,
  }));

  const extrasRunOptions = ["0", "1", "2", "3", "4", "5", "6"].map((v) => ({
    label: v === "0" ? "0 (just penalty)" : `+${v} runs`,
    value: v,
  }));

  const overs = `${matchData.currentOver}.${matchData.currentBall}`;
  const canRecordBall = Boolean(
    matchData.striker?.playerId && matchData.currentBowler?.playerId
  );
  const needsBowlerSelection = !matchData.currentBowler?.playerId;
  const needsBatsmanSelection =
    batsmanToReplace !== null ||
    (!matchData.striker?.playerId &&
      Boolean(matchData.nonStriker?.playerId) &&
      !matchData.matchComplete);

  const renderBatsmanPicker = (compact = false) => (
    <View className={compact ? "" : "mb-2"}>
      {availableBatsmen.length === 0 ? (
        <Text className="text-center text-red-500 py-4">
          No more batsmen available — innings may be ending.
        </Text>
      ) : (
        <>
          <View className={compact ? "mb-3" : "mb-1"}>
            <Dropdown
              label={
                compact
                  ? undefined
                  : activeBatsmanRole === "non_striker"
                  ? "Next non-striker"
                  : "Next striker"
              }
              placeholder={
                activeBatsmanRole === "non_striker"
                  ? "Select non-striker"
                  : "Select striker"
              }
              options={availableBatsmen}
              value={newBatsmanId}
              onSelect={setNewBatsmanId}
            />
          </View>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {availableBatsmen.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setNewBatsmanId(option.value)}
                className={`px-3 py-2 rounded-full border ${
                  newBatsmanId === option.value
                    ? "bg-green-600 border-green-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    newBatsmanId === option.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={handleNewBatsman}
            disabled={!newBatsmanId || sending}
            className={`py-4 rounded-xl items-center ${
              !newBatsmanId || sending ? "bg-gray-300" : "bg-green-600"
            }`}
          >
            {sending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Set Batsman</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderBowlerPicker = (compact = false) => (
    <View className={compact ? "" : "mb-2"}>
      {bowlerOptions.length === 0 ? (
        <View className="py-4 items-center">
          <ActivityIndicator color="#7C3AED" />
          <Text className="text-gray-500 text-sm mt-2">Loading bowlers…</Text>
        </View>
      ) : (
        <>
          <View className={compact ? "mb-3" : "mb-1"}>
            <Dropdown
              label={compact ? undefined : "Next bowler"}
              placeholder="Select bowler"
              options={bowlerOptions}
              value={nextBowlerId}
              onSelect={setNextBowlerId}
            />
          </View>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {bowlerOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setNextBowlerId(option.value)}
                className={`px-3 py-2 rounded-full border ${
                  nextBowlerId === option.value
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    nextBowlerId === option.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={handleChangeBowler}
            disabled={!nextBowlerId || sending}
            className={`py-4 rounded-xl items-center ${
              !nextBowlerId || sending ? "bg-gray-300" : "bg-purple-600"
            }`}
          >
            <Text className="text-white font-bold text-lg">Set Bowler</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ① Score Header */}
        <View className="bg-white p-5 shadow-sm mb-3 border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-purple-600 font-bold mb-1 uppercase tracking-wider text-xs">
                {matchData.currentInnings === 1 ? "1st Innings" : "2nd Innings"}
              </Text>
              <View className="flex-row items-baseline">
                <Text className="text-5xl font-extrabold text-gray-900">
                  {matchData.totalRuns}
                </Text>
                <Text className="text-3xl font-bold text-gray-400">
                  /{matchData.totalWickets}
                </Text>
              </View>
              <Text className="text-gray-500 font-medium mt-1">
                Overs: {overs}{" "}
                <Text className="text-gray-400">({matchData.maxOvers})</Text>
              </Text>
            </View>
            <View className="items-end bg-gray-50 p-3 rounded-lg">
              <Text className="text-gray-500 font-medium text-xs uppercase">
                Run Rate
              </Text>
              <Text className="text-xl font-bold text-gray-800">
                {matchData.currentOver > 0
                  ? (
                      matchData.totalRuns /
                      (matchData.currentOver +
                        matchData.currentBall / 6)
                    ).toFixed(2)
                  : "0.00"}
              </Text>
              {matchData.target && (
                <View>
                  <Text className="text-xs text-red-500 mt-1 font-medium">
                    Target: {matchData.target}
                  </Text>
                  {(() => {
                    const runsNeeded =
                      matchData.target - matchData.totalRuns;
                    const ballsLeft =
                      matchData.maxOvers * 6 -
                      (matchData.currentOver * 6 +
                        matchData.currentBall);
                    const oversLeft = ballsLeft / 6;
                    return (
                      <Text className="text-xs text-orange-500 font-medium">
                        RRR:{" "}
                        {oversLeft > 0
                          ? (runsNeeded / oversLeft).toFixed(2)
                          : "∞"}
                      </Text>
                    );
                  })()}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ② Players Card */}
        <View className="bg-white mx-4 rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <View className="flex-row justify-between border-b border-gray-100 pb-3 mb-3">
            <View className="flex-1">
              <TouchableOpacity
                onPress={() => {
                  if (needsBatsmanSelection) setShowNewBatsmanModal(true);
                }}
                disabled={!needsBatsmanSelection}
              >
                <View className="flex-row items-center mb-1">
                  <Text
                    className="font-bold text-lg text-gray-800 max-w-[80%]"
                    numberOfLines={1}
                  >
                    {matchData.striker?.playerName ?? "Select striker"}
                  </Text>
                  {matchData.striker?.playerId ? (
                    <Ionicons name="caret-back" size={16} color="#7C3AED" />
                  ) : null}
                </View>
                {matchData.striker?.playerId ? (
                  <Text className="text-gray-500 font-medium">
                    {matchData.striker.runs}{" "}
                    <Text className="text-xs">
                      ({matchData.striker.balls}b) • {matchData.striker.fours}×4 •{" "}
                      {matchData.striker.sixes}×6
                    </Text>
                  </Text>
                ) : (
                  <Text className="text-xs text-red-600 font-medium">
                    Tap to choose next batsman
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <View className="flex-1 items-end opacity-70">
              <Text
                className="font-bold text-lg text-gray-800 max-w-[80%]"
                numberOfLines={1}
              >
                {matchData.nonStriker?.playerName}
              </Text>
              <Text className="text-gray-500 font-medium">
                {matchData.nonStriker?.runs}{" "}
                <Text className="text-xs">
                  ({matchData.nonStriker?.balls}b)
                </Text>
              </Text>
            </View>
          </View>

          {/* Bowler row + swap button */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                setNextBowlerId("");
                setShowBowlerModal(true);
              }}
              className="flex-1"
            >
              <Text className="text-xs uppercase text-gray-400 font-bold mb-1">
                Bowling
              </Text>
              <Text className="font-bold text-md text-gray-800">
                {matchData.currentBowler?.playerName ?? "Select next bowler"}
              </Text>
              {matchData.currentBowler ? (
                <Text className="text-xs text-gray-500">
                  {matchData.currentBowler.overs}.
                  {matchData.currentBowler.balls} ov •{" "}
                  {matchData.currentBowler.runs} runs •{" "}
                  {matchData.currentBowler.wickets} wkts
                </Text>
              ) : (
                <Text className="text-xs text-amber-600 font-medium">
                  Tap to choose next bowler
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSwapBatsmen}
              className="bg-indigo-100 py-2 px-4 rounded-xl flex-row items-center gap-1"
              disabled={sending}
            >
              <Ionicons name="swap-horizontal" size={16} color="#4F46E5" />
              <Text className="text-indigo-700 font-bold text-xs">Swap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {needsBatsmanSelection && (
          <View className="mx-4 mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <Text className="font-bold text-red-900 text-base mb-1">
              Wicket — new batsman required
            </Text>
            <Text className="text-red-800 text-sm mb-4">
              {activeBatsmanRole === "non_striker"
                ? "Select the next non-striker to continue."
                : "Select the next striker to continue."}
            </Text>
            {renderBatsmanPicker()}
          </View>
        )}

        {needsBowlerSelection && (
          <View className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <Text className="font-bold text-amber-900 text-base mb-1">
              Over complete
            </Text>
            <Text className="text-amber-800 text-sm mb-4">
              Select the next bowler to continue scoring.
            </Text>
            {renderBowlerPicker()}
          </View>
        )}

        {/* ③ Recent Balls */}
        <View className="px-4 mb-4">
          <Text className="font-bold text-gray-400 text-xs uppercase mb-2 ml-1">
            Recent Deliveries
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row py-1"
          >
            {matchData.lastBalls?.slice(0, 12).map((ball, idx) => {
              const isWicket = ball.deliveryType === "wicket";
              const isBoundary = ball.runs >= 4 && ball.deliveryType !== "wicket";
              const isExtra = ["wide", "no_ball", "bye", "leg_bye"].includes(
                ball.deliveryType
              );
              const bgColor = isWicket
                ? "bg-red-500 border-red-600"
                : isBoundary
                ? "bg-green-500 border-green-600"
                : isExtra
                ? "bg-yellow-400 border-yellow-500"
                : "bg-white border-gray-200";
              const textColor =
                isWicket || isBoundary ? "text-white" : isExtra ? "text-gray-800" : "text-gray-700";
              const label = isWicket
                ? "W"
                : ball.deliveryType === "wide"
                ? `${ball.runs}wd`
                : ball.deliveryType === "no_ball"
                ? `${ball.runs}nb`
                : ball.deliveryType === "bye"
                ? `${ball.runs}b`
                : ball.deliveryType === "leg_bye"
                ? `${ball.runs}lb`
                : `${ball.runs}`;

              return (
                <View
                  key={idx}
                  className={`min-w-[36px] h-9 px-1 rounded-full justify-center items-center mr-2 border ${bgColor}`}
                >
                  <Text className={`font-bold text-xs ${textColor}`}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ④ Controls */}
        <View className="bg-white mx-4 rounded-xl p-5 shadow-sm border border-gray-100">
          {sending && (
            <View className="absolute z-10 top-0 left-0 w-full h-full bg-white/70 justify-center items-center rounded-xl">
              <ActivityIndicator color="#7C3AED" size="large" />
            </View>
          )}

          {/* Runs */}
          <Text className="text-center text-gray-400 text-xs font-bold uppercase mb-3">
            Runs
          </Text>
          <View className="flex-row flex-wrap justify-center mb-6">
            <ScoreButton label="0" color="bg-gray-100" disabled={!canRecordBall} onPress={() => handleScore(0, "normal")} />
            <ScoreButton label="1" color="bg-gray-100" disabled={!canRecordBall} onPress={() => handleScore(1, "normal")} />
            <ScoreButton label="2" color="bg-gray-100" disabled={!canRecordBall} onPress={() => handleScore(2, "normal")} />
            <ScoreButton label="3" color="bg-gray-100" disabled={!canRecordBall} onPress={() => handleScore(3, "normal")} />
            <ScoreButton label="4" color="bg-green-100" textColor="text-green-800" disabled={!canRecordBall} onPress={() => handleScore(4, "normal", true, false)} />
            <ScoreButton label="6" color="bg-purple-100" textColor="text-purple-800" disabled={!canRecordBall} onPress={() => handleScore(6, "normal", false, true)} />
          </View>

          <View className="h-[1px] bg-gray-100 my-2" />

          {/* Extras */}
          <Text className="text-center text-gray-400 text-xs font-bold uppercase mb-3 mt-2">
            Extras
          </Text>
          <View className="flex-row flex-wrap justify-between mb-4">
            <ActionButton
              label="WD"
              disabled={!canRecordBall}
              onPress={() => {
                setExtrasDelivery("wide");
                setExtrasRuns("0");
                setShowExtrasModal(true);
              }}
              color="bg-yellow-100"
              textColor="text-yellow-800"
            />
            <ActionButton
              label="NB"
              disabled={!canRecordBall}
              onPress={() => {
                setExtrasDelivery("no_ball");
                setExtrasRuns("0");
                setShowExtrasModal(true);
              }}
              color="bg-yellow-100"
              textColor="text-yellow-800"
            />
            <ActionButton
              label="BYE"
              disabled={!canRecordBall}
              onPress={() => {
                setExtrasDelivery("bye");
                setExtrasRuns("1");
                setShowExtrasModal(true);
              }}
              color="bg-orange-100"
              textColor="text-orange-800"
            />
            <ActionButton
              label="LB"
              disabled={!canRecordBall}
              onPress={() => {
                setExtrasDelivery("leg_bye");
                setExtrasRuns("1");
                setShowExtrasModal(true);
              }}
              color="bg-orange-100"
              textColor="text-orange-800"
            />
          </View>

          <View className="h-[1px] bg-gray-100 my-2" />

          {/* Primary action row */}
          <View className="flex-row justify-between mt-4 gap-2">
            <TouchableOpacity
              onPress={() => {
                if (!canRecordBall) {
                  ensureReadyToScore();
                  return;
                }
                setOutBatsmanId(matchData.striker?.playerId ?? "");
                setWicketType("caught");
                setShowWicketModal(true);
              }}
              disabled={!canRecordBall}
              className={`bg-red-500 flex-1 py-4 rounded-xl items-center shadow-sm ${
                !canRecordBall ? "opacity-40" : ""
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">WICKET</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUndo}
              className="bg-gray-800 w-14 items-center justify-center rounded-xl"
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-undo" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* ─── WICKET MODAL ─── */}
      <Modal visible={showWicketModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-5" />
            <Text className="text-2xl font-bold mb-5 text-center text-gray-800">
              Record Wicket
            </Text>

            <Text className="mb-2 font-bold text-gray-500 uppercase text-xs">
              Dismissal Type
            </Text>
            <View className="mb-5">
              <Dropdown
                placeholder="Select Type"
                options={wicketOptions}
                value={wicketType}
                onSelect={(v) => setWicketType(v as WicketType)}
              />
            </View>

            <Text className="mb-2 font-bold text-gray-500 uppercase text-xs">
              Who is out?
            </Text>
            <View className="flex-row mb-2 gap-3">
              <TouchableOpacity
                onPress={() => setOutBatsmanId(matchData.striker?.playerId)}
                className={`flex-1 p-4 rounded-xl border-2 items-center ${
                  outBatsmanId === matchData.striker?.playerId
                    ? "bg-red-50 border-red-500"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`font-bold ${
                    outBatsmanId === matchData.striker?.playerId
                      ? "text-red-700"
                      : "text-gray-700"
                  }`}
                >
                  {matchData.striker?.playerName}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">Striker ★</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setOutBatsmanId(matchData.nonStriker?.playerId)}
                className={`flex-1 p-4 rounded-xl border-2 items-center ${
                  outBatsmanId === matchData.nonStriker?.playerId
                    ? "bg-red-50 border-red-500"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`font-bold ${
                    outBatsmanId === matchData.nonStriker?.playerId
                      ? "text-red-700"
                      : "text-gray-700"
                  }`}
                >
                  {matchData.nonStriker?.playerName}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">Non-Striker</Text>
              </TouchableOpacity>
            </View>

            {wicketType === "run_out" && (
              <Text className="text-xs text-gray-400 mb-4 text-center">
                Tap who was run out above
              </Text>
            )}

            <TouchableOpacity
              onPress={handleWicket}
              className="bg-red-600 py-4 rounded-xl items-center mt-2 mb-2"
            >
              <Text className="text-white font-bold text-lg">
                Confirm Wicket
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowWicketModal(false)}
              className="py-3 items-center mb-2"
            >
              <Text className="text-gray-500 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── EXTRAS MODAL ─── */}
      <Modal visible={showExtrasModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-5" />
            <Text className="text-xl font-bold mb-1 text-center text-gray-800">
              {extrasDelivery === "wide"
                ? "Wide Ball"
                : extrasDelivery === "no_ball"
                ? "No Ball"
                : extrasDelivery === "bye"
                ? "Bye"
                : "Leg Bye"}
            </Text>
            <Text className="text-xs text-center text-gray-400 mb-5">
              {["wide", "no_ball"].includes(extrasDelivery)
                ? "Server adds +1 penalty automatically. Enter any additional runs scored."
                : "Enter runs (go to team extras, not batsman)."}
            </Text>

            <Text className="mb-2 font-bold text-gray-500 uppercase text-xs">
              Additional Runs
            </Text>
            <View className="mb-6">
              <Dropdown
                placeholder="Select runs"
                options={extrasRunOptions}
                value={extrasRuns}
                onSelect={setExtrasRuns}
              />
            </View>

            <TouchableOpacity
              onPress={handleExtrasSubmit}
              className="bg-yellow-500 py-4 rounded-xl items-center mb-2"
            >
              <Text className="text-white font-bold text-lg">
                Record{" "}
                {extrasDelivery === "wide"
                  ? "Wide"
                  : extrasDelivery === "no_ball"
                  ? "No Ball"
                  : extrasDelivery === "bye"
                  ? "Bye"
                  : "Leg Bye"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowExtrasModal(false)}
              className="py-3 items-center mb-2"
            >
              <Text className="text-gray-500 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── BOWLER CHANGE MODAL ─── */}
      <Modal
        visible={showBowlerModal}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-5" />
            <Text className="text-2xl font-bold mb-2 text-center text-gray-800">
              Over Complete!
            </Text>
            <Text className="text-center text-gray-500 mb-5">
              Select the next bowler
            </Text>

            {renderBowlerPicker(true)}
          </View>
        </View>
      </Modal>

      {/* ─── NEW BATSMAN MODAL ─── */}
      <Modal
        visible={showNewBatsmanModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewBatsmanModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-5" />
            <Text className="text-2xl font-bold mb-2 text-center text-gray-800">
              Wicket! 🎯
            </Text>
            <Text className="text-center text-gray-500 mb-5">
              {activeBatsmanRole === "non_striker"
                ? "Select the next non-striker"
                : "Select the next striker"}
            </Text>

            {renderBatsmanPicker(true)}

            <TouchableOpacity
              onPress={() => setShowNewBatsmanModal(false)}
              className="py-3 items-center mb-2"
            >
              <Text className="text-gray-500 font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
