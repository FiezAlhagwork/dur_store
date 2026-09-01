import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import AccountManager from "@/components/admin/account/AccountManager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return { title: t("admin.nav.account") };
}

export default function AdminAccountPage() {
  return <AccountManager />;
}
