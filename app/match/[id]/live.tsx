
import { MatchScoreState } from "@/api/scoreApi";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { useMatchStore } from "@/store/matchStore";
import {
    InningsCompletePayload,
    MatchCompletePayload,
    ScoreUpdateEvent,
    socketService,
} from "@/utils/socketService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LiveMatchScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { matchData, fetchMatchData, handleSocketEvent, loading, error } =
    useMatchStore();
  const [connectionStatus, setConnectionStatus] = useState<"Connecting…" | "Live" | "Offline">(
    "Connecting…"
  );
  const [inningsAlert, setInningsAlert] = useState<InningsCompletePayload | null>(null);
  const [matchResult, setMatchResult] = useState<MatchCompletePayload | null>(null);
  const { token } = useAuth();

  /* ---------------------------------------------------------------------- */
  /*                         Socket + Data Setup                             */
  /* ---------------------------------------------------------------------- */

  const onSocketEvent = useCallback(
    (payload: ScoreUpdateEvent) => {
      const { type, data } = payload;
      console.log("⚡️ Socket Update:", type);

      switch (type) {
        case "BALL_UPDATE":
        case "UNDO_BALL":
        case "PLAYERS_SET":
        case "BOWLER_CHANGED":
        case "BATSMEN_SWAPPED":
        case "SCORE_RESET":
          handleSocketEvent(type, data as MatchScoreState);
          break;
        case "INNINGS_COMPLETE":
          setInningsAlert(data as InningsCompletePayload);
          // Also re-fetch full state for accuracy
          fetchMatchData(matchId!, token);
          break;
        case "MATCH_COMPLETE":
          setMatchResult(data as MatchCompletePayload);
          fetchMatchData(matchId!, token);
          break;
        default:
          break;
      }
    },
    [matchId, token, handleSocketEvent, fetchMatchData]
  );

  useEffect(() => {
    if (!matchId) return;

    // Initial data fetch
    fetchMatchData(matchId, token);

    // WebSocket
    socketService.connect();
    socketService.subscribeToMatch(matchId);
    setConnectionStatus("Live");

    socketService.onScoreUpdate(onSocketEvent);

    return () => {
      socketService.unsubscribeFromMatch(matchId);
      socketService.offScoreUpdate();
    };
  }, [matchId]);

  /* ---------------------------------------------------------------------- */
  /*                               Render                                    */
  /* ---------------------------------------------------------------------- */

  if (loading && !matchData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-gray-400">Loading match…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  if (!matchData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-400 text-center">
          Match hasn't started yet.{"\n"}Check back soon!
        </Text>
      </SafeAreaView>
    );
  }

  const overs = `${matchData.currentOver}.${matchData.currentBall}`;
  const crr =
    matchData.currentOver > 0 || matchData.currentBall > 0
      ? (
          matchData.totalRuns /
          Math.max(
            0.1,
            matchData.currentOver + matchData.currentBall / 6
          )
        ).toFixed(2)
      : "0.00";

  const runsNeeded = matchData.target
    ? matchData.target - matchData.totalRuns
    : null;
  const ballsLeft = matchData.target
    ? matchData.maxOvers * 6 -
      (matchData.currentOver * 6 + matchData.currentBall)
    : null;
  const rrr =
    runsNeeded !== null && ballsLeft !== null && ballsLeft > 0
      ? (runsNeeded / (ballsLeft / 6)).toFixed(2)
      : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Header
        type="title"
        title="Live Score"
        showBackButton
        onBackPress={() => router.back()}
      />
      <ScrollView className="flex-1">
        {/* ── Match Result Banner ── */}
        {(matchResult || matchData.matchComplete) && (
          <View className="bg-yellow-400 px-4 py-3 items-center">
            <Text className="text-gray-900 font-extrabold text-base">
              🏆{" "}
              {matchResult?.winner ?? matchData.result?.winner ?? "Match Complete"}
            </Text>
            <Text className="text-gray-800 text-sm">
              {matchResult?.margin ?? matchData.result?.margin}
            </Text>
          </View>
        )}

        {/* ── Innings Complete Banner ── */}
        {inningsAlert && !matchData.matchComplete && (
          <View className="bg-blue-600 px-4 py-3 items-center">
            <Text className="text-white font-bold">
              Innings {inningsAlert.innings} Complete —{" "}
              {inningsAlert.score.runs}/{inningsAlert.score.wickets}
            </Text>
            {inningsAlert.target > 0 && (
              <Text className="text-blue-100 text-sm">
                Target: {inningsAlert.target} runs
              </Text>
            )}
          </View>
        )}

        {/* ── Header Card ── */}
        <View className="bg-blue-900 pb-6 px-6 pt-4 rounded-b-3xl shadow-lg">
          {/* Live indicator */}
          <View className="absolute top-4 right-4 flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full mr-1 ${
                connectionStatus === "Live" ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <Text className="text-white text-xs font-medium">
              {connectionStatus}
            </Text>
          </View>

          <Text className="text-blue-300 text-center text-xs font-bold uppercase tracking-widest mb-3">
            {matchData.currentInnings === 1 ? "1st Innings" : "2nd Innings"}
          </Text>

          {/* Score */}
          <View className="items-center mb-3">
            <Text className="text-6xl text-white font-extrabold">
              {matchData.totalRuns}
              <Text className="text-4xl text-blue-300 font-bold">
                /{matchData.totalWickets}
              </Text>
            </Text>
            <Text className="text-blue-200 text-lg mt-1">
              {overs} / {matchData.maxOvers} overs
            </Text>
          </View>

          {/* CRR / Target / RRR row */}
          <View className="flex-row justify-center gap-8">
            <View className="items-center">
              <Text className="text-blue-300 text-xs">CRR</Text>
              <Text className="text-white font-bold text-lg">{crr}</Text>
            </View>
            {matchData.target && (
              <>
                <View className="items-center">
                  <Text className="text-blue-300 text-xs">Target</Text>
                  <Text className="text-yellow-400 font-bold text-lg">
                    {matchData.target}
                  </Text>
                </View>
                {rrr && (
                  <View className="items-center">
                    <Text className="text-blue-300 text-xs">RRR</Text>
                    <Text className="text-orange-300 font-bold text-lg">{rrr}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        <View className="m-4 gap-4">
          {/* ── Batsmen Card ── */}
          <View className="bg-white rounded-2xl shadow-sm p-4">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-3">
              Batting
            </Text>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="bg-purple-600 w-2 h-2 rounded-full mr-2" />
                <Text className="font-bold text-lg text-gray-800">
                  {matchData.striker?.playerName}
                </Text>
                <Text className="ml-1 text-purple-600 font-bold">*</Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-xl text-gray-900">
                  {matchData.striker?.runs}{" "}
                  <Text className="text-sm font-normal text-gray-500">
                    ({matchData.striker?.balls})
                  </Text>
                </Text>
                <Text className="text-xs text-gray-400">
                  {matchData.striker?.fours}×4 · {matchData.striker?.sixes}×6
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center py-2">
              <Text className="font-semibold text-gray-600">
                {matchData.nonStriker?.playerName}
              </Text>
              <Text className="font-bold text-lg text-gray-700">
                {matchData.nonStriker?.runs}{" "}
                <Text className="text-sm font-normal text-gray-500">
                  ({matchData.nonStriker?.balls})
                </Text>
              </Text>
            </View>
          </View>

          {/* ── Bowler Card ── */}
          <View className="bg-white rounded-2xl shadow-sm p-4">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-3">
              Bowling
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-lg text-gray-800">
                {matchData.currentBowler?.playerName}
              </Text>
              <View className="flex-row gap-5 items-center">
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Overs</Text>
                  <Text className="font-bold text-lg">
                    {matchData.currentBowler?.overs}.
                    {matchData.currentBowler?.balls ?? 0}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Runs</Text>
                  <Text className="font-bold text-lg">
                    {matchData.currentBowler?.runs}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Wkts</Text>
                  <Text className="font-bold text-lg">
                    {matchData.currentBowler?.wickets}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Recent Balls ── */}
          {matchData.lastBalls?.length > 0 && (
            <View className="bg-white rounded-2xl shadow-sm p-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-3">
                Recent Deliveries
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {matchData.lastBalls.slice(0, 12).map((ball, index) => {
                  const isW = ball.deliveryType === "wicket";
                  const isBoundary =
                    ball.runs >= 4 && ball.deliveryType !== "wicket";
                  const isExtra = ["wide", "no_ball", "bye", "leg_bye"].includes(
                    ball.deliveryType
                  );
                  const bg = isW
                    ? "bg-red-500"
                    : isBoundary
                    ? "bg-green-500"
                    : isExtra
                    ? "bg-yellow-400"
                    : "bg-gray-200";
                  const tc =
                    isW || isBoundary ? "text-white" : "text-gray-800";
                  const extraLabels: Partial<Record<string, string>> = {
                    wide: "wd",
                    no_ball: "nb",
                    bye: "b",
                    leg_bye: "lb",
                  };
                  const shortType = extraLabels[ball.deliveryType];
                  const label = isW
                    ? "W"
                    : shortType
                    ? `${ball.runs}${shortType}`
                    : `${ball.runs}`;
                  return (
                    <View
                      key={index}
                      className={`min-w-[36px] h-9 px-1 rounded-full justify-center items-center mr-2 ${bg}`}
                    >
                      <Text className={`font-bold text-xs ${tc}`}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── Innings Summary (if innings 1 complete) ── */}
          {matchData.innings1Complete && matchData.innings1 && (
            <View className="bg-gray-800 rounded-2xl p-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-2">
                1st Innings
              </Text>
              <Text className="text-white font-bold text-xl">
                {matchData.innings1.runs}/{matchData.innings1.wickets}{" "}
                <Text className="text-sm font-normal text-gray-300">
                  ({matchData.innings1.overs}.{matchData.innings1.balls} ov)
                </Text>
              </Text>
              {matchData.target && (
                <Text className="text-yellow-400 font-bold mt-1">
                  Target: {matchData.target}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
