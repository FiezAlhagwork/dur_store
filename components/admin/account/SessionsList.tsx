"use client";

import { useState } from "react";
import { useSession } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Monitor, Smartphone } from "lucide-react";
import RevokeSessionDialog from "./RevokeSessionDialog";
import Button from "@/components/ui/Button";
import { SkeletonGroup, SkeletonListRow } from "@/components/ui/Skeleton";
import { useClerkSessions, type ClerkSession } from "@/hooks/useClerkSessions";
import { formatRelativeTime } from "@/utils/helper";

/**
 * Every field on Clerk's `SessionActivity` is optional — `browserName`,
 * `deviceType`, `city`, `country` and the rest are all `?:` in the installed
 * types. So each label is assembled from whatever actually arrived, and a
 * session Clerk could tell us nothing about falls back to a single honest
 * "unknown device" rather than rendering "undefined · undefined".
 */
function describeDevice(session: ClerkSession, t: TFunction): string {
  const parts = [
    session.latestActivity?.browserName,
    session.latestActivity?.deviceType,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" · ")
    : t("admin.settings.sessions.unknownDevice");
}

function describeLocation(session: ClerkSession): string | null {
  const parts = [
    session.latestActivity?.city,
    session.latestActivity?.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
}

export default function SessionsList() {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const { session: activeSession } = useSession();
  const { data, isPending, isError, refetch } = useClerkSessions();
  const [revokeTarget, setRevokeTarget] = useState<ClerkSession | null>(null);

  if (isPending) {
    return (
      <SkeletonGroup
        label={t("common.loading")}
        className="flex flex-col divide-y divide-primary/10"
      >
        {Array.from({ length: 2 }).map((_, index) => (
          <SkeletonListRow key={index} />
        ))}
      </SkeletonGroup>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm text-foreground/60">
          {t("admin.settings.sessions.loadError")}
        </p>
        <Button type="button" variant="surface" size="sm" onClick={() => refetch()}>
          {t("admin.settings.sessions.retry")}
        </Button>
      </div>
    );
  }

  const sessions = [...data].sort(
    (a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime(),
  );

  return (
    <>
      <ul className="flex flex-col divide-y divide-primary/10">
        {sessions.map((session) => {
          const isCurrent = session.id === activeSession?.id;
          const deviceLabel = describeDevice(session, t);
          const location = describeLocation(session);
          const DeviceIcon = session.latestActivity?.isMobile
            ? Smartphone
            : Monitor;

          return (
            <li
              key={session.id}
              className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <DeviceIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-primary">
                    {deviceLabel}
                  </p>
                  {isCurrent && (
                    <span className="rounded-full border border-emerald-300/60 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      {t("admin.settings.sessions.thisDevice")}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 truncate text-xs text-foreground/55">
                  {[location, formatRelativeTime(session.lastActiveAt, locale)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {/*
                The current session is deliberately not revocable here: doing
                so is just signing yourself out, which already has its own
                clearly-labelled button in the top bar. Offering it twice — once
                disguised as a security action — invites accidental logouts.
              */}
              {!isCurrent && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setRevokeTarget(session)}
                >
                  {t("admin.settings.sessions.revoke")}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {revokeTarget && (
        <RevokeSessionDialog
          session={revokeTarget}
          deviceLabel={describeDevice(revokeTarget, t)}
          isOpen
          onClose={() => setRevokeTarget(null)}
        />
      )}
    </>
  );
}
