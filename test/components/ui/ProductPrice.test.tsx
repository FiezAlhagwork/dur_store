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
    renderWithI18n(<ProductPrice product={plain} locale="en" />);

    expect(screen.getByText("$790")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("السعر قبل الخصم"),
    ).not.toBeInTheDocument();
  });

  it("renders the final price alongside a labelled original when discounted", () => {
    renderWithI18n(<ProductPrice product={discounted} locale="en" />);

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
        locale="en"
      />,
    );

    expect(screen.getByText("$790")).toBeInTheDocument();
    expect(screen.queryByLabelText("السعر قبل الخصم")).not.toBeInTheDocument();
  });

  it("hides the discount badge by default", () => {
    renderWithI18n(<ProductPrice product={discounted} locale="en" />);
    expect(screen.queryByText(/خصم/)).not.toBeInTheDocument();
  });

  it("shows the percentage badge when asked", () => {
    renderWithI18n(<ProductPrice product={discounted} locale="en" showBadge />);
    expect(screen.getByText("خصم 15%")).toBeInTheDocument();
  });

  it("formats the price in the locale it is given, independent of the UI language", () => {
    // `locale` is a prop, not read from i18n — an Arabic-language admin
    // table still renders `locale="en"` numbers where it asks for them.
    renderWithI18n(<ProductPrice product={plain} locale="ar" />);

    expect(screen.queryByText("$790")).not.toBeInTheDocument();
    expect(screen.getByText(/[٠-٩]/)).toBeInTheDocument();
  });
});
