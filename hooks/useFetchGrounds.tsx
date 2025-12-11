// src/hooks/useFetchGrounds.ts
import { useAuth } from "@/context/AuthContext";
import { useGroundStore } from "@/store/groundStore";
import { useEffect } from "react";

export const useFetchGrounds = () => {
  const { token } = useAuth();
  const { 
    grounds, 
    groundsLoading, 
    groundsLoaded, 
    fetchGrounds 
  } = useGroundStore();

  useEffect(() => {
    if (token && !groundsLoaded) {
      fetchGrounds(token); // Smart fetch - only if not cached
    }
  }, [token, groundsLoaded]);

  return { 
    grounds, 
    loading: groundsLoading, 
    error: null 
  };
};
