import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import DashboardOverview from "@/components/admin/dashboard/DashboardOverview";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return { title: t("admin.nav.dashboard") };
}

export default function DashboardPage() {
  return <DashboardOverview />;
}
