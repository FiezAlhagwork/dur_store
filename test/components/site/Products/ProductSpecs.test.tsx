import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import ProductSpecs from "@/components/site/Products/ProductSpecs";
import type { Product } from "@/types/product";
import { renderWithI18n } from "../../../helpers/renderWithI18n";

/**
 * Every spec except karat is nullable on a real product, so what matters
 * here is which cards appear for a given piece — not that a fully-populated
 * one renders four of them.
 */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug: "gold-ring",
    category_id: 1,
    name_ar: "خاتم ذهبي",
    name_en: "Gold Ring",
    description_ar: null,
    description_en: null,
    gold_weight: 4.5,
    karat: "21",
    gemstone_type: "diamond",
    gemstone_carat: 0.5,
    price: 790,
    has_discount: false,
    discount_value: null,
    final_price: 790,
    discount: null,
    stock: 3,
    is_active: true,
    images: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("ProductSpecs", () => {
  it("renders a card per recorded spec", () => {
    renderWithI18n(<ProductSpecs product={makeProduct()} />);

    expect(screen.getByText("العيار")).toBeInTheDocument();
    expect(screen.getByText("وزن الذهب")).toBeInTheDocument();
    expect(screen.getByText("الحجر الكريم")).toBeInTheDocument();
    expect(screen.getByText("قيراط الحجر")).toBeInTheDocument();
  });

  it("localises the units rather than hardcoding g and ct", () => {
    // These were concatenated in JSX as `{weight}g` / `· {carat} ct`, so an
    // Arabic page showed English units.
    renderWithI18n(<ProductSpecs product={makeProduct()} />);

    expect(screen.getByText("4.5 غرام")).toBeInTheDocument();
    expect(screen.getByText("0.5 قيراط")).toBeInTheDocument();
    expect(screen.getByText("عيار 21")).toBeInTheDocument();
  });

  it("translates a known gemstone", () => {
    renderWithI18n(<ProductSpecs product={makeProduct()} />);
    expect(screen.getByText("ألماس")).toBeInTheDocument();
  });

  it("falls back to the stored value for an untranslated gemstone", () => {
    // Only `diamond` has a translation today; a sapphire piece must still
    // say what it is rather than printing a raw i18n key.
    renderWithI18n(
      <ProductSpecs product={makeProduct({ gemstone_type: "sapphire" })} />,
    );

    expect(screen.getByText("sapphire")).toBeInTheDocument();
  });

  it("omits cards for specs the piece doesn't record", () => {
    renderWithI18n(
      <ProductSpecs
        product={makeProduct({ gemstone_type: null, gemstone_carat: null })}
      />,
    );

    expect(screen.getByText("العيار")).toBeInTheDocument();
    expect(screen.getByText("وزن الذهب")).toBeInTheDocument();
    expect(screen.queryByText("الحجر الكريم")).not.toBeInTheDocument();
    expect(screen.queryByText("قيراط الحجر")).not.toBeInTheDocument();
  });

  it("renders nothing at all when karat is the only spec", () => {
    // A "Piece Details" heading over a single lonely card is worse than no
    // section — karat is already implied by the piece.
    const { container } = renderWithI18n(
      <ProductSpecs
        product={makeProduct({
          gold_weight: null,
          gemstone_type: null,
          gemstone_carat: null,
        })}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("keeps a zero gold weight rather than treating it as missing", () => {
    // `!= null` not truthiness: 0 is a real recorded value, and `0 &&` would
    // silently drop the card.
    renderWithI18n(<ProductSpecs product={makeProduct({ gold_weight: 0 })} />);
    expect(screen.getByText("0 غرام")).toBeInTheDocument();
  });

  it("renders in English too", () => {
    renderWithI18n(<ProductSpecs product={makeProduct()} />, { locale: "en" });

    expect(screen.getByText("Piece Details")).toBeInTheDocument();
    expect(screen.getByText("4.5 g")).toBeInTheDocument();
    expect(screen.getByText("Diamond")).toBeInTheDocument();
  });
});
