import { locales } from "@/i18n/config";
import I18nProvider from "@/components/providers/I18nProvider";
import QueryProvider from "@/components/providers/QueryProvider";

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
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
