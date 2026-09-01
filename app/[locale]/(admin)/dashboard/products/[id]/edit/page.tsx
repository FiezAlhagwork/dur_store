import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import EditProductLoader from "@/components/admin/products/EditProductLoader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return { title: t("admin.products.actions.edit") };
}

export default function EditProductPage() {
  return <EditProductLoader />;
}
