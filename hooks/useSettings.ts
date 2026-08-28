"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiToken } from "@/hooks/useApiToken";
import { settingsKeys } from "@/lib/query-keys/settings";
import { ApiError } from "@/lib/api/errors";
import { fetchSettings, updateSettings } from "@/services/settings";
import { DEFAULT_SETTINGS } from "@/constants/settings";
import type { SiteSettings, SettingsUpdatePayload } from "@/types/settings";

/**
 * Site-wide settings.
 *
 * Like `useCategories` and `useProducts`, this deliberately does **not** wait
 * on Clerk's `isLoaded` and sends no token: `GET /api/settings` is public, and
 * gating it on auth would stall the hero and footer for visitors who are never
 * going to sign in.
 *
 * **Read `settings`, not `data`.** `data` is `undefined` while loading and on
 * failure; `settings` is always a complete object, falling back to
 * `DEFAULT_SETTINGS`. That is what keeps a settings outage from blanking the
 * storefront — a shop with slightly stale copy still sells, one with an empty
 * hero does not. `isError` and `error` remain untouched for the dashboard
 * editor, which does need to say plainly that the save target is unreachable.
 */
export function useSettings() {
  const query = useQuery<SiteSettings, ApiError>({
    queryKey: settingsKeys.current(),
    queryFn: fetchSettings,
    /*
     * Settings change on the order of weeks. Without these two, every route
     * change refetches them, because the shared QueryClient leaves staleTime
     * at its default of 0 — fine for a product list, wasteful for a record
     * that is the same all day.
     */
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { ...query, settings: query.data ?? DEFAULT_SETTINGS };
}

/**
 * Saves part of the settings. Admin only.
 *
 * `onProgress` matters here in a way it does not for other writes: the hero
 * video is allowed up to 50MB, which is minutes on a slow connection. Without
 * a progress reading the dashboard looks frozen and the save button gets
 * pressed twice.
 *
 * Note the callback stops being useful at 100% — that is the browser finishing
 * its upload to our server, which then has its own upload to Cloudinary still
 * to do. Show an indeterminate "processing" state from there, not a stalled
 * full bar.
 */
export function useUpdateSettings() {
  const { getApiToken } = useApiToken();
  const queryClient = useQueryClient();

  return useMutation<
    SiteSettings,
    ApiError,
    { payload: SettingsUpdatePayload; onProgress?: (percent: number) => void }
  >({
    mutationFn: async ({ payload, onProgress }) =>
      updateSettings(await getApiToken(), payload, onProgress),
    onSuccess: async (saved) => {
      /*
       * The response is the full, merged settings object, so it is written
       * straight into the cache — that makes the new hero video appear without
       * waiting for a refetch to come back. The invalidation still follows, to
       * resync anything the server changed that the response did not cover.
       */
      queryClient.setQueryData(settingsKeys.current(), saved);
      await queryClient.invalidateQueries({ queryKey: settingsKeys.all() });
    },
  });
}
