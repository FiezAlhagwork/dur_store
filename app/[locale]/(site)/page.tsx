import Hero from "@/components/site/Home/Hero";
import AboutUs from "@/components/site/Home/AboutUs";
import WhyChooseUs from "@/components/site/Home/WhyChooseUs";
import Categories from "@/components/site/Home/Categories";
import ContactCTA from "@/components/site/Home/ContactCTA";

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
      <ContactCTA />
    </>
  );
}
