"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ABOUT_STATS } from "@/constants";
import Reveal from "@/components/shared/Reveal";
import CountUp from "@/components/shared/CountUp";

export default function AboutUs() {
  const { t } = useTranslation("common");

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24 bg-second"
      id="about"
      data-navbar-theme="dark"
    >
      <Image
        src="/eger.webp"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -left-9 -top-11 w-80 select-none sm:w-90 md:-left-12 md:-top-22 md:w-150"
      />
      <Image
        src="/eger.webp"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -bottom-10 -right-19 w-70  rotate-180 select-none  sm:w-60 md:-bottom-12 md:-right-22 md:w-90"
      />

      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 ">
        <Reveal className="relative aspect-4/5 w-full    ">
          <Image
            src="/logo_removed.webp"
            alt={t("about.imageAlt")}
            fill
            className="object-cover drop-shadow-2xl rounded-xl"
            sizes="(min-width: 1024px) 40vw, 90vw"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <span className="text-sm font-bold uppercase text-primary sm:text-base">
            {t("about.eyebrow")}
          </span>

          <h2 className="mt-3 font-serif text-2xl font-bold text-primary sm:text-3xl md:text-5xl">
            {t("about.title")}
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-foreground/70 sm:text-base">
            {t("about.description")}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {ABOUT_STATS.map(({ icon: Icon, value, labelKey }) => (
              <div
                key={labelKey}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/40 bg-background/25 px-2 py-4 text-center backdrop-blur-md backdrop-saturate-150 shadow-[0_8px_30px_-12px_rgba(29,6,52,0.15)] sm:gap-2 sm:px-3 sm:py-5"
              >
                <Icon
                  className="h-6 w-6 text-primary sm:h-8 sm:w-8"
                  strokeWidth={1.75}
                />
                <CountUp
                  value={value}
                  className="font-serif text-lg font-bold text-primary sm:text-2xl"
                />
                <span className="text-[11px] text-foreground/60 sm:text-xs">
                  {t(labelKey)}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
