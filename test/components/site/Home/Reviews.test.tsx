import { describe, it, expect, vi, afterEach } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Reviews from "@/components/site/Home/Reviews";
import { REVIEWS } from "@/constants";
import { renderWithI18n } from "../../../helpers/renderWithI18n";

/**
 * The first carousel in the codebase, so what's pinned down here is the
 * behaviour that isn't obvious from reading it: wrap-around in both
 * directions, dots staying in sync with the arrows, and autoplay that stops
 * the moment someone interacts with the section.
 */
describe("Reviews", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the section heading in the active language", () => {
    renderWithI18n(<Reviews />);

    expect(screen.getByText("آراء عميلاتنا")).toBeInTheDocument();
    // A missing translation key would render the key itself.
    expect(screen.queryByText(/reviews\./)).not.toBeInTheDocument();
  });

  it("shows only the first review to begin with", () => {
    renderWithI18n(<Reviews />);

    expect(
      screen.getByText(/أكثر شيء أحببته في DUR/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/التفاصيل، التغليف/),
    ).not.toBeInTheDocument();
  });

  it("names the reviewer and where she is from", () => {
    renderWithI18n(<Reviews />);

    expect(screen.getByText("نورة")).toBeInTheDocument();
    expect(screen.getByText("الإمارات")).toBeInTheDocument();
  });

  describe("navigation", () => {
    it("moves to the next review", async () => {
      const user = userEvent.setup();
      renderWithI18n(<Reviews />);

      await user.click(screen.getByRole("button", { name: "الرأي التالي" }));

      expect(screen.getByText(/التفاصيل، التغليف/)).toBeInTheDocument();
      expect(
        screen.queryByText(/أكثر شيء أحببته في DUR/),
      ).not.toBeInTheDocument();
    });

    it("wraps backwards from the first review to the last", async () => {
      // Neither arrow should ever be a dead end — going back from the first
      // review lands on the last one rather than doing nothing.
      const user = userEvent.setup();
      renderWithI18n(<Reviews />);

      await user.click(screen.getByRole("button", { name: "الرأي السابق" }));

      expect(screen.getByText("دانة")).toBeInTheDocument();
    });

    it("wraps forwards from the last review back to the first", async () => {
      const user = userEvent.setup();
      renderWithI18n(<Reviews />);

      const next = screen.getByRole("button", { name: "الرأي التالي" });
      for (let i = 0; i < REVIEWS.length; i += 1) {
        await user.click(next);
      }

      expect(screen.getByText("نورة")).toBeInTheDocument();
    });
  });

  describe("dots", () => {
    it("renders one dot per review", () => {
      renderWithI18n(<Reviews />);

      expect(
        screen.getAllByRole("button", { name: /اعرضي الرأي رقم/ }),
      ).toHaveLength(REVIEWS.length);
    });

    it("marks the current review's dot with aria-current", () => {
      renderWithI18n(<Reviews />);

      const dots = screen.getAllByRole("button", {
        name: /اعرضي الرأي رقم/,
      });
      expect(dots[0]).toHaveAttribute("aria-current", "true");
      expect(dots[1]).toHaveAttribute("aria-current", "false");
    });

    it("jumps straight to the review its dot belongs to", async () => {
      const user = userEvent.setup();
      renderWithI18n(<Reviews />);

      await user.click(
        screen.getByRole("button", { name: "اعرضي الرأي رقم 3" }),
      );

      expect(screen.getByText("ليان")).toBeInTheDocument();
    });

    it("keeps the dots in sync when the arrows are used", async () => {
      const user = userEvent.setup();
      renderWithI18n(<Reviews />);

      await user.click(screen.getByRole("button", { name: "الرأي التالي" }));

      const dots = screen.getAllByRole("button", {
        name: /اعرضي الرأي رقم/,
      });
      expect(dots[1]).toHaveAttribute("aria-current", "true");
      expect(dots[0]).toHaveAttribute("aria-current", "false");
    });
  });

  describe("autoplay", () => {
    it("advances on its own after the interval", () => {
      vi.useFakeTimers();
      renderWithI18n(<Reviews />);

      expect(screen.getByText("نورة")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(6000);
      });

      expect(screen.getByText("سارة")).toBeInTheDocument();
    });

    it("stops while the pointer is over the section", () => {
      // Text sliding out from under someone mid-sentence is worse than no
      // autoplay at all.
      //
      // `fireEvent` rather than `userEvent.hover` here: userEvent schedules
      // its own delays, which deadlocks against `vi.useFakeTimers()` unless
      // the two are wired together — and the only thing this test needs is
      // the single mouseenter that pauses the interval.
      vi.useFakeTimers();
      const { container } = renderWithI18n(<Reviews />);

      fireEvent.mouseEnter(
        container.querySelector('[aria-roledescription="carousel"]')!,
      );

      act(() => {
        vi.advanceTimersByTime(12000);
      });

      expect(screen.getByText("نورة")).toBeInTheDocument();
    });

    it("resumes once the pointer leaves again", () => {
      vi.useFakeTimers();
      const { container } = renderWithI18n(<Reviews />);

      const carousel = container.querySelector(
        '[aria-roledescription="carousel"]',
      )!;

      fireEvent.mouseEnter(carousel);
      act(() => {
        vi.advanceTimersByTime(12000);
      });
      expect(screen.getByText("نورة")).toBeInTheDocument();

      fireEvent.mouseLeave(carousel);
      act(() => {
        vi.advanceTimersByTime(6000);
      });
      expect(screen.getByText("سارة")).toBeInTheDocument();
    });
  });

  it("renders in English when the locale says so", () => {
    renderWithI18n(<Reviews />, { locale: "en" });

    expect(screen.getByText("What Our Clients Say")).toBeInTheDocument();
    expect(screen.getByText("Noura")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next review" }),
    ).toBeInTheDocument();
  });
});
