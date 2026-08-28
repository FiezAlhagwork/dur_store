"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { ApiError } from "@/lib/api/errors";

/**
 * Laravel validates a token minted from this specific Clerk JWT template.
 * Calling `getToken()` without it silently returns Clerk's default session
 * token — same type, different claims — which the API rejects.
 */
const JWT_TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE_NAME;

/**
 * Supplies a fresh API token to hooks that call an authenticated service.
 *
 * Tokens are very short-lived (~60 seconds), so `getApiToken()` is called
 * inside each `queryFn`/`mutationFn` rather than being read once and held —
 * a token captured at render time would already be stale by the time a
 * mutation fires.
 *
 * `isLoaded` is returned so callers can gate a query on Clerk being ready.
 * Firing before then would read a null session and throw a spurious 401.
 */
export function useApiToken() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const getApiToken = useCallback(async () => {
    if (!JWT_TEMPLATE) {
      throw new ApiError(
        0,
        "NEXT_PUBLIC_CLERK_JWT_TEMPLATE_NAME is not configured",
      );
    }

    const token = await getToken({ template: JWT_TEMPLATE });
    if (!token) {
      throw new ApiError(401, "No active session");
    }
    return token;
  }, [getToken]);

  return { isLoaded, isSignedIn, getApiToken };
}
