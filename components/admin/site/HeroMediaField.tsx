"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { useSettingsSection } from "./useSettingsSection";
import {
  HERO_POSTER_MAX_BYTES,
  HERO_VIDEO_MAX_BYTES,
  HERO_VIDEO_MIME_TYPES,
} from "@/constants/settings";
import type { SiteSettings } from "@/types/settings";

const MEGABYTE = 1024 * 1024;

interface HeroMediaFieldProps {
  hero: SiteSettings["home_hero"];
}

/**
 * The hero's video and poster.
 *
 * The upload starts as soon as a file is chosen — there is no separate Save
 * button for this card. A picked-but-unsent 50MB file would be a confusing
 * thing to hold in the page, and the surrounding "save" idiom implies a cheap
 * operation, which this is not.
 */
export default function HeroMediaField({ hero }: HeroMediaFieldProps) {
  const { t } = useTranslation("common");
  const section = useSettingsSection();
  const [localError, setLocalError] = useState<string | null>(null);
  /** Which of the two is uploading, so only that row shows a bar. */
  const [uploading, setUploading] = useState<"video" | "poster" | null>(null);

  const upload = async (kind: "video" | "poster", file: File) => {
    setLocalError(null);

    /*
     * Checked here, before the request. The limits are documented by the API
     * owner rather than guessed, so rejecting locally is safe — and making
     * someone sit through a 50MB upload to be told the file was too large is a
     * slow way to deliver a verdict we already have.
     */
    if (kind === "video") {
      if (!HERO_VIDEO_MIME_TYPES.includes(file.type as never)) {
        setLocalError(t("admin.site.media.videoType"));
        return;
      }
      if (file.size > HERO_VIDEO_MAX_BYTES) {
        setLocalError(
          t("admin.site.media.tooLarge", {
            max: HERO_VIDEO_MAX_BYTES / MEGABYTE,
          }),
        );
        return;
      }
    } else {
      if (!file.type.startsWith("image/")) {
        setLocalError(t("admin.site.media.posterType"));
        return;
      }
      if (file.size > HERO_POSTER_MAX_BYTES) {
        setLocalError(
          t("admin.site.media.tooLarge", {
            max: HERO_POSTER_MAX_BYTES / MEGABYTE,
          }),
        );
        return;
      }
    }

    setUploading(kind);
    await section.save(
      { home_hero: kind === "video" ? { video: file } : { poster: file } },
      { trackProgress: true },
    );
    setUploading(null);
  };

  const renderPicker = (kind: "video" | "poster") => {
    const isBusy = uploading === kind;
    /*
     * 100% means the browser finished sending to *our* server, which then
     * still has its own upload to Cloudinary ahead of it. Leaving a full bar
     * on screen for that stretch reads as a freeze, so the label changes and
     * the bar goes indeterminate instead.
     */
    const isProcessing = isBusy && section.progress === 100;

    return (
      <div className="flex flex-col gap-2">
        <label
          className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl border border-primary/15 bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 ${
            section.isPending ? "pointer-events-none opacity-55" : ""
          }`}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {kind === "video"
            ? t("admin.site.media.chooseVideo")
            : t("admin.site.media.choosePoster")}
          <input
            type="file"
            accept={kind === "video" ? HERO_VIDEO_MIME_TYPES.join(",") : "image/*"}
            className="sr-only"
            disabled={section.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              // Cleared so the same file can be re-picked after a failure.
              event.target.value = "";
              if (file) void upload(kind, file);
            }}
          />
        </label>

        {isBusy && section.progress !== null && (
          <div className="flex flex-col gap-1.5">
            <div
              role="progressbar"
              aria-label={t("admin.site.media.uploading")}
              // Omitted while processing: an indeterminate bar must not claim
              // a value, or assistive tech reports a figure that is not moving.
              aria-valuenow={isProcessing ? undefined : section.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10"
            >
              <div
                className={
                  isProcessing
                    ? "h-full w-1/3 animate-pulse rounded-full bg-primary"
                    : "h-full rounded-full bg-primary transition-[width] duration-200"
                }
                style={isProcessing ? undefined : { width: `${section.progress}%` }}
              />
            </div>
            <p className="text-xs text-foreground/60">
              {isProcessing
                ? t("admin.site.media.processing")
                : t("admin.site.media.uploadingPercent", {
                    percent: section.progress,
                  })}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-primary">
            {t("admin.site.media.video")}
          </span>
          <p className="text-xs text-foreground/50">
            {t("admin.site.media.videoHint")}
          </p>

          {/* `controls` and no `autoPlay`: a dashboard is not the place for a
              video that starts playing at you. `key` forces the element to
              reload when the URL changes, which a bare src swap does not do. */}
          <video
            key={hero.video_url}
            controls
            muted
            playsInline
            poster={hero.poster_url || undefined}
            className="aspect-video w-full rounded-2xl bg-primary/5 object-cover"
          >
            <source src={hero.video_url} />
          </video>

          {renderPicker("video")}
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-primary">
            {t("admin.site.media.poster")}
          </span>
          <p className="text-xs text-foreground/50">
            {t("admin.site.media.posterHint")}
          </p>

          {hero.poster_url ? (
            /* A plain <img>: the poster can be a Cloudinary URL or the bundled
               fallback, and next/image would have to be told about both. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero.poster_url}
              alt=""
              className="aspect-video w-full rounded-2xl bg-primary/5 object-cover"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-primary/15 bg-primary/2 text-xs text-foreground/45">
              {t("admin.site.media.noPoster")}
            </div>
          )}

          {renderPicker("poster")}
        </div>
      </div>

      {(localError || section.formError) && (
        <p role="alert" className="text-xs text-red-500">
          {localError ?? section.formError}
        </p>
      )}
    </div>
  );
}
