import type { Locale } from "@/i18n/config";

export function parseValue(value: string) {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { target: 0, prefix: "", suffix: value };
  return { target: Number(match[1]), prefix: "", suffix: match[2] };
}

/**
 * Picks the field for the active language.
 *
 * Products and categories both carry `name_ar`/`name_en`, and this two-line
 * choice was being repeated at every place either one is rendered.
 */
export function getLocalizedName(
  entity: { name_ar: string; name_en: string },
  locale: Locale,
): string {
  return locale === "ar" ? entity.name_ar : entity.name_en;
}

/**
 * Formats a product price for display.
 *
 * Arabic uses `ar-EG` so prices render with Arabic-Indic digits, matching the
 * rest of the Arabic UI.
 *
 * Fractions are shown only when the value actually has them. The catalogue is
 * priced in whole units, so this reads as `$790` for almost everything — but
 * discounts produce fractional results (15% off $790 is $671.50), and the
 * previous unconditional `maximumFractionDigits: 0` rounded that to `$672`.
 * Quoting a customer a price they will not be charged is not a rounding
 * detail, so a fractional price prints both of its decimals.
 */
export function formatPrice(value: number, locale: Locale): string {
  const fractionDigits = Number.isInteger(value) ? 0 : 2;

  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * A whole percentage, localised — "15%" / "١٥٪".
 *
 * Takes the number as it reads (15, not 0.15) and divides internally, since
 * every caller here has a percentage already computed. Rendered through `Intl`
 * rather than string-concatenating a `%`, so Arabic gets its own digits and
 * its own percent sign, and the sign lands on the correct side of the number.
 */
export function formatPercent(percent: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(percent / 100);
}

export interface ProductPricing {
  hasDiscount: boolean;
  /** The undiscounted price — what gets struck through. */
  price: number;
  /** What the customer actually pays. */
  finalPrice: number;
  /** `price − finalPrice`. Zero when there is no discount. */
  savedAmount: number;
  /** Whole percent off, rounded. Zero when there is no discount. */
  percentOff: number;
}

/**
 * Everything a price display needs, derived from the two prices the server
 * already computed.
 *
 * Deliberately ignores `discount_value` and `discount.type`. A product-level
 * discount is a percentage, but the API names the type explicitly and reports
 * a `source`, which says other kinds exist (a promotion, for one). Deriving
 * from `price` and `final_price` — both computed server-side — stays correct
 * for every type the backend may add, so nothing here has to be revisited when
 * one shows up.
 *
 * `Number()` guards the arithmetic because these fields are new and have only
 * ever been observed in one state — a product with no discount. Should either
 * arrive as a string, the comparison below fails closed and the product simply
 * shows its plain price.
 */
export function getProductPricing(product: {
  price: number;
  has_discount: boolean;
  final_price: number;
}): ProductPricing {
  const price = Number(product.price);
  const finalPrice = Number(product.final_price);

  /*
   * `has_discount` alone is not enough. A product flagged as discounted whose
   * `final_price` still equals `price` would otherwise render a struck-through
   * price above an identical number and a "0% off" badge — a false claim to
   * the customer, produced by inconsistent data rather than by a real offer.
   */
  const hasDiscount =
    product.has_discount &&
    Number.isFinite(price) &&
    Number.isFinite(finalPrice) &&
    finalPrice < price &&
    price > 0;

  if (!hasDiscount) {
    return {
      hasDiscount: false,
      price,
      finalPrice: Number.isFinite(finalPrice) ? finalPrice : price,
      savedAmount: 0,
      percentOff: 0,
    };
  }

  return {
    hasDiscount: true,
    price,
    finalPrice,
    savedAmount: price - finalPrice,
    percentOff: Math.round((1 - finalPrice / price) * 100),
  };
}

/**
 * Dates use `ar-SY` rather than the `ar-EG` that `formatPrice` uses above.
 * Both render Arabic-Indic digits, but only `ar-SY` gives the Levantine month
 * names this store's customers actually read — `٢٠ آب` instead of Egyptian
 * `٢٠ أغسطس`. Prices have no month name, so the difference never shows there.
 */
const AR_DATE_LOCALE = "ar-SY";

/** A calendar date, for things like "member since". */
export function formatDate(value: string | Date, locale: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "ar" ? AR_DATE_LOCALE : "en-US", {
    dateStyle: "long",
  }).format(date);
}

/** Largest-first, so the first threshold a difference clears is the one used. */
const RELATIVE_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/**
 * "2 days ago" / "منذ يومين", for timestamps where the exact moment matters
 * less than how recent it is — a session's last activity, say.
 *
 * `numeric: "auto"` is what turns "1 day ago" into "yesterday" and "أول أمس",
 * which reads far more naturally than the numeric form in both languages.
 */
export function formatRelativeTime(
  value: string | Date,
  locale: Locale,
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const formatter = new Intl.RelativeTimeFormat(
    locale === "ar" ? AR_DATE_LOCALE : "en-US",
    { numeric: "auto" },
  );
  const elapsed = date.getTime() - Date.now();

  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (Math.abs(elapsed) >= unitMs) {
      return formatter.format(Math.round(elapsed / unitMs), unit);
    }
  }

  // Anything under a minute reads better as "now" than as "0 minutes ago".
  return formatter.format(0, "second");
}
