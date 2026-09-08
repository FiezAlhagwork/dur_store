import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "@/components/ui/Pagination";
import { renderWithI18n } from "../../helpers/renderWithI18n";

describe("Pagination", () => {
  const baseProps = { currentPage: 2, lastPage: 5, onPageChange: vi.fn() };

  it("renders nothing when there is only one page", () => {
    // "A pager that can never do anything is just noise" — the component's
    // own reasoning, worth locking in so a refactor doesn't reintroduce it.
    const { container } = renderWithI18n(
      <Pagination currentPage={1} lastPage={1} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there are no pages at all", () => {
    const { container } = renderWithI18n(
      <Pagination currentPage={1} lastPage={0} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the current position out of the total", () => {
    renderWithI18n(<Pagination {...baseProps} />);
    expect(screen.getByText("صفحة 2 من 5")).toBeInTheDocument();
  });

  it("labels itself as navigation for assistive tech", () => {
    renderWithI18n(<Pagination {...baseProps} />);
    expect(
      screen.getByRole("navigation", { name: "تنقّل بين الصفحات" }),
    ).toBeInTheDocument();
  });

  it("moves one page back", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(<Pagination {...baseProps} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "الصفحة السابقة" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("moves one page forward", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderWithI18n(<Pagination {...baseProps} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "الصفحة التالية" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables 'previous' on the first page", () => {
    renderWithI18n(<Pagination {...baseProps} currentPage={1} />);

    expect(screen.getByRole("button", { name: "الصفحة السابقة" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "الصفحة التالية" })).toBeEnabled();
  });

  it("disables 'next' on the last page", () => {
    renderWithI18n(<Pagination {...baseProps} currentPage={5} />);

    expect(screen.getByRole("button", { name: "الصفحة التالية" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "الصفحة السابقة" })).toBeEnabled();
  });

  it("disables both arrows while a page is in flight", () => {
    renderWithI18n(<Pagination {...baseProps} isDisabled />);

    expect(screen.getByRole("button", { name: "الصفحة السابقة" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "الصفحة التالية" })).toBeDisabled();
  });

  it("renders in English too", () => {
    renderWithI18n(<Pagination {...baseProps} />, { locale: "en" });
    expect(
      screen.getByRole("button", { name: /previous/i }),
    ).toBeInTheDocument();
  });
});
