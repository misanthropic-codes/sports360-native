// src/hooks/useFetchGrounds.ts
import { useEffect, useState } from "react";
import { getGrounds, Ground } from "@/api/tournamentApi";

export const useFetchGrounds = () => {
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGrounds();
        setGrounds(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch grounds"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGrounds();
  }, []);

  return { grounds, loading, error };
};
