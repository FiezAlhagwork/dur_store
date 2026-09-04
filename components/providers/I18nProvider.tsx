"use client";

import { useEffect, useMemo } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { locales, defaultLocale, type Locale } from "@/i18n/config";
import arCommon from "@/i18n/locales/ar/common.json";
import enCommon from "@/i18n/locales/en/common.json";

const resources = {
  ar: { common: arCommon },
  en: { common: enCommon },
} as const;

/**
 * Builds a fresh i18next instance seeded with `locale`, synchronously —
 * `useMemo` runs during the render call itself (server-side included), so
 * the very first HTML this produces is already in the right language.
 *
 * This used to import the shared singleton from `i18n/client.ts` and switch
 * its language inside a `useEffect`. Two problems with that: a `useEffect`
 * never runs during SSR, so every server-rendered page — regardless of
 * `/ar` or `/en` — rendered every client component's translated text in
 * `defaultLocale` ("ar") until hydration fixed it a moment later. Visiting
 * `/en` showed Arabic body copy (headings, list items, form labels — not
 * just the `<title>`/meta tags, which come from server components and were
 * always correct) both to a plain HTTP fetch and as a same-locale flash of
 * the wrong language in a real browser. Worse, that singleton was one
 * module-level instance shared by every request the server process
 * handles — mutating its language from a request's effect is a race with
 * whatever other request is mid-render at the same time. Building a new
 * instance per render tree (same idea as `i18n/request.ts`'s
 * `createInstance()`, just synchronous since these resources are already
 * bundled locally instead of lazy-imported) has neither problem: it is
 * already correct on first paint, and nothing about it is shared across
 * requests.
 */
export default function I18nProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const instance = useMemo(() => {
    const i18nInstance = createInstance();
    i18nInstance.use(initReactI18next).init({
      resources,
      lng: locales.includes(locale as Locale) ? locale : defaultLocale,
      fallbackLng: defaultLocale,
      supportedLngs: locales,
      defaultNS: "common",
      ns: ["common"],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
    return i18nInstance;
  }, [locale]);

  useEffect(() => {
    const direction = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.body.dir = direction;
  }, [locale]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
