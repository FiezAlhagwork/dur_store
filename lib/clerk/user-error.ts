import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

/**
 * Turning a failed Clerk *user* mutation — updating a name, replacing an
 * avatar, revoking a session — into something worth showing on screen.
 *
 * This is deliberately **not** the sign-in/sign-up error mapping that
 * CLAUDE.md rules out: that flow distinguishes a wrong code from an expired
 * one by reading `verification.status` directly, inline in
 * `lib/auth/orchestration.ts`, and must stay there. Nothing here touches the
 * auth flow; these are settings-page writes on an already-signed-in account.
 */

/**
 * Clerk can demand a fresh proof of identity before a sensitive change goes
 * through. On this passwordless instance that means another emailed code, so
 * it needs its own message rather than the generic failure text — the user has
 * to be told to sign in again, not to retry.
 */
const REVERIFICATION_CODE = "session_reverification_required";

export function isReverificationRequired(error: unknown): boolean {
  return (
    isClerkAPIResponseError(error) &&
    error.errors.some((item) => item.code === REVERIFICATION_CODE)
  );
}

/**
 * Clerk's own message when it has one, the caller's fallback otherwise.
 *
 * `longMessage` is the sentence Clerk writes for end users ("That email
 * address is taken. Please try another."); `message` is the terser form. Both
 * beat a generic "something went wrong", because they say what to change.
 *
 * They are English-only, which is why `fallback` is a translated string and
 * not a hardcoded one: a caller that would rather stay bilingual than be
 * specific can pass its own message and ignore this entirely.
 */
export function getClerkErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!isClerkAPIResponseError(error)) return fallback;
  const first = error.errors[0];
  return first?.longMessage ?? first?.message ?? fallback;
}
