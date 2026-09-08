import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductsTable from "@/components/admin/products/ProductsTable";
import type { Product } from "@/types/product";
import { renderWithProviders } from "../../../helpers/renderWithProviders";

/**
 * ProductsTable renders the visibility toggle, which reaches
 * `useToggleProductActive` → `useApiToken` → Clerk's `useAuth`, and that
 * throws outside a `<ClerkProvider>`. Stubbing `useAuth` — the third-party
 * boundary — keeps everything of ours in the graph real (`useApiToken`, the
 * query hooks, the component itself), which is the same line the
 * orchestration tests draw. A real `<ClerkProvider>` would mean a
 * publishable key and Clerk's own JS loading, for a component that never
 * asks who the user is.
 */
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    getToken: async () => "test-token",
  }),
}));

/**
 * The E2E suite already proves add/edit/delete work end to end. What this
 * adds, far faster and with several products on screen at once, is that each
 * row's buttons act on **its own** product — the failure mode a
 * single-product E2E run can't surface at all.
 *
 * Fixtures deliberately carry no images: `next/image` would otherwise pull
 * in Next's image config, which has nothing to do with what's being tested
 * here, and the empty-image fallback is a real state anyway (a product added
 * before its photos are ready).
 */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug: "gold-ring",
    category_id: 1,
    category: {
      id: 1,
      image: null,
      name_ar: "خواتم",
      name_en: "Rings",
      slug: "rings",
      is_active: true,
    },
    name_ar: "خاتم ذهبي",
    name_en: "Gold Ring",
    description_ar: null,
    description_en: null,
    gold_weight: null,
    karat: "21",
    gemstone_type: null,
    gemstone_carat: null,
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

/**
 * A row is found by its product name, then walked up to the `<li>` it lives
 * in. `getByRole("listitem", { name })` does not work here: a list item
 * takes no accessible name from its text content, unlike Playwright's
 * `getByRole("listitem").filter({ hasText })` in the E2E suite, which
 * filters by text rather than accessible name.
 */
function rowFor(productName: string): HTMLElement {
  const row = screen.getByText(productName).closest("li");
  if (!row) throw new Error(`No row found for product "${productName}"`);
  return row;
}

describe("ProductsTable", () => {
  const baseProps = { locale: "ar" as const, onDelete: vi.fn(), onEditDiscount: vi.fn() };

  it("renders one row per product, named in the active language", () => {
    renderWithProviders(
      <ProductsTable
        {...baseProps}
        products={[
          makeProduct({ id: 1, name_ar: "خاتم ذهبي", name_en: "Gold Ring" }),
          makeProduct({ id: 2, name_ar: "قلادة لؤلؤ", name_en: "Pearl Necklace" }),
        ]}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("خاتم ذهبي")).toBeInTheDocument();
    expect(screen.getByText("قلادة لؤلؤ")).toBeInTheDocument();
    expect(screen.queryByText("Gold Ring")).not.toBeInTheDocument();
  });

  it("uses the English name when the locale is en", () => {
    renderWithProviders(
      <ProductsTable {...baseProps} locale="en" products={[makeProduct()]} />,
      { locale: "en" },
    );

    expect(screen.getByText("Gold Ring")).toBeInTheDocument();
    expect(screen.queryByText("خاتم ذهبي")).not.toBeInTheDocument();
  });

  it("shows the category name, or a dash when it wasn't eager-loaded", () => {
    renderWithProviders(
      <ProductsTable
        {...baseProps}
        products={[makeProduct({ id: 1 }), makeProduct({ id: 2, category: undefined })]}
      />,
    );

    expect(screen.getByText("خواتم")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("deletes the product whose own row was clicked", async () => {
    // The bug this guards against: every row rendering the same handler
    // bound to the first product, so deleting row 2 deletes row 1.
    const onDelete = vi.fn();
    const user = userEvent.setup();
    const second = makeProduct({ id: 2, name_ar: "قلادة لؤلؤ" });

    renderWithProviders(
      <ProductsTable
        {...baseProps}
        onDelete={onDelete}
        products={[makeProduct({ id: 1 }), second]}
      />,
    );

    const row = rowFor("قلادة لؤلؤ");
    await user.click(
      within(row).getByRole("button", { name: "حذف المنتج" }),
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete.mock.calls[0][0]).toMatchObject({ id: 2 });
  });

  it("opens the discount dialog for its own row's product", async () => {
    const onEditDiscount = vi.fn();
    const user = userEvent.setup();
    const second = makeProduct({ id: 2, name_ar: "قلادة لؤلؤ" });

    renderWithProviders(
      <ProductsTable
        {...baseProps}
        onEditDiscount={onEditDiscount}
        products={[makeProduct({ id: 1 }), second]}
      />,
    );

    const row = rowFor("قلادة لؤلؤ");
    await user.click(
      within(row).getByRole("button", { name: "تحديد خصم" }),
    );

    expect(onEditDiscount.mock.calls[0][0]).toMatchObject({ id: 2 });
  });

  it("links each row's edit action to that product's edit page", () => {
    renderWithProviders(
      <ProductsTable
        {...baseProps}
        products={[makeProduct({ id: 1 }), makeProduct({ id: 2, name_ar: "قلادة لؤلؤ" })]}
      />,
    );

    const row = rowFor("قلادة لؤلؤ");
    expect(
      within(row).getByRole("link", { name: "تعديل المنتج" }),
    ).toHaveAttribute("href", "/ar/dashboard/products/2/edit");
  });

  it("reports visibility state through aria-pressed, not colour alone", () => {
    renderWithProviders(
      <ProductsTable
        {...baseProps}
        products={[
          makeProduct({ id: 1, is_active: true, name_ar: "ظاهر" }),
          makeProduct({ id: 2, is_active: false, name_ar: "مخفي" }),
        ]}
      />,
    );

    const visible = rowFor("ظاهر");
    const hidden = rowFor("مخفي");

    expect(
      within(visible).getByRole("button", { name: "تبديل الظهور" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(hidden).getByRole("button", { name: "تبديل الظهور" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("renders an empty list without crashing", () => {
    renderWithProviders(<ProductsTable {...baseProps} products={[]} />);
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
