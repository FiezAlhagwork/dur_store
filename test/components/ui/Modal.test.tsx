import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "@/components/ui/Modal";
import { renderWithI18n } from "../../helpers/renderWithI18n";

/**
 * The app's only general-purpose dialog — every destructive confirmation
 * (DeleteProductDialog, DeleteCategoryDialog, DeleteImageDialog) and the
 * category form are built on it, so its close paths and scroll lock are
 * worth pinning down.
 */
describe("Modal", () => {
  const baseProps = {
    title: "حذف المنتج",
    onClose: vi.fn(),
  };

  it("renders nothing at all when closed", () => {
    const { container } = renderWithI18n(
      <Modal {...baseProps} isOpen={false}>
        <p>body</p>
      </Modal>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes a labelled modal dialog when open", () => {
    renderWithI18n(
      <Modal {...baseProps} isOpen>
        <p>body</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // The accessible name comes from the heading via aria-labelledby, which
    // is what lets the E2E suite scope to `getByRole("dialog")` reliably.
    expect(dialog).toHaveAccessibleName("حذف المنتج");
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders an optional description and links it via aria-describedby", () => {
    renderWithI18n(
      <Modal {...baseProps} isOpen description="لا يمكن التراجع عن هذا">
        <p>body</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "لا يمكن التراجع عن هذا",
    );
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(
      <Modal {...baseProps} onClose={onClose} isOpen>
        <p>body</p>
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on the close button", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(
      <Modal {...baseProps} onClose={onClose} isOpen>
        <p>body</p>
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClose while it is closed", async () => {
    // The Escape listener is registered inside an effect gated on isOpen —
    // a closed modal must not be quietly eating Escape presses meant for
    // whatever else is on the page.
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(
      <Modal {...baseProps} onClose={onClose} isOpen={false}>
        <p>body</p>
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  describe("page scroll lock", () => {
    it("locks body scroll while open and restores it on close", () => {
      const { rerender } = renderWithI18n(
        <Modal {...baseProps} isOpen>
          <p>body</p>
        </Modal>,
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(
        <Modal {...baseProps} isOpen={false}>
          <p>body</p>
        </Modal>,
      );
      expect(document.body.style.overflow).toBe("");
    });

    it("restores body scroll when unmounted while still open", () => {
      // The realistic failure: a dialog whose parent stops rendering it
      // (ProductsManager clears `deleteTarget`) would otherwise leave the
      // whole page permanently unscrollable.
      const { unmount } = renderWithI18n(
        <Modal {...baseProps} isOpen>
          <p>body</p>
        </Modal>,
      );
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });
});
