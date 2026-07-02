import { getLiveMatches } from "@/api/guest/guestApi";
import { getMyOngoingMatches } from "@/api/tournamentApi";
import { LiveMatchListItem } from "@/components/LiveMatchCard";
import { MatchScoreState } from "@/api/scoreApi";
import {
  applyScoreStateToMatch,
  enrichMatchesWithLiveScores,
  mergeLiveMatchesById,
} from "@/utils/liveMatchScore";
import {
  ScoreUpdateEvent,
  socketService,
} from "@/utils/socketService";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const LIVE_SCORE_EVENTS = new Set([
  "BALL_UPDATE",
  "UNDO_BALL",
  "PLAYERS_SET",
  "BOWLER_CHANGED",
  "BATSMEN_SWAPPED",
  "SCORE_RESET",
  "INNINGS_COMPLETE",
]);

function extraMatchesKey(matches: LiveMatchListItem[]): string {
  return matches
    .map((m) => m.id)
    .filter(Boolean)
    .sort()
    .join(",");
}

function normalizeListItem(match: Record<string, unknown>): LiveMatchListItem {
  return {
    ...(match as LiveMatchListItem),
    id: String(match.id ?? match.matchId ?? ""),
    teamAName:
      (match.teamAName as string | undefined) ??
      (match.teamA as { name?: string } | undefined)?.name,
    teamBName:
      (match.teamBName as string | undefined) ??
      (match.teamB as { name?: string } | undefined)?.name,
  };
}

export function useLiveMatches(
  token?: string | null,
  extraMatches: LiveMatchListItem[] = []
) {
  const [myLiveMatches, setMyLiveMatches] = useState<LiveMatchListItem[]>([]);
  const [allLiveMatches, setAllLiveMatches] = useState<LiveMatchListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const extraKey = useMemo(() => extraMatchesKey(extraMatches), [extraMatches]);
  const extraMatchesRef = useRef(extraMatches);
  extraMatchesRef.current = extraMatches;

  const applyScoreUpdate = useCallback((state: MatchScoreState) => {
    const updater = (prev: LiveMatchListItem[]) => {
      const index = prev.findIndex((match) => match.id === state.matchId);
      if (index === -1) {
        const fallback = extraMatchesRef.current.find(
          (match) => match.id === state.matchId
        );
        if (!fallback) return prev;
        return [...prev, applyScoreStateToMatch(fallback, state)];
      }

      return prev.map((match) =>
        match.id === state.matchId
          ? applyScoreStateToMatch(match, state)
          : match
      );
    };

    setMyLiveMatches(updater);
    setAllLiveMatches(updater);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [allMatches, myMatches] = await Promise.all([
        getLiveMatches(),
        token ? getMyOngoingMatches(token) : Promise.resolve([]),
      ]);

      const normalizedAll = allMatches.map((m: Record<string, unknown>) =>
        normalizeListItem(m)
      );
      const normalizedMine = myMatches.map((m: Record<string, unknown>) =>
        normalizeListItem(m)
      );

      const mergedMine = mergeLiveMatchesById(normalizedMine, extraMatchesRef.current);
      const enrichedMine = await enrichMatchesWithLiveScores(mergedMine, token);
      const enrichedAll = await enrichMatchesWithLiveScores(normalizedAll, token);

      setMyLiveMatches(enrichedMine);
      setAllLiveMatches(enrichedAll);
    } finally {
      setLoading(false);
    }
  }, [token, extraKey]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      const interval = setInterval(refresh, 12_000);
      return () => clearInterval(interval);
    }, [refresh])
  );

  const subscribedIdsRef = useRef<Set<string>>(new Set());

  const liveMatchIds = useMemo(() => {
    const ids = new Set<string>();
    for (const match of myLiveMatches) {
      if (match.id) ids.add(match.id);
    }
    for (const match of allLiveMatches) {
      if (match.id) ids.add(match.id);
    }
    for (const match of extraMatches) {
      if (match.id) ids.add(match.id);
    }
    return [...ids].sort();
  }, [
    extraKey,
    myLiveMatches.map((m) => m.id).join(","),
    allLiveMatches.map((m) => m.id).join(","),
  ]);

  useEffect(() => {
    if (liveMatchIds.length === 0) return;

    socketService.connect();

    for (const id of liveMatchIds) {
      if (!subscribedIdsRef.current.has(id)) {
        socketService.subscribeToMatch(id);
        subscribedIdsRef.current.add(id);
      }
    }

    for (const id of [...subscribedIdsRef.current]) {
      if (!liveMatchIds.includes(id)) {
        socketService.unsubscribeFromMatch(id);
        subscribedIdsRef.current.delete(id);
      }
    }
  }, [liveMatchIds.join(",")]);

  useEffect(() => {
    if (liveMatchIds.length === 0) return;

    const onSocketEvent = (payload: ScoreUpdateEvent) => {
      if (payload.type === "MATCH_COMPLETE") {
        const matchId = (payload.data as MatchScoreState)?.matchId;
        if (!matchId) return;
        setMyLiveMatches((prev) => prev.filter((m) => m.id !== matchId));
        setAllLiveMatches((prev) => prev.filter((m) => m.id !== matchId));
        return;
      }

      if (!LIVE_SCORE_EVENTS.has(payload.type)) return;

      const state = payload.data as MatchScoreState;
      if (!state?.matchId) return;

      applyScoreUpdate(state);
    };

    socketService.connect();
    socketService.onScoreUpdate(onSocketEvent);

    return () => {
      socketService.offScoreUpdate();
    };
  }, [liveMatchIds.join(","), applyScoreUpdate]);

  return {
    myLiveMatches,
    allLiveMatches,
    loading,
    refresh,
  };
}
