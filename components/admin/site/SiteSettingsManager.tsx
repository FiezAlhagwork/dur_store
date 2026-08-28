"use client";

import { useTranslation } from "react-i18next";
import HeroMediaField from "./HeroMediaField";
import HeroTextForm from "./HeroTextForm";
import ContactForm from "./ContactForm";
import SocialForm from "./SocialForm";
import BrandForm from "./BrandForm";
import SettingsSection from "@/components/ui/SettingsSection";
import Button from "@/components/ui/Button";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";
import { useSettings } from "@/hooks/useSettings";

/**
 * Everything a customer sees that is not a product: the hero, how to reach the
 * shop, and where to follow it.
 *
 * Five cards, each saving on its own. `SettingsUpdatePayload` takes one group
 * at a time, so a phone-number change sends only `contact` — it never has to
 * wait for, or re-send, a hero video.
 *
 * The About section of the home page is deliberately absent: the API has no
 * `home_about` group, so there is nothing here to edit. Same for the legal
 * links. Both stay hardcoded until the backend has somewhere to put them.
 */
export default function SiteSettingsManager() {
  const { t } = useTranslation("common");
  const { settings, isPending, isError, error, refetch } = useSettings();

  if (isPending) {
    return (
      <SkeletonGroup label={t("common.loading")} className="flex flex-col gap-6">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
      </SkeletonGroup>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/*
        Shown as a banner rather than replacing the page. `settings` has fallen
        back to the bundled defaults, so the forms below are still usable — but
        they would be editing values that are not what the server holds, and
        saving over live settings from a stale baseline is worth warning about.
      */}
      {isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-500/5 p-4">
          <div>
            <p className="text-sm font-medium text-amber-800">
              {t("admin.site.loadError.title")}
            </p>
            <p className="mt-0.5 text-xs text-amber-800/80">
              {t("admin.site.loadError.description")}
            </p>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap text-xs text-amber-900/70">
                {error.status} — {error.message}
              </pre>
            )}
          </div>
          <Button type="button" variant="surface" size="sm" onClick={() => refetch()}>
            {t("admin.site.loadError.retry")}
          </Button>
        </div>
      )}

      <SettingsSection
        title={t("admin.site.media.title")}
        description={t("admin.site.media.description")}
      >
        <HeroMediaField hero={settings.home_hero} />
      </SettingsSection>

      <SettingsSection
        title={t("admin.site.hero.title")}
        description={t("admin.site.hero.description")}
      >
        <HeroTextForm hero={settings.home_hero} />
      </SettingsSection>

      <SettingsSection title={t("admin.site.contact.title")}>
        <ContactForm contact={settings.contact} />
      </SettingsSection>

      <SettingsSection title={t("admin.site.social.title")}>
        <SocialForm social={settings.social} />
      </SettingsSection>

      <SettingsSection
        title={t("admin.site.brand.title")}
        description={t("admin.site.brand.description")}
      >
        <BrandForm brand={settings.brand} />
      </SettingsSection>
    </div>
  );
}
