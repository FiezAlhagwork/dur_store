import { describe, it, expect, vi } from "vitest";
import type {
  SignInFutureResource,
  SignUpFutureResource,
} from "@clerk/shared/types";
import {
  startEmailAuth,
  resendEmailCode,
  verifyEmailCode,
  finalizeAuth,
} from "@/lib/auth/orchestration";

/**
 * `lib/auth/orchestration.ts` is exactly the logic CLAUDE.md's own history
 * documents as easy to get wrong — `isTransferable`, `verification.status`,
 * and the "signIn vs signUp" redirect split have each caused a real,
 * previously-diagnosed bug (see CLAUDE.md's "Cannot finalize sign-up
 * without a created session" and the `finalizeAuth` details messages below,
 * which are lifted verbatim from incidents that already happened once).
 * Unit tests exercise every branch directly instead of only ever
 * re-discovering them through a live Clerk instance.
 *
 * Both `signIn`/`signUp` are the Future-API resources — plain mutable
 * objects with methods, not classes — so a partial mock cast to the real
 * type is the normal way to test code written against them; only the
 * fields orchestration.ts actually reads are filled in. The overrides
 * parameter is keyed off the real type's own keys (`keyof ...`) rather than
 * a hand-written duplicate shape, so a typo'd override field is still
 * caught, without fighting the real interface's deep, non-optional nesting
 * for values we only ever replace wholesale anyway.
 */

type Overrides<T> = Partial<Record<keyof T, unknown>>;

function mockSignIn(
  overrides: Overrides<SignInFutureResource> = {},
): SignInFutureResource {
  return {
    create: vi.fn().mockResolvedValue({ error: undefined }),
    isTransferable: false,
    emailCode: {
      sendCode: vi.fn().mockResolvedValue({ error: undefined }),
      verifyCode: vi.fn().mockResolvedValue({ error: undefined }),
    },
    firstFactorVerification: { status: "verified" },
    status: "complete",
    finalize: vi.fn().mockResolvedValue({ error: undefined }),
    ...overrides,
  } as unknown as SignInFutureResource;
}

function mockSignUp(
  overrides: Overrides<SignUpFutureResource> = {},
): SignUpFutureResource {
  return {
    create: vi.fn().mockResolvedValue({ error: undefined }),
    isTransferable: false,
    verifications: {
      sendEmailCode: vi.fn().mockResolvedValue({ error: undefined }),
      verifyEmailCode: vi.fn().mockResolvedValue({ error: undefined }),
      emailAddress: { status: "verified" },
    },
    status: "complete",
    missingFields: [],
    finalize: vi.fn().mockResolvedValue({ error: undefined }),
    ...overrides,
  } as unknown as SignUpFutureResource;
}

