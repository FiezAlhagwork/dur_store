import { AboutStat } from "@/types";
import {
  Gem,
  Users2,
  Award,
  PenTool,
  Feather,
  Layers,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import InstagramIcon from "@/components/shared/InstagramIcon";
import FacebookIcon from "@/components/shared/FacebookIcon";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import type { Locale } from "@/i18n/config";
import type { SiteSettings } from "@/types/settings";

export const ABOUT_STATS: AboutStat[] = [
  { icon: Gem, value: "500+", labelKey: "about.stats.products" },
  { icon: Users2, value: "1000+", labelKey: "about.stats.customers" },
  { icon: Award, value: "10+", labelKey: "about.stats.years" },
];

export const WHY_CHOOSE_US = [
  {
    icon: PenTool,
    titleKey: "whyUs.designs.title",
    descriptionKey: "whyUs.designs.description",
  },
  {
    icon: Feather,
    titleKey: "whyUs.luxury.title",
    descriptionKey: "whyUs.luxury.description",
  },
  {
    icon: Gem,
    titleKey: "whyUs.materials.title",
    descriptionKey: "whyUs.materials.description",
  },
  {
    icon: Layers,
    titleKey: "whyUs.limited.title",
    descriptionKey: "whyUs.limited.description",
  },
  {
    icon: ShieldCheck,
    titleKey: "whyUs.digital.title",
    descriptionKey: "whyUs.digital.description",
  },
];

/**
 * Homepage FAQ content. Same pattern as `WHY_CHOOSE_US` above rather than a
 * single `t(key, { returnObjects: true })` array — that pattern isn't used
 * anywhere else in this codebase, so a per-item translation key stays
 * consistent with how every other list-driven section sources its text.
 */
export const FAQ_ITEMS = [
  {
    questionKey: "faq.items.customization.question",
    answerKey: "faq.items.customization.answer",
  },
  {
    questionKey: "faq.items.limited.question",
    answerKey: "faq.items.limited.answer",
  },
  {
    questionKey: "faq.items.materials.question",
    answerKey: "faq.items.materials.answer",
  },
  {
    questionKey: "faq.items.shipping.question",
    answerKey: "faq.items.shipping.answer",
  },
  {
    questionKey: "faq.items.packaging.question",
    answerKey: "faq.items.packaging.answer",
  },
  {
    questionKey: "faq.items.customOrders.question",
    answerKey: "faq.items.customOrders.answer",
  },
] as const;

/**
 * Contact details and social links, built from live settings rather than
 * hardcoded — mirrors `getLocalizedNavLinks` in `constants/nav.ts`: a pure
 * function taking the data and locale, producing the exact shape `Footer` and
 * `ContactCTA` already map over. Neither component's JSX changes; only where
 * the array comes from does.
 *
 * The icon-to-field pairing stays a compile-time constant here — which icon
 * goes with "phone" is presentation, not something an admin edits — while
 * every `value`/`href` comes from `settings`, which is always a complete
 * object (see `useSettings`), so no caller has to guard against a missing
 * field.
 */
export function getContactDetails(settings: SiteSettings, locale: Locale) {
  return [
    {
      icon: Phone,
      labelKey: "contact.info.phone",
      value: settings.contact.phone,
      href: settings.contact.phone_href,
    },
    {
      icon: Mail,
      labelKey: "contact.info.email",
      value: settings.contact.email,
      // Derived, not stored: unlike phone (where the display form and the
      // `tel:` form are genuinely different strings), an email's `mailto:`
      // link is a mechanical prefix of the address itself — the settings API
      // has no separate `email_href` field, and doesn't need one.
      href: `mailto:${settings.contact.email}`,
    },
    {
      icon: MapPin,
      labelKey: "contact.info.address",
      value: locale === "ar" ? settings.contact.address_ar : settings.contact.address_en,
      href: undefined,
    },
  ];
}

export function getSocialLinks(settings: SiteSettings) {
  return [
    {
      icon: InstagramIcon,
      href: settings.social.instagram_url,
      label: "Instagram",
    },
    {
      icon: FacebookIcon,
      href: settings.social.facebook_url,
      label: "Facebook",
    },
    {
      icon: WhatsAppIcon,
      // No `whatsapp_url` field on `settings.social` by design — the number
      // lives once, on `settings.brand`, and every WhatsApp link in the app
      // (this one, and the per-product order links in lib/whatsapp.ts) is
      // built from that single source rather than each holding its own copy.
      href: `https://wa.me/${settings.brand.whatsapp_number}`,
      label: "WhatsApp",
    },
  ];
}
