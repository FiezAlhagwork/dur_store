import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

/**
 * Unlike role-routing.spec.ts / dashboard-guard.spec.ts, this test is not
 * about auth — it's about a real admin workflow: adding a product through
 * the actual form, watching it land in the list, then deleting it through
 * the actual confirmation dialog. Every step past sign-in drives real UI
 * (fill a field, click a button, see a row appear/disappear), which is also
 * why the config now runs headed + slowMo locally — this is meant to be
 * watched, not just asserted on.
 *
 * `clerk.signIn(...)` still bypasses the login *form* on purpose (that's
 * dashboard-guard.spec.ts's job) — this test starts from "an admin is
 * already in the dashboard".
 *
 * Self-cleaning: the product this test creates is the same one it deletes,
 * so a passing run never leaves test data behind. It does assume at least
 * one category already exists (the category <select> has nothing to pick
 * otherwise) — same category of prerequisite as the two shared Clerk test
 * accounts the other specs depend on.
 */
test.describe("admin product CRUD", () => {
  test("adding a product shows it in the list, deleting it removes the row", async ({
    page,
  }) => {
    const unique = Date.now();
    const productName = `E2E Test Product ${unique}`;
    const slug = `e2e-test-product-${unique}`;

    await page.goto("/ar");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_ADMIN_EMAIL!,
    });

    // --- Create -------------------------------------------------------
    await page.goto("/ar/dashboard/products/new");

    // First real option after the "اختاري تصنيف" placeholder — whichever
    // category exists in this environment, not a hardcoded name. `exact`
    // matters here: the sidebar's "التصنيفات" (Categories) nav link would
    // otherwise match too, since getByLabel does substring matching by
    // default and "التصنيف" is a prefix of "التصنيفات".
    await page.getByLabel("التصنيف", { exact: true }).selectOption({ index: 1 });

    await page.getByLabel("الرابط (slug)").fill(slug);
    await page.getByLabel("الاسم (عربي)").fill(productName);
    await page.getByLabel("الاسم (إنجليزي)").fill(productName);
    await page.getByLabel("السعر").fill("100");

    await page.getByRole("button", { name: "أضف منتج" }).click();

    await page.waitForURL("**/dashboard/products");
    const row = page.getByRole("listitem").filter({ hasText: productName });
    await expect(row).toBeVisible();

    // --- Delete ---------------------------------------------------------
    await row.getByRole("button", { name: "حذف المنتج" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "احذف المنتج" }).click();

    await expect(dialog).not.toBeVisible();
    await expect(row).not.toBeVisible();
  });
});
