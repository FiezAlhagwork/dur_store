"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { defaultLocale, locales } from "@/i18n/config";
import arCommon from "@/i18n/locales/ar/common.json";
import enCommon from "@/i18n/locales/en/common.json";

const resources = {
  ar: {
    common: arCommon,
  },
  en: {
    common: enCommon,
  },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: defaultLocale,
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
}

export default i18n;
