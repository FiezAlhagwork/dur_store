"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";

/**
 * `@clerk/types` is not a resolvable package here (only `@clerk/nextjs`,
 * `@clerk/react`, `@clerk/shared` and `@clerk/backend` are installed), so the
 * session type is derived from the method that produces it instead of being
 * imported from a path that may not exist. This also cannot drift: it is
 * whatever `getSessions()` returns, by construction.
 */
type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>;
export type ClerkSession = Awaited<
  ReturnType<ClerkUser["getSessions"]>
>[number];

/** One key, like `["current-user"]` in `useCurrentUser`. */
const SESSIONS_QUERY_KEY = ["clerk-sessions"] as const;

/**
 * Every session the account is currently signed in on, newest activity first.
 *
 * `getSessions()` is a promise on the user resource rather than a hook, so it
 * is wrapped in `useQuery` to get caching, loading and error states for free
 * from the provider the rest of the app already uses.
 */
export function useClerkSessions() {
  const { user, isLoaded } = useUser();

  return useQuery<ClerkSession[], Error>({
    queryKey: SESSIONS_QUERY_KEY,
    enabled: isLoaded && !!user,
    queryFn: async () => {
      if (!user) throw new Error("No signed-in user");
      return user.getSessions();
    },
    /*
     * The app-wide policy in QueryProvider retries anything that is not an
     * `ApiError` twice. A Clerk rejection here is a settled answer about the
     * account, not a flaky network hop, so retrying only delays the message.
     */
    retry: false,
    // The list is a security overview, not a live feed; refetching it on every
    // tab focus would hammer Clerk for a list that changes very rarely.
    refetchOnWindowFocus: false,
  });
}

/**
 * Ends one session. Takes the resource itself rather than an id, because
 * `revoke()` is a method on it — there is no "revoke by id" call to make.
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ClerkSession>({
    mutationFn: async (session) => {
      await session.revoke();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}
