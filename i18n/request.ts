import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";

import { locales, defaultLocale } from "./config";

export async function getTranslation(locale: string) {
  const i18nInstance = createInstance();

  await i18nInstance
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`./locales/${language}/${namespace}.json`),
      ),
    )
    .init({
      lng: locales.includes(locale as any) ? locale : defaultLocale,

      fallbackLng: defaultLocale,

      supportedLngs: locales,

      defaultNS: "common",

      ns: ["common"],
    });

  return {
    t: i18nInstance.getFixedT(locale),
  };
}
