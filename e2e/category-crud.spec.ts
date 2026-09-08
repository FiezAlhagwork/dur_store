import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

/**
 * Same shape as product-crud.spec.ts (create through the real form, watch
 * it land in the list, delete it through the real confirmation), but for
 * the *other* admin CRUD pattern in this app: categories live entirely in a
 * `<Modal>` (CategoryFormModal / DeleteCategoryDialog) opened from the list
 * page, not a dedicated route — per this project's own convention that only
 * small forms get a modal, large ones get a route (products' form has 12
 * fields and its own /new route; categories' has 3 and a modal).
 *
 * That matters here because both the page's "add" button and the modal's
 * submit button render the exact same i18n string ("أضف تصنيف" /
 * admin.categories.add and admin.categories.form.create) — unlike products,
 * where the two differ. Every locator below is scoped to `dialog` or `page`
 * accordingly to avoid an ambiguous match once the modal is open.
 *
 * Deleting a category cascades to every product inside it (see
 * DeleteCategoryDialog's own comment), which is exactly why this test only
 * ever deletes the category it just created itself — never an existing one.
 */
test.describe("admin category CRUD", () => {
  test("adding a category shows it in the list, deleting it removes the row", async ({
    page,
  }) => {
    const unique = Date.now();
    const categoryName = `E2E Test Category ${unique}`;
    const slug = `e2e-test-category-${unique}`;

    await page.goto("/ar");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_ADMIN_EMAIL!,
    });

    // --- Create -----------------------------------------------------------
    await page.goto("/ar/dashboard/categories");

    // Only the page's own "add" button exists yet — the modal (and its
    // identically-labelled submit button) isn't open until this is clicked.
    await page.getByRole("button", { name: "أضف تصنيف" }).click();

    const formDialog = page.getByRole("dialog");
    await expect(formDialog).toBeVisible();

    await formDialog.getByLabel("الاسم (عربي)").fill(categoryName);
    await formDialog.getByLabel("الاسم (إنجليزي)").fill(categoryName);
    await formDialog.getByLabel("الرابط (slug)").fill(slug);

    await formDialog.getByRole("button", { name: "أضف تصنيف" }).click();

    // The modal has no redirect to wait on (it's not a route) — closing is
    // the success signal, then the invalidated list brings the row in.
    await expect(formDialog).not.toBeVisible();
    const row = page.getByRole("listitem").filter({ hasText: categoryName });
    await expect(row).toBeVisible();

    // --- Delete -------------------------------------------------------------
    await row.getByRole("button", { name: "حذف التصنيف" }).click();

    const deleteDialog = page.getByRole("dialog");
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole("button", { name: "احذف التصنيف" }).click();

    await expect(deleteDialog).not.toBeVisible();
    await expect(row).not.toBeVisible();
  });
});