describe("startEmailAuth", () => {
  describe("mode: login", () => {
    it("sends a sign-in code when the account already exists", async () => {
      const signIn = mockSignIn();
      const signUp = mockSignUp();

      const result = await startEmailAuth({
        mode: "login",
        email: "a@b.com",
        signIn,
        signUp,
      });

      expect(signIn.create).toHaveBeenCalledWith({ identifier: "a@b.com" });
      expect(signUp.create).not.toHaveBeenCalled();
      expect(signIn.emailCode.sendCode).toHaveBeenCalled();
      expect(result).toEqual({ flow: "signIn" });
    });

    it("surfaces the error and code when signIn.create fails", async () => {
      const signIn = mockSignIn({
        create: vi
          .fn()
          .mockResolvedValue({
            error: { message: "Couldn't find your account.", code: "form_identifier_not_found" },
          }),
      });
      const signUp = mockSignUp();

      const result = await startEmailAuth({
        mode: "login",
        email: "nobody@example.com",
        signIn,
        signUp,
      });

      expect(result).toEqual({
        error: "Couldn't find your account.",
        code: "form_identifier_not_found",
      });
    });

    it("transfers into a sign-up when the account needs a different method", async () => {
      const signIn = mockSignIn({ isTransferable: true });
      const signUp = mockSignUp();

      const result = await startEmailAuth({
        mode: "login",
        email: "a@b.com",
        signIn,
        signUp,
      });

      expect(signUp.create).toHaveBeenCalledWith({ transfer: true });
      expect(signUp.verifications.sendEmailCode).toHaveBeenCalled();
      expect(signIn.emailCode.sendCode).not.toHaveBeenCalled();
      expect(result).toEqual({ flow: "signUp" });
    });

    it("surfaces the error when the transfer itself fails", async () => {
      const signIn = mockSignIn({ isTransferable: true });
      const signUp = mockSignUp({
        create: vi.fn().mockResolvedValue({ error: { message: "transfer failed" } }),
      });

      const result = await startEmailAuth({
        mode: "login",
        email: "a@b.com",
        signIn,
        signUp,
      });

      expect(result).toEqual({ error: "transfer failed" });
    });
  });

  describe("mode: register", () => {
    it("sends a sign-up code for a brand-new email", async () => {
      const signIn = mockSignIn();
      const signUp = mockSignUp();

      const result = await startEmailAuth({
        mode: "register",
        email: "new@b.com",
        firstName: "Fiez",
        lastName: "Alhag",
        signIn,
        signUp,
      });

      expect(signUp.create).toHaveBeenCalledWith({
        emailAddress: "new@b.com",
        firstName: "Fiez",
        lastName: "Alhag",
      });
      expect(signIn.create).not.toHaveBeenCalled();
      expect(result).toEqual({ flow: "signUp" });
    });

    it("surfaces the error when signUp.create fails", async () => {
      const signUp = mockSignUp({
        create: vi
          .fn()
          .mockResolvedValue({ error: { message: "That email address is taken.", code: "form_identifier_exists" } }),
      });

      const result = await startEmailAuth({
        mode: "register",
        email: "taken@b.com",
        signIn: mockSignIn(),
        signUp,
      });

      expect(result).toEqual({
        error: "That email address is taken.",
        code: "form_identifier_exists",
      });
    });

    it("transfers into a sign-in when the account already exists", async () => {
      const signIn = mockSignIn();
      const signUp = mockSignUp({ isTransferable: true });

      const result = await startEmailAuth({
        mode: "register",
        email: "existing@b.com",
        signIn,
        signUp,
      });

      expect(signIn.create).toHaveBeenCalledWith({ transfer: true });
      expect(signIn.emailCode.sendCode).toHaveBeenCalled();
      expect(result).toEqual({ flow: "signIn" });
    });
  });

  it("surfaces an error from sendCode itself, not just from create", async () => {
    const signIn = mockSignIn({
      emailCode: {
        sendCode: vi.fn().mockResolvedValue({ error: { message: "rate limited" } }),
        verifyCode: vi.fn(),
      },
    });

    const result = await startEmailAuth({
      mode: "login",
      email: "a@b.com",
      signIn,
      signUp: mockSignUp(),
    });

    expect(result).toEqual({ error: "rate limited" });
  });
});

