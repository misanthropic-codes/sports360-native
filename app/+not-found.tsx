import { useAuth } from "@/context/AuthContext";
import { getDefaultRoute } from "@/utils/navigation";
import { Redirect, usePathname } from "expo-router";
import { useEffect } from "react";

/**
 * Never show Expo's "Unmatched Route" screen.
 * Unknown paths redirect to the user's home route.
 */
export default function NotFound() {
  const pathname = usePathname();
  const { user } = useAuth();
  const fallback = getDefaultRoute(user);

  useEffect(() => {
    console.warn("[Navigation] Unknown route, redirecting:", pathname, "→", fallback);
  }, [pathname, fallback]);

  return <Redirect href={fallback as any} />;
}
