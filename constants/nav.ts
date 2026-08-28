import type { TFunction } from "i18next";
import type { Locale } from "@/i18n/config";


export const NAV_LINKS = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.about", href: "/#about" },
  { labelKey: "nav.products", href: "/products" },
  { labelKey: "nav.contact", href: "/#contact" },
];


export function getLocalizedNavLinks(locale: Locale, t: TFunction) {
  return NAV_LINKS.map((link) => ({
    label: t(link.labelKey),
    href: `/${locale}${link.href === "/" ? "" : link.href}`,
  }));
}
