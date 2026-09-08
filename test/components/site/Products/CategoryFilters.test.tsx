import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryFilters from "@/components/site/Products/CategoryFilters";

/**
 * Takes already-localised `label`s from its parent, so no i18n setup is
 * needed here — plain `render` is enough.
 */
describe("CategoryFilters", () => {
  const options = [
    { id: "all", label: "الكل" },
    { id: "rings", label: "خواتم" },
    { id: "necklaces", label: "قلادات" },
  ];

  it("renders one button per option", () => {
    render(
      <CategoryFilters options={options} activeId="all" onChange={vi.fn()} />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "خواتم" })).toBeInTheDocument();
  });

  it("reports the id of the option that was clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CategoryFilters options={options} activeId="all" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "قلادات" }));
    expect(onChange).toHaveBeenCalledWith("necklaces");
  });

  it("styles only the active option differently", () => {
    // The active filter is communicated by fill alone, so if the two
    // variants ever collapsed into one there'd be no visible indication of
    // what's being filtered — and no other signal to fall back on.
    render(
      <CategoryFilters options={options} activeId="rings" onChange={vi.fn()} />,
    );

    const active = screen.getByRole("button", { name: "خواتم" });
    const inactive = screen.getByRole("button", { name: "قلادات" });
    expect(active.className).not.toBe(inactive.className);
  });

  it("renders nothing but an empty container when there are no options", () => {
    render(<CategoryFilters options={[]} activeId="all" onChange={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("never submits a surrounding form", () => {
    // These sit inside the catalogue page, not a form today — but Button's
    // default type is what keeps that safe if they ever do.
    render(
      <CategoryFilters options={options} activeId="all" onChange={vi.fn()} />,
    );

    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("type", "button");
    }
  });
});
