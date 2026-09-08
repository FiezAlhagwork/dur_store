import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FAQItem from "@/components/site/Home/FAQItem";

/**
 * FAQItem is fully controlled by its parent (FAQ.tsx owns `openIndex`), and
 * takes plain question/answer strings rather than translation keys — so
 * unlike FAQ.tsx itself, this needs no i18n setup at all to test
 * meaningfully. What belongs here is exactly what the component owns: does
 * it show the right content for a given `isOpen`, and does it report a
 * click back to the parent — not the accordion's open-one-at-a-time
 * behavior, which lives in FAQ.tsx's own state.
 */
describe("FAQItem", () => {
  const baseProps = {
    question: "How long does shipping take?",
    answer: "Orders ship within 3 business days.",
    index: 0,
  };

  it("always shows the question", () => {
    render(<FAQItem {...baseProps} isOpen={false} onToggle={vi.fn()} />);
    expect(screen.getByText(baseProps.question)).toBeInTheDocument();
  });

  it("hides the answer when closed", () => {
    render(<FAQItem {...baseProps} isOpen={false} onToggle={vi.fn()} />);
    expect(screen.queryByText(baseProps.answer)).not.toBeInTheDocument();
  });

  it("shows the answer when open", () => {
    render(<FAQItem {...baseProps} isOpen={true} onToggle={vi.fn()} />);
    expect(screen.getByText(baseProps.answer)).toBeInTheDocument();
  });

  it("reflects the open state via aria-expanded, for accessibility", () => {
    const { rerender } = render(
      <FAQItem {...baseProps} isOpen={false} onToggle={vi.fn()} />,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");

    rerender(<FAQItem {...baseProps} isOpen={true} onToggle={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onToggle exactly once when the question is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<FAQItem {...baseProps} isOpen={false} onToggle={onToggle} />);

    await user.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
