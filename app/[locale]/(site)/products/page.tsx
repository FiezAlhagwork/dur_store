import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import ProductsPageClient from "./ProductsPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return {
    title: t("products.title"),
    description: t("products.subtitle"),
  };
}

export default function ProductsPage() {
  return <ProductsPageClient />;
}
