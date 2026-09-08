import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "@/components/ui/Input";
import { describeFieldContract } from "../../helpers/fieldContract";

describe("Input", () => {
  describeFieldContract({
    role: "textbox",
    renderField: (props) => <Input {...props} />,
  });

  it("forwards its ref to the underlying input", () => {
    // react-hook-form's `register()` hands a ref down; without forwardRef
    // working, every registered field silently stops being controlled.
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Price" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText("Price"));
  });

  it("passes native props like type and placeholder through", () => {
    render(<Input label="Price" type="number" placeholder="0.00" />);

    const input = screen.getByLabelText("Price");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("placeholder", "0.00");
  });

  it("accepts typed input", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input label="Slug" onChange={onChange} />);

    await user.type(screen.getByLabelText("Slug"), "gold-ring");
    expect(screen.getByLabelText("Slug")).toHaveValue("gold-ring");
    expect(onChange).toHaveBeenCalled();
  });
});
