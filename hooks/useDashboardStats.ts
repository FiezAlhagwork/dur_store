"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiToken } from "@/hooks/useApiToken";
import { dashboardKeys } from "@/lib/query-keys/dashboard";
import { ApiError } from "@/lib/api/errors";
import { fetchDashboardStats } from "@/services/dashboard";
import type { DashboardStats } from "@/types/dashboard";

/**
 * Everything the dashboard shows, in one request.
 *
 * Admin-only, so unlike `useCategories` and `useProducts` this waits on
 * Clerk's `isLoaded`: firing earlier would read a null session and throw a
 * spurious 401 before the real token exists.
 *
 * Neither 401 nor 403 is retried — the QueryClient's shared policy handles
 * that (see components/providers/QueryProvider.tsx). Call sites can tell the
 * two apart with `error.isForbidden`: a 401 means sign in again, a 403 means
 * this account is signed in but is not an admin, so re-authenticating would
 * change nothing.
 *
 * Product and category writes invalidate `dashboardKeys.all()`, so the stats
 * refresh on their own after any change rather than going stale behind the
 * dashboard.
 */
export function useDashboardStats() {
  const { isLoaded, getApiToken } = useApiToken();

  return useQuery<DashboardStats, ApiError>({
    queryKey: dashboardKeys.stats(),
    enabled: isLoaded,
    queryFn: async () => fetchDashboardStats(await getApiToken()),
  });
}
