import { useAuth } from "@/context/AuthContext";
import { useGroundStore } from "@/store/groundStore";
import { useEffect } from "react";

export const useFetchGrounds = () => {
  const { token } = useAuth();
  const { grounds, groundsLoading, groundsError, fetchGrounds } = useGroundStore();

  useEffect(() => {
    if (token) {
      fetchGrounds(token);
    }
  }, [token]);

  return {
    grounds,
    loading: groundsLoading,
    error: groundsError,
  };
};
