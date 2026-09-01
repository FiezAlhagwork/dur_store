import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import ProductForm from "@/components/admin/products/ProductForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return { title: t("admin.products.add") };
}

export default function NewProductPage() {
  return <ProductForm />;
}
