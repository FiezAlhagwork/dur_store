import { test } from "@playwright/test";

/**
 * Every other spec authenticates via `clerk.signIn(...)`, a ticket-based
 * Backend API call that never touches AuthFlow's own UI — deliberate,
 * because those specs are about what happens *after* a session exists (see
 * role-routing.spec.ts's own comment). This one is the opposite: it drives
 * the real method → email → code steps a visitor actually sees
 * (components/auth/{MethodStep,EmailStep,CodeStep}.tsx), through the app's
 * own custom flow (lib/auth/orchestration.ts) — no password anywhere, per
 * CLAUDE.md.
 *
 * This only works with a Clerk test-mode email: any address whose local
 * part contains `+clerk_test` (e.g. `you+clerk_test@example.com`) always
 * accepts the fixed OTP `424242` instead of a real email being sent, so the
 * test never needs to read an inbox. Set `E2E_OTP_CUSTOMER_EMAIL` in
 * `.env.test` to one such address.
 *
 * This test requires E2E_OTP_CUSTOMER_EMAIL to already exist as a Clerk
 * account — confirmed the hard way: `signIn.create({ identifier: email })`
 * on /login does NOT quietly transfer into a sign-up for an email with zero
 * prior account, it hard-errors "Couldn't find your account" (seen directly
 * in a failed run's page snapshot). `isTransferable` only covers an account
 * that exists but needs a different verification method, not "doesn't exist
 * at all" — so a brand-new identifier has no path through /login at all. The
 * account behind E2E_OTP_CUSTOMER_EMAIL was created once via /register (the
 * one page that does accept a brand-new email) and is reused on every run
 * after that, same as the ticket-based suite's two shared Clerk accounts.
 */
test.describe("real email-OTP sign-in flow", () => {
  test("logging in through the actual UI with a real emailed code lands on home", async ({
    page,
  }) => {
    const email = process.env.E2E_OTP_CUSTOMER_EMAIL;
    test.skip(!email, "E2E_OTP_CUSTOMER_EMAIL is not set in .env.test");

    await page.goto("/ar/login");

    await page.getByRole("button", { name: "المتابعة عبر الإيميل" }).click();
    await page.getByLabel("البريد الإلكتروني").fill(email!);
    await page.getByRole("button", { name: "إرسال الكود" }).click();

    await page.getByLabel("كود التحقق").fill("424242");
    await page.getByRole("button", { name: "تحقّق" }).click();

    await page.waitForURL("**/ar");
  });
});
