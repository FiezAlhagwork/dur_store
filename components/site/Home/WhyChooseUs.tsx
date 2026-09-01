import { getTranslation } from "@/i18n/request";
import { WHY_CHOOSE_US } from "@/constants";
import Reveal from "@/components/shared/Reveal";
import Image from "next/image";
import WhyChooseUsCard from "./WhyChooseUsCard";

export default async function WhyChooseUs({ locale }: { locale: string }) {
  const { t } = await getTranslation(locale);

  return (
    <section
      className="relative overflow-hidden bg-second py-8"
      id="why-us"
      data-navbar-theme="dark"
    >
      <Image
        src="/eger.png"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -left-13 -top-11 w-60 select-none sm:w-90 md:-left-12 md:-top-22 md:w-110"
      />
      <Image
        src="/eger.png"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -bottom-8 -right-8 w-60  rotate-180 select-none  sm:w-60 md:-bottom-12 md:-right-22 md:w-90"
      />

      <div className="site-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-primary xl:text-base">
            {t("whyUs.eyebrow")}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-primary md:text-4xl xl:text-5xl">
            {t("whyUs.title")}
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 xl:gap-x-14">
          {WHY_CHOOSE_US.map((item, index) => (
            <WhyChooseUsCard
              key={item.titleKey}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descriptionKey)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
