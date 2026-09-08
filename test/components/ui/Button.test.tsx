import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/ui/Button";

/**
 * The app's single button. No i18n here — it renders whatever children it's
 * given — so this uses plain `render`.
 */
describe("Button", () => {
  it("renders a <button> with its children", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("defaults to type='button', never 'submit'", () => {
    // Load-bearing: this component is used inside forms (ProductForm's
    // Cancel, the dialogs' Cancel/Confirm). A default of "submit" would make
    // any of them silently submit the form they happen to sit in.
    render(<Button>Cancel</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("honors an explicit type='submit'", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  describe("isLoading", () => {
    it("disables the button and marks it aria-busy", () => {
      render(<Button isLoading>Save</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("is not busy or disabled by default", () => {
      render(<Button>Save</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeEnabled();
      expect(button).toHaveAttribute("aria-busy", "false");
    });

    it("cannot be clicked while loading", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Button isLoading onClick={onClick}>
          Save
        </Button>,
      );

      await user.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it("still shows its label alongside the spinner", () => {
      // The spinner is added, not swapped in — a button that loses its text
      // mid-submit makes the page jump and leaves no clue what's happening.
      render(<Button isLoading>Save</Button>);
      expect(screen.getByRole("button")).toHaveTextContent("Save");
    });
  });

  it("respects the disabled prop on its own", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    expect(screen.getByRole("button")).toBeDisabled();
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when enabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe("as a link", () => {
    it("renders an anchor instead of a button when given href", () => {
      render(<Button href="/ar/dashboard/products">Add product</Button>);

      const link = screen.getByRole("link", { name: "Add product" });
      expect(link).toHaveAttribute("href", "/ar/dashboard/products");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("passes target and rel through for external links", () => {
      render(
        <Button href="https://wa.me/123" target="_blank" rel="noopener noreferrer">
          WhatsApp
        </Button>,
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
