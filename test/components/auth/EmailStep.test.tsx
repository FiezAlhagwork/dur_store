import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmailStep from "@/components/auth/EmailStep";
import { renderWithI18n } from "../../helpers/renderWithI18n";

/**
 * The email step is the same component on both pages, differing only by
 * `mode` — and that difference is load-bearing: the register page collects
 * first/last name because `signUp.create()` needs them for the Laravel
 * `user.created` webhook's `name` column, while the login page must not ask
 * a returning visitor for their name (see schema/auth.ts).
 */
describe("EmailStep", () => {
  const baseProps = {
    defaultEmail: "",
    onSubmit: vi.fn(),
    errorMessage: null,
  };

  describe("login mode", () => {
    it("asks for an email only — no name fields", () => {
      renderWithI18n(<EmailStep {...baseProps} mode="login" />);

      expect(screen.getByLabelText("البريد الإلكتروني")).toBeInTheDocument();
      expect(screen.queryByLabelText("الاسم الأول")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("اسم العيلة")).not.toBeInTheDocument();
    });

    it("submits a valid email", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderWithI18n(
        <EmailStep {...baseProps} mode="login" onSubmit={onSubmit} />,
      );

      await user.type(
        screen.getByLabelText("البريد الإلكتروني"),
        "fiez@example.com",
      );
      await user.click(screen.getByRole("button", { name: "إرسال الكود" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        email: "fiez@example.com",
      });
    });

    it("blocks an invalid email before any network call", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderWithI18n(
        <EmailStep {...baseProps} mode="login" onSubmit={onSubmit} />,
      );

      await user.type(screen.getByLabelText("البريد الإلكتروني"), "nope");
      await user.click(screen.getByRole("button", { name: "إرسال الكود" }));

      expect(
        await screen.findByText("لازم تكتبي إيميل صحيح"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("prefills the email it was given, so going back doesn't lose it", () => {
      renderWithI18n(
        <EmailStep
          {...baseProps}
          mode="login"
          defaultEmail="fiez@example.com"
        />,
      );

      expect(screen.getByLabelText("البريد الإلكتروني")).toHaveValue(
        "fiez@example.com",
      );
    });
  });

  describe("register mode", () => {
    it("also asks for a first and last name", () => {
      renderWithI18n(<EmailStep {...baseProps} mode="register" />);

      expect(screen.getByLabelText("الاسم الأول")).toBeInTheDocument();
      expect(screen.getByLabelText("اسم العيلة")).toBeInTheDocument();
    });

    it("requires both names before submitting", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderWithI18n(
        <EmailStep {...baseProps} mode="register" onSubmit={onSubmit} />,
      );

      await user.type(
        screen.getByLabelText("البريد الإلكتروني"),
        "fiez@example.com",
      );
      await user.click(screen.getByRole("button", { name: "إرسال الكود" }));

      expect(
        await screen.findByText("لازم تكتبي الاسم الأول (حرفين ع الأقل)"),
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("passes the names along with the email", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderWithI18n(
        <EmailStep {...baseProps} mode="register" onSubmit={onSubmit} />,
      );

      await user.type(screen.getByLabelText("الاسم الأول"), "فيّاض");
      await user.type(screen.getByLabelText("اسم العيلة"), "الحاج");
      await user.type(
        screen.getByLabelText("البريد الإلكتروني"),
        "fiez@example.com",
      );
      await user.click(screen.getByRole("button", { name: "إرسال الكود" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        email: "fiez@example.com",
        firstName: "فيّاض",
        lastName: "الحاج",
      });
    });
  });

  it("surfaces a server-side error message as an alert", () => {
    renderWithI18n(
      <EmailStep
        {...baseProps}
        mode="login"
        errorMessage="Couldn't find your account."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't find your account.",
    );
  });
});
