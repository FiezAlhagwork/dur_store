"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import Reveal from "@/components/shared/Reveal";
import { FAQ_ITEMS } from "@/constants";
import FAQItem from "./FAQItem";

/**
 * "use client" (unlike the server-rendered WhyChooseUs) because this section
 * owns which question is open — a single `openIndex` rather than local state
 * per item, so opening one question closes whichever was open before it.
 */
export default function FAQ() {
  const { t } = useTranslation("common");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      className="relative overflow-hidden bg-second py-16 md:py-24"
      id="faq"
      data-navbar-theme="dark"
    >
      <Image
        src="/eger.webp"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="pointer-events-none absolute -left-13 -top-11 w-60 select-none sm:w-90 md:-left-12 md:-top-22 md:w-110"
      />

      <div className="site-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-primary xl:text-base">
            {t("faq.eyebrow")}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-primary md:text-4xl xl:text-5xl">
            {t("faq.title")}
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 max-w-3xl xl:mt-16">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
              key={item.questionKey}
              question={t(item.questionKey)}
              answer={t(item.answerKey)}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
