import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MethodStep from "@/components/auth/MethodStep";
import { renderWithI18n } from "../../helpers/renderWithI18n";

/**
 * The first screen of the auth flow. Per CLAUDE.md there are exactly two
 * ways in — Google OAuth and email OTP — and no password field anywhere;
 * that "exactly two, no password" property is worth asserting, not just
 * documenting.
 */
describe("MethodStep", () => {
  const baseProps = {
    mode: "login" as const,
    onContinueWithEmail: vi.fn(),
    onGoogleClick: vi.fn(),
    isGoogleLoading: false,
    errorMessage: null,
  };

  it("offers exactly the two supported methods", () => {
    renderWithI18n(<MethodStep {...baseProps} />);

    expect(
      screen.getByRole("button", { name: /Google/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "المتابعة عبر الإيميل" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("never renders a password field", () => {
    const { container } = renderWithI18n(<MethodStep {...baseProps} />);
    expect(container.querySelector('input[type="password"]')).toBeNull();
  });

  it("calls onGoogleClick for the Google button", async () => {
    const onGoogleClick = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(
      <MethodStep {...baseProps} onGoogleClick={onGoogleClick} />,
    );

    await user.click(screen.getByRole("button", { name: /Google/ }));
    expect(onGoogleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onContinueWithEmail for the email button", async () => {
    const onContinueWithEmail = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(
      <MethodStep {...baseProps} onContinueWithEmail={onContinueWithEmail} />,
    );

    await user.click(
      screen.getByRole("button", { name: "المتابعة عبر الإيميل" }),
    );
    expect(onContinueWithEmail).toHaveBeenCalledTimes(1);
  });

  it("disables the Google button while its redirect is in flight", async () => {
    // The OAuth redirect takes a visible moment; a second click would start
    // a competing attempt.
    const onGoogleClick = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(
      <MethodStep
        {...baseProps}
        isGoogleLoading
        onGoogleClick={onGoogleClick}
      />,
    );

    const googleButton = screen.getByRole("button", { name: /Google/ });
    expect(googleButton).toBeDisabled();

    await user.click(googleButton);
    expect(onGoogleClick).not.toHaveBeenCalled();
  });

  it("shows an error message as an alert when one is given", () => {
    renderWithI18n(
      <MethodStep {...baseProps} errorMessage="صار في خطأ. جربي مرة تانية." />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "صار في خطأ. جربي مرة تانية.",
    );
  });

  it("renders no alert when there is no error", () => {
    renderWithI18n(<MethodStep {...baseProps} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