describe("resendEmailCode", () => {
  it("resends via signIn for an in-progress signIn flow", async () => {
    const signIn = mockSignIn();
    const result = await resendEmailCode({ flow: "signIn", signIn, signUp: mockSignUp() });

    expect(signIn.emailCode.sendCode).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it("resends via signUp for an in-progress signUp flow", async () => {
    const signUp = mockSignUp();
    const result = await resendEmailCode({ flow: "signUp", signIn: mockSignIn(), signUp });

    expect(signUp.verifications.sendEmailCode).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it("surfaces a resend error", async () => {
    const signIn = mockSignIn({
      emailCode: {
        sendCode: vi.fn().mockResolvedValue({ error: { message: "too soon" } }),
        verifyCode: vi.fn(),
      },
    });

    const result = await resendEmailCode({ flow: "signIn", signIn, signUp: mockSignUp() });
    expect(result).toEqual({ error: "too soon" });
  });
});

describe("verifyEmailCode", () => {
  // The exact three-way branch this app relies on to tell a wrong code from
  // an expired one, per CLAUDE.md: "use verification.status directly ...
  // do not guess or map Clerk error codes for this."
  it.each([
    ["verified" as const, { status: "verified" as const }],
    ["expired" as const, { status: "expired" as const }],
    ["failed" as const, { status: "wrongCode" as const }],
  ])("maps signIn firstFactorVerification.status %s correctly", async (status, expected) => {
    const signIn = mockSignIn({ firstFactorVerification: { status } });

    const result = await verifyEmailCode({
      flow: "signIn",
      code: "123456",
      signIn,
      signUp: mockSignUp(),
    });

    expect(result).toEqual(expected);
  });

  it("falls back to an error status with the Clerk message for an unrecognized signIn status", async () => {
    const signIn = mockSignIn({
      firstFactorVerification: { status: "needs_second_factor" },
      emailCode: {
        sendCode: vi.fn(),
        verifyCode: vi.fn().mockResolvedValue({ error: { message: "2fa required" } }),
      },
    });

    const result = await verifyEmailCode({
      flow: "signIn",
      code: "123456",
      signIn,
      signUp: mockSignUp(),
    });

    expect(result).toEqual({ status: "error", message: "2fa required" });
  });

  it.each([
    ["verified" as const, { status: "verified" as const }],
    ["expired" as const, { status: "expired" as const }],
    ["failed" as const, { status: "wrongCode" as const }],
  ])("maps signUp verifications.emailAddress.status %s correctly", async (status, expected) => {
    const signUp = mockSignUp({
      verifications: {
        sendEmailCode: vi.fn(),
        verifyEmailCode: vi.fn().mockResolvedValue({ error: undefined }),
        emailAddress: { status },
      },
    });

    const result = await verifyEmailCode({
      flow: "signUp",
      code: "123456",
      signIn: mockSignIn(),
      signUp,
    });

    expect(result).toEqual(expected);
  });
});

describe("finalizeAuth", () => {
  it("redirects to redirect-after-login when signIn completes", async () => {
    const signIn = mockSignIn({ status: "complete" });

    const result = await finalizeAuth({ flow: "signIn", signIn, signUp: mockSignUp() });

    expect(signIn.finalize).toHaveBeenCalled();
    expect(result).toEqual({ redirectTo: "redirect-after-login" });
  });

  it("refuses to finalize an incomplete signIn instead of guessing", async () => {
    // This is the exact class of bug CLAUDE.md documents for signUp
    // (missing dashboard attributes) mirrored on the signIn side — e.g. 2FA
    // enabled unexpectedly. finalize() must never be called speculatively.
    const signIn = mockSignIn({ status: "needs_second_factor" });

    const result = await finalizeAuth({ flow: "signIn", signIn, signUp: mockSignUp() });

    expect(signIn.finalize).not.toHaveBeenCalled();
    expect(result).toMatchObject({ error: "signin_incomplete" });
    expect((result as { details: string }).details).toContain("needs_second_factor");
  });

  it("surfaces a finalize() error for signIn", async () => {
    const signIn = mockSignIn({
      status: "complete",
      finalize: vi.fn().mockResolvedValue({ error: { message: "session creation failed" } }),
    });

    const result = await finalizeAuth({ flow: "signIn", signIn, signUp: mockSignUp() });
    expect(result).toEqual({ error: "session creation failed" });
  });

  it("redirects home when signUp completes", async () => {
    const signUp = mockSignUp({ status: "complete" });

    const result = await finalizeAuth({ flow: "signUp", signIn: mockSignIn(), signUp });

    expect(signUp.finalize).toHaveBeenCalled();
    expect(result).toEqual({ redirectTo: "home" });
  });

  it("reports which fields are still missing for an incomplete signUp", async () => {
    // The precise real-world failure this guards against, per CLAUDE.md:
    // Password/Name left "required" in the Clerk Dashboard silently leaves
    // signUp.status as "missing_requirements" even after the OTP verifies.
    const signUp = mockSignUp({
      status: "missing_requirements",
      missingFields: ["password"],
    });

    const result = await finalizeAuth({ flow: "signUp", signIn: mockSignIn(), signUp });

    expect(signUp.finalize).not.toHaveBeenCalled();
    expect(result).toMatchObject({ error: "signup_incomplete" });
    expect((result as { details: string }).details).toContain("password");
  });

  it("reports '(none reported)' when signUp is incomplete with no missing fields listed", async () => {
    const signUp = mockSignUp({ status: "missing_requirements", missingFields: [] });

    const result = await finalizeAuth({ flow: "signUp", signIn: mockSignIn(), signUp });

    expect((result as { details: string }).details).toContain("(none reported)");
  });

  it("surfaces a finalize() error for signUp", async () => {
    const signUp = mockSignUp({
      status: "complete",
      finalize: vi.fn().mockResolvedValue({ error: { message: "session creation failed" } }),
    });

    const result = await finalizeAuth({ flow: "signUp", signIn: mockSignIn(), signUp });
    expect(result).toEqual({ error: "session creation failed" });
  });
});
