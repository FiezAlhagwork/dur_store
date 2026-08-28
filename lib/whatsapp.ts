import type { Product } from "@/types/product";
import type { SiteSettings } from "@/types/settings";
import { getProductPricing } from "@/utils/helper";

type Locale = "ar" | "en";

const WHATSAPP_COPY: Record<
  Locale,
  { greeting: string; price: string; wasPrice: string; link: string }
> = {
  ar: {
    greeting: "مرحباً، بدي أستفسر عن هالمنتج:",
    price: "السعر",
    wasPrice: "بدل",
    link: "رابط المنتج",
  },
  en: {
    greeting: "Hi, I'd like to ask about this product:",
    price: "Price",
    wasPrice: "was",
    link: "Product link",
  },
};

function formatPrice(price: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function getProductUrl(product: Product, siteUrl: string) {
  const path = `/products/${product.slug}`;
  // ثابتة النتيجة على السيرفر والكلاينت — لازم نتفادى window.location.origin
  // هون لأنه بيسبب hydration mismatch: السيرفر ما بيشوف window فبيرجع مسار
  // نسبي، والكلاينت بيرجع رابط كامل. `siteUrl` من settings.brand.site_url
  // بدل قراءة env متغيّر مباشرة، فنفس القيمة عند السيرفر والكلاينت.
  return `${siteUrl}${path}`;
}

/**
 * Builds a `wa.me` link pre-filled with a short bilingual message
 * (product name + price + link only, no full description) so the
 * chat stays short. Opening the link only fills WhatsApp's message
 * box — the visitor still has to tap "send" themselves.
 *
 * `brand` is passed in explicitly rather than read from `process.env` inside
 * this function — matching how `apiClient`/`authHeader` take their token as a
 * parameter rather than reaching into global state (see lib/api/client.ts).
 * Every call site already has `settings.brand` from `useSettings()`, which
 * always resolves to a complete object, so there is nothing to guard here for
 * a still-loading or failed settings fetch.
 */
export function getWhatsAppOrderLink(
  product: Product,
  locale: Locale,
  brand: SiteSettings["brand"],
) {
  const name = locale === "ar" ? product.name_ar : product.name_en;
  const copy = WHATSAPP_COPY[locale];

  /*
   * The discounted price, not `product.price`.
   *
   * This message is the actual order the shop receives, so quoting the
   * undiscounted price here would contradict the price the customer just saw
   * on the page — and the shop would only find out mid-conversation. The old
   * price still rides along when there is a discount, so the message reads as
   * an offer rather than as a number that disagrees with the site.
   */
  const pricing = getProductPricing(product);
  const priceLine = pricing.hasDiscount
    ? `${copy.price}: ${formatPrice(pricing.finalPrice, locale)} (${copy.wasPrice} ${formatPrice(pricing.price, locale)})`
    : `${copy.price}: ${formatPrice(pricing.finalPrice, locale)}`;

  const message = [
    `${copy.greeting} ${name}`,
    priceLine,
    `${copy.link}: ${getProductUrl(product, brand.site_url)}`,
  ].join("\n");

  return `https://wa.me/${brand.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

export interface ContactMessageFields {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const CONTACT_WHATSAPP_COPY: Record<
  Locale,
  {
    greeting: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }
> = {
  ar: {
    greeting: "مرحباً، عم تواصل معكن من موقع در:",
    name: "الاسم",
    email: "الإيميل",
    phone: "رقم الهاتف",
    subject: "الموضوع",
    message: "الرسالة",
  },
  en: {
    greeting: "Hi, I'm reaching out from the Dur website:",
    name: "Name",
    email: "Email",
    phone: "Phone",
    subject: "Subject",
    message: "Message",
  },
};

/**
 * نفس فكرة getWhatsAppOrderLink بس لفورم "تواصل معنا" العام —
 * بتبني رسالة من الحقول الخمسة وبترجع رابط wa.me جاهز نفتحه بضغطة زر.
 *
 * بياخد `brand` صراحةً بدل قراءته من process.env — نفس سبب
 * getWhatsAppOrderLink فوق. الشكل نفسه بين الدالتين (`brand` كاملة، مو رقم
 * لحاله) حتى ما يصير توقيعين مختلفين لنفس الفكرة، رغم إنو هاي الدالة
 * بالذات بتستعمل `whatsapp_number` بس.
 */
export function getWhatsAppContactLink(
  fields: ContactMessageFields,
  locale: Locale,
  brand: SiteSettings["brand"],
) {
  const copy = CONTACT_WHATSAPP_COPY[locale];

  const message = [
    copy.greeting,
    `${copy.name}: ${fields.name}`,
    `${copy.email}: ${fields.email}`,
    `${copy.phone}: ${fields.phone}`,
    `${copy.subject}: ${fields.subject}`,
    `${copy.message}: ${fields.message}`,
  ].join("\n");

  return `https://wa.me/${brand.whatsapp_number}?text=${encodeURIComponent(message)}`;
}
