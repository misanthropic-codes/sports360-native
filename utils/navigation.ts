export const LOGIN_ROUTE = "/(root)/login";

export function normalizeRole(role?: string | null): string {
  return (role ?? "player").toLowerCase().replace(/\s+/g, "_");
}

export function normalizeDomain(domain?: string | null): string {
  return (domain ?? "cricket").toLowerCase();
}

/** Maps API role to onboarding folder segment (e.g. ground_owner → ground-owner). */
export function roleToOnboardingSegment(role: string): string {
  const normalized = normalizeRole(role);
  if (normalized === "ground_owner") return "ground-owner";
  return normalized;
}

export function getFeedPath(domain?: string | null): string {
  return normalizeDomain(domain) === "marathon"
    ? "/feed/marathon-feed"
    : `/feed/${normalizeDomain(domain)}`;
}

export function getBookingPath(domain?: string | null): string {
  return normalizeDomain(domain) === "marathon"
    ? "/booking/Marathon-booking"
    : "/booking/Cricket-booking";
}

export function getDashboardPath(
  role?: string | null,
  domain?: string | null
): string {
  const normalizedRole = normalizeRole(role);
  const normalizedDomain = normalizeDomain(domain);

  if (normalizedRole === "ground_owner") {
    return "/dashboard/ground_owner";
  }

  return `/dashboard/${normalizedRole}/${normalizedDomain}`;
}

export function getDefaultRoute(
  user: { role?: string; domains?: string[] } | null
): string {
  if (!user) return LOGIN_ROUTE;

  const role = normalizeRole(user.role);
  const domain = normalizeDomain(user.domains?.[0]);

  if (role !== "ground_owner" && !user.domains?.length) {
    return "/onboarding/choose-domain";
  }

  return getDashboardPath(role, domain);
}

export function getBottomNavPaths(role: string, type: string) {
  const normalizedRole = normalizeRole(role);
  const normalizedType = normalizeDomain(type);

  return {
    normalizedRole,
    feedPath: getFeedPath(normalizedType),
    bookingPath: getBookingPath(normalizedType),
    dashboardPath: getDashboardPath(normalizedRole, normalizedType),
  };
}
