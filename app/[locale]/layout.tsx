import type { Metadata } from "next";
import { locales } from "@/i18n/config";
import I18nProvider from "@/components/providers/I18nProvider";
import QueryProvider from "@/components/providers/QueryProvider";

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const title = isArabic ? "دُرّ | متجر مجوهرات" : "Dur Store | Jewelry Store";
  const description = isArabic
    ? "اكتشف تشكيلتنا من المجوهرات الفاخرة"
    : "Discover our collection of fine jewelry";

  return {
    // A template so every other page in the app only sets its own short
    // segment (e.g. "المنتجات") instead of repeating "| دُر" everywhere.
    // Pages that don't set a title at all (home) get `default` as-is.
    title: {
      default: title,
      template: isArabic ? "%s | دُر" : "%s | Dur",
    },
    description,
    openGraph: {
      title,
      description,
      // Temporary: the brand mark on its own backdrop, not a purpose-built
      // 1200x630 OG banner (public/dur.jpg is square, 1000x1000) — most
      // platforms will center-crop or letterbox it. Swap for a proper
      // banner image later; the field itself won't need to change.
      images: [{ url: "/dur.jpg", width: 1000, height: 1000 }],
      locale: isArabic ? "ar_AR" : "en_US",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } = await params;

  return (
    <QueryProvider>
      <I18nProvider locale={locale}>
        <div dir={locale === "ar" ? "rtl" : "ltr"}>{children}</div>
      </I18nProvider>
    </QueryProvider>
  );
}
