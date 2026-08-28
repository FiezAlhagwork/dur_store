"use client";

import { useUser } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import AvatarField from "./AvatarField";
import Skeleton from "@/components/ui/Skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDate } from "@/utils/helper";
import type { CurrentUser } from "@/services/user";

/**
 * Each role gets its own colour so the badge is readable at a glance rather
 * than being a uniform pill you have to actually read.
 */
const ROLE_STYLES: Record<CurrentUser["role"], string> = {
  admin: "border-primary/20 bg-primary/10 text-primary",
  manager: "border-amber-300/60 bg-amber-500/10 text-amber-700",
  customer: "border-primary/10 bg-primary/5 text-foreground/60",
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs uppercase tracking-wide text-foreground/45">
        {label}
      </dt>
      <dd className="text-sm font-medium text-primary">{children}</dd>
    </div>
  );
}

/**
 * Who is signed in — drawn from the two systems that each own part of the
 * answer.
 *
 * Clerk owns identity (picture, name, email), so those come from `useUser` and
 * update the instant they are edited below. The **role** lives in our own
 * database and Clerk knows nothing about it (see CLAUDE.md), so it comes from
 * `/api/user` — already in the query cache, since `AdminShell` fetched it to
 * decide whether to render this page at all.
 */
export default function AccountCard() {
  const { user } = useUser();
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language === "ar" ? "ar" : "en";
  const { data: currentUser, isPending, isError } = useCurrentUser();

  if (!user) return null;

  const provider = user.externalAccounts[0]?.provider;
  const signInMethod = provider
    ? t(`admin.settings.account.methods.${provider}`, {
        defaultValue: provider,
      })
    : t("admin.settings.account.methods.emailCode");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <AvatarField />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-serif text-lg font-bold text-primary">
              {user.fullName || t("admin.settings.account.noName")}
            </p>

            {isPending ? (
              <Skeleton className="h-5 w-16 rounded-full" />
            ) : (
              /* Hidden rather than guessed when the role could not be read —
                 showing the wrong role is worse than showing none. */
              !isError &&
              currentUser && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[currentUser.role]}`}
                >
                  {t(`admin.settings.account.roles.${currentUser.role}`)}
                </span>
              )
            )}
          </div>

          <p className="mt-1 truncate text-sm text-foreground/60">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 border-t border-primary/10 pt-5 sm:grid-cols-2">
        <Fact label={t("admin.settings.account.signInMethod")}>
          {signInMethod}
        </Fact>

        <Fact label={t("admin.settings.account.memberSince")}>
          {isPending ? (
            <Skeleton className="h-4 w-28" />
          ) : currentUser ? (
            formatDate(currentUser.created_at, locale)
          ) : (
            "—"
          )}
        </Fact>
      </dl>
    </div>
  );
}
