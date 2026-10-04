import {
  Gem,
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
import SnapchatIcon from "@/components/shared/SnapchatIcon";
import TikTokIcon from "@/components/shared/TikTokIcon";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import type { Locale } from "@/i18n/config";
import type { SiteSettings } from "@/types/settings";

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
 * Homepage testimonials. Same per-item-key pattern as `FAQ_ITEMS` below.
 *
 * The order here is the order they appear in the carousel, so it is content,
 * not incidental — reordering this array reorders the section.
 */
export const REVIEWS = [
  {
    quoteKey: "reviews.items.noura.quote",
    nameKey: "reviews.items.noura.name",
    locationKey: "reviews.items.noura.location",
  },
  {
    quoteKey: "reviews.items.sara.quote",
    nameKey: "reviews.items.sara.name",
    locationKey: "reviews.items.sara.location",
  },
  {
    quoteKey: "reviews.items.layan.quote",
    nameKey: "reviews.items.layan.name",
    locationKey: "reviews.items.layan.location",
  },
  {
    quoteKey: "reviews.items.dana.quote",
    nameKey: "reviews.items.dana.name",
    locationKey: "reviews.items.dana.location",
  },
] as const;

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
      icon: TikTokIcon,
      href: settings.social.tiktok_url,
      label: "TikTok",
    },
    {
      icon: SnapchatIcon,
      href: settings.social.snapchat_url,
      label: "Snapchat",
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
    // Snapchat and TikTok are optional settings — an unset one is "" and is
    // left off rather than rendered as an icon linking nowhere.
  ].filter((link) => link.href);
}
