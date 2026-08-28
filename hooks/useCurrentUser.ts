"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiToken } from "@/hooks/useApiToken";
import { ApiError } from "@/lib/api/errors";
import { fetchCurrentUser, type CurrentUser } from "@/services/user";

/**
 * Development-only. Logs the two claims that decide whether the API accepts
 * the token at all:
 *
 * - `azp` — the origin that requested the token. The API checks it against an
 *   authorized-parties allowlist and fails the request when it is not listed,
 *   so every origin this app is served from has to be registered there. See
 *   the note in CLAUDE.md.
 * - `sub` — the Clerk user id the `users.clerk_id` lookup keys on.
 *
 * Never logs the token itself: it is a real credential that lets whoever
 * holds it act as this user until it expires.
 */
function logTokenIdentityInDev(token: string) {
  if (process.env.NODE_ENV !== "development") return;

  try {
    const payload = token.split(".")[1];
    const claims = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    console.info("[auth] azp:", claims.azp, "| sub:", claims.sub);
  } catch {
    console.warn("[auth] could not decode the JWT payload");
  }
}

/**
 * The signed-in user's row, used by `/redirect-after-login` to route on role.
 *
 * The retry policy is not set here: 401 → no retry, everything else → two
 * retries 500ms apart now lives in the QueryClient defaults, so it applies to
 * every query in the app rather than just this one.
 */
export function useCurrentUser() {
  const { isLoaded, getApiToken } = useApiToken();

  return useQuery<CurrentUser, ApiError>({
    queryKey: ["current-user"],
    enabled: isLoaded,
    // A one-shot redirect router, not a live view: without this every tab
    // focus refires the request and its retries.
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const token = await getApiToken();
      logTokenIdentityInDev(token);
      return fetchCurrentUser(token);
    },
  });
}
