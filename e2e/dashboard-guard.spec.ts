import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

/**
 * Two independent guards protect `/dashboard`, per CLAUDE.md:
 * 1. `(admin)/layout.tsx` (server, `auth()`) — is there a session at all.
 * 2. `AdminShell` (client, cached role) — is that session an admin.
 * Each test here targets one of them directly, plus sign-out unwinding both.
 */
test.describe("dashboard route guard", () => {
  test("an unauthenticated visitor is redirected to login", async ({ page }) => {
    await page.goto("/ar/dashboard");
    await page.waitForURL("/ar/login");
  });

  test("a signed-in customer who navigates straight to /dashboard is sent home", async ({
    page,
  }) => {
    await page.goto("/ar");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_CUSTOMER_EMAIL!,
    });

    // Skips /redirect-after-login on purpose — this is the layout's server
    // guard letting a real session through, then AdminShell's own client
    // check catching the wrong role, independent of how the visitor arrived.
    await page.goto("/ar/dashboard");
    await page.waitForURL("/ar");
  });

  test("signing out revokes dashboard access", async ({ page }) => {
    await page.goto("/ar");
    await clerk.signIn({
      page,
      emailAddress: process.env.E2E_ADMIN_EMAIL!,
    });

    await page.goto("/ar/dashboard");
    await expect(page.getByRole("navigation")).toBeVisible();

    await clerk.signOut({ page });
    await page.goto("/ar/dashboard");
    await page.waitForURL("/ar/login");
  });
});
