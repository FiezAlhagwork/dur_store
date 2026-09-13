import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseValue,
  getLocalizedName,
  formatPrice,
  formatPercent,
  getProductPricing,
  formatDate,
  formatRelativeTime,
} from "@/utils/helper";

describe("parseValue", () => {
  it("splits a leading number from its suffix", () => {
    expect(parseValue("150+")).toEqual({ target: 150, prefix: "", suffix: "+" });
  });

  it("returns the bare number with an empty suffix", () => {
    expect(parseValue("0")).toEqual({ target: 0, prefix: "", suffix: "" });
  });

  it("falls back to target 0 with the whole string as suffix when there's no leading digit", () => {
    expect(parseValue("abc")).toEqual({ target: 0, prefix: "", suffix: "abc" });
    expect(parseValue("")).toEqual({ target: 0, prefix: "", suffix: "" });
  });
});

describe("getLocalizedName", () => {
  const entity = { name_ar: "خاتم", name_en: "Ring" };

  it("picks name_ar for ar", () => {
    expect(getLocalizedName(entity, "ar")).toBe("خاتم");
  });

  it("picks name_en for en", () => {
    expect(getLocalizedName(entity, "en")).toBe("Ring");
  });
});

describe("formatPrice", () => {
  it("omits decimals for a whole number", () => {
    expect(formatPrice(790)).toBe("$790");
  });

  it("shows exactly two decimals for a fractional price", () => {
    // 15% off $790 — the real case that motivated this rule (see the
    // function's own comment): rounding would misquote what's charged.
    expect(formatPrice(671.5)).toBe("$671.50");
  });

  it("never emits Arabic-Indic digits, whatever the UI language", () => {
    // Deliberately locale-independent: money reads as `$790` in both
    // languages. This used to format Arabic through `ar-EG` (`‏٧٩٠ US$`).
    // The function no longer takes a locale at all — this asserts the
    // resulting output, which is the part a customer sees.
    expect(formatPrice(790)).not.toMatch(/[٠-٩]/);
    expect(formatPrice(671.5)).not.toMatch(/[٠-٩]/);
  });

  it("puts the symbol before the number, not after it", () => {
    // `ar-*` locales render `790 US$`; en-US renders `$790`. Pinning the
    // leading `$` is what keeps the two languages identical.
    expect(formatPrice(790).startsWith("$")).toBe(true);
  });
});

describe("formatPercent", () => {
  it("formats a whole percentage", () => {
    expect(formatPercent(15)).toBe("15%");
  });

  it("rounds to the nearest whole percent", () => {
    expect(formatPercent(14.6)).toBe("15%");
  });

  it("never emits Arabic-Indic digits either", () => {
    expect(formatPercent(15)).not.toMatch(/[٠-٩]/);
  });
});

describe("getProductPricing", () => {
  it("reports no discount when has_discount is false", () => {
    const result = getProductPricing({
      price: 100,
      has_discount: false,
      final_price: 100,
    });
    expect(result).toEqual({
      hasDiscount: false,
      price: 100,
      finalPrice: 100,
      savedAmount: 0,
      percentOff: 0,
    });
  });

  it("computes savedAmount and percentOff for a real discount", () => {
    const result = getProductPricing({
      price: 790,
      has_discount: true,
      final_price: 671.5,
    });
    expect(result).toEqual({
      hasDiscount: true,
      price: 790,
      finalPrice: 671.5,
      savedAmount: 118.5,
      percentOff: 15,
    });
  });

  it("treats has_discount:true with final_price >= price as no real discount", () => {
    // Inconsistent data shouldn't render a struck-through price above an
    // identical (or higher) number — see the function's own comment.
    const result = getProductPricing({
      price: 100,
      has_discount: true,
      final_price: 100,
    });
    expect(result.hasDiscount).toBe(false);
    expect(result.savedAmount).toBe(0);
    expect(result.percentOff).toBe(0);
  });

  it("never reports a discount when price is 0 or less", () => {
    const result = getProductPricing({
      price: 0,
      has_discount: true,
      final_price: -5,
    });
    expect(result.hasDiscount).toBe(false);
  });

  it("fails closed to the plain price when final_price is not a finite number", () => {
    // The exact scenario the function's own comment calls out: a
    // non-numeric final_price must not produce a discount out of NaN math.
    const result = getProductPricing({
      price: 100,
      has_discount: true,
      final_price: Number("not-a-number"),
    });
    expect(result).toEqual({
      hasDiscount: false,
      price: 100,
      finalPrice: 100,
      savedAmount: 0,
      percentOff: 0,
    });
  });
});

describe("formatDate", () => {
  it("formats a valid date string for en", () => {
    // dateStyle: "long" — exact wording ("January 15, 2024") is stable for
    // en-US across Node/ICU versions, unlike the Arabic month names below.
    expect(formatDate("2024-01-15T00:00:00Z", "en")).toContain("2024");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not-a-date", "en")).toBe("");
    expect(formatDate("not-a-date", "ar")).toBe("");
  });

  it("accepts a Date instance directly, not just a string", () => {
    expect(formatDate(new Date("2024-01-15T00:00:00Z"), "en")).toContain(
      "2024",
    );
  });
});

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatRelativeTime("not-a-date", "en")).toBe("");
  });

  it("reports whole days for a difference of exactly 2 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    expect(formatRelativeTime("2024-01-13T12:00:00Z", "en")).toBe(
      "2 days ago",
    );
  });

  it("reports whole hours once the difference is under a day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    expect(formatRelativeTime("2024-01-15T09:00:00Z", "en")).toBe(
      "3 hours ago",
    );
  });

  it("reports 'now' for anything under a minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    expect(formatRelativeTime("2024-01-15T11:59:45Z", "en")).toBe("now");
  });

  it("handles a future timestamp the same way, just phrased forward", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));

    expect(formatRelativeTime("2024-01-17T12:00:00Z", "en")).toBe(
      "in 2 days",
    );
  });
});
