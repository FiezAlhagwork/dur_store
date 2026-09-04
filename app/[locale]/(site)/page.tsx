import type { Metadata } from "next";
import Hero from "@/components/site/Home/Hero";
import AboutUs from "@/components/site/Home/AboutUs";
import WhyChooseUs from "@/components/site/Home/WhyChooseUs";
import Categories from "@/components/site/Home/Categories";
import FAQ from "@/components/site/Home/FAQ";
import ContactCTA from "@/components/site/Home/ContactCTA";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Title/description are intentionally left unset here — they fall back to
  // the `default` title and description already set in [locale]/layout.tsx,
  // which are already home-page-appropriate copy.
  return { alternates: buildAlternates("", locale as Locale) };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Hero />
      <AboutUs />
      <Categories />
      <WhyChooseUs locale={locale} />
      <FAQ />
      <ContactCTA />
    </>
  );
}
