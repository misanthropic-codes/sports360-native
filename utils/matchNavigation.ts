export function isLiveMatchStatus(status?: string | null): boolean {
  const normalized = status?.toLowerCase().trim() ?? "";
  return normalized === "ongoing" || normalized === "live";
}

export function getLiveMatchPath(matchId: string): `/match/${string}/live` {
  return `/match/${matchId}/live`;
}
