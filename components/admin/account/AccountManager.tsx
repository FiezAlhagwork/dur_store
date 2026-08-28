"use client";

import { useUser } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import SettingsSection from "@/components/ui/SettingsSection";
import AccountCard from "./AccountCard";
import ProfileForm from "./ProfileForm";
import SessionsList from "./SessionsList";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";

/**
 * Two cards covering three things: who you are, editing that, and where you
 * are signed in.
 *
 * There is no "store settings" section — the API has no endpoint that accepts
 * one (`/api/settings` is a 404), so the WhatsApp number and contact details
 * stay in environment variables and change on deploy. That is a deliberate
 * omission, not an oversight; showing an inert form for it would be worse than
 * not offering it.
 *
 * Language and sign-out are absent for a different reason: `AdminTopbar`
 * already has both on every dashboard page, and a second copy here would just
 * be two controls that must be kept in sync.
 */
export default function AccountManager() {
  const { t } = useTranslation("common");
  const { isLoaded, user } = useUser();

  /*
   * Everything on this page reads from the Clerk user, and the name form seeds
   * its default values from it exactly once. Rendering before Clerk has
   * resolved would open the form with empty fields and leave them empty.
   */
  if (!isLoaded) {
    return (
      <SkeletonGroup label={t("common.loading")} className="flex flex-col gap-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-44 rounded-3xl" />
      </SkeletonGroup>
    );
  }

  // `AdminShell` only renders this page for a signed-in admin, so this is a
  // type guard rather than a state a user can actually reach.
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title={t("admin.settings.account.title")}>
        {/* The form draws its own top rule as a divider; the gap is what stops
            that rule from sitting flush against the details above it. */}
        <div className="flex flex-col gap-6">
          <AccountCard />
          <ProfileForm />
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("admin.settings.sessions.title")}
        description={t("admin.settings.sessions.description")}
      >
        <SessionsList />
      </SettingsSection>
    </div>
  );
}
