"use client";

import { useTranslation } from "react-i18next";
import Reveal from "@/components/shared/Reveal";

export default function AboutUs() {
  const { t } = useTranslation("common");

  return (
    <section
      className="py-16 md:py-24 bg-second"
      id="about"
      data-navbar-theme="dark"
    >
      <Reveal className="mx-auto max-w-2xl px-6 text-center">
        <span className="text-sm font-bold uppercase text-primary sm:text-base">
          {t("about.eyebrow")}
        </span>

        <h2 className="mt-3 font-serif text-2xl font-bold text-primary sm:text-3xl md:text-5xl">
          {t("about.title")}
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-foreground/70 sm:text-base">
          {t("about.description")}
        </p>
      </Reveal>
    </section>
  );
}
