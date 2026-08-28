import type { SiteSettings } from "@/types/settings";

/**
 * What the site shows when the API cannot tell it otherwise.
 *
 * These are the values that were hardcoded across `constants/index.ts`,
 * `Home/Hero.tsx` and the i18n files before settings existed, so falling back
 * to them reproduces exactly the site as it shipped. They are a safety net at
 * three levels — a failed request, a group the backend has not built yet, and
 * a field that comes back `null` (which is the state of `video_url` today).
 *
 * Not dead code and not a duplicate of the API: a public storefront that
 * renders a blank hero because a settings request timed out is worse than one
 * showing slightly stale copy.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  brand: {
    site_url: "https://durjewels.com",
    whatsapp_number: "963999000000",
  },

  contact: {
    phone: "+963 999 000 000",
    phone_href: "tel:+963999000000",
    email: "info@dur-jewelry.com",
    address_ar: "دمشق، سوريا",
    address_en: "Damascus, Syria",
  },

  social: {
    instagram_url: "https://instagram.com/dur.jewelry",
    facebook_url: "https://facebook.com/dur.jewelry",
  },

  home_hero: {
    // The file bundled in `public/`, used until a video is uploaded.
    video_url: "/video-dur-store.MP4",
    poster_url: "",

    title_line1_ar: "أجواء فاخرة",
    title_line1_en: "Elegant Atmosphere",
    title_line2_ar: "لتجربة تسوق أنيقة",
    title_line2_en: "For Premium Shopping",
    description_ar: "تشكيلة مختارة بعناية لتليق بذوقك وتجربة شراء راقية ومريحة",
    description_en: "A curated collection for a refined shopping experience.",

    primary_button_label_ar: "تسوق الآن",
    primary_button_label_en: "Shop",
    primary_button_url: "/products",
    secondary_button_label_ar: "اكتشف المزيد",
    secondary_button_label_en: "Explore",
    secondary_button_url: "/#about",
  },
};


export const HERO_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const HERO_POSTER_MAX_BYTES = 4 * 1024 * 1024;

export const HERO_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
] as const;
