"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpdateSettings } from "@/hooks/useSettings";
import { ApiError } from "@/lib/api/errors";
import type { SettingsUpdatePayload } from "@/types/settings";

/**
 * The save behaviour every card on the store page shares.
 *
 * Each card calls this separately rather than sharing one mutation, and that
 * is the point: with a single shared instance, saving a phone number would put
 * every other card into a loading state, and a failed social-links save would
 * show its error under the hero. One mutation per card keeps each section's
 * success and failure to itself.
 *
 * `applyFieldErrors` lets the caller route a 422 back onto its own inputs
 * without this hook needing to know react-hook-form's generics — the form owns
 * its field names, so it does the mapping.
 */
export function useSettingsSection() {
  const { t } = useTranslation("common");
  const updateSettings = useUpdateSettings();

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  /** Browser→server percentage; `null` when nothing is uploading. */
  const [progress, setProgress] = useState<number | null>(null);
  /*
   * Mirrors `progress`, but read synchronously inside `save`'s `catch` below.
   * `save` is redefined on every render and closes over that render's
   * `progress` — by the time an upload's promise actually rejects, several
   * `setProgress` calls have already fired from `onUploadProgress`, each
   * scheduling a re-render this specific closure never sees. A ref is mutated
   * in place, so reading `progressRef.current` in `catch` gets the true latest
   * value instead of whatever `progress` happened to be when `save` was
   * created.
   */
  const progressRef = useRef<number | null>(null);

  const save = async (
    payload: SettingsUpdatePayload,
    options: {
      /** Called with the 422 body so the form can highlight its own fields. */
      applyFieldErrors?: (error: ApiError) => void;
      /** Pass true only for a card that sends files. */
      trackProgress?: boolean;
      onSuccess?: () => void;
    } = {},
  ): Promise<boolean> => {
    setFormError(null);
    setIsSaved(false);
    progressRef.current = options.trackProgress ? 0 : null;
    if (options.trackProgress) setProgress(0);

    const onProgress = options.trackProgress
      ? (percent: number) => {
          progressRef.current = percent;
          setProgress(percent);
        }
      : undefined;

    try {
      await updateSettings.mutateAsync({ payload, onProgress });

      setIsSaved(true);
      options.onSuccess?.();
      return true;
    } catch (error) {
      /*
       * A 401 arriving right after the browser finished sending every byte
       * means the token expired while the request was still in flight — see
       * hooks/useApiToken.ts and the Clerk "laravel" template's token
       * lifetime. That is a different situation from a stale session on an
       * ordinary save, so it gets its own message telling the admin what
       * actually happened rather than the generic failure text.
       */
      const isUploadTokenExpiry =
        error instanceof ApiError &&
        error.status === 401 &&
        progressRef.current === 100;

      if (isUploadTokenExpiry) {
        setFormError(t("admin.site.media.sessionExpiredDuringUpload"));
      } else if (error instanceof ApiError && error.isValidation) {
        options.applyFieldErrors?.(error);
        setFormError(t("admin.site.errors.validation"));
      } else {
        setFormError(t("admin.site.errors.generic"));
      }
      return false;
    } finally {
      progressRef.current = null;
      setProgress(null);
    }
  };

  return {
    save,
    formError,
    isSaved,
    progress,
    isPending: updateSettings.isPending,
    /** Clears the "saved" tick once the user starts editing again. */
    clearSaved: () => setIsSaved(false),
  };
}
