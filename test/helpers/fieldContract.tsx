import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

interface FieldContractOptions {
  /** How to render the field under test with the given label/error/hint. */
  renderField: (props: {
    label?: string;
    error?: string;
    hint?: string;
    id?: string;
  }) => ReactElement;
  /** Which ARIA role the underlying control exposes. */
  role: "textbox" | "combobox";
}

/**
 * `Input`, `Select` and `Textarea` are deliberately identical in everything
 * except the control they wrap: same `useId`-generated id, same
 * `<label htmlFor>` wiring, same error-beats-hint precedence, same
 * `aria-invalid`/`aria-describedby`. Asserting that contract once here beats
 * triplicating ~7 tests across three files — and if the contract ever
 * changes, it changes in one place.
 *
 * Each field's own mirror test file (test/components/ui/*.test.tsx) calls
 * this and then adds whatever is specific to it.
 *
 * This contract is not cosmetic: **every `getByLabel(...)` in the Playwright
 * E2E suite depends on the label↔control association below.** If it breaks,
 * the admin forms become untestable end-to-end and unusable with a screen
 * reader, with no visual symptom at all.
 */
export function describeFieldContract({
  renderField,
  role,
}: FieldContractOptions) {
  describe("shared field contract", () => {
    it("associates the label with the control, so getByLabelText finds it", () => {
      render(renderField({ label: "Price" }));
      expect(screen.getByLabelText("Price")).toBe(screen.getByRole(role));
    });

    it("generates a unique id per instance", () => {
      render(
        <>
          {renderField({ label: "First" })}
          {renderField({ label: "Second" })}
        </>,
      );

      const first = screen.getByLabelText("First");
      const second = screen.getByLabelText("Second");
      expect(first.id).not.toBe("");
      expect(first.id).not.toBe(second.id);
    });

    it("uses an explicit id when one is passed", () => {
      render(renderField({ label: "Price", id: "custom-id" }));
      expect(screen.getByLabelText("Price")).toHaveAttribute("id", "custom-id");
    });

    it("renders no label element when no label is given", () => {
      const { container } = render(renderField({}));
      expect(container.querySelector("label")).toBeNull();
    });

    it("shows a hint and points aria-describedby at it", () => {
      render(renderField({ label: "Slug", hint: "lowercase only" }));

      const control = screen.getByRole(role);
      const hint = screen.getByText("lowercase only");
      expect(control).toHaveAttribute("aria-describedby", hint.id);
      expect(control).toHaveAttribute("aria-invalid", "false");
    });

    it("shows an error, flags aria-invalid, and points aria-describedby at it", () => {
      render(renderField({ label: "Slug", error: "Slug is required" }));

      const control = screen.getByRole(role);
      const error = screen.getByText("Slug is required");
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(control).toHaveAttribute("aria-describedby", error.id);
    });

    it("lets the error replace the hint rather than showing both", () => {
      // A field showing "lowercase only" *and* "Slug is required" at once
      // buries the thing that actually needs fixing.
      render(
        renderField({
          label: "Slug",
          hint: "lowercase only",
          error: "Slug is required",
        }),
      );

      expect(screen.getByText("Slug is required")).toBeInTheDocument();
      expect(screen.queryByText("lowercase only")).not.toBeInTheDocument();
    });
  });
}
