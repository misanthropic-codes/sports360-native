// src/hooks/useFetchGrounds.ts
import { getGrounds, Ground } from "@/api/tournamentApi";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export const useFetchGrounds = () => {
  const { token } = useAuth();
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrounds = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getGrounds(token);
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
  }, [token]);

  return { grounds, loading, error };
};
