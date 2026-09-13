import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import ProductPrice from "@/components/ui/ProductPrice";
import { renderWithI18n } from "../../helpers/renderWithI18n";

/**
 * The pricing math itself is already covered in
 * `test/utils/helper.test.ts` (`getProductPricing`). What's tested here is
 * only what this component adds on top: which of the two layouts it picks,
 * and whether the struck-through original price is actually announced
 * rather than just visually decorated.
 */
describe("ProductPrice", () => {
  const plain = { price: 790, has_discount: false, final_price: 790 };
  const discounted = { price: 790, has_discount: true, final_price: 671.5 };

  it("renders a single price for an undiscounted product", () => {
    renderWithI18n(<ProductPrice product={plain} />);

    expect(screen.getByText("$790")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("السعر قبل الخصم"),
    ).not.toBeInTheDocument();
  });

  it("renders the final price alongside a labelled original when discounted", () => {
    renderWithI18n(<ProductPrice product={discounted} />);

    expect(screen.getByText("$671.50")).toBeInTheDocument();

    // `line-through` alone is decoration a screen reader may skip, leaving
    // two contradictory prices announced with no explanation — hence the
    // explicit label on the <s>.
    const original = screen.getByLabelText("السعر قبل الخصم");
    expect(original).toHaveTextContent("$790");
    expect(original.tagName).toBe("S");
  });

  it("falls back to a single price when the data claims a discount that isn't one", () => {
    // has_discount true but final_price === price: getProductPricing rejects
    // it, and nothing struck-through should reach the customer.
    renderWithI18n(
      <ProductPrice
        product={{ price: 790, has_discount: true, final_price: 790 }}
       
      />,
    );

    expect(screen.getByText("$790")).toBeInTheDocument();
    expect(screen.queryByLabelText("السعر قبل الخصم")).not.toBeInTheDocument();
  });

  it("hides the discount badge by default", () => {
    renderWithI18n(<ProductPrice product={discounted} />);
    expect(screen.queryByText(/خصم/)).not.toBeInTheDocument();
  });

  it("shows the percentage badge when asked", () => {
    renderWithI18n(<ProductPrice product={discounted} showBadge />);
    expect(screen.getByText("خصم 15%")).toBeInTheDocument();
  });

  it("renders the identical price string in Arabic as in English", () => {
    // Deliberate: money is pinned to `$790` in both languages (see the
    // comment above formatPrice). This asserts no Arabic-Indic digit ever
    // reaches a price, which is what the previous `ar-EG` formatting did.
    renderWithI18n(<ProductPrice product={plain} />, { locale: "ar" });

    expect(screen.getByText("$790")).toBeInTheDocument();
    expect(screen.queryByText(/[٠-٩]/)).not.toBeInTheDocument();
  });

  describe("spacing", () => {
    // Regression test for a real bug: the undiscounted branch used to render
    // a bare inline <span>, and vertical margins do not apply to inline
    // boxes — so `className="mt-4"` from the product details page was
    // silently dropped and the product name sat glued to its price, but
    // only on products without a discount.
    it("applies a passed className on an undiscounted product", () => {
      const { container } = renderWithI18n(
        <ProductPrice product={plain} className="mt-4" />,
      );

      const root = container.firstElementChild!;
      expect(root).toHaveClass("mt-4");
      expect(root).toHaveClass("inline-flex");
    });

    it("applies a passed className on a discounted product too", () => {
      const { container } = renderWithI18n(
        <ProductPrice product={discounted} className="mt-4" />,
      );

      expect(container.firstElementChild).toHaveClass("mt-4");
    });
  });
});
