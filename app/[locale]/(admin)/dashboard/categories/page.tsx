import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import CategoriesManager from "@/components/admin/categories/CategoriesManager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return { title: t("admin.nav.categories") };
}

export default function AdminCategoriesPage() {
  return <CategoriesManager />;
}
