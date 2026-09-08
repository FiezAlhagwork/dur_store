import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoriesTable from "@/components/admin/categories/CategoriesTable";
import type { Category } from "@/types/product";
import { renderWithI18n } from "../../../helpers/renderWithI18n";

/**
 * Unlike ProductsTable this one is purely presentational — no mutation hook,
 * so no Clerk or React Query needed, just i18n for the action labels and the
 * active/inactive badge.
 */
function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    image: null,
    name_ar: "خواتم",
    name_en: "Rings",
    slug: "rings",
    is_active: true,
    ...overrides,
  };
}

/** See the identical note in ProductsTable.test.tsx: an <li> has no accessible name. */
function rowFor(categoryName: string): HTMLElement {
  const row = screen.getByText(categoryName).closest("li");
  if (!row) throw new Error(`No row found for category "${categoryName}"`);
  return row;
}

describe("CategoriesTable", () => {
  const baseProps = { onEdit: vi.fn(), onDelete: vi.fn() };

  it("renders one row per category with its name and slug", () => {
    renderWithI18n(
      <CategoriesTable
        {...baseProps}
        categories={[
          makeCategory({ id: 1, name_ar: "خواتم", slug: "rings" }),
          makeCategory({ id: 2, name_ar: "قلادات", slug: "necklaces" }),
        ]}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("قلادات")).toBeInTheDocument();
    expect(screen.getByText("necklaces")).toBeInTheDocument();
  });

  it("names categories in the active language", () => {
    renderWithI18n(<CategoriesTable {...baseProps} categories={[makeCategory()]} />, {
      locale: "en",
    });

    expect(screen.getByText("Rings")).toBeInTheDocument();
    expect(screen.queryByText("خواتم")).not.toBeInTheDocument();
  });

  it("labels each category as active or inactive", () => {
    renderWithI18n(
      <CategoriesTable
        {...baseProps}
        categories={[
          makeCategory({ id: 1, name_ar: "ظاهر", is_active: true }),
          makeCategory({ id: 2, name_ar: "مخفي", is_active: false }),
        ]}
      />,
    );

    expect(within(rowFor("ظاهر")).getByText("مفعّل")).toBeInTheDocument();
    expect(within(rowFor("مخفي")).getByText("معطّل")).toBeInTheDocument();
  });

  it("edits the category whose own row was clicked", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    renderWithI18n(
      <CategoriesTable
        {...baseProps}
        onEdit={onEdit}
        categories={[
          makeCategory({ id: 1, name_ar: "خواتم" }),
          makeCategory({ id: 2, name_ar: "قلادات" }),
        ]}
      />,
    );

    await user.click(
      within(rowFor("قلادات")).getByRole("button", { name: "تعديل التصنيف" }),
    );

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit.mock.calls[0][0]).toMatchObject({ id: 2 });
  });

  it("deletes the category whose own row was clicked", async () => {
    // Extra weight here: deleting a category cascades to every product
    // inside it (see DeleteCategoryDialog), so hitting the wrong row is
    // considerably worse than it is for a single product.
    const onDelete = vi.fn();
    const user = userEvent.setup();

    renderWithI18n(
      <CategoriesTable
        {...baseProps}
        onDelete={onDelete}
        categories={[
          makeCategory({ id: 1, name_ar: "خواتم" }),
          makeCategory({ id: 2, name_ar: "قلادات" }),
        ]}
      />,
    );

    await user.click(
      within(rowFor("قلادات")).getByRole("button", { name: "حذف التصنيف" }),
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete.mock.calls[0][0]).toMatchObject({ id: 2 });
  });

  it("renders an empty list without crashing", () => {
    renderWithI18n(<CategoriesTable {...baseProps} categories={[]} />);
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
