"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

/** Attempts after the first failure. */
const MAX_QUERY_RETRIES = 2;
/** Fixed, not exponential — a short, predictable gap before retrying. */
const RETRY_DELAY_MS = 500;

/**
 * Statuses where a second attempt is guaranteed to fail the same way.
 *
 * `401` — the same rejected token produces the same answer.
 * `403` — the account's role will not change between two requests 500ms
 *   apart. This one matters for the admin-only dashboard stats: without it a
 *   signed-in non-admin waits through three identical rejections before
 *   seeing the message.
 */
const NON_RETRYABLE_STATUSES: readonly number[] = [401, 403];

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            /**
             * One retry policy for the whole app, not just auth.
             *
             * Settled rejections (see NON_RETRYABLE_STATUSES) are never
             * retried, since retrying only delays showing the user what
             * happened. Everything else (500, timeout, network failure) gets
             * two more attempts, since those are often transient.
             */
            retry: (failureCount, error) => {
              if (
                error instanceof ApiError &&
                NON_RETRYABLE_STATUSES.includes(error.status)
              ) {
                return false;
              }
              return failureCount < MAX_QUERY_RETRIES;
            },
            retryDelay: RETRY_DELAY_MS,
          },
          mutations: {
            /**
             * Explicitly zero. This is React Query's default, but stating it
             * here prevents anyone from assuming the query policy above also
             * covers writes: replaying a POST whose response was lost in
             * transit would create the product twice.
             */
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
