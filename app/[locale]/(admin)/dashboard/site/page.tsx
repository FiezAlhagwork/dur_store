import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import SiteSettingsManager from "@/components/admin/site/SiteSettingsManager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return { title: t("admin.nav.site") };
}

export default function AdminSitePage() {
  return <SiteSettingsManager />;
}
