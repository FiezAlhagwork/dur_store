import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

/**
 * product-crud.spec.ts covers create + delete; this covers the third leg —
 * updating an existing product through ProductForm's edit mode
 * (EditProductLoader → ProductForm, /dashboard/products/{id}/edit).
 *
 * There's no seed product to edit safely (editing a real one would touch
 * live catalog data), so this test creates its own, edits *that*, then
 * deletes it — same self-cleaning shape as the other two CRUD specs, just
 * one step longer. The edit page loads the product by id, defaults the
 * whole form to its current values, and — same as create — has no toast:
 * success is the redirect back to the list plus the new values showing up
 * there (ProductForm's onSubmit does the same `router.push` either way; see
 * components/admin/products/ProductForm.tsx).
 */
test.describe("admin product edit", () => {
  test("editing a product's name updates it in the list", async ({ page }) => {
    const unique = Date.now();
    const originalName = `E2E Edit Source ${unique}`;
    const updatedName = `E2E Edit Source ${unique} (Edited)`;
    const slug = `e2e-edit-source-${unique}`;

    await page.goto("/ar");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_ADMIN_EMAIL!,
    });

    // --- Create the product this test will edit ----------------------------
    await page.goto("/ar/dashboard/products/new");
    await page.getByLabel("التصنيف", { exact: true }).selectOption({ index: 1 });
    await page.getByLabel("الرابط (slug)").fill(slug);
    await page.getByLabel("الاسم (عربي)").fill(originalName);
    await page.getByLabel("الاسم (إنجليزي)").fill(originalName);
    await page.getByLabel("السعر").fill("100");
    await page.getByRole("button", { name: "أضف منتج" }).click();

    await page.waitForURL("**/dashboard/products");
    const originalRow = page.getByRole("listitem").filter({ hasText: originalName });
    await expect(originalRow).toBeVisible();

    // --- Edit ---------------------------------------------------------------
    // The pencil is a <Link> to /dashboard/products/{id}/edit, not a button
    // (see ProductsTable.tsx) — scoped to this row so it opens this product's
    // edit page specifically, not whichever one happens to render first.
    await originalRow.getByRole("link", { name: "تعديل المنتج" }).click();

    // The edit form defaults every field to the product's current values
    // (EditProductLoader waits on the fetch before mounting ProductForm), so
    // only the two name fields need touching — everything else round-trips
    // unchanged, which is itself part of what this test is checking.
    await page.getByLabel("الاسم (عربي)").fill(updatedName);
    await page.getByLabel("الاسم (إنجليزي)").fill(updatedName);
    await page.getByRole("button", { name: "حفظ التعديلات" }).click();

    await page.waitForURL("**/dashboard/products");
    const updatedRow = page.getByRole("listitem").filter({ hasText: updatedName });
    await expect(updatedRow).toBeVisible();
    await expect(page.getByText(originalName, { exact: true })).not.toBeVisible();

    // --- Clean up -------------------------------------------------------------
    await updatedRow.getByRole("button", { name: "حذف المنتج" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "احذف المنتج" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(updatedRow).not.toBeVisible();
  });
});
