"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

/**
 * Visual shell shared by /login and /register: a full-height split with the
 * brand panel on one side and the form column on the other.
 *
 * Presentation only — it holds no auth state. The flow itself (method → email
 * → code) lives in components/auth/AuthFlow.tsx.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";

  return (
    <div className="relative min-h-screen w-full bg-background lg:grid lg:grid-cols-[0.9fr_1fr]">
      {/*
        Brand panel. Purely decorative, so below `lg` it is dropped entirely
        rather than stacked above the form — nobody should have to scroll past
        a photo to reach a sign-in button. The card repeats the logo there.
      */}
      <aside className="relative hidden overflow-hidden bg-primary lg:block ">
        {/* <div className="absolute inset-6 overflow-hidden "> */}
          <Image
            src="/deff.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="55vw"
            className=" object-cover object-[50%_22%]"
          />
        <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/20 to-primary/5" />

        <div
          className={[
            "absolute inset-0 flex flex-col justify-between p-10 xl:p-14",
            isArabic ? "text-right" : "text-left",
          ].join(" ")}
        >
          <Image
            src="/rgr.png"
            alt="DUR"
            width={52}
            height={52}
            priority
            className="object-contain"
          />

          <div>
            <h2 className="max-w-sm font-serif text-3xl font-bold leading-[1.45] text-second xl:text-[2.5rem]">
              {t("auth.aside.title")}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-second/70 xl:text-base">
              {t("auth.aside.subtitle")}
            </p>
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-8 bg-second">
        {/*
          The ornaments hang off every edge and need clipping, but that
          clipping must not sit anywhere above the content column: Clerk's
          Smart CAPTCHA renders a Cloudflare Turnstile iframe inside the card
          (see `#clerk-captcha` in components/auth/AuthFlow.tsx), and no
          ancestor of it may carry `overflow-hidden` or a `backdrop-filter`.

          So the clipping lives on this decorative layer, which is a *sibling*
          of the content column rather than its parent — same visual result,
          nothing between the card and the page root.
        */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="/eger.webp"
            alt=""
            aria-hidden="true"
            width={200}
            height={200}
            className="pointer-events-none absolute -left-8 -top-11 w-80 select-none sm:w-90 md:-left-12 md:-top-22 md:w-120"
          />
          <Image
            src="/eger.webp"
            alt=""
            aria-hidden="true"
            width={200}
            height={200}
            className="pointer-events-none absolute -bottom-8 -right-8 w-70  rotate-180 select-none  sm:w-60 md:-bottom-12 md:-right-22 md:w-90"
          />
        </div>

        <div className="relative z-10 w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
