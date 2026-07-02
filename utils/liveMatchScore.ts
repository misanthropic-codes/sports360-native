import { getMatchScore, MatchScoreState } from "@/api/scoreApi";
import { LiveMatchListItem } from "@/components/LiveMatchCard";

export function formatTeamScore(
  runs: number,
  wickets: number,
  overs: number,
  balls: number
): string {
  return `${runs}/${wickets} (${overs}.${balls})`;
}

function getTeamScoreFromState(
  state: MatchScoreState,
  teamId: string
): string | null {
  if (state.battingTeamId === teamId) {
    return formatTeamScore(
      state.totalRuns,
      state.totalWickets,
      state.currentOver,
      state.currentBall
    );
  }

  if (state.innings1?.teamId === teamId) {
    return formatTeamScore(
      state.innings1.runs,
      state.innings1.wickets,
      state.innings1.overs,
      state.innings1.balls ?? 0
    );
  }

  if (state.innings2?.teamId === teamId) {
    return formatTeamScore(
      state.innings2.runs,
      state.innings2.wickets,
      state.innings2.overs,
      state.innings2.balls ?? 0
    );
  }

  return null;
}

export function applyScoreStateToMatch(
  match: LiveMatchListItem,
  state: MatchScoreState
): LiveMatchListItem {
  const teamAId = match.teamAId;
  const teamBId = match.teamBId;

  let scoreA = match.scoreA;
  let scoreB = match.scoreB;

  if (teamAId) {
    scoreA = getTeamScoreFromState(state, teamAId) ?? scoreA;
  }
  if (teamBId) {
    scoreB = getTeamScoreFromState(state, teamBId) ?? scoreB;
  }

  if (!teamAId && !teamBId && state.battingTeamId) {
    scoreA = formatTeamScore(
      state.totalRuns,
      state.totalWickets,
      state.currentOver,
      state.currentBall
    );
  }

  return {
    ...match,
    scoreA,
    scoreB,
    teamAId: teamAId ?? state.battingTeamId,
    teamBId: teamBId ?? state.bowlingTeamId,
    status: state.matchComplete ? "completed" : match.status ?? "ongoing",
  };
}

export async function enrichMatchesWithLiveScores(
  matches: LiveMatchListItem[],
  token?: string | null
): Promise<LiveMatchListItem[]> {
  if (matches.length === 0) return matches;

  return Promise.all(
    matches.map(async (match) => {
      try {
        const state = await getMatchScore(match.id, token);
        if (!state) return match;
        return applyScoreStateToMatch(match, state);
      } catch {
        return match;
      }
    })
  );
}

export function mergeLiveMatchesById(
  ...lists: LiveMatchListItem[][]
): LiveMatchListItem[] {
  const byId = new Map<string, LiveMatchListItem>();

  for (const list of lists) {
    for (const match of list) {
      if (!match.id) continue;
      const existing = byId.get(match.id);
      byId.set(match.id, existing ? { ...existing, ...match } : match);
    }
  }

  return [...byId.values()];
}
