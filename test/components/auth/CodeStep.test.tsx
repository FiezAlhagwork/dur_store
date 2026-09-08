import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CodeStep from "@/components/auth/CodeStep";
import { renderWithI18n } from "../../helpers/renderWithI18n";

describe("CodeStep", () => {
  const baseProps = {
    email: "fiez@example.com",
    codeState: "awaiting" as const,
    resendRemaining: 0,
    errorMessage: null,
    onSubmit: vi.fn(),
    onResend: vi.fn(),
  };

  it("confirms which address the code went to", () => {
    // The one thing worth double-checking before sitting and waiting on an
    // inbox — so the address has to actually appear, interpolated.
    renderWithI18n(<CodeStep {...baseProps} />);
    expect(screen.getByText(/fiez@example\.com/)).toBeInTheDocument();
  });

  it("submits a 6-digit code", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(<CodeStep {...baseProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("كود التحقق"), "424242");
    await user.click(screen.getByRole("button", { name: "تحقّق" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ code: "424242" });
  });

  it("rejects a short code locally instead of asking the server", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(<CodeStep {...baseProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("كود التحقق"), "1234");
    await user.click(screen.getByRole("button", { name: "تحقّق" }));

    expect(await screen.findByText("دخّلي كود من 6 أرقام")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe("code state messages", () => {
    // CLAUDE.md is explicit that a wrong code and an expired one are told
    // apart by `verification.status`, never by guessing at error codes —
    // and they need different wording, because only one of them is fixed by
    // requesting a new code.
    it("says the code was wrong for a failed verification", () => {
      renderWithI18n(<CodeStep {...baseProps} codeState="wrongCode" />);
      expect(
        screen.getByText("الكود غلط، جربي مرة تانية."),
      ).toBeInTheDocument();
    });

    it("says the code expired for an expired verification", () => {
      renderWithI18n(<CodeStep {...baseProps} codeState="expired" />);
      expect(
        screen.getByText("انتهت صلاحية هالكود. اطلبي كود جديد."),
      ).toBeInTheDocument();
    });

    it("shows a specific error message when one is provided", () => {
      renderWithI18n(
        <CodeStep
          {...baseProps}
          codeState="error"
          errorMessage="Something specific from Clerk"
        />,
      );
      expect(
        screen.getByText("Something specific from Clerk"),
      ).toBeInTheDocument();
    });

    it("falls back to generic copy for an error with no message", () => {
      // finalizeAuth deliberately withholds its `details` from the user
      // (it's a Clerk Dashboard misconfiguration, not something they typed)
      // and logs it instead — the UI must still say *something*.
      renderWithI18n(<CodeStep {...baseProps} codeState="error" />);
      expect(
        screen.getByText("صار في خطأ. جربي مرة تانية."),
      ).toBeInTheDocument();
    });

    it("shows the verify button as busy while verifying", () => {
      renderWithI18n(<CodeStep {...baseProps} codeState="verifying" />);
      expect(screen.getByRole("button", { name: "تحقّق" })).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });
  });

  describe("resend", () => {
    it("is available once the countdown has finished", async () => {
      const onResend = vi.fn();
      const user = userEvent.setup();
      renderWithI18n(
        <CodeStep {...baseProps} resendRemaining={0} onResend={onResend} />,
      );

      const resend = screen.getByRole("button", {
        name: "إعادة إرسال الكود",
      });
      expect(resend).toBeEnabled();

      await user.click(resend);
      expect(onResend).toHaveBeenCalledTimes(1);
    });

    it("is disabled and counting down right after a code is sent", async () => {
      const onResend = vi.fn();
      const user = userEvent.setup();
      renderWithI18n(
        <CodeStep {...baseProps} resendRemaining={25} onResend={onResend} />,
      );

      const resend = screen.getByRole("button", { name: /25/ });
      expect(resend).toBeDisabled();

      await user.click(resend);
      expect(onResend).not.toHaveBeenCalled();
    });
  });
});
