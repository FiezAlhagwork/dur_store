"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import { Loader2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  getClerkErrorMessage,
  isReverificationRequired,
} from "@/lib/clerk/user-error";

/**
 * The account's profile picture, changed and removed on the spot.
 *
 * Both actions call Clerk immediately rather than waiting for the name form's
 * Save button — `setProfileImage` is its own request, exactly like the product
 * image endpoints, so folding it into an unrelated submit would only make
 * "Cancel" look as though it could undo an upload it cannot.
 */
export default function AvatarField() {
  const { user } = useUser();
  const { t } = useTranslation("common");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const runImageChange = async (file: File | null) => {
    setError(null);
    setIsBusy(true);
    try {
      await user.setProfileImage({ file });
    } catch (caught) {
      setError(
        isReverificationRequired(caught)
          ? t("admin.settings.errors.reverification")
          : getClerkErrorMessage(caught, t("admin.settings.avatar.error")),
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-primary/5">
          {/*
            Clerk serves avatars from whichever host owns the image — its own
            `img.clerk.com` for uploads, but the OAuth provider's CDN for a
            Google picture it has not copied. That set cannot be enumerated in
            next.config.ts's `remotePatterns`, so this stays a plain <img>.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />

          {isBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
              <Loader2
                className="h-5 w-5 animate-spin text-second"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-primary/15 bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 ${
              isBusy ? "pointer-events-none opacity-55" : ""
            }`}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t("admin.settings.avatar.change")}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isBusy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                // Cleared so re-picking the same file fires `change` again.
                event.target.value = "";
                if (file) void runImageChange(file);
              }}
            />
          </label>

          {/*
            Only offered once there is something to remove: Clerk always
            returns an `imageUrl`, falling back to a generated initials avatar,
            so `hasImage` is the only way to tell a real picture from that
            placeholder.
          */}
          {user.hasImage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isBusy}
              onClick={() => void runImageChange(null)}
            >
              {t("admin.settings.avatar.remove")}
            </Button>
          )}
        </div>
      </div>

      {/*
        No client-side size limit: Clerk enforces its own, and the exact
        threshold is not confirmed for this instance (see CLAUDE.md's rule
        against hardcoding unverified Clerk settings). A file Clerk rejects
        comes back with its own specific message, which reads better than a
        guessed local cap that might not match.
      */}
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
