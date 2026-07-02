export type MemberPlayingStatus = "active" | "benched";

export interface MemberStatusFields {
  playerStatus?: string | null;
  isBenched?: boolean | null;
}

/** Resolve playing status from API `playerStatus`, with `isBenched` as fallback. */
export function getMemberPlayingStatus(
  member: MemberStatusFields
): MemberPlayingStatus {
  const status = member.playerStatus?.toLowerCase().trim();
  if (status === "benched") return "benched";
  if (status === "active") return "active";
  if (member.isBenched) return "benched";
  return "active";
}

export function isMemberBenched(member: MemberStatusFields): boolean {
  return getMemberPlayingStatus(member) === "benched";
}

export function isMemberActivePlayer(member: MemberStatusFields): boolean {
  return getMemberPlayingStatus(member) === "active";
}

export function getPlayingStatusLabel(member: MemberStatusFields): string {
  return isMemberBenched(member) ? "Benched" : "Active";
}
