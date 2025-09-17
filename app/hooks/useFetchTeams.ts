// src/hooks/useFetchTeams.ts
import { getTeamsByTournament, Team } from "@/api/tournamentApi";
import { useEffect, useState } from "react";

export const useFetchTeams = (tournamentId: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) return;

    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTeamsByTournament(tournamentId);
        setTeams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [tournamentId]);

  return { teams, loading, error };
};
