import type {
  SignInFutureResource,
  SignUpFutureResource,
} from "@clerk/shared/types";
import type { AuthMode, AuthPendingFlow } from "@/types";

interface StartEmailAuthParams {
  mode: AuthMode;
  email: string;
  firstName?: string;
  lastName?: string;
  signIn: SignInFutureResource;
  signUp: SignUpFutureResource;
}

type StartEmailAuthResult =
  | { flow: AuthPendingFlow }
  | { error: string; code?: string };

export const SESSION_EXISTS_ERROR_CODE = "session_exists";


export async function startEmailAuth({
  mode,
  email,
  firstName,
  lastName,
  signIn,
  signUp,
}: StartEmailAuthParams): Promise<StartEmailAuthResult> {
  if (mode === "login") {
    const { error } = await signIn.create({ identifier: email });
    if (error) return { error: error.message, code: error.code };

    if (signIn.isTransferable) {
      const { error: transferError } = await signUp.create({ transfer: true });
      if (transferError) return { error: transferError.message };
      return sendSignUpCode(signUp);
    }

    return sendSignInCode(signIn);
  }

  const { error } = await signUp.create({
    emailAddress: email,
    firstName,
    lastName,
  });
  if (error) return { error: error.message, code: error.code };

  if (signUp.isTransferable) {
    const { error: transferError } = await signIn.create({ transfer: true });
    if (transferError) return { error: transferError.message };
    return sendSignInCode(signIn);
  }

  return sendSignUpCode(signUp);
}

async function sendSignInCode(
  signIn: SignInFutureResource,
): Promise<StartEmailAuthResult> {
  const { error } = await signIn.emailCode.sendCode();
  if (error) return { error: error.message };
  return { flow: "signIn" };
}

async function sendSignUpCode(
  signUp: SignUpFutureResource,
): Promise<StartEmailAuthResult> {
  const { error } = await signUp.verifications.sendEmailCode();
  if (error) return { error: error.message };
  return { flow: "signUp" };
}

/** Resends the code for whichever flow is currently in progress. */
export async function resendEmailCode({
  flow,
  signIn,
  signUp,
}: {
  flow: AuthPendingFlow;
  signIn: SignInFutureResource;
  signUp: SignUpFutureResource;
}): Promise<{ error: string } | { ok: true }> {
  const result =
    flow === "signIn"
      ? await signIn.emailCode.sendCode()
      : await signUp.verifications.sendEmailCode();
  if (result.error) return { error: result.error.message };
  return { ok: true };
}

type VerifyCodeResult =
  | { status: "verified" }
  | { status: "wrongCode" }
  | { status: "expired" }
  | { status: "error"; message: string };


export async function verifyEmailCode({
  flow,
  code,
  signIn,
  signUp,
}: {
  flow: AuthPendingFlow;
  code: string;
  signIn: SignInFutureResource;
  signUp: SignUpFutureResource;
}): Promise<VerifyCodeResult> {
  if (flow === "signIn") {
    const { error } = await signIn.emailCode.verifyCode({ code });
    const status = signIn.firstFactorVerification.status;
    if (status === "verified") return { status: "verified" };
    if (status === "expired") return { status: "expired" };
    if (status === "failed") return { status: "wrongCode" };
    return { status: "error", message: error?.message ?? "unknown_error" };
  }

  const { error } = await signUp.verifications.verifyEmailCode({ code });
  const status = signUp.verifications.emailAddress.status;
  if (status === "verified") return { status: "verified" };
  if (status === "expired") return { status: "expired" };
  if (status === "failed") return { status: "wrongCode" };
  return { status: "error", message: error?.message ?? "unknown_error" };
}

type FinalizeResult =
  | { redirectTo: "home" | "redirect-after-login" }

  | { error: string; details?: string };


export async function finalizeAuth({
  flow,
  signIn,
  signUp,
}: {
  flow: AuthPendingFlow;
  signIn: SignInFutureResource;
  signUp: SignUpFutureResource;
}): Promise<FinalizeResult> {
  if (flow === "signIn") {
    if (signIn.status !== "complete") {
      return {
        error: "signin_incomplete",
        details:
          `Clerk will not create a session: signIn.status is "${signIn.status}", expected "complete". ` +
          `A status of "needs_second_factor" means two-factor auth is enabled on this Clerk instance, ` +
          `which this email-OTP flow does not implement.`,
      };
    }

    const { error } = await signIn.finalize();
    if (error) return { error: error.message };
    return { redirectTo: "redirect-after-login" };
  }

  if (signUp.status !== "complete") {
    const missing = signUp.missingFields.join(", ") || "(none reported)";
    return {
      error: "signup_incomplete",
      details:
        `Clerk will not create a session: signUp.status is "${signUp.status}" and it is still ` +
        `waiting on [${missing}], even though the email code verified successfully. ` +
        `This flow only ever collects an email + OTP, so every attribute listed there must be ` +
        `turned off (or made optional) in the Clerk Dashboard under User & authentication. ` +
        `A fresh Clerk instance has Password enabled by default, which alone causes this.`,
    };
  }

  const { error } = await signUp.finalize();
  if (error) return { error: error.message };
  return { redirectTo: "home" };
}
