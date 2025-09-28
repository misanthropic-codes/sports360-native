// src/hooks/useGenerateFixtures.ts
import {
  GenerateFixturePayload,
  generateFixtures,
  Ground,
  Match,
  Team,
} from "@/api/tournamentApi";
import { useState } from "react";

export const useGenerateFixtures = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    payload: GenerateFixturePayload,
    teams: Team[],
    grounds: Ground[]
  ): Promise<Match[]> => {
    try {
      setLoading(true);
      setError(null);
      const rawMatches = await generateFixtures(payload);

      // Enhance matches with team and ground details
      const enhancedMatches = rawMatches.map((match) => {
        const teamA = teams.find((t) => t.id === match.teamAId);
        const teamB = teams.find((t) => t.id === match.teamBId);
        const ground = grounds.find((g) => g.id === match.groundId);

        // Calculate end time based on match duration
        const startTime = match.matchTime;
        const endTime = new Date(
          new Date(startTime).getTime() + payload.matchDurationMinutes * 60000
        ).toISOString();

        return {
          ...match,
          teamA,
          teamB,
          ground,
          startTime,
          endTime,
        };
      });

      setMatches(enhancedMatches);
      return enhancedMatches;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate fixtures";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, generate };
};
