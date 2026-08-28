import axios from "axios";

/**
 * The single axios instance every service uses.
 *
 * `NEXT_PUBLIC_LARAVEL_API_URL` holds the host only (no `/api`), matching how
 * it is already used elsewhere; the `/api` prefix is appended here so callers
 * write `apiClient.get("/products")` rather than repeating it.
 *
 * There is deliberately **no auth interceptor**. Attaching the token
 * automatically would mean reaching for `window.Clerk` — a global that lives
 * outside React and is not guaranteed to be ready when a request fires, which
 * invites race conditions. Instead every service that needs auth takes an
 * explicit `token` parameter, and the hooks fetch it through Clerk's React
 * context after `isLoaded` is true (see hooks/useApiToken.ts). It costs one
 * argument per call and makes the dependency visible at every call site.
 *
 * Error normalisation is likewise left to the services via `toApiError`,
 * keeping this module to exactly what it is: transport configuration.
 */
export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? ""}/api`,
  headers: {
    Accept: "application/json",
  },
});

/** `Authorization` header for an authenticated call. */
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
