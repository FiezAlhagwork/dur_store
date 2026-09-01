import type { Metadata } from "next";
import { getTranslation } from "@/i18n/request";
import AuthFlow from "@/components/auth/AuthFlow";
import AuthCard from "@/components/auth/AuthCard";

// AuthCard/AuthFlow are themselves "use client" — this file doesn't need to
// be, which is what lets it export generateMetadata at all.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTranslation(locale);

  return {
    title: t("auth.register.title"),
    // Nothing for a search engine to index on a sign-up screen.
    robots: { index: false, follow: false },
  };
}

export default function RegisterPage() {
  return (
    <AuthCard mode="register">
      <AuthFlow mode="register" />
    </AuthCard>
  );
}
