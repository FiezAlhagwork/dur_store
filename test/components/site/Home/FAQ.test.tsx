import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FAQ from "@/components/site/Home/FAQ";
import { FAQ_ITEMS } from "@/constants";
import { renderWithI18n } from "../../../helpers/renderWithI18n";

/**
 * FAQItem's own test covers a single row in isolation. This covers the part
 * only the parent owns: the accordion rule that exactly one answer can be
 * open at a time (a single `openIndex` rather than per-item state).
 *
 * Questions are located by role rather than by hardcoded Arabic strings
 * wherever possible, so adding or reordering a question in `FAQ_ITEMS`
 * doesn't require editing this file.
 */
describe("FAQ", () => {
  it("renders one toggle per configured question", () => {
    renderWithI18n(<FAQ />);
    expect(screen.getAllByRole("button")).toHaveLength(FAQ_ITEMS.length);
  });

  it("renders the real translated copy, not raw keys", () => {
    renderWithI18n(<FAQ />);

    expect(screen.getByText("الأسئلة الشائعة")).toBeInTheDocument();
    expect(screen.getByText("هل يمكن تخصيص القطع؟")).toBeInTheDocument();
    // A missing key would render the key itself — catch that explicitly.
    expect(
      screen.queryByText(/faq\.items\./),
    ).not.toBeInTheDocument();
  });

  it("starts with every question collapsed", () => {
    renderWithI18n(<FAQ />);

    for (const toggle of screen.getAllByRole("button")) {
      expect(toggle).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("opens the question that was clicked", async () => {
    const user = userEvent.setup();
    renderWithI18n(<FAQ />);

    const [first] = screen.getAllByRole("button");
    await user.click(first);

    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the previously open question when another is opened", async () => {
    // The whole reason FAQ owns the state instead of each FAQItem: two
    // answers expanded at once pushes the rest of the page around and makes
    // the section twice as tall as it should be.
    const user = userEvent.setup();
    renderWithI18n(<FAQ />);

    const [first, second] = screen.getAllByRole("button");

    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");

    await user.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("closes an open question when it is clicked again", async () => {
    const user = userEvent.setup();
    renderWithI18n(<FAQ />);

    const [first] = screen.getAllByRole("button");

    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");

    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("renders in English when the locale says so", () => {
    renderWithI18n(<FAQ />, { locale: "en" });

    expect(screen.queryByText("الأسئلة الشائعة")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(FAQ_ITEMS.length);
  });
});
