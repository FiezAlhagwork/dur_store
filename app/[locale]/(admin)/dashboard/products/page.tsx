import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import ProductsManager from "@/components/admin/products/ProductsManager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return { title: t("admin.nav.products") };
}

export default function AdminProductsPage() {
  return <ProductsManager />;
}
